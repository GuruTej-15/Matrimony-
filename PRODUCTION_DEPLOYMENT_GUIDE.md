# 🚀 Production Deployment Guide - Complete Setup

## 📋 **Overview**

This guide will help you deploy your matrimony platform with:
- ✅ Real Firebase data storage
- ✅ User authentication (Phone OTP)
- ✅ Photo uploads to Firebase Storage
- ✅ Razorpay payment integration
- ✅ Custom domain hosting

---

## 🔥 **Part 1: Firebase Setup (Already Mostly Done)**

### **Step 1: Verify Firebase Configuration**

You already have:
- ✅ Firebase project: `jaimala-9e985`
- ✅ Firestore database (Native mode)
- ✅ Service account JSON file
- ✅ Authentication enabled

**What to Verify:**

1. **Firestore Rules** - Make them production-ready:

Go to: https://console.firebase.google.com/project/jaimala-9e985/firestore/rules

Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - only owner can read/write
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profiles collection
    match /profiles/{userId} {
      allow read: if request.auth != null; // Anyone logged in can read profiles
      allow write: if request.auth != null && request.auth.uid == userId; // Only owner can update
    }
    
    // Interests collection
    match /interests/{interestId} {
      allow read: if request.auth != null && 
        (resource.data.from == request.auth.uid || resource.data.to == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.from == request.auth.uid;
      allow update: if request.auth != null && resource.data.to == request.auth.uid;
    }
    
    // Chat messages
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        (resource.data.from == request.auth.uid || resource.data.to == request.auth.uid);
      allow create: if request.auth != null && request.resource.data.from == request.auth.uid;
    }
    
    // Subscriptions
    match /subscriptions/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only backend can write
    }
  }
}
```

2. **Firebase Storage Rules** - For photo uploads:

Go to: https://console.firebase.google.com/project/jaimala-9e985/storage/rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{fileName} {
      // Allow read by anyone authenticated
      allow read: if request.auth != null;
      // Allow write only by the user
      allow write: if request.auth != null && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024 // Max 5MB
        && request.resource.contentType.matches('image/.*'); // Only images
    }
  }
}
```

3. **Enable Firebase Storage:**

Go to: https://console.firebase.google.com/project/jaimala-9e985/storage
- Click "Get Started"
- Choose location: `asia-south1`
- Click "Done"

---

## 💳 **Part 2: Razorpay Integration**

### **Step 1: Create Razorpay Account**

1. Go to: https://razorpay.com/
2. Click "Sign Up"
3. Complete KYC verification (required for live payments)
4. Get API keys

### **Step 2: Get API Keys**

1. Login to Razorpay Dashboard
2. Go to: Settings → API Keys
3. Generate keys:
   - **Test Mode:** For testing (use test cards)
   - **Live Mode:** For real payments (after KYC approval)

You'll get:
- `Key ID`: `rzp_test_xxxxx` or `rzp_live_xxxxx`
- `Key Secret`: `xxxxx`

### **Step 3: Update Backend**

**File: `server/.env`**
```env
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Firebase
FIREBASE_STORAGE_BUCKET=jaimala-9e985.firebasestorage.app

# Razorpay (Test Mode)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# For production, use:
# RAZORPAY_KEY_ID=rzp_live_xxxxx
# RAZORPAY_KEY_SECRET=xxxxx
```

### **Step 4: Install Razorpay SDK**

```bash
cd server
npm install razorpay
```

### **Step 5: Update Payment Route**

**File: `server/src/routes/paymentsFirebase.js`**

```javascript
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { db } = require('../lib/firebase');
const firebaseAuth = require('../middleware/firebaseAuth');

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', firebaseAuth, async (req, res) => {
  try {
    const { plan, price } = req.body;
    
    // Convert price to paise (₹499 = 49900 paise)
    const amount = parseInt(price.replace('₹', '').replace(',', '')) * 100;
    
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: req.user.uid,
        plan,
        userPhone: req.user.phone
      }
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (e) {
    console.error('Order creation failed:', e);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and activate membership
router.post('/verify-payment', firebaseAuth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');
    
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    
    // Payment verified - activate membership
    const now = new Date();
    const expires = new Date(now);
    expires.setMonth(expires.getMonth() + 1);
    
    const subData = {
      userId: req.user.uid,
      plan,
      startedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      paymentProvider: 'razorpay',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'active',
      updatedAt: now.toISOString()
    };
    
    // Save subscription
    await db.collection('subscriptions').doc(req.user.uid).set(subData, { merge: true });
    
    // Update profile with membership
    await db.collection('profiles').doc(req.user.uid).set({
      membership: {
        plan,
        expiresAt: expires.toISOString(),
        purchasedAt: now.toISOString(),
        limits: {
          interestsSentThisMonth: 0,
          matchesViewedToday: 0,
          searchesPerformedToday: 0,
          activeChats: 0
        },
        lastDailyReset: now.toISOString(),
        lastMonthlyReset: now.toISOString()
      }
    }, { merge: true });
    
    res.json({ success: true, subscription: subData });
  } catch (e) {
    console.error('Payment verification failed:', e);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;
```

### **Step 6: Update Frontend**

**File: `client/index.html`** - Add Razorpay script:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Jai Mala - Find Your Perfect Match</title>
    <!-- Add Razorpay -->
    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**File: `client/src/pages/Plans.jsx`** - Update buy function:

```javascript
async function buy(plan, price){
  setMsg('')
  setLoading(true)
  try{ 
    // Create Razorpay order
    const { data: order } = await api.post('/payments/create-order', { 
      plan, 
      price 
    })
    
    // Open Razorpay checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxx', // Your Key ID
      amount: order.amount,
      currency: order.currency,
      name: 'Jai Mala',
      description: `${plan.toUpperCase()} Membership Plan`,
      order_id: order.id,
      handler: async function (response) {
        try {
          // Verify payment on backend
          const { data } = await api.post('/payments/verify-payment', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan
          })
          
          setMsg(`✅ ${plan.toUpperCase()} plan activated until ${new Date(data.subscription.expiresAt).toLocaleDateString()}`)
          setCurrentPlan(plan)
          setTimeout(() => setMsg(''), 5000)
        } catch (err) {
          setMsg('❌ Payment verification failed')
        }
      },
      prefill: {
        contact: '' // User's phone if available
      },
      theme: {
        color: '#a855f7'
      },
      modal: {
        ondismiss: function() {
          setMsg('❌ Payment cancelled')
          setLoading(false)
        }
      }
    }
    
    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch(e){ 
    setMsg('❌ ' + (e?.response?.data?.error || 'Payment failed'))
  } finally {
    setLoading(false)
  }
}
```

**File: `client/.env`** - Add Razorpay Key:

```env
VITE_API_BASE=http://localhost:4000

# Firebase Web Config
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=jaimala-9e985.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jaimala-9e985
VITE_FIREBASE_STORAGE_BUCKET=jaimala-9e985.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

---

## 📸 **Part 3: Photo Upload Implementation**

Your backend already has photo upload routes, but let's ensure they work with Firebase Storage:

**File: `server/src/routes/profilesFirebase.js`** - Update photo upload:

```javascript
const multer = require('multer');
const { storage } = require('../lib/firebase');

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Upload photos
router.post('/me/photos', firebaseAuth, upload.array('photos', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const bucket = storage.bucket();
    const photoUrls = [];

    for (const file of req.files) {
      const fileName = `profile-photos/${req.user.uid}/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(fileName);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      });

      // Make file publicly readable
      await fileUpload.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      photoUrls.push(publicUrl);
    }

    // Update profile with photo URLs
    await db.collection('profiles').doc(req.user.uid).set({
      photos: photoUrls
    }, { merge: true });

    res.json({ photos: photoUrls });
  } catch (e) {
    console.error('Photo upload error:', e);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

**Install multer:**
```bash
cd server
npm install multer
```

---

## 🌐 **Part 4: Domain & Hosting**

### **Option A: Vercel (Recommended - Easy & Free)**

**For Frontend:**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy Frontend:**
```bash
cd client
vercel
```

3. **Add Custom Domain:**
- Go to Vercel Dashboard
- Click your project
- Settings → Domains
- Add your domain: `www.jaimala.com`
- Follow DNS instructions

**For Backend:**

1. **Deploy Backend:**
```bash
cd server
vercel
```

2. **Set Environment Variables:**
- Vercel Dashboard → Settings → Environment Variables
- Add all from `.env` file

3. **Update Frontend API URL:**
```env
# client/.env.production
VITE_API_BASE=https://your-backend.vercel.app
```

---

### **Option B: Firebase Hosting + Cloud Functions**

**For Frontend:**

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Hosting:**
```bash
cd client
firebase init hosting
```

3. **Build & Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

4. **Add Custom Domain:**
- Firebase Console → Hosting
- Add custom domain
- Follow DNS instructions

**For Backend:**

1. **Convert to Cloud Functions:**
```bash
cd server
firebase init functions
```

2. **Deploy:**
```bash
firebase deploy --only functions
```

---

### **Option C: VPS (DigitalOcean, AWS, etc.)**

1. **Get VPS:**
- DigitalOcean Droplet ($5/month)
- AWS EC2 (Free tier)
- Linode, Vultr, etc.

2. **Setup Server:**
```bash
# SSH into server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
sudo apt install nginx
```

3. **Deploy Code:**
```bash
# Clone your repo
git clone your-repo-url
cd MatrimonyPro

# Install dependencies
cd server && npm install
cd ../client && npm install && npm run build
```

4. **Start Backend:**
```bash
cd server
pm2 start src/index.js --name matrimony-api
pm2 save
pm2 startup
```

5. **Configure Nginx:**
```nginx
# /etc/nginx/sites-available/jaimala
server {
    listen 80;
    server_name jaimala.com www.jaimala.com;

    # Frontend
    location / {
        root /path/to/MatrimonyPro/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/jaimala /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **SSL Certificate (Free):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d jaimala.com -d www.jaimala.com
```

---

## ✅ **Part 5: Final Checklist**

### **Before Going Live:**

- [ ] Firebase Firestore rules updated (production-ready)
- [ ] Firebase Storage rules updated
- [ ] Firebase Storage enabled
- [ ] Razorpay account created & KYC completed
- [ ] Razorpay live keys obtained
- [ ] Environment variables set (production)
- [ ] Photo upload tested
- [ ] Payment flow tested (test mode)
- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate installed
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Test complete user journey
- [ ] Monitor logs for errors

### **Test User Journey:**

1. [ ] Register with phone OTP
2. [ ] Complete profile (all 6 fields)
3. [ ] Upload profile photo
4. [ ] View AI matches
5. [ ] Search profiles
6. [ ] Send interest
7. [ ] Accept interest from another user
8. [ ] Chat with mutual match
9. [ ] Try to exceed FREE limits
10. [ ] Upgrade to SILVER (test payment)
11. [ ] Verify unlimited access
12. [ ] Check membership expiry (set past date)

---

## 📊 **Monitoring & Maintenance**

### **Firebase Console:**
- Monitor Firestore usage
- Check Storage usage
- View Authentication logs

### **Razorpay Dashboard:**
- Track payments
- Handle refunds
- View analytics

### **Server Logs:**
- Check PM2 logs: `pm2 logs`
- Monitor errors
- Track API usage

---

## 💰 **Estimated Costs**

### **Firebase (Pay as you go):**
- Firestore: ~₹500-2000/month (depends on usage)
- Storage: ~₹200-1000/month
- Authentication: Free up to 10K users

### **Razorpay:**
- 2% per transaction
- No setup fees

### **Hosting:**
- Vercel: Free (Hobby plan)
- VPS: ₹400-1500/month
- Domain: ₹500-1500/year

**Total: ~₹2000-5000/month** (for moderate traffic)

---

## 🚀 **You're Ready to Launch!**

Follow this guide step by step, and your matrimony platform will be live with:
- ✅ Real user data in Firebase
- ✅ Photo uploads working
- ✅ Razorpay payments
- ✅ Custom domain
- ✅ SSL certificate
- ✅ Production-ready!

**Good luck with your launch! 🎉**
