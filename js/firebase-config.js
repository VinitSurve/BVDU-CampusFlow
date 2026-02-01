/**
 * Firebase Configuration
 * OD Forms Management System - BVDU CampusFlow
 * 
 * Configuration is loaded from environment variables:
 * - Local Development: .env file
 * - Production (Vercel): Environment variables in dashboard
 */

// Firebase SDK imports (using CDN modules)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, connectAuthEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, connectFirestoreEmulator } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ============================================
// LOAD ENVIRONMENT VARIABLES
// ============================================
// Helper to get environment variable (works in both dev and production)
const getEnv = (key) => {
  // Check window.__ENV__ (set by env-loader.js in development)
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  // No fallback - must be set in .env or Vercel environment variables
  console.error(`Missing environment variable: ${key}`);
  return '';
};

// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

// ============================================
// GOOGLE DRIVE CONFIGURATION
// ============================================
const googleDriveConfig = {
  apiKey: getEnv('VITE_GOOGLE_DRIVE_API_KEY'),
  clientId: getEnv('VITE_GOOGLE_DRIVE_CLIENT_ID'),
  folderId: getEnv('VITE_GOOGLE_DRIVE_FOLDER_ID')
};

// ============================================
// DEVELOPMENT/PRODUCTION TOGGLE
// ============================================
const USE_EMULATORS = getEnv('VITE_USE_EMULATORS', 'false') === 'true';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export Google Drive config
export const driveConfig = googleDriveConfig;

// Connect to emulators in development mode
if (USE_EMULATORS) {
  console.log('🔧 Using Firebase Emulators');
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

// ============================================
// HELPER: Check if Firebase is configured
// ============================================
export function isFirebaseConfigured() {
  return firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza');
}

// ============================================
// HELPER: Check if Google Drive is configured
// ============================================
export function isGoogleDriveConfigured() {
  return googleDriveConfig.apiKey && 
         googleDriveConfig.clientId && 
         googleDriveConfig.folderId &&
         !googleDriveConfig.apiKey.includes('YOUR_');
}

// ============================================
// HELPER: Get Firebase project info
// ============================================
export function getProjectInfo() {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    storageBucket: firebaseConfig.storageBucket
  };
}

// Log configuration status
if (!isFirebaseConfigured()) {
  console.warn('⚠️ Firebase is not configured. Please update js/firebase-config.js with your Firebase credentials.');
} else {
  console.log('✅ Firebase initialized successfully');
}

export default app;
