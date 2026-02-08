// Supabase Client Initialization
// This file initializes the Supabase client for use across the application

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
);

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient };
}
