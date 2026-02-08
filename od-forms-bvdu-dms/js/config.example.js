// Supabase Configuration
// IMPORTANT: Copy this file to 'config.js' and update with your actual credentials
// DO NOT commit config.js to version control - it's in .gitignore for security

// Get your Supabase credentials from: https://app.supabase.com/project/YOUR_PROJECT/settings/api
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

const SUPABASE_CONFIG = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY
};

// Database is configured and ready - always use real data
const USE_SUPABASE = true;

// Mock data disabled - using real database only
const MOCK_CONFIG = {
  enabled: false,
  mockDelay: 0
};

// Google Maps Configuration
// Get your API key from: https://console.cloud.google.com/google/maps-apis
const GOOGLE_MAPS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Replace with your actual Google Maps API key
  defaultLocation: {
    lat: 18.4538,
    lng: 73.8636,
    name: 'Bharati Vidyapeeth Deemed University, Pune'
  }
};

// Google Sheets Configuration
// Get your credentials from: https://console.cloud.google.com/apis/credentials
const GOOGLE_SHEETS_CONFIG = {
  apiKey: 'YOUR_GOOGLE_SHEETS_API_KEY', // Replace with your actual Google Sheets API key
  clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Replace with your OAuth 2.0 Client ID
  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
  scopes: 'https://www.googleapis.com/auth/spreadsheets'
};

// Feature flags
const FEATURES = {
  googleMaps: true, // Enable/disable Google Maps integration
  googleSheets: true, // Enable/disable Google Sheets integration
  qrScanner: false, // Enable/disable QR code scanner (requires additional setup)
  geolocation: true // Enable/disable geolocation features
};
