# Firebase Setup Guide for Jai Mala

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `jaimala` (or your choice)
4. Disable Google Analytics (optional)
5. Click **Create Project**

## 2. Enable Phone Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Phone** provider
3. Click **Enable**
4. Add your test phone numbers (for development):
   - Phone: `+919876543210`
   - Code: `123456`
5. Click **Save**

## 3. Enable Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your region (e.g., `asia-south1` for India)
5. Click **Enable**

## 4. Get Firebase Web Config

1. Go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app with nickname: `jaimala-web`
5. Copy the `firebaseConfig` object values
6. Paste into `client/.env`:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=jaimala-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jaimala-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=jaimala-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 5. Get Firebase Admin SDK Service Account

1. Go to **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Click **Generate key** (downloads JSON file)
4. Save as `server/firebase-service-account.json`
5. **IMPORTANT**: Add to `.gitignore` (already done)

## 6. Configure Firestore Security Rules (Production)

Go to **Firestore Database** > **Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Profiles collection
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
    }
    
    // Subscriptions collection
    match /subscriptions/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if false; // Only backend can write
    }
  }
}
```

## 7. Set Up Firestore Indexes (if needed)

If you get index errors in console, click the provided link to auto-create indexes.

Common indexes needed:
- Collection: `messages`, Fields: `participants` (Array), `createdAt` (Ascending)

## 8. Enable Firebase Storage (for photo uploads)

1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Click **Done**

## 9. Update Environment Variables

**Server** (`server/.env`):
```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
FIREBASE_STORAGE_BUCKET=jaimala-xxxxx.appspot.com
```

**Client** (`client/.env`):
```env
VITE_API_BASE=http://localhost:4000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 10. Test Phone Authentication

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Go to `http://localhost:5173/register`
4. Enter test phone number: `+919876543210`
5. Enter test OTP: `123456`
6. Should log in successfully!

## Production Checklist

- [ ] Update Firestore rules to production mode
- [ ] Remove test phone numbers from Firebase Auth
- [ ] Set up proper Firebase billing
- [ ] Enable App Check for security
- [ ] Set up Firebase Cloud Functions for backend logic
- [ ] Configure custom domain for Firebase Hosting
- [ ] Set up monitoring and alerts

## Troubleshooting

**"Firebase: Error (auth/invalid-app-credential)"**
- Check that `firebase-service-account.json` exists in `server/` directory
- Verify the JSON file is valid

**"reCAPTCHA verification failed"**
- Make sure you're using `http://localhost` (not `127.0.0.1`)
- Add your domain to Firebase Auth > Settings > Authorized domains

**"Missing or insufficient permissions"**
- Update Firestore security rules
- Check that user is authenticated

**OTP not received**
- Use test phone numbers in development
- Check Firebase Console > Authentication > Phone for test numbers
- In production, ensure billing is enabled for SMS delivery
