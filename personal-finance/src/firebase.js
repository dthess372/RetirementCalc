import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9kWzOTCReP708h8NEu5uJE3gWK5iglso",
  authDomain: "wealthstud-95ead.firebaseapp.com",
  projectId: "wealthstud-95ead",
  storageBucket: "wealthstud-95ead.appspot.com",
  messagingSenderId: "399182709975",
  appId: "1:399182709975:web:bd684554d7e4b6c5305c92",
  measurementId: "G-Z65Z3091W2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = app.auth;
