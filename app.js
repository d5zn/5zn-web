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
        const previewArea = document.querySelector('.preview-area');
        const connectedState = document.getElementById('connected');
        
        if (container && previewArea) {
            // Простая структура: navbar фикс, панель фикс, preview-area растягивается
            container.style.setProperty('width', '100vw', 'important');
            container.style.setProperty('height', '100vh', 'important');
            container.style.setProperty('display', 'flex', 'important');
            container.style.setProperty('flex-direction', 'column', 'important');
            container.style.setProperty('margin', '0', 'important');
            container.style.setProperty('padding', '0', 'important');
            container.style.setProperty('overflow', 'hidden', 'important');
            
            // Preview area просто растягивается
            previewArea.style.setProperty('flex', '1', 'important');
            previewArea.style.setProperty('display', 'flex', 'important');
            previewArea.style.setProperty('align-items', 'center', 'important');
            previewArea.style.setProperty('justify-content', 'center', 'important');
            
            // Connected state заполняет preview area
            if (connectedState) {
                connectedState.style.setProperty('width', '100%', 'important');
                connectedState.style.setProperty('height', '100%', 'important');
            }
            
            console.log('🔧 Простая flex структура установлена');
        }
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
        
        // Проверяем текущее соотношение
        const connectedState = document.getElementById('connected');
        const is4_5 = connectedState && connectedState.classList.contains('ratio-4-5');
        
        // Get device pixel ratio for crisp rendering on mobile
        const dpr = window.devicePixelRatio || 1;
        
        let canvasWidth, canvasHeight;
        
        if (is4_5) {
            // Для 4:5 canvas рассчитывается по ширине экрана
            const screenWidth = window.innerWidth;
            canvasWidth = screenWidth;
            canvasHeight = screenWidth * 5 / 4;
            
            console.log('📐 4:5 Canvas - calculated from screen width:', canvasWidth, 'x', canvasHeight);
        } else {
            // Для 9:16 используем размеры preview-area
            const previewArea = document.querySelector('.preview-area');
            const previewRect = previewArea.getBoundingClientRect();
            
            canvasWidth = previewRect.width;
            canvasHeight = previewRect.height;
            
            console.log('📐 9:16 Canvas - using preview area:', canvasWidth, 'x', canvasHeight);
        }
        
        // Set display size
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';
        
        // Set actual canvas size with DPR for crisp rendering
        this.canvas.width = canvasWidth * dpr;
        this.canvas.height = canvasHeight * dpr;
        
        // Scale context for crisp rendering
        this.ctx.scale(dpr, dpr);
        
        console.log('📐 Canvas resized:', canvasWidth, 'x', canvasHeight);
        
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
        const speed = this.formatSpeed(this.currentWorkout.average_speed);
        const time = this.formatTime(this.currentWorkout.moving_time);

        document.getElementById('distance-value').textContent = distance;
        document.getElementById('elevation-value').textContent = elevation;
        document.getElementById('speed-value').textContent = speed;
        document.getElementById('time-value').textContent = time;
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

    formatSpeed(mps) {
        // Convert m/s to km/h
        const kmh = mps * 3.6;
        return `${kmh.toFixed(1)} km/h`;
    }

    drawRoute() {
        if (!this.ctx || !this.currentWorkout) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фоновую картинку если есть
        this.drawBackground();
        
        // Рисуем маршрут
        this.drawDemoRoute();
        
        // Рисуем данные Strava
        this.drawStravaData();
    }

    drawBackground() {
        if (this.backgroundImage) {
            const img = new Image();
            img.onload = () => {
                // Получаем размеры canvas (уже с учетом DPR)
                const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
                const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
                
                const imgAspect = img.width / img.height;
                const canvasAspect = canvasWidth / canvasHeight;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                // Адаптируем изображение под высоту канваса (cover по высоте)
                if (imgAspect > canvasAspect) {
                    // Изображение шире - масштабируем по высоте и обрезаем по бокам
                    drawHeight = canvasHeight;
                    drawWidth = drawHeight * imgAspect;
                    drawX = (canvasWidth - drawWidth) / 2;
                    drawY = 0;
                } else {
                    // Изображение уже - масштабируем по ширине и обрезаем сверху/снизу
                    drawWidth = canvasWidth;
                    drawHeight = drawWidth / imgAspect;
                    drawX = 0;
                    drawY = (canvasHeight - drawHeight) / 2;
                }
                
                // Рисуем изображение, заполняющее весь канвас
                this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                console.log('🖼️ Background image drawn to canvas (height-adaptive)');
            };
            img.src = this.backgroundImage;
        }
    }

    drawStravaData() {
        if (!this.currentWorkout) return;
        
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Проверяем соотношение для выбора layout
        const connectedState = document.getElementById('connected');
        const is4_5 = connectedState && connectedState.classList.contains('ratio-4-5');
        
        if (is4_5) {
            // Для 4:5 используем старый layout
            this.drawStravaDataOld();
        } else {
            // Для 9:16 используем новый layout в стиле карточки
            this.drawStravaDataCard();
        }
    }

    drawStravaDataCard() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Заголовок и дата в верхней части
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Morning Ride', 20, 50);
        
        this.ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillStyle = '#CCCCCC';
        this.ctx.fillText('25 OCT, 15:30', 20, 80);
        
        // Иконка велосипеда справа
        this.drawBikeIcon(canvasWidth - 60, 30);
        
        // График в центральной части
        this.drawActivityGraph(20, 120, canvasWidth - 40, 200);
        
        // Статистики внизу (3x2 сетка)
        const statsY = 350;
        const statsHeight = canvasHeight - statsY - 20;
        const statsWidth = canvasWidth - 40;
        const colWidth = statsWidth / 3;
        const rowHeight = statsHeight / 2;
        
        const stats = [
            { label: 'DISTANCE', value: this.formatDistance(this.currentWorkout.distance) },
            { label: 'ELEVATION', value: this.formatElevation(this.currentWorkout.total_elevation_gain) },
            { label: 'TIME', value: this.formatTime(this.currentWorkout.moving_time) },
            { label: 'SPEED/AVG', value: this.formatSpeed(this.currentWorkout.average_speed) },
            { label: 'CALORIES', value: '1,200' },
            { label: 'POWER/AVG', value: '180W' }
        ];
        
        for (let i = 0; i < stats.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const x = 20 + col * colWidth;
            const y = statsY + row * rowHeight;
            
            // Label
            this.ctx.fillStyle = '#AAAAAA';
            this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(stats[i].label, x, y + 20);
            
            // Value
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            this.ctx.fillText(stats[i].value, x, y + 45);
        }
        
        console.log('📊 Strava data card drawn to canvas');
    }

    drawStravaDataOld() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Настройки текста
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.textAlign = 'left';
        
        // Верхние данные
        const distance = this.formatDistance(this.currentWorkout.distance);
        const elevation = this.formatElevation(this.currentWorkout.total_elevation_gain);
        
        this.ctx.fillText('DISTANCE', 20, 40);
        this.ctx.fillText(distance, 20, 70);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText('ELEVATION', canvasWidth - 20, 40);
        this.ctx.fillText(elevation, canvasWidth - 20, 70);
        
        // Нижние данные
        const speed = this.formatSpeed(this.currentWorkout.average_speed);
        const time = this.formatTime(this.currentWorkout.moving_time);
        
        this.ctx.textAlign = 'left';
        this.ctx.fillText('AVG SPEED', 20, canvasHeight - 50);
        this.ctx.fillText(speed, 20, canvasHeight - 20);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText('TIME', canvasWidth - 20, canvasHeight - 50);
        this.ctx.fillText(time, canvasWidth - 20, canvasHeight - 20);
        
        console.log('📊 Strava data old layout drawn to canvas');
    }

    drawBikeIcon(x, y) {
        // Простая иконка велосипеда
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        // Рама велосипеда
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 20);
        this.ctx.lineTo(x + 15, y + 10);
        this.ctx.lineTo(x + 25, y + 15);
        this.ctx.lineTo(x + 30, y + 5);
        this.ctx.stroke();
        
        // Колеса
        this.ctx.beginPath();
        this.ctx.arc(x + 5, y + 20, 8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(x + 25, y + 15, 8, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawActivityGraph(x, y, width, height) {
        // Рисуем график активности (элевация или мощность)
        this.ctx.strokeStyle = '#FF6B35';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Создаем точки для графика
        const points = [];
        const numPoints = 20;
        
        for (let i = 0; i <= numPoints; i++) {
            const pointX = x + (i / numPoints) * width;
            const pointY = y + height - (Math.sin(i * 0.3) * 0.5 + 0.5) * height * 0.8;
            points.push({ x: pointX, y: pointY });
        }
        
        // Рисуем линию графика
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
        
        // Добавляем тень
        this.ctx.strokeStyle = 'rgba(255, 107, 53, 0.3)';
        this.ctx.lineWidth = 6;
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.stroke();
        this.ctx.globalCompositeOperation = 'source-over';
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
        
        // Update active button
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-ratio="${ratio}"]`).classList.add('active');
        
        // Update preview-area ratio с правильной формулой
        const previewArea = document.querySelector('.preview-area');
        const connectedState = document.getElementById('connected');
        
        if (previewArea && connectedState) {
            // Просто переключаем ratio классы
            previewArea.classList.remove('ratio-9-16', 'ratio-4-5');
            connectedState.classList.remove('ratio-9-16', 'ratio-4-5');
            
            switch(ratio) {
                case '9:16':
                    // Для 9:16 рассчитываем от доступной высоты экрана
                    const screenHeight = window.innerHeight;
                    const navBarHeight = 60;
                    const tabBarHeight = 180;
                    const safeAreaInsets = 0;
                    
                    const viewportHeight9_16 = screenHeight - navBarHeight - tabBarHeight - safeAreaInsets;
                    const viewportWidth9_16 = viewportHeight9_16 * 9 / 16;
                    
                    previewArea.classList.add('ratio-9-16');
                    connectedState.classList.add('ratio-9-16');
                    
                    // Устанавливаем правильные размеры для preview-area
                    previewArea.style.setProperty('width', `${viewportWidth9_16}px`, 'important');
                    previewArea.style.setProperty('height', `${viewportHeight9_16}px`, 'important');
                    previewArea.style.setProperty('max-width', `${viewportWidth9_16}px`, 'important');
                    previewArea.style.setProperty('max-height', `${viewportHeight9_16}px`, 'important');
                    
                    connectedState.style.setProperty('aspect-ratio', '9 / 16', 'important');
                    connectedState.style.setProperty('width', '100%', 'important');
                    connectedState.style.setProperty('height', '100%', 'important');
                    
                    console.log('🔧 Установлено соотношение 9:16:', viewportWidth9_16, 'x', viewportHeight9_16);
                    break;
                case '4:5':
                    // Для 4:5 контейнер превью остается на своем месте (по высоте)
                    // А canvas внутри рассчитывается по ширине экрана
                    const screenHeight4_5 = window.innerHeight;
                    const screenWidth4_5 = window.innerWidth;
                    const navBarHeight4_5 = 60;
                    const tabBarHeight4_5 = 180;
                    const safeAreaInsets4_5 = 0;
                    
                    // Контейнер превью - фиксированная высота (как для 9:16)
                    const containerHeight4_5 = screenHeight4_5 - navBarHeight4_5 - tabBarHeight4_5 - safeAreaInsets4_5;
                    
                    // Canvas для 4:5 - рассчитывается по ширине экрана
                    const canvasWidth4_5 = screenWidth4_5;
                    const canvasHeight4_5 = screenWidth4_5 * 5 / 4;
                    
                    previewArea.classList.add('ratio-4-5');
                    connectedState.classList.add('ratio-4-5');
                    
                    // Контейнер превью - остается на своем месте
                    previewArea.style.setProperty('width', '100%', 'important');
                    previewArea.style.setProperty('height', `${containerHeight4_5}px`, 'important');
                    previewArea.style.setProperty('max-width', '100%', 'important');
                    previewArea.style.setProperty('max-height', `${containerHeight4_5}px`, 'important');
                    
                    // Connected state - заполняет контейнер
                    connectedState.style.setProperty('aspect-ratio', '4 / 5', 'important');
                    connectedState.style.setProperty('width', '100%', 'important');
                    connectedState.style.setProperty('height', '100%', 'important');
                    
                    console.log('🔧 Установлено соотношение 4:5 - контейнер:', '100% x', containerHeight4_5, 'canvas:', canvasWidth4_5, 'x', canvasHeight4_5);
                    break;
            }
        }
        
        console.log('🔧 Ratio изменен на:', ratio, '- превью обновлен');
        
        // Перерисовываем canvas после изменения соотношения
        setTimeout(() => {
            this.resizeCanvas();
            console.log('🔧 Canvas перерисован после изменения соотношения');
        }, 100);
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
        // Убираем CSS фон, теперь фон рисуется в canvas
        const background = document.getElementById('connected');
        background.style.backgroundImage = 'none';
        
        // Управляем шашечками в зависимости от наличия фона
        if (this.backgroundImage) {
            this.canvas.classList.add('has-background');
        } else {
            this.canvas.classList.remove('has-background');
        }
        
        // Обновляем размер canvas
        this.resizeCanvas();
        
        // Перерисовываем canvas с новым фоном
        if (this.currentWorkout) {
            this.drawRoute();
        }
        
        console.log('🖼️ Background updated in canvas');
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
        if (connected) {
            connected.classList.remove('hidden');
            // Принудительно устанавливаем правильные пропорции 9:16
            connected.style.setProperty('aspect-ratio', '9 / 16', 'important');
            connected.style.setProperty('max-height', '100%', 'important');
            connected.style.setProperty('overflow', 'hidden', 'important');
            connected.style.setProperty('box-sizing', 'border-box', 'important');
            connected.style.setProperty('width', '100%', 'important');
            connected.style.setProperty('height', 'auto', 'important');
            
            // Просто показываем connected state
            console.log('🔧 Connected state показан');
            
            // Перерисовываем canvas для правильного размера
            setTimeout(() => {
                this.resizeCanvas();
                console.log('🔧 Canvas перерисован при показе connected state');
            }, 100);
            
            console.log('🔧 Connected state с правильными пропорциями 9:16');
        }
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

    // Export functionality with proper 1080x1920 resolution
    exportData() {
        if (!this.currentWorkout) {
            this.showError('No workout data to export');
            return;
        }

        // Create a new canvas with exact 1080x1920 resolution (оригинальный размер)
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = 1080;
        exportCanvas.height = 1920;
        const exportCtx = exportCanvas.getContext('2d');

        // Fill background
        exportCtx.fillStyle = '#000000';
        exportCtx.fillRect(0, 0, 1080, 1920);

        // Draw route with proper scaling for 1080x1920
        const padding = 40;
        const routeWidth = 1080 - (padding * 2);
        const routeHeight = 1920 - (padding * 2) - 200; // Leave space for stats

        // Generate route points for export resolution (1080x1920)
        const points = this.generateDemoRoute(routeWidth, routeHeight, 0);
        
        // Draw route with French flag colors
        const segmentLength = points.length / 3;
        
        // Blue segment
        exportCtx.strokeStyle = '#002395';
        exportCtx.lineWidth = 8;
        exportCtx.lineCap = 'round';
        exportCtx.lineJoin = 'round';
        this.drawExportPathSegment(exportCtx, points, 0, segmentLength, padding);
        
        // White segment
        exportCtx.strokeStyle = '#FFFFFF';
        this.drawExportPathSegment(exportCtx, points, segmentLength, segmentLength * 2, padding);
        
        // Red segment
        exportCtx.strokeStyle = '#ED2939';
        this.drawExportPathSegment(exportCtx, points, segmentLength * 2, points.length, padding);

        // Draw stats overlay
        exportCtx.fillStyle = '#FFFFFF';
        exportCtx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        exportCtx.textAlign = 'left';
        exportCtx.fillText('DISTANCE', 60, 1800);
        exportCtx.fillText('3 000 m', 60, 1860);
        
        exportCtx.textAlign = 'right';
        exportCtx.fillText('ELEVATION', 1020, 1800);
        exportCtx.fillText('3 000 m', 1020, 1860);

        // Download the image
        const link = document.createElement('a');
        link.download = `5zn-workout-${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png');
        link.click();

        console.log('📸 Exported workout image: 1080x1920 (оригинальный размер)');
    }

    drawExportPathSegment(ctx, points, start, end, offsetX) {
        if (!points || !Array.isArray(points) || points.length === 0) return;
        
        start = Math.max(0, Math.min(start, points.length - 1));
        end = Math.max(0, Math.min(end, points.length));
        
        if (start >= end) return;
        
        ctx.beginPath();
        
        // Find first valid point
        let firstValidPoint = null;
        for (let i = start; i < end; i++) {
            if (points[i] && typeof points[i].x === 'number' && typeof points[i].y === 'number' && 
                !isNaN(points[i].x) && !isNaN(points[i].y)) {
                firstValidPoint = points[i];
                break;
            }
        }
        
        if (!firstValidPoint) return;
        
        ctx.moveTo(firstValidPoint.x + offsetX, firstValidPoint.y + 100); // Offset for header
        
        for (let i = start + 1; i < end; i++) {
            if (points[i] && typeof points[i].x === 'number' && typeof points[i].y === 'number' &&
                !isNaN(points[i].x) && !isNaN(points[i].y)) {
                ctx.lineTo(points[i].x + offsetX, points[i].y + 100);
            }
        }
        
        ctx.stroke();
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