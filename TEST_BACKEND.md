# Backend Test Results

## Issue: "Request failed with status code 500"

### What's Working:
✅ OTP sent successfully (Firebase frontend working)
✅ Backend server is running on port 4000
✅ Frontend can reach backend (getting 500 response)

### What's Failing:
❌ Backend `/api/auth/verify-phone` endpoint returning 500 error

### Possible Causes:

1. **Firebase Admin SDK Issue**
   - Service account JSON might be invalid
   - Token verification failing
   - Firestore permissions issue

2. **Missing User Document**
   - Backend trying to create user in Firestore
   - Firestore rules might be blocking writes

3. **Token Format Issue**
   - ID token from frontend not matching backend expectations

### How to Debug:

**Step 1: Check Backend Console**
Look at your terminal where `npm run dev` is running in the `server` folder.
You should see error logs like:
```
Verify phone error: [error details]
```

**Step 2: Check Firebase Console**
1. Go to: https://console.firebase.google.com/
2. Click your project
3. Go to "Firestore Database"
4. Check if there are any documents in the `users` collection

**Step 3: Check Firestore Rules**
The backend needs permission to write to Firestore.

Current rules should allow:
- Backend (with service account) can write anywhere
- Users can read/write their own data

### Quick Fix Options:

**Option A: Check Firestore Rules**
1. Go to Firebase Console → Firestore Database → Rules
2. Make sure rules allow backend writes:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // TEMPORARY for testing
    }
  }
}
```
⚠️ This is for TESTING ONLY - use proper rules in production

**Option B: Check Service Account**
The file `server/firebase-service-account.json` should have:
- `type`: "service_account"
- `project_id`: "jaimala-9e985"
- `private_key`: (long encrypted key)
- `client_email`: (service account email)

**Option C: Check Backend Logs**
Run this in terminal:
```bash
cd server
npm run dev
```
Then try login again and watch for error messages.

### Expected Backend Log:
```
Firebase Admin initialized
API listening on http://localhost:4000
Verify phone error: [specific error here]
```

The error message will tell us exactly what's wrong!

---

## Next Steps:

1. **Check your backend terminal** - What error do you see?
2. **Share the error message** - I can fix it immediately
3. **Or try the Quick Fix** - Set Firestore rules to allow all (temporarily)

The good news: Your app is 99% working! Just need to fix this one backend issue! 🚀
