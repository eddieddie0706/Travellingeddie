import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZ_eSDqGhuaf9FGKs5r4_jT6xHIYpwjZ0",
  authDomain: "travellingeddie.firebaseapp.com",
  projectId: "travellingeddie",
  storageBucket: "travellingeddie.firebasestorage.app",
  messagingSenderId: "330515479231",
  appId: "1:330515479231:web:06d600a31f326248cf640a",
  measurementId: "G-QVK8PMSYBC",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
