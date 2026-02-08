#!/usr/bin/env node
/**
 * Build script to generate config.js from environment variables
 * This runs during Vercel deployment to inject Supabase credentials
 */

const fs = require('fs');
const path = require('path');

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

// Validate required variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  if (!SUPABASE_URL) console.error('   - SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) console.error('   - SUPABASE_ANON_KEY');
  console.error('\nPlease set these in your Vercel project settings.');
  process.exit(1);
}

// Generate config.js content
const configContent = `// Auto-generated config file - DO NOT EDIT MANUALLY
// Generated at build time from environment variables

const SUPABASE_URL = '${SUPABASE_URL}';
const SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';

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
const GOOGLE_MAPS_CONFIG = {
  apiKey: '${GOOGLE_MAPS_API_KEY}',
  defaultLocation: {
    lat: 18.4538,
    lng: 73.8636,
    name: 'Bharati Vidyapeeth Deemed University, Pune'
  },
  defaultZoom: 15
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SUPABASE_CONFIG,
    USE_SUPABASE,
    MOCK_CONFIG,
    GOOGLE_MAPS_CONFIG
  };
}
`;

// Determine the output path
const outputPath = path.join(__dirname, '..', 'od-forms-bvdu-dms', 'js', 'config.js');

// Ensure directory exists
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write the config file
fs.writeFileSync(outputPath, configContent, 'utf8');

console.log('✅ Successfully generated config.js');
console.log(`   SUPABASE_URL: ${SUPABASE_URL.substring(0, 30)}...`);
console.log(`   SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
