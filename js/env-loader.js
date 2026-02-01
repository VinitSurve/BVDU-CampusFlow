/**
 * Environment Variables Loader
 * This script loads .env file and makes variables available to the app
 * Only used in local development - Vercel handles env vars automatically
 */

(function() {
  // Only run in development (localhost)
  if (!window.location.hostname.includes('localhost') && 
      !window.location.hostname.includes('127.0.0.1')) {
    return;
  }

  // Parse .env file content
  async function loadEnvFile() {
    try {
      const response = await fetch('/.env');
      if (!response.ok) {
        console.warn('No .env file found - using defaults');
        return {};
      }
      
      const envText = await response.text();
      const envVars = {};
      
      envText.split('\n').forEach(line => {
        // Skip comments and empty lines
        if (line.trim().startsWith('#') || !line.trim()) return;
        
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });
      
      return envVars;
    } catch (error) {
      console.error('Error loading .env file:', error);
      return {};
    }
  }

  // Load and expose environment variables
  loadEnvFile().then(envVars => {
    window.__ENV__ = envVars;
    console.log('✅ Environment variables loaded');
  });
})();
