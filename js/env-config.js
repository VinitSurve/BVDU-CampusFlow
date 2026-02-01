/**
 * Environment Configuration Loader
 * Loads configuration from .env file for local development
 * and from Vercel environment variables for production
 */

// Helper to get environment variable
const getEnvVar = (key, defaultValue = '') => {
  // Check if running in Vercel (production)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || defaultValue;
  }
  
  // For local development, we'll inject these via a build step
  // or use window.__ENV__ object set by env-loader.js
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__[key] || defaultValue;
  }
  
  return defaultValue;
};

// Export configuration object
export const config = {
  firebase: {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID'),
    measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')
  },
  googleDrive: {
    apiKey: getEnvVar('VITE_GOOGLE_DRIVE_API_KEY'),
    clientId: getEnvVar('VITE_GOOGLE_DRIVE_CLIENT_ID'),
    folderId: getEnvVar('VITE_GOOGLE_DRIVE_FOLDER_ID')
  },
  useEmulators: getEnvVar('VITE_USE_EMULATORS', 'false') === 'true'
};
