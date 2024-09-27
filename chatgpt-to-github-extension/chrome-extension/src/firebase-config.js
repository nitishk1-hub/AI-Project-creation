import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged as firebaseOnAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAm0i5tRqqNXBIOCB2CRTV3wpWetHzyEEo",
  authDomain: "clip-extension-34a13.firebaseapp.com",
  projectId: "clip-extension-34a13",
  storageBucket: "clip-extension-34a13.appspot.com",
  messagingSenderId: "214666516099",
  appId: "1:214666516099:web:38108ca9dd03c72fae2db6",
  measurementId: "G-1XX7V1JNVN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

export { app, auth, functions, firebaseOnAuthStateChanged, signInWithCustomToken, httpsCallable };
