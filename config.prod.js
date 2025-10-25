// Production Configuration for 5zn-web
window.CONFIG = {
    STRAVA: {
        CLIENT_ID: process.env.STRAVA_CLIENT_ID || 'your_strava_client_id_here',
        CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET || 'your_strava_client_secret_here',
        REDIRECT_URI: process.env.STRAVA_REDIRECT_URI || 'https://app.5zn.io/oauth/index.html',
        SCOPE: 'read,activity:read_all'
    }
};
