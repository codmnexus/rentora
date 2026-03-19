// ============================================
// Rentora — Firebase Configuration
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD4AWWH2HKE7vVUzoloG9iN2UQ17BOyCTs",
    authDomain: "rentoral.firebaseapp.com",
    projectId: "rentoral",
    storageBucket: "rentoral.firebasestorage.app",
    messagingSenderId: "141304183045",
    appId: "1:141304183045:web:951e01c27cc67cb68b1f6c",
    measurementId: "G-EFF7L12907"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
