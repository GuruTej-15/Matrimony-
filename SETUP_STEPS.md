# Firebase Setup - Step by Step Guide

Follow these exact steps to set up Firebase for Jai Mala.

---

## Step 1: Create Firebase Project (2 minutes)

1. Open your browser and go to: **https://console.firebase.google.com/**
2. Click **"Add project"** button
3. Enter project name: **`jaimala`** (or any name you want)
4. Click **Continue**
5. **Disable** Google Analytics (you can enable later if needed)
6. Click **Create project**
7. Wait for project creation (30 seconds)
8. Click **Continue**

✅ **You now have a Firebase project!**

---

## Step 2: Enable Phone Authentication (2 minutes)

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"** button
3. Click on **"Sign-in method"** tab at the top
4. Find **"Phone"** in the list and click on it
5. Toggle **"Enable"** switch to ON
6. Scroll down to **"Phone numbers for testing"** section
7. Click **"Add phone number"**
   - Phone number: `+919876543210` (or your test number)
   - Test code: `123456`
8. Click **"Add"**
9. Click **"Save"**

✅ **Phone authentication is now enabled!**

---

## Step 3: Enable Firestore Database (2 minutes)

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"** button
3. Select **"Start in test mode"** (for development)
4. Click **"Next"**
5. Choose location: **`asia-south1 (Mumbai)`** (or closest to you)
6. Click **"Enable"**
7. Wait for database creation (30 seconds)

✅ **Firestore database is ready!**

---

## Step 4: Get Web App Configuration (3 minutes)

1. Click the **gear icon** (⚙️) next to "Project Overview" in left sidebar
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** (`</>` symbol)
5. Enter app nickname: **`jaimala-web`**
6. **DO NOT** check "Firebase Hosting" (we'll do that later)
7. Click **"Register app"**
8. You'll see a code snippet with `firebaseConfig` object
9. **COPY these values** (you'll need them):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // Copy this
  authDomain: "jaimala-xxx.firebaseapp.com",  // Copy this
  projectId: "jaimala-xxx",       // Copy this
  storageBucket: "jaimala-xxx.appspot.com",   // Copy this
  messagingSenderId: "123456789", // Copy this
  appId: "1:123456789:web:abc123" // Copy this
};
```

10. Click **"Continue to console"**

✅ **Web config copied!**

---

## Step 5: Download Service Account Key (2 minutes)

1. Still in **Project settings** page
2. Click **"Service accounts"** tab at the top
3. Click **"Generate new private key"** button
4. Click **"Generate key"** in the popup
5. A JSON file will download (e.g., `jaimala-xxx-firebase-adminsdk-xxx.json`)
6. **IMPORTANT**: Rename this file to: **`firebase-service-account.json`**
7. Move this file to: **`C:\Users\nkybi\CascadeProjects\MatrimonyPro\server\`**

✅ **Service account key downloaded!**

---

## Step 6: Configure Your Project (5 minutes)

### A) Backend Configuration

1. Open: `C:\Users\nkybi\CascadeProjects\MatrimonyPro\server\.env.example`
2. Copy it and rename to: `.env`
3. Edit the `.env` file:

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173

# Leave empty if you placed firebase-service-account.json in server/ folder
FIREBASE_SERVICE_ACCOUNT=

# Replace with your storage bucket from Step 4
FIREBASE_STORAGE_BUCKET=jaimala-xxx.appspot.com
```

4. Save the file

### B) Frontend Configuration

1. Open: `C:\Users\nkybi\CascadeProjects\MatrimonyPro\client\.env.example`
2. Copy it and rename to: `.env`
3. Edit the `.env` file with values from Step 4:

```env
VITE_API_BASE=http://localhost:4000

# Paste your values from Step 4 here:
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=jaimala-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jaimala-xxx
VITE_FIREBASE_STORAGE_BUCKET=jaimala-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. Save the file

✅ **Configuration complete!**

---

## Step 7: Install Dependencies & Run (3 minutes)

Open **TWO** terminals/command prompts:

### Terminal 1 - Backend:
```bash
cd C:\Users\nkybi\CascadeProjects\MatrimonyPro\server
npm install
npm run dev
```

Wait until you see:
```
Firebase Admin initialized
API listening on http://localhost:4000
```

### Terminal 2 - Frontend:
```bash
cd C:\Users\nkybi\CascadeProjects\MatrimonyPro\client
npm install
npm run dev
```

Wait until you see:
```
Local:   http://localhost:5173/
```

✅ **App is running!**

---

## Step 8: Test the App (2 minutes)

1. Open browser and go to: **http://localhost:5173**
2. Click **"Register"**
3. Enter:
   - Name: `Test User`
   - Phone: `+919876543210` (the test number you added)
4. Click **"Send OTP"**
5. Enter OTP: `123456` (the test code you set)
6. Click **"Verify & Register"**

✅ **If you're logged in and see the profile page - SUCCESS!** 🎉

---

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-app-credential)"
- Check that `firebase-service-account.json` is in the `server/` folder
- Make sure the file is valid JSON

### Error: "reCAPTCHA verification failed"
- Use `http://localhost:5173` (not `127.0.0.1`)
- Clear browser cache and try again

### Error: "Invalid phone number"
- Phone must be in international format: `+[country code][number]`
- Example: `+919876543210` for India

### OTP not working
- Make sure you added the test phone number in Firebase Console (Step 2)
- Use the exact test code you configured (`123456`)

### Backend not starting
- Check that `firebase-service-account.json` exists
- Check that `.env` file exists in `server/` folder

---

## What You've Set Up

✅ Firebase project created  
✅ Phone authentication enabled with test numbers  
✅ Firestore database ready  
✅ Web app registered  
✅ Service account key downloaded  
✅ Environment variables configured  
✅ App running locally  

---

## Next Steps (Optional)

### For Production:
1. Remove test phone numbers from Firebase Auth
2. Update Firestore rules to production mode
3. Enable Firebase Billing for SMS delivery
4. Deploy to Firebase Hosting

### Add More Features:
1. Enable Firebase Storage for photo uploads
2. Set up Firebase Cloud Functions for backend logic
3. Add Firebase Analytics
4. Enable Firebase Cloud Messaging for push notifications

---

## Need Help?

If you get stuck:
1. Check the Firebase Console for error messages
2. Check browser console (F12) for errors
3. Check terminal logs for backend errors
4. Refer to `FIREBASE_SETUP.md` for detailed troubleshooting

---

**Total Setup Time: ~20 minutes**

Once done, you'll have a fully functional matrimonial platform with real phone authentication! 🚀
