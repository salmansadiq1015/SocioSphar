import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDmc9W99g5kQmCnKMgqpy40KRcHURJEhFg",
  authDomain: "wchat-app-29154.firebaseapp.com",
  projectId: "wchat-app-29154",
  storageBucket: "wchat-app-29154.appspot.com",
  messagingSenderId: "773821910601",
  appId: "1:773821910601:web:c71c9def357fea00343998",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
