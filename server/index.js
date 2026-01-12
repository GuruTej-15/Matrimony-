/* Production-ready Express API for Jai Mala.
 * - Uses Firebase Auth + Firestore when MOCK_MODE=false and service account is present
 * - Falls back to in-memory data when MOCK_MODE=true (default for local dev)
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// ✅ Razorpay imports
const Razorpay = require('razorpay');
const crypto = require('crypto');

dotenv.config();

const PORT = process.env.PORT || 4000;
const MOCK_MODE = process.env.MOCK_MODE !== 'false';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Optional Firebase Admin setup
let admin = null;
let db = null;
if (!MOCK_MODE) {
  try {
    const servicePath =
      process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';

    if (fs.existsSync(servicePath)) {
      admin = require('firebase-admin');
      const serviceAccount = require(path.resolve(servicePath));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      db = admin.firestore();
      console.log('Firebase Admin initialized');
    }
  } catch (err) {
    console.warn('Firebase init failed, using mock mode', err.message);
    admin = null;
  }
}

/* ---------------- AUTH GUARD ---------------- */

const authGuard = async (req, res, next) => {
  if (MOCK_MODE || !admin) {
    req.user = { uid: 'demo-user', phone: '+910000000000' };
    return next();
  }

  const bearer = req.headers.authorization;
  const token = bearer?.startsWith('Bearer ')
    ? bearer.slice(7)
    : req.headers['x-id-token'];

  if (!token) return res.status(401).json({ message: 'Missing auth token' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, phone: decoded.phone_number };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

/* ---------------- PAYMENT VERIFY API ---------------- */

app.post('/api/payments/verify', authGuard, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    plan
  } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  // ✅ Save plan + payment in Firestore
  if (db) {
    await db
      .collection('users')
      .doc(req.user.uid)
      .set(
        {
          plan,
          planActivatedAt: Date.now()
        },
        { merge: true }
      );

    await db.collection('payments').add({
      uid: req.user.uid,
      plan,
      paymentId: razorpay_payment_id,
      createdAt: Date.now()
    });
  }

  return res.json({
    success: true,
    paymentId: razorpay_payment_id,
    plan
  });
});

/* ---------------- PAYMENTS HISTORY API (STEP 3.2) ---------------- */

app.get('/api/payments', authGuard, async (req, res) => {
  if (!db) return res.json({ payments: [] });

  const snap = await db
    .collection('payments')
    .where('uid', '==', req.user.uid)
    .orderBy('createdAt', 'desc')
    .get();

  const payments = snap.docs.map(d => d.data());
  res.json({ payments });
});

/* ---------------- OTHER ROUTES ---------------- */

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mock: MOCK_MODE });
});

app.get('/api/plans', authGuard, async (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: '₹0 / month',
        description: 'Browse limited profiles each day',
        features: ['Create profile', '5 profile views/day', 'Send 3 interests/day']
      },
      {
        id: 'gold',
        name: 'Gold',
        price: '₹999 / month',
        popular: true,
        description: 'Unlimited views and interests',
        features: [
          'Unlimited profile views',
          'Unlimited interests',
          'Advanced filters'
        ]
      },
      {
        id: 'platinum',
        name: 'Platinum',
        price: '₹1999 / month',
        description: 'Priority support and featured placement',
        features: ['Everything in Gold', 'Featured profile', 'Verified badge']
      }
    ]
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT} (mock=${MOCK_MODE})`);
});
