// Trinky Web - Configuration
// Update these values for your development environment

const CONFIG = {
    // Strava API Configuration
    STRAVA: {
        CLIENT_ID: 'YOUR_STRAVA_CLIENT_ID', // Replace with your Strava Client ID
        CLIENT_SECRET: 'YOUR_STRAVA_CLIENT_SECRET', // Replace with your Strava Client Secret
        REDIRECT_URI: window.location.origin + '/oauth/',
        SCOPE: 'read,activity:read_all',
        API_BASE_URL: 'https://www.strava.com/api/v3'
    },
    
    // Development Settings
    DEV: {
        MOCK_DATA: true, // Set to false for real Strava API calls
        DEBUG: true, // Enable console logging
        AUTO_CONNECT: false // Automatically connect with mock data in dev mode
    },
    
    // App Settings
    APP: {
        NAME: 'Trinky Web',
        VERSION: '1.0.0',
        DEFAULT_WORKOUTS_COUNT: 10
    }
};

// Development helpers
if (CONFIG.DEV.DEBUG) {
    console.log('🔧 Trinky Web - Development Mode');
    console.log('📋 Configuration:', CONFIG);
}

// Auto-connect with mock data in development
if (CONFIG.DEV.AUTO_CONNECT && window.location.hostname === 'localhost') {
    console.log('🚀 Auto-connecting with mock data...');
    localStorage.setItem('strava_token', 'mock_token_' + Date.now());
}

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
