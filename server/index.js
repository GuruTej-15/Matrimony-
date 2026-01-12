/* Production-ready Express API for Jai Mala.
 * - Uses Firebase Auth + Firestore when MOCK_MODE=false and service account is present
 * - Falls back to in-memory data when MOCK_MODE=true (default for local dev)
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 4000;
const MOCK_MODE = process.env.MOCK_MODE !== 'false';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(express.json());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Optional Firebase Admin setup (only used if MOCK_MODE=false and credentials exist)
let admin = null;
let db = null;
if (!MOCK_MODE) {
  try {
    const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
    if (fs.existsSync(servicePath)) {
      admin = require('firebase-admin');
      const serviceAccount = require(path.resolve(servicePath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      db = admin.firestore();
      console.log('Firebase Admin initialized');
    } else {
      console.warn('Firebase service account not found. Falling back to mock mode.');
    }
  } catch (err) {
    console.warn('Firebase init failed, using mock mode', err.message);
    admin = null;
  }
}

// Demo data (in-memory; resets on restart) when mock mode is enabled
let profiles = [
  {
    id: 'u1',
    name: 'Aarav Sharma',
    age: 28,
    location: 'Mumbai',
    religion: 'Hindu',
    education: 'MBA',
    profession: 'Product Manager',
    bio: 'Driven, family-oriented, loves travel and food.',
    phone: '+919999000001'
  },
  {
    id: 'u2',
    name: 'Neha Verma',
    age: 26,
    location: 'Delhi',
    religion: 'Hindu',
    education: 'B.Tech',
    profession: 'Software Engineer',
    bio: 'Techie, music enthusiast, values balance and growth.',
    phone: '+919999000002'
  },
  {
    id: 'u3',
    name: 'Aman Khan',
    age: 29,
    location: 'Bengaluru',
    religion: 'Muslim',
    education: 'MS',
    profession: 'Data Scientist',
    bio: 'Curious mind, coffee lover, enjoys long runs.',
    phone: '+919999000003'
  }
];

const messages = {
  u2: [
    { from: 'u2', body: 'Hello! Great to connect with you.' },
    { from: 'me', body: 'Hi Neha, nice to meet you.' }
  ],
  u3: [
    { from: 'u3', body: 'Hey! How is your week going?' }
  ]
};

const plans = [
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
    description: 'Unlimited views and interests',
    popular: true,
    features: ['Unlimited profile views', 'Unlimited interests', 'Advanced filters', 'View contact details']
  },
  {
    id: 'platinum',
    name: 'Platinum',
    price: '₹1999 / month',
    description: 'Priority support and featured placement',
    features: ['Everything in Gold', 'Featured profile', 'Priority placement', 'Verified badge']
  }
];

const authGuard = async (req, res, next) => {
  if (MOCK_MODE || !admin) {
    const uid = req.headers['x-user-id'] || 'demo-user';
    const phone = req.headers['x-user-phone'] || '+910000000000';
    req.user = { uid, phone };
    return next();
  }

  const bearer = req.headers.authorization;
  const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : req.headers['x-id-token'];
  if (!token) return res.status(401).json({ message: 'Missing auth token' });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = { uid: decoded.uid, phone: decoded.phone_number }; // Firebase phone auth provides phone_number
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Firestore helpers
const getProfileDoc = async (uid) => {
  if (!db) return null;
  const snap = await db.collection('profiles').doc(uid).get();
  return snap.exists ? { id: uid, ...snap.data() } : null;
};

const upsertProfileDoc = async (uid, data) => {
  if (!db) return null;
  await db.collection('profiles').doc(uid).set({ ...data, id: uid }, { merge: true });
  return getProfileDoc(uid);
};

const listProfiles = async () => {
  if (!db) return null;
  const snap = await db.collection('profiles').limit(100).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const listPlans = async () => {
  if (!db) return null;
  const snap = await db.collection('plans').get();
  if (snap.empty) return null;
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

const conversationId = (a, b) => [a, b].sort().join('::');

const fetchMessagesDb = async (userA, userB) => {
  if (!db) return null;
  const convo = conversationId(userA, userB);
  const snap = await db.collection('messages').doc(convo).collection('items').orderBy('createdAt').get();
  return snap.docs.map((d) => d.data());
};

const addMessageDb = async (userA, userB, body) => {
  if (!db) return null;
  const convo = conversationId(userA, userB);
  const ref = db.collection('messages').doc(convo).collection('items').doc();
  await ref.set({ from: userA, to: userB, body, createdAt: Date.now() });
  return true;
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mock: MOCK_MODE, firestore: Boolean(db) });
});

app.post('/api/auth/verify-phone', async (req, res) => {
  const { idToken, phone } = req.body;

  if (!MOCK_MODE && admin) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);
      return res.json({ uid: decoded.uid, phone: decoded.phone_number || phone });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
  }

  // Mock mode: accept any phone/OTP combo
  const safePhone = phone || '+910000000000';
  const uid = `mock-${safePhone}`;
  return res.json({ uid, phone: safePhone, mock: true });
});

app.get('/api/profiles/me', authGuard, async (req, res) => {
  const { uid, phone } = req.user;

  if (db) {
    const existing = await getProfileDoc(uid);
    if (existing) return res.json(existing);
    const created = await upsertProfileDoc(uid, {
      name: 'New User',
      phone,
      createdAt: Date.now()
    });
    return res.json(created);
  }

  const existing = profiles.find((p) => p.id === uid || p.phone === phone);
  if (existing) return res.json(existing);
  const created = { ...profiles[0], id: uid, phone, name: 'New User' };
  profiles.push(created);
  return res.json(created);
});

app.put('/api/profiles/me', authGuard, async (req, res) => {
  const { uid, phone } = req.user;
  if (db) {
    const saved = await upsertProfileDoc(uid, { ...req.body, phone, updatedAt: Date.now() });
    return res.json(saved);
  }
  const idx = profiles.findIndex((p) => p.id === uid || p.phone === phone);
  if (idx >= 0) {
    profiles[idx] = { ...profiles[idx], ...req.body, id: uid, phone };
    return res.json(profiles[idx]);
  }
  const created = { ...req.body, id: uid, phone };
  profiles.push(created);
  return res.json(created);
});

app.get('/api/search', authGuard, async (req, res) => {
  const { location = '', religion = '', education = '' } = req.query;

  if (db) {
    const allProfiles = await listProfiles();
    const results = (allProfiles || []).filter((p) => {
      const matchLocation = location ? (p.location || '').toLowerCase().includes(location.toLowerCase()) : true;
      const matchReligion = religion ? (p.religion || '').toLowerCase().includes(religion.toLowerCase()) : true;
      const matchEducation = education ? (p.education || '').toLowerCase().includes(education.toLowerCase()) : true;
      return matchLocation && matchReligion && matchEducation;
    });
    return res.json({ results });
  }

  const results = profiles.filter((p) => {
    const matchLocation = location ? p.location.toLowerCase().includes(location.toLowerCase()) : true;
    const matchReligion = religion ? p.religion.toLowerCase().includes(religion.toLowerCase()) : true;
    const matchEducation = education ? p.education.toLowerCase().includes(education.toLowerCase()) : true;
    return matchLocation && matchReligion && matchEducation;
  });
  res.json({ results });
});

app.get('/api/matches', authGuard, async (req, res) => {
  if (db) {
    const allProfiles = await listProfiles();
    const results = (allProfiles || []).slice(0, 6).map((p, idx) => ({ ...p, score: 92 - idx * 3 }));
    return res.json({ results });
  }
  const results = profiles.slice(0, 3).map((p, idx) => ({ ...p, score: 92 - idx * 5 }));
  res.json({ results });
});

app.get('/api/chat/messages/:userId', authGuard, async (req, res) => {
  const { userId } = req.params;
  const me = req.user.uid;
  if (db) {
    const thread = await fetchMessagesDb(me, userId);
    return res.json({ messages: thread || [] });
  }
  const thread = messages[userId] || [];
  res.json({ messages: thread });
});

app.post('/api/chat/messages/:userId', authGuard, async (req, res) => {
  const { userId } = req.params;
  const { body } = req.body;
  const me = req.user.uid;
  if (db) {
    await addMessageDb(me, userId, body);
    return res.json({ ok: true });
  }
  if (!messages[userId]) messages[userId] = [];
  messages[userId].push({ from: me, body });
  res.json({ ok: true });
});

app.get('/api/plans', authGuard, async (req, res) => {
  if (db) {
    const remotePlans = await listPlans();
    if (remotePlans) return res.json({ plans: remotePlans });
  }
  res.json({ plans });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT} (mock=${MOCK_MODE})`);
});
