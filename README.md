# Jai Mala

A full-stack matrimonial platform with **Firebase Authentication & Firestore**. Includes phone OTP auth, user profiles, advanced search, matchmaking, messaging, membership plans, and admin panel.

## Tech Stack
- **Backend**: Node.js, Express, Firebase Admin SDK
- **Database**: Cloud Firestore (NoSQL)
- **Auth**: Firebase Phone Authentication (OTP)
- **Frontend**: React + Vite, Firebase JS SDK
- **Storage**: Firebase Storage (for photos)

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Phone Auth & Firestore enabled

### 1) Firebase Setup
**See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.**

Quick summary:
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Phone Authentication
3. Enable Firestore Database
4. Download service account JSON → save as `server/firebase-service-account.json`
5. Get web config → add to `client/.env`

### 2) Backend Setup
```bash
cd server
copy .env.example .env
# Add your Firebase config to .env
npm install
npm run dev
```
API runs on http://localhost:4000

### 3) Frontend Setup
```bash
cd client
copy .env.example .env
# Add your Firebase web config to .env
npm install
npm run dev
```
App runs on http://localhost:5173

### 4) Build & Deploy (Static Hosting)
- The Vite build outputs directly to `/public` (preserves existing static pages)
- Build frontend: `cd client && npm run build`
- Deploy hosting: `firebase deploy --only hosting`
- API stays on port 4000 (deploy separately to your chosen host)

## API Overview

### Authentication (Firebase Phone OTP)
- `POST /api/auth/verify-phone` - Verify Firebase ID token and create/login user

### Profile & Search
- `GET /api/profiles/me` - Get my profile
- `PUT /api/profiles/me` - Update my profile
- `POST /api/profiles/me/photos` - Upload photos (multipart)
- `GET /api/search` - Search profiles with filters
- `GET /api/matches` - Get compatibility-scored matches

### Chat & Payments
- `GET /api/chat/messages/:userId` - Get conversation
- `POST /api/chat/messages/:userId` - Send message
- `POST /api/payments/checkout` - Subscribe to plan (stub)

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/stats` - Platform statistics (admin only)

## Firestore Collections

- **users** - User accounts (uid, phone, role, verified)
- **profiles** - User profiles (name, gender, religion, education, photos, preferences)
- **messages** - Chat messages (from, to, body, participants, createdAt)
- **subscriptions** - Membership plans (userId, plan, expiresAt, status)

## Features

✅ **Phone OTP Authentication** - Real SMS OTP via Firebase  
✅ **Profile Management** - Detailed profiles with photos  
✅ **Advanced Search** - Filter by religion, caste, education, location  
✅ **Smart Matchmaking** - Compatibility scoring algorithm  
✅ **Messaging** - Private chat between users  
✅ **Membership Plans** - Free, Gold, Platinum tiers  
✅ **Admin Panel** - User management and analytics  
✅ **Mobile Responsive** - Works on all devices  
✅ **Modern UI** - Soft pink/lavender gradient theme

## Current Status

✅ **Phase 1 Ready** - Can handle 0-10K users on Firebase free tier!

See `PHASE1_CHECKLIST.md` for launch checklist.

## Scalability Roadmap

### Phase 1: 0-10K Users (Current) ✅
- Firebase free tier
- All core features working
- **Cost: ₹0/month**

### Phase 2: 10K-50K Users
- Add Firestore indexes
- Implement pagination
- Pre-calculate matches
- **Cost: ₹5,000-8,000/month**

### Phase 3: 50K-100K Users
- Add Algolia search
- Firebase Storage + CDN
- Caching layer
- **Cost: ₹14,000-20,000/month**

### Phase 4: 100K+ Users
- Microservices
- Load balancing
- Mobile apps
- **Cost: ₹30,000-50,000/month**

## Next Steps (Phase 2+)

- [ ] Add real-time chat with Firestore listeners
- [ ] Integrate Stripe/Razorpay for payments
- [ ] Add photo verification
- [ ] Add push notifications
- [ ] Deploy to Firebase Hosting + Cloud Functions
- [ ] Add Algolia for advanced search

## License
MIT
