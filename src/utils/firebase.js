// ============================================
// Rentora — Firebase Configuration
// ============================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if keys are actually configured and not placeholders
const isConfigValid = 
    firebaseConfig.apiKey && 
    !firebaseConfig.apiKey.includes('your_') && 
    !firebaseConfig.apiKey.includes('placeholder') &&
    firebaseConfig.apiKey !== 'AIzaSyA1...'; // matches the placeholder in .env.example

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isConfigValid) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        window.__firebaseConfigError = false;
    } catch (err) {
        console.error('[Rentora] Failed to initialize Firebase:', err.message);
        window.__firebaseConfigError = true;
        window.__firebaseConfigMessage = err.message;
    }
} else {
    console.warn('[Rentora] Firebase configuration keys are missing or invalid placeholders. Falling back to local storage mode.');
    window.__firebaseConfigError = true;
    window.__firebaseConfigMessage = 'Firebase environment variables are missing or contain placeholder values.';
    
    // Create stubs so eager imports don't crash
    app = {};
    auth = {};
    db = {};
    storage = {};
}

export { auth, db, storage };
export default app;
