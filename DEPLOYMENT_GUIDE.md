# Jai Mala - Deployment Guide for Client

## 📦 Package Contents

This package contains the complete source code for **Jai Mala** matrimonial platform.

### Folder Structure:
```
MatrimonyPro/
├── server/          # Backend (Node.js + Express + Firebase)
├── client/          # Frontend (React + Vite)
├── README.md        # Main documentation
├── FIREBASE_SETUP.md    # Firebase setup guide
├── PHASE1_CHECKLIST.md  # Launch checklist
└── DEPLOYMENT_GUIDE.md  # This file
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites:
- Node.js 18+ installed
- Firebase account created
- Text editor (VS Code recommended)

### Step 1: Extract Files
Extract the ZIP file to your desired location (e.g., `C:\Projects\JaiMala`)

### Step 2: Firebase Setup
Follow `FIREBASE_SETUP.md` to:
1. Create Firebase project
2. Enable Phone Authentication
3. Enable Firestore Database
4. Download service account JSON
5. Get web config

### Step 3: Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Frontend (`client/.env`):**
```env
VITE_API_BASE=http://localhost:4000
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Service Account:**
Place `firebase-service-account.json` in `server/` folder

### Step 4: Install Dependencies

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm run dev
```

### Step 5: Test
Open browser: `http://localhost:5173`

---

## 🌐 Production Deployment

### Option 1: Firebase Hosting (Recommended)

**Benefits:**
- Free tier available
- Auto-scaling
- Global CDN
- HTTPS included
- Easy deployment

**Steps:**

1. **Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Firebase:**
```bash
firebase init hosting
# Select your project
# Public directory: client/dist
# Single-page app: Yes
# GitHub auto-deploy: No
```

3. **Build Frontend:**
```bash
cd client
npm run build
```

4. **Deploy:**
```bash
firebase deploy --only hosting
```

5. **Deploy Backend (Cloud Functions):**
```bash
cd server
# Convert to Cloud Functions format (optional)
firebase deploy --only functions
```

**Your site will be live at:** `https://your-project.web.app`

---

### Option 2: VPS/Cloud Server (DigitalOcean, AWS, etc.)

**Requirements:**
- Ubuntu 20.04+ server
- Domain name
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Connect to Server:**
```bash
ssh root@your-server-ip
```

2. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2 (Process Manager):**
```bash
npm install -g pm2
```

4. **Upload Code:**
```bash
# Use FileZilla, SCP, or Git
scp -r MatrimonyPro root@your-server-ip:/var/www/
```

5. **Configure Environment:**
```bash
cd /var/www/MatrimonyPro/server
nano .env
# Add your Firebase config
```

6. **Install Dependencies:**
```bash
cd /var/www/MatrimonyPro/server
npm install

cd /var/www/MatrimonyPro/client
npm install
npm run build
```

7. **Start Backend with PM2:**
```bash
cd /var/www/MatrimonyPro/server
pm2 start src/index.js --name jaimala-api
pm2 save
pm2 startup
```

8. **Setup Nginx (Web Server):**
```bash
sudo apt install nginx

# Create config
sudo nano /etc/nginx/sites-available/jaimala

# Add this config:
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/MatrimonyPro/client/dist;
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

# Enable site
sudo ln -s /etc/nginx/sites-available/jaimala /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **Setup SSL (HTTPS):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Your site will be live at:** `https://yourdomain.com`

---

### Option 3: Vercel (Frontend) + Firebase (Backend)

**Frontend on Vercel:**
```bash
cd client
npm install -g vercel
vercel login
vercel
# Follow prompts
```

**Backend on Firebase Cloud Functions:**
- Convert Express app to Cloud Functions
- Deploy with `firebase deploy --only functions`

---

## 🔧 Configuration for Production

### Update CORS Origin:

**server/.env:**
```env
CORS_ORIGIN=https://yourdomain.com
```

### Update API Base URL:

**client/.env:**
```env
VITE_API_BASE=https://yourdomain.com
# OR
VITE_API_BASE=https://your-project.web.app
```

### Firestore Security Rules:

Deploy production rules from `firestore.rules` file:
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Monitoring & Maintenance

### Firebase Console:
- Monitor usage: https://console.firebase.google.com
- Check authentication stats
- View Firestore usage
- Monitor costs

### Server Monitoring (if using VPS):
```bash
# Check backend status
pm2 status

# View logs
pm2 logs jaimala-api

# Restart if needed
pm2 restart jaimala-api
```

---

## 💰 Cost Estimates

### Firebase Hosting + Firestore (Phase 1):
- 0-10K users: **₹0/month** (free tier)
- 10K-50K users: **₹5,000-8,000/month**

### VPS (DigitalOcean/AWS):
- Basic Droplet: **₹500-1,000/month**
- Domain: **₹500-1,500/year**
- SSL: **Free** (Let's Encrypt)

---

## 🆘 Troubleshooting

### Backend won't start:
- Check `server/.env` exists
- Verify `firebase-service-account.json` is in `server/` folder
- Check Firebase credentials are correct

### Frontend shows errors:
- Check `client/.env` exists
- Verify Firebase config is correct
- Run `npm install` in client folder

### Phone OTP not working:
- Check Firebase Phone Auth is enabled
- For testing, add test phone numbers in Firebase Console
- For production, enable billing for SMS delivery

### Database errors:
- Check Firestore is enabled
- Deploy security rules
- Check indexes are created

---

## 📞 Support

For technical issues:
1. Check Firebase Console for errors
2. Check browser console (F12) for frontend errors
3. Check server logs for backend errors
4. Review `FIREBASE_SETUP.md` for configuration

---

## 🎉 You're Ready!

Your Jai Mala platform is ready to deploy. Choose your deployment method above and follow the steps.

**Recommended for beginners:** Firebase Hosting (Option 1)

**Good luck with your launch!** 🚀
