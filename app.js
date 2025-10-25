// Trinky Web App - Mobile-First Version
class TrinkyApp {
    constructor() {
        this.stravaToken = localStorage.getItem('strava_token');
        this.currentWorkout = null;
        this.workouts = [];
        this.canvas = null;
        this.ctx = null;
        this.currentTab = 'photo';
        this.currentMetric = 'distance';
        this.backgroundImage = null;
        this.logoImage = null;
        
        this.init();
    }

    init() {
        console.log('TrinkyApp initializing...');
        this.setupEventListeners();
        this.setupCanvas();
        this.setupTabs();
        this.initializeRatio();
        this.setupMobileOptimizations();
        this.checkAuthStatus();
        
        // Force display after initialization
        setTimeout(() => {
            this.forceMobileDisplay();
        }, 100);
    }

    setupEventListeners() {
        // Connect Strava button
        document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        document.getElementById('connect-strava-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.connectStrava();
        });
        
        // Demo button
        document.getElementById('demo-btn')?.addEventListener('click', () => this.enableDemoMode());
        document.getElementById('demo-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.enableDemoMode();
        });
        
        // File uploads
        document.getElementById('upload-photo-btn')?.addEventListener('click', () => {
            document.getElementById('photo-input').click();
        });
        
        document.getElementById('upload-logo-btn')?.addEventListener('click', () => {
            document.getElementById('logo-input').click();
        });
        
        document.getElementById('photo-input')?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files[0]);
        });
        
        document.getElementById('logo-input')?.addEventListener('change', (e) => {
            this.handleLogoUpload(e.target.files[0]);
        });
        
        // Nav buttons
        document.getElementById('workout-selector-btn')?.addEventListener('click', () => {
            this.openWorkoutSelector();
        });
        
        document.getElementById('share-btn')?.addEventListener('click', () => {
            this.shareData();
        });
        
        // Modal close
        document.getElementById('close-workout-selector')?.addEventListener('click', () => {
            this.closeWorkoutSelector();
        });
        
        // Close modal on backdrop click
        document.getElementById('workout-selector-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeWorkoutSelector();
            }
        });
    }

    setupTabs() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Data metric buttons
        document.querySelectorAll('.data-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metric = e.target.dataset.metric;
                this.selectMetric(metric);
            });
        });

        // Position buttons
        document.querySelectorAll('.position-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const position = e.target.dataset.position;
                this.setPosition(position);
            });
        });

        // Color buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const color = e.target.dataset.color;
                this.setColor(color);
            });
        });

        // Ratio buttons
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ratio = e.target.dataset.ratio;
                this.setRatio(ratio);
            });
        });
    }

    initializeRatio() {
        // Set default ratio to 9:16 and make it active
        this.setRatio('9:16');
    }

    setupMobileOptimizations() {
        // Force mobile display
        this.forceMobileDisplay();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
                this.forceMobileDisplay();
            }, 100);
        });
        
        // Handle viewport changes
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.forceMobileDisplay();
        });
        
        // Prevent zoom on double tap for mobile
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    forceMobileDisplay() {
        const container = document.getElementById('mobile-container');
        const mainContent = document.querySelector('.main-content');
        const connectedState = document.getElementById('connected');
        const notConnected = document.getElementById('not-connected');
        
        if (container) {
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.maxWidth = '100vw';
            container.style.maxHeight = '100vh';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
        }
        
        if (mainContent) {
            mainContent.style.display = 'flex';
            mainContent.style.flexDirection = 'column';
            mainContent.style.height = 'calc(100vh - 60px - 160px)';
            mainContent.style.marginTop = '60px';
            mainContent.style.marginBottom = '160px';
        }
        
        if (connectedState) {
            connectedState.style.display = 'flex';
            connectedState.style.flexDirection = 'column';
            connectedState.style.height = '100%';
        }
        
        if (notConnected) {
            notConnected.style.display = 'flex';
            notConnected.style.flexDirection = 'column';
            notConnected.style.height = '100%';
        }
        
        console.log('🔧 Mobile display forced');
    }

    setupCanvas() {
        this.canvas = document.getElementById('route-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Get device pixel ratio for crisp rendering on mobile
        const dpr = window.devicePixelRatio || 1;
        
        // Set display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Set actual canvas size with DPR
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Scale context for crisp rendering
        this.ctx.scale(dpr, dpr);
        
        if (this.currentWorkout) {
            this.drawRoute();
        }
    }

    checkAuthStatus() {
        console.log('Checking auth status, token:', this.stravaToken);
        if (this.stravaToken && this.stravaToken !== 'null') {
            console.log('Token found, loading workouts...');
            this.loadWorkouts();
        } else {
            console.log('No token, showing not connected state');
            this.showNotConnectedState();
        }
    }

    async connectStrava() {
        const clientId = window.CONFIG?.STRAVA?.CLIENT_ID || 'YOUR_STRAVA_CLIENT_ID';
        const redirectUri = window.CONFIG?.STRAVA?.REDIRECT_URI || `${window.location.origin}/oauth/`;
        const scope = window.CONFIG?.STRAVA?.SCOPE || 'read,activity:read_all';
        
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isLocalhost && clientId === 'YOUR_STRAVA_CLIENT_ID') {
            this.showDevInstructions();
            return;
        }
        
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
        window.location.href = authUrl;
    }

    enableDemoMode() {
        localStorage.setItem('strava_token', 'demo_token');
        this.stravaToken = 'demo_token';
        this.showConnectedState();
        this.loadWorkouts();
    }

    showDevInstructions() {
        const instructions = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="background: #000000; border: 1px solid #333333; padding: 2rem; border-radius: 8px; max-width: 500px; color: white;">
                    <h2 style="color: #ffffff; margin-bottom: 1rem; font-weight: 300;">Development Mode</h2>
                    <p style="margin-bottom: 1rem; opacity: 0.8;">Для работы с Strava OAuth в локальной разработке:</p>
                    <ol style="margin: 1rem 0; padding-left: 1.5rem; opacity: 0.8;">
                        <li>Создайте приложение на <a href="https://www.strava.com/settings/api" target="_blank" style="color: #ffffff; text-decoration: underline;">Strava API Settings</a></li>
                        <li>Установите Authorization Callback Domain: <code style="background: #111111; padding: 0.2rem 0.4rem; border-radius: 2px;">localhost:8000</code></li>
                        <li>Замените YOUR_STRAVA_CLIENT_ID в config.js на ваш Client ID</li>
                        <li>Или используйте ngrok для публичного URL</li>
                    </ol>
                    <p style="margin: 1rem 0; opacity: 0.8;"><strong>Альтернатива:</strong> Нажмите F12, откройте Console и выполните:</p>
                    <code style="background: #111111; padding: 0.5rem; border-radius: 4px; display: block; margin: 0.5rem 0; font-family: monospace; font-size: 0.9rem;">
                        localStorage.setItem('strava_token', 'mock_token'); location.reload();
                    </code>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #ffffff; color: #000000; border: none; padding: 0.5rem 1rem; border-radius: 4px; margin-top: 1rem; cursor: pointer; font-weight: 300;">
                        Понятно
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', instructions);
    }

    async loadWorkouts() {
        try {
            const response = await this.fetchStravaData('/athlete/activities?per_page=10');
            this.workouts = response.data || [];
            
            if (this.workouts.length > 0) {
                this.currentWorkout = this.workouts[0];
                this.updateWorkoutDisplay();
                this.drawRoute();
            }
            
            this.showConnectedState();
        } catch (error) {
            console.error('Error loading workouts:', error);
            this.showError('Failed to load workouts. Please try again.');
        }
    }

    async fetchStravaData(endpoint) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    data: [
                        {
                            id: 1,
                            name: 'Morning Ride',
                            distance: 15000,
                            moving_time: 3600,
                            total_elevation_gain: 500,
                            average_speed: 4.17,
                            map: { polyline: 'mock_polyline_data' }
                        },
                        {
                            id: 2,
                            name: 'Evening Run',
                            distance: 8000,
                            moving_time: 2400,
                            total_elevation_gain: 200,
                            average_speed: 3.33,
                            map: { polyline: 'mock_polyline_data_2' }
                        }
                    ]
                });
            }, 1000);
        });
    }

    updateWorkoutDisplay() {
        if (!this.currentWorkout) return;

        const distance = this.formatDistance(this.currentWorkout.distance);
        const elevation = this.formatElevation(this.currentWorkout.total_elevation_gain);

        document.getElementById('distance-value').textContent = distance;
        document.getElementById('elevation-value').textContent = elevation;
    }

    formatDistance(meters) {
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters} m`;
    }

    formatElevation(meters) {
        return `${meters} m`;
    }

    drawRoute() {
        if (!this.ctx || !this.currentWorkout) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawDemoRoute();
    }

    drawDemoRoute() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 20;
        
        const points = this.generateDemoRoute(width, height, padding);
        
        // Draw shadow
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.drawPath(points);
        
        // Draw main route with French flag colors
        this.drawSegmentedPath(points);
    }

    generateDemoRoute(width, height, padding) {
        const points = [];
        const numPoints = 40;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = padding + (width - 2 * padding) * t;
            const y = padding + (height - 2 * padding) * (0.5 + 0.3 * Math.sin(t * Math.PI * 3) + 0.2 * Math.sin(t * Math.PI * 7));
            
            // Ensure valid coordinates
            if (!isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y)) {
                points.push({ x: Math.round(x), y: Math.round(y) });
            }
        }
        
        console.log('Generated', points.length, 'valid points');
        return points;
    }

    drawPath(points) {
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
    }

    drawSegmentedPath(points) {
        const segmentLength = points.length / 3;
        
        // Blue segment
        this.ctx.strokeStyle = '#002395';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.drawPathSegment(points, 0, segmentLength);
        
        // White segment
        this.ctx.strokeStyle = '#FFFFFF';
        this.drawPathSegment(points, segmentLength, segmentLength * 2);
        
        // Red segment
        this.ctx.strokeStyle = '#ED2939';
        this.drawPathSegment(points, segmentLength * 2, points.length);
    }

    drawPathSegment(points, start, end) {
        if (!points || !Array.isArray(points) || points.length === 0) {
            console.log('No points to draw');
            return;
        }
        
        // Ensure start and end are within bounds
        start = Math.max(0, Math.min(start, points.length - 1));
        end = Math.max(0, Math.min(end, points.length));
        
        if (start >= end) {
            console.log('Invalid segment range');
            return;
        }
        
        this.ctx.beginPath();
        
        // Find first valid point
        let firstValidPoint = null;
        for (let i = start; i < end; i++) {
            if (points[i] && typeof points[i].x === 'number' && typeof points[i].y === 'number' && 
                !isNaN(points[i].x) && !isNaN(points[i].y)) {
                firstValidPoint = points[i];
                break;
            }
        }
        
        if (!firstValidPoint) {
            console.log('No valid points found in segment');
            // Draw a simple fallback line
            this.ctx.moveTo(50, 50);
            this.ctx.lineTo(100, 100);
            this.ctx.stroke();
            return;
        }
        
        this.ctx.moveTo(firstValidPoint.x, firstValidPoint.y);
        
        for (let i = start + 1; i < end; i++) {
            if (points[i] && typeof points[i].x === 'number' && typeof points[i].y === 'number' &&
                !isNaN(points[i].x) && !isNaN(points[i].y)) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
        }
        
        this.ctx.stroke();
    }

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
    }

    // Metric Selection
    selectMetric(metric) {
        document.querySelectorAll('.data-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-metric="${metric}"]`).classList.add('active');
        
        this.currentMetric = metric;
        this.updateWorkoutDisplay();
    }

    // Position Setting
    setPosition(position) {
        console.log('Setting position:', position);
        // Implement position logic
    }

    // Color Setting
    setColor(color) {
        console.log('Setting color:', color);
        if (color === 'french') {
            this.drawRoute(); // Redraw with French colors
        }
    }

    // Ratio Setting
    setRatio(ratio) {
        console.log('Setting ratio:', ratio);
        const container = document.getElementById('mobile-container');
        
        // Remove all aspect ratio classes
        container.classList.remove('aspect-9-16', 'aspect-4-5');
        
        // Add the new aspect ratio class
        switch(ratio) {
            case '9:16':
                container.classList.add('aspect-9-16');
                break;
            case '4:5':
                container.classList.add('aspect-4-5');
                break;
        }
        
        // Update active button
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-ratio="${ratio}"]`).classList.add('active');
        
        
        // For mobile, use viewport-based sizing instead of fixed dimensions
        if (window.innerWidth <= 768) {
            // Mobile: use viewport dimensions
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.maxWidth = '100vw';
            container.style.maxHeight = '100vh';
            container.style.transform = 'none';
            container.style.marginLeft = '0';
            container.style.marginRight = '0';
            
            console.log('Mobile mode: using viewport dimensions');
        } else {
            // Desktop: use aspect ratio with scaling
            setTimeout(() => {
                const rect = container.getBoundingClientRect();
                console.log('Container dimensions:', rect.width, 'x', rect.height);
                
                // Apply fixed dimensions based on ratio
                let width, height;
                
                switch(ratio) {
                    case '9:16':
                        width = 400;
                        height = 711;
                        break;
                    case '4:5':
                        width = 400;
                        height = 500;
                        break;
                }
                
                container.style.width = `${width}px`;
                container.style.height = `${height}px`;
                container.style.maxWidth = `${width}px`;
                container.style.maxHeight = `${height}px`;
                container.style.transform = 'none';
                container.style.marginLeft = 'auto';
                container.style.marginRight = 'auto';
                
                console.log('Desktop mode: applied dimensions', width, 'x', height);
                
                this.resizeCanvas();
            }, 100);
        }
    }

    // File Upload Handlers
    handlePhotoUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.backgroundImage = e.target.result;
            this.updateBackground();
        };
        reader.readAsDataURL(file);
    }

    handleLogoUpload(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoImage = e.target.result;
            this.updateLogo();
        };
        reader.readAsDataURL(file);
    }

    updateBackground() {
        const background = document.getElementById('workout-background');
        if (this.backgroundImage) {
            background.style.backgroundImage = `url(${this.backgroundImage})`;
            background.style.backgroundSize = 'cover';
            background.style.backgroundPosition = 'center';
            background.style.backgroundRepeat = 'no-repeat';
        }
    }

    updateLogo() {
        // Implement logo update logic
        console.log('Logo updated:', this.logoImage);
    }

    showNotConnectedState() {
        console.log('Showing not connected state');
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        const connected = document.getElementById('connected');
        
        if (loading) loading.classList.add('hidden');
        if (notConnected) notConnected.classList.remove('hidden');
        if (connected) connected.classList.add('hidden');
    }

    showConnectedState() {
        console.log('Showing connected state');
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        const connected = document.getElementById('connected');
        
        if (loading) loading.classList.add('hidden');
        if (notConnected) notConnected.classList.add('hidden');
        if (connected) connected.classList.remove('hidden');
    }

    showError(message) {
        alert(message);
    }

    // Workout Selector Modal
    openWorkoutSelector() {
        const modal = document.getElementById('workout-selector-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateWorkoutList();
        }
    }

    closeWorkoutSelector() {
        const modal = document.getElementById('workout-selector-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    populateWorkoutList() {
        const workoutList = document.getElementById('workout-list');
        if (!workoutList || !this.workouts.length) {
            workoutList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No workouts available</p>';
            return;
        }

        workoutList.innerHTML = this.workouts.map((workout, index) => `
            <div class="workout-item ${workout.id === this.currentWorkout?.id ? 'active' : ''}" 
                 data-workout-id="${workout.id}">
                <h4 class="workout-name">${workout.name || 'Unnamed Workout'}</h4>
                <div class="workout-stats">
                    <div class="workout-stat">
                        <span class="workout-stat-label">Distance</span>
                        <span class="workout-stat-value">${this.formatDistance(workout.distance)}</span>
                    </div>
                    <div class="workout-stat">
                        <span class="workout-stat-label">Elevation</span>
                        <span class="workout-stat-value">${this.formatElevation(workout.total_elevation_gain)}</span>
                    </div>
                    <div class="workout-stat">
                        <span class="workout-stat-label">Time</span>
                        <span class="workout-stat-value">${this.formatTime(workout.moving_time)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        workoutList.querySelectorAll('.workout-item').forEach(item => {
            item.addEventListener('click', () => {
                const workoutId = parseInt(item.dataset.workoutId);
                this.selectWorkout(workoutId);
            });
        });
    }

    selectWorkout(workoutId) {
        const workout = this.workouts.find(w => w.id === workoutId);
        if (workout) {
            this.currentWorkout = workout;
            this.updateWorkoutDisplay();
            this.drawRoute();
            this.closeWorkoutSelector();
            console.log('🏃 Selected workout:', workout.name);
        }
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    // Share functionality
    shareData() {
        if (!this.currentWorkout) {
            this.showError('No workout data to share');
            return;
        }

        const shareText = `Check out my workout: ${this.currentWorkout.name || 'Workout'} - ${this.formatDistance(this.currentWorkout.distance)}`;
        
        if (navigator.share) {
            navigator.share({
                title: '5zn Workout',
                text: shareText,
                url: window.location.href
            }).then(() => {
                console.log('📤 Shared successfully');
            }).catch((error) => {
                console.log('Error sharing:', error);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Workout info copied to clipboard!');
            }).catch(() => {
                alert(text);
            });
        } else {
            alert(text);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing TrinkyApp');
    new TrinkyApp();
});

// Force show not connected state if no token
if (!localStorage.getItem('strava_token')) {
    console.log('No token found, forcing not connected state');
    setTimeout(() => {
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        if (loading) loading.classList.add('hidden');
        if (notConnected) notConnected.classList.remove('hidden');
    }, 100);
}

// Handle OAuth callback
if (window.location.pathname.includes('/oauth/')) {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        console.log('OAuth code received:', code);
        localStorage.setItem('strava_token', 'mock_token');
        window.location.href = '/';
    }
}