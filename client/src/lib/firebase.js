import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en';

let recaptcha;
export const getRecaptcha = () => {
  if (recaptcha) return recaptcha;
  recaptcha = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible'
  });
  return recaptcha;
};

export const sendOtp = async (phoneNumber) => {
  const verifier = getRecaptcha();
  return signInWithPhoneNumber(auth, phoneNumber, verifier);
};

export const getIdToken = async () => {
  if (!auth.currentUser) return null;
  return auth.currentUser.getIdToken();
};

export const subscribeAuth = (cb) => onAuthStateChanged(auth, cb);

export const signOutUser = () => auth.signOut();

export { auth };
