// Enhanced TrinkyApp - Using nextPoly-inspired Canvas System
// Обновленная версия с модульной архитектурой и профессиональными эффектами

// Утилита для условного логирования (только в development)
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const log = isDev ? console.log : () => {};

// Define polyline decoder inline if not loaded
if (typeof window.polyline === 'undefined') {
    console.log('⚠️ Polyline library not found, defining inline decoder...');
    window.polyline = {
        decode: function(str, precision) {
            var index = 0, lat = 0, lng = 0, coordinates = [];
            var shift = 0, result = 0, byte = null;
            var latitude_change, longitude_change;
            var factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);

            while (index < str.length) {
                byte = null;
                shift = 1;
                result = 0;

                do {
                    byte = str.charCodeAt(index++) - 63;
                    result += (byte & 0x1f) * shift;
                    shift *= 32;
                } while (byte >= 0x20);

                latitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

                shift = 1;
                result = 0;

                do {
                    byte = str.charCodeAt(index++) - 63;
                    result += (byte & 0x1f) * shift;
                    shift *= 32;
                } while (byte >= 0x20);

                longitude_change = (result & 1) ? ((-result - 1) / 2) : (result / 2);

                lat += latitude_change;
                lng += longitude_change;

                coordinates.push([lat / factor, lng / factor]);
            }

            return coordinates;
        }
    };
    console.log('✅ Inline polyline decoder loaded');
}

class EnhancedTrinkyApp {
    constructor() {
        this.stravaToken = localStorage.getItem('strava_token');
        this.currentWorkout = null;
        this.workouts = [];
        this.canvasSystem = null;
        this.currentTab = 'photo';
        this.currentMetric = 'distance';
        this.activeMetrics = new Set(['distance']);
        this.backgroundImage = null;
        this.originalBackgroundImage = null;
        this.isMonochrome = false;
        this.logoImage = null;
        
        // Конфигурация canvas системы
        this.canvasConfig = {
            width: 400,
            height: 1400,
            aspectRatio: '9/16',
            maxDPR: 2,
            padding: 0.08,
            fontFamily: 'Inter, sans-serif',
            fontFamilyBold: 'Inter, sans-serif',
            primaryColor: '#FFFFFF',
            secondaryColor: '#888888',
            overlayOpacity: 0.4
        };
        
        // Переменные для управления фоновым изображением
        this.imageTransform = {
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0
        };
        
        // Переменные для отслеживания жестов
        this.touchState = {
            isDragging: false,
            isScaling: false,
            lastTouchDistance: 0,
            lastTouchCenter: { x: 0, y: 0 },
            startTouches: []
        };
        
        this.init();
    }

    init() {
        console.log('Enhanced TrinkyApp initializing...');
        this.setupEventListeners();
        this.setupCanvas();
        this.setupTabs();
        this.initializeRatio();
        this.setupMobileOptimizations();
        this.checkAuthStatus();
        
        // Force display after initialization
        setTimeout(() => {
            console.log('✅ Enhanced TrinkyApp initialized');
        }, 100);
    }
    
    setupCanvas() {
        const canvas = document.getElementById('route-canvas');
        if (canvas) {
            // Инициализируем новую canvas систему
            this.canvasSystem = new EnhancedCanvasSystem(canvas, this.canvasConfig);
            
            // Настраиваем обработчики для управления изображением
            this.setupImageManipulation();
            this.setupPhotoButtons();
            this.initializeActiveMetrics();
            
            console.log('✅ Enhanced canvas system setup complete');
        }
    }
    
    updateCanvas() {
        // Новая система автоматически обрабатывает resize
        if (this.canvasSystem) {
            this.canvasSystem.render();
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
            console.log('🔄 Loading workouts...');
            const response = await this.fetchStravaData('/athlete/activities?per_page=10');
            console.log('📊 Workouts response:', response);
            
            this.workouts = response.data || [];
            console.log('📋 Workouts loaded:', this.workouts.length);
            
            if (this.workouts.length > 0) {
                this.currentWorkout = this.workouts[0];
                console.log('🎯 Current workout:', this.currentWorkout);
                this.updateWorkoutDisplay();
                this.renderWorkout();
            } else {
                console.log('⚠️ No workouts found');
            }
            
            this.showConnectedState();
        } catch (error) {
            console.error('❌ Error loading workouts:', error);
            this.showError('Failed to load workouts. Please try again.');
        }
    }

    async fetchStravaData(endpoint) {
        try {
            const apiUrl = `https://www.strava.com/api/v3${endpoint}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.stravaToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('strava_token');
                    this.showError('Сессия истекла. Пожалуйста, подключитесь снова');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                    throw new Error('Unauthorized');
                }
                throw new Error(`Strava API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            return { data };
        } catch (error) {
            console.error('❌ Strava API error:', error);
            
            if (error.message !== 'Unauthorized') {
                this.showError('Не удалось загрузить данные из Strava. Проверьте подключение к интернету');
            }
            
            // Fallback to mock data for development
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
    }

    updateWorkoutDisplay() {
        if (!this.currentWorkout) return;

        // Обновляем значения только для активных метрик
        if (this.activeMetrics.has('distance')) {
            const distance = this.formatDistance(this.currentWorkout.distance);
            document.getElementById('distance-value').textContent = distance;
        } else {
            document.getElementById('distance-value').textContent = '';
        }

        if (this.activeMetrics.has('elevation')) {
            const elevation = this.formatElevation(this.currentWorkout.total_elevation_gain);
            document.getElementById('elevation-value').textContent = elevation;
        } else {
            document.getElementById('elevation-value').textContent = '';
        }

        if (this.activeMetrics.has('speed')) {
            const speed = this.formatSpeed(this.currentWorkout.average_speed);
            document.getElementById('speed-value').textContent = speed;
        } else {
            document.getElementById('speed-value').textContent = '';
        }

        if (this.activeMetrics.has('time')) {
            const time = this.formatTime(this.currentWorkout.moving_time);
            document.getElementById('time-value').textContent = time;
        } else {
            document.getElementById('time-value').textContent = '';
        }
        
        // Перерисовываем canvas с учетом активных метрик
        this.renderWorkout();
    }

    // Новый метод рендеринга с использованием enhanced canvas системы
    renderWorkout() {
        if (!this.canvasSystem || !this.currentWorkout) return;
        
        console.log('🎨 Rendering workout with enhanced system');
        
        // Устанавливаем фоновое изображение
        if (this.backgroundImage) {
            this.canvasSystem.setBackgroundImage(this.backgroundImage);
        }
        
        // Устанавливаем данные маршрута
        const polylineData = this.currentWorkout?.map?.polyline || this.currentWorkout?.map?.summary_polyline;
        if (polylineData) {
            this.canvasSystem.setPolylineData(polylineData);
        }
        
        // Устанавливаем заголовок и подзаголовок
        const title = this.currentWorkout.name || 'Workout';
        const subtitle = this.formatWorkoutDate(this.currentWorkout.start_date);
        this.canvasSystem.setTitle(title, subtitle);
        
        // Устанавливаем метрики
        const metrics = this.getActiveMetrics();
        this.canvasSystem.setMetrics(metrics);
        
        // Устанавливаем логотип
        if (this.logoImage) {
            this.canvasSystem.setLogo(this.logoImage);
        } else {
            // Используем SVG логотип по умолчанию
            this.canvasSystem.setLogo('logo_NIP.svg');
        }
        
        console.log('✅ Workout rendered with enhanced canvas system');
    }
    
    getActiveMetrics() {
        const allMetrics = [
            { key: 'distance', label: 'DISTANCE', value: this.formatDistance(this.currentWorkout.distance) },
            { key: 'elevation', label: 'ELEVATION', value: this.formatElevation(this.currentWorkout.total_elevation_gain) },
            { key: 'time', label: 'TIME', value: this.formatTime(this.currentWorkout.moving_time) },
            { key: 'speed', label: 'SPEED/AVG', value: this.formatSpeed(this.currentWorkout.average_speed) },
            { key: 'calories', label: 'CALORIES', value: '1,200' },
            { key: 'power', label: 'POWER/AVG', value: '180W' }
        ];
        
        return allMetrics.filter(metric => this.activeMetrics.has(metric.key));
    }

    formatDistance(meters) {
        if (!meters || meters === 0) return '—';
        if (meters >= 1000) {
            return `${(meters / 1000).toFixed(1)} km`;
        }
        return `${meters} m`;
    }

    formatElevation(meters) {
        if (!meters || meters === 0) return '—';
        return `${meters} m`;
    }

    formatSpeed(mps) {
        if (!mps || mps === 0) return '—';
        const kmh = mps * 3.6;
        return `${kmh.toFixed(1)} km/h`;
    }

    formatTime(seconds) {
        if (!seconds || seconds === 0) return '—';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }
    
    formatWorkoutDate(dateString) {
        try {
            const date = new Date(dateString);
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                          'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const day = date.getDate();
            const month = months[date.getMonth()];
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${day} ${month}, ${hours}:${minutes}`;
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid date';
        }
    }

    setupEventListeners() {
        // Connect Strava button
        document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        document.getElementById('connect-strava-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.connectStrava();
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
        
        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.logout();
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
        this.setRatio('9:16');
    }

    setupMobileOptimizations() {
        const container = document.getElementById('mobile-container');
        const previewArea = document.querySelector('.preview-area');
        
        if (container && previewArea) {
            container.style.setProperty('width', '100vw', 'important');
            container.style.setProperty('height', '100vh', 'important');
            container.style.setProperty('display', 'flex', 'important');
            container.style.setProperty('flex-direction', 'column', 'important');
            container.style.setProperty('margin', '0', 'important');
            container.style.setProperty('padding', '0', 'important');
            container.style.setProperty('overflow', 'hidden', 'important');
            
            previewArea.style.setProperty('flex', '1', 'important');
            previewArea.style.setProperty('display', 'flex', 'important');
            previewArea.style.setProperty('align-items', 'center', 'important');
            previewArea.style.setProperty('justify-content', 'center', 'important');
        }
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.updateCanvas(), 100);
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

    setupImageManipulation() {
        if (!this.canvasSystem) return;
        
        const canvas = this.canvasSystem.canvas;
        
        // Обработчики для мыши
        canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Обработчики для touch
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    }

    handleMouseDown(e) {
        if (!this.backgroundImage) return;
        
        this.touchState.isDragging = true;
        this.touchState.lastTouchCenter = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.touchState.isDragging || !this.backgroundImage) return;
        
        const deltaX = e.clientX - this.touchState.lastTouchCenter.x;
        const deltaY = e.clientY - this.touchState.lastTouchCenter.y;
        
        this.imageTransform.x += deltaX;
        this.imageTransform.y += deltaY;
        
        this.touchState.lastTouchCenter = { x: e.clientX, y: e.clientY };
        
        this.renderWorkout();
        e.preventDefault();
    }

    handleMouseUp(e) {
        this.touchState.isDragging = false;
        e.preventDefault();
    }

    handleWheel(e) {
        if (!this.backgroundImage) return;
        
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.imageTransform.scale *= scaleFactor;
        this.imageTransform.scale = Math.max(0.1, Math.min(5, this.imageTransform.scale));
        
        this.renderWorkout();
        e.preventDefault();
    }

    handleTouchStart(e) {
        if (!this.backgroundImage) return;
        
        this.touchState.startTouches = Array.from(e.touches);
        
        if (e.touches.length === 1) {
            this.touchState.isDragging = true;
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        } else if (e.touches.length === 2) {
            this.touchState.isScaling = true;
            this.touchState.isDragging = false;
            this.touchState.lastTouchDistance = this.getTouchDistance(e.touches);
            this.touchState.lastTouchCenter = this.getTouchCenter(e.touches);
        }
        
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (!this.backgroundImage) return;
        
        if (this.touchState.isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - this.touchState.lastTouchCenter.x;
            const deltaY = e.touches[0].clientY - this.touchState.lastTouchCenter.y;
            
            this.imageTransform.x += deltaX;
            this.imageTransform.y += deltaY;
            
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
            
            this.renderWorkout();
        } else if (this.touchState.isScaling && e.touches.length === 2) {
            const currentDistance = this.getTouchDistance(e.touches);
            const scaleFactor = currentDistance / this.touchState.lastTouchDistance;
            
            this.imageTransform.scale *= scaleFactor;
            this.imageTransform.scale = Math.max(0.1, Math.min(5, this.imageTransform.scale));
            
            this.touchState.lastTouchDistance = currentDistance;
            this.touchState.lastTouchCenter = this.getTouchCenter(e.touches);
            
            this.renderWorkout();
        }
        
        e.preventDefault();
    }

    handleTouchEnd(e) {
        this.touchState.isDragging = false;
        this.touchState.isScaling = false;
        e.preventDefault();
    }

    getTouchDistance(touches) {
        if (touches.length < 2) return 0;
        
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getTouchCenter(touches) {
        if (touches.length === 0) return { x: 0, y: 0 };
        
        let x = 0, y = 0;
        for (let touch of touches) {
            x += touch.clientX;
            y += touch.clientY;
        }
        
        return {
            x: x / touches.length,
            y: y / touches.length
        };
    }

    setupPhotoButtons() {
        document.getElementById('mono-toggle-btn')?.addEventListener('click', () => {
            if (this.isMonochrome) {
                this.returnToOriginal();
            } else {
                this.convertToMono();
            }
        });
    }

    convertToMono() {
        if (!this.backgroundImage) {
            console.log('⚠️ No background image to convert');
            return;
        }
        
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            
            tempCtx.drawImage(img, 0, 0);
            
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                
                gray = gray / 255;
                
                if (gray < 0.5) {
                    gray = Math.pow(gray * 2, 1.5) / 2;
                } else {
                    gray = 0.5 + Math.pow((gray - 0.5) * 2, 0.6) / 2;
                }
                
                gray = Math.pow(gray, 0.8);
                gray = gray * gray * (3 - 2 * gray);
                gray = Math.round(gray * 255);
                gray = Math.max(0, Math.min(255, gray));
                
                data[i] = gray;
                data[i + 1] = gray;
                data[i + 2] = gray;
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            
            this.backgroundImage = tempCanvas.toDataURL('image/png');
            
            this.isMonochrome = true;
            this.updateMonoButton();
            
            this.renderWorkout();
            
            console.log('🖤 Image converted to monochrome');
        };
        img.src = this.backgroundImage;
    }

    returnToOriginal() {
        if (!this.originalBackgroundImage) {
            console.log('⚠️ No original image to return to');
            return;
        }
        
        this.backgroundImage = this.originalBackgroundImage;
        
        this.isMonochrome = false;
        this.updateMonoButton();
        
        this.renderWorkout();
        
        console.log('🔄 Returned to original image');
    }

    initializeActiveMetrics() {
        document.querySelectorAll('.data-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-metric="distance"]`).classList.add('active');
    }

    updateMonoButton() {
        const monoBtn = document.getElementById('mono-toggle-btn');
        if (!monoBtn) return;
        
        if (this.isMonochrome) {
            monoBtn.textContent = 'Return to Original';
        } else {
            monoBtn.textContent = 'Convert to Mono';
        }
    }

    // Tab Management
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
    }

    // Metric Selection
    selectMetric(metric) {
        const button = document.querySelector(`[data-metric="${metric}"]`);
        
        if (this.activeMetrics.has(metric)) {
            this.activeMetrics.delete(metric);
            button.classList.remove('active');
            
            if (this.activeMetrics.size === 0) {
                this.activeMetrics.add('distance');
                document.querySelector(`[data-metric="distance"]`).classList.add('active');
            }
        } else {
            this.activeMetrics.add(metric);
            button.classList.add('active');
        }
        
        this.updateWorkoutDisplay();
        this.renderWorkout();
    }

    // Position Setting
    setPosition(position) {
        console.log('Setting position:', position);
    }

    // Color Setting
    setColor(color) {
        console.log('Setting color:', color);
        if (color === 'french') {
            this.renderWorkout();
        }
    }

    // Ratio Setting
    setRatio(ratio) {
        console.log('Setting ratio:', ratio);
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-ratio="${ratio}"]`).classList.add('active');
        
        const previewArea = document.querySelector('.preview-area');
        const connectedState = document.getElementById('connected');
        
        if (previewArea && connectedState) {
            previewArea.classList.remove('ratio-9-16', 'ratio-4-5');
            connectedState.classList.remove('ratio-9-16', 'ratio-4-5');
            
            switch(ratio) {
                case '9:16':
                    const screenHeight = window.innerHeight;
                    const navBarHeight = 60;
                    const tabBarHeight = 180;
                    const safeAreaInsets = 0;
                    
                    const viewportHeight9_16 = screenHeight - navBarHeight - tabBarHeight - safeAreaInsets;
                    const viewportWidth9_16 = viewportHeight9_16 * 9 / 16;
                    
                    previewArea.classList.add('ratio-9-16');
                    connectedState.classList.add('ratio-9-16');
                    
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
                    const screenHeight4_5 = window.innerHeight;
                    const navBarHeight4_5 = 60;
                    const tabBarHeight4_5 = 180;
                    const safeAreaInsets4_5 = 0;
                    
                    const viewportHeight4_5 = screenHeight4_5 - navBarHeight4_5 - tabBarHeight4_5 - safeAreaInsets4_5;
                    const viewportWidth4_5 = viewportHeight4_5 * 4 / 5;
                    
                    previewArea.classList.add('ratio-4-5');
                    connectedState.classList.add('ratio-4-5');
                    
                    previewArea.style.setProperty('width', `${viewportWidth4_5}px`, 'important');
                    previewArea.style.setProperty('height', `${viewportHeight4_5}px`, 'important');
                    previewArea.style.setProperty('max-width', `${viewportWidth4_5}px`, 'important');
                    previewArea.style.setProperty('max-height', `${viewportWidth4_5}px`, 'important');
                    
                    connectedState.style.setProperty('aspect-ratio', '4 / 5', 'important');
                    connectedState.style.setProperty('width', '100%', 'important');
                    connectedState.style.setProperty('height', '100%', 'important');
                    
                    console.log('🔧 Установлено соотношение 4:5:', viewportWidth4_5, 'x', viewportHeight4_5);
                    break;
            }
        }
        
        console.log('🔧 Ratio изменен на:', ratio, '- превью обновлен');
        
        setTimeout(() => {
            this.updateCanvas();
            console.log('🔧 Canvas перерисован после изменения соотношения');
        }, 100);
    }

    // File Upload Handlers
    handlePhotoUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showError('Пожалуйста, загрузите изображение');
            return;
        }
        
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('Файл слишком большой. Максимальный размер: 10MB');
            return;
        }
        
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validExtensions.includes(file.type)) {
            this.showError('Неподдерживаемый формат изображения. Используйте JPG, PNG или WEBP');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.backgroundImage = e.target.result;
            this.originalBackgroundImage = e.target.result;
            this.isMonochrome = false;
            this.updateMonoButton();
            this.updateBackground();
            
            const monoBtn = document.getElementById('mono-toggle-btn');
            if (monoBtn) {
                monoBtn.style.display = 'flex';
                monoBtn.style.alignItems = 'center';
                monoBtn.style.justifyContent = 'center';
            }
        };
        reader.onerror = () => {
            this.showError('Ошибка при чтении файла');
        };
        reader.readAsDataURL(file);
    }

    handleLogoUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showError('Пожалуйста, загрузите изображение');
            return;
        }
        
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('Логотип слишком большой. Максимальный размер: 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoImage = e.target.result;
            this.updateLogo();
        };
        reader.onerror = () => {
            this.showError('Ошибка при чтении файла логотипа');
        };
        reader.readAsDataURL(file);
    }

    updateBackground() {
        const background = document.getElementById('connected');
        background.style.backgroundImage = 'none';
        
        if (this.backgroundImage) {
            this.canvasSystem.canvas.classList.add('has-background');
        } else {
            this.canvasSystem.canvas.classList.remove('has-background');
        }
        
        if (this.currentWorkout) {
            this.renderWorkout();
        }
        
        console.log('🖼️ Background updated in canvas');
    }

    updateLogo() {
        console.log('Logo updated:', this.logoImage);
        this.renderWorkout();
    }

    showNotConnectedState() {
        console.log('Showing not connected state');
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        const connected = document.getElementById('connected');
        
        if (loading) loading.classList.add('hidden');
        if (notConnected) notConnected.classList.remove('hidden');
        if (connected) connected.classList.add('hidden');
        
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <button id="connect-strava-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; justify-content: center;">Connect Strava</button>
            `;
            
            document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        }
    }

    showConnectedState() {
        console.log('Showing connected state');
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        const connected = document.getElementById('connected');
        
        console.log('🔍 Elements found:', {
            loading: !!loading,
            notConnected: !!notConnected,
            connected: !!connected
        });
        
        if (loading) {
            loading.classList.add('hidden');
            loading.style.display = 'none';
            console.log('✅ Loading hidden');
        }
        if (notConnected) {
            notConnected.classList.add('hidden');
            notConnected.style.display = 'none';
            console.log('✅ Not connected hidden');
            
            const connectBtn = document.getElementById('connect-strava-btn');
            if (connectBtn) {
                connectBtn.style.display = 'none';
                console.log('✅ Connect button hidden');
            }
        }
        if (connected) {
            connected.classList.remove('hidden');
            connected.style.display = 'block';
            console.log('✅ Connected shown');
            
            const navbar = document.querySelector('.navbar');
            if (navbar) {
                navbar.style.display = 'flex';
                navbar.style.visibility = 'visible';
                navbar.style.opacity = '1';
                navbar.classList.remove('hidden');
                console.log('✅ Navbar shown');
            } else {
                console.log('❌ Navbar not found!');
            }
            
            setTimeout(() => {
                const navActions = document.querySelector('.nav-actions');
                
                console.log('🔍 Navigation elements found (with delay):', {
                    navActions: !!navActions
                });
                
                if (navActions) {
                    navActions.innerHTML = `
                        <button class="nav-btn" title="Select Workout" id="workout-selector-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/>
                                <path d="M3 12h18"/>
                                <path d="M3 18h18"/>
                            </svg>
                        </button>
                        <button class="nav-btn" title="Share" id="share-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="18" cy="5" r="3"/>
                                <circle cx="6" cy="12" r="3"/>
                                <circle cx="18" cy="19" r="3"/>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                            </svg>
                        </button>
                        <button class="nav-btn" title="Logout" id="logout-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16,17 21,12 16,7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                        </button>
                    `;
                }
                
                setTimeout(() => {
                    const workoutBtn = document.getElementById('workout-selector-btn');
                    const shareBtn = document.getElementById('share-btn');
                    const logoutBtn = document.getElementById('logout-btn');
                    
                    if (workoutBtn) {
                        const newWorkoutBtn = workoutBtn.cloneNode(true);
                        workoutBtn.parentNode.replaceChild(newWorkoutBtn, workoutBtn);
                        
                        newWorkoutBtn.addEventListener('click', () => {
                            console.log('🔵 Workout selector button clicked');
                            this.openWorkoutSelector();
                        });
                        console.log('✅ Workout selector button listener added');
                    }
                    
                    if (shareBtn) {
                        const newShareBtn = shareBtn.cloneNode(true);
                        shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
                        
                        newShareBtn.addEventListener('click', () => {
                            console.log('🔵 Share button clicked');
                            this.shareData();
                        });
                        console.log('✅ Share button listener added');
                    }
                    
                    if (logoutBtn) {
                        const newLogoutBtn = logoutBtn.cloneNode(true);
                        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
                        
                        newLogoutBtn.addEventListener('click', () => {
                            console.log('🔵 Logout button clicked');
                            this.logout();
                        });
                        console.log('✅ Logout button listener added');
                    }
                }, 10);
                
                const navbar = document.querySelector('.navbar');
                const navContainer = document.querySelector('.nav-container');
                
                console.log('🔍 Navigation structure:', {
                    navbar: !!navbar,
                    navContainer: !!navContainer,
                    navActions: !!navActions
                });
                
                if (navActions) {
                    navActions.style.display = 'flex';
                    navActions.style.visibility = 'visible';
                    navActions.style.opacity = '1';
                    console.log('✅ Navigation container shown');
                }
            }, 500);
            
            connected.style.setProperty('aspect-ratio', '9 / 16', 'important');
            connected.style.setProperty('max-height', '100%', 'important');
            connected.style.setProperty('overflow', 'hidden', 'important');
            connected.style.setProperty('box-sizing', 'border-box', 'important');
            connected.style.setProperty('width', '100%', 'important');
            connected.style.setProperty('height', 'auto', 'important');
            
            console.log('🔧 Connected state показан');
            
            setTimeout(() => {
                this.updateCanvas();
                console.log('🔧 Canvas перерисован при показе connected state');
            }, 100);
            
            console.log('🔧 Connected state с правильными пропорциями 9:16');
            
            setTimeout(() => {
                console.log('🔄 Force refresh after connected state');
                this.updateWorkoutDisplay();
                this.renderWorkout();
                
                document.body.offsetHeight;
                console.log('🔄 DOM forced reflow');
            }, 200);
        }
    }

    showError(message) {
        if (isDev) {
            alert(message);
        } else {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: #f44336;
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 90%;
                text-align: center;
                animation: slideDown 0.3s ease-out;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideUp 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 4000);
        }
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
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <div style="flex: 1;">
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
                    <a href="activity.html?activityId=${workout.id}" 
                       style="margin-left: 10px; padding: 8px 12px; background: #fff; color: #000; text-decoration: none; border-radius: 4px; font-size: 12px; white-space: nowrap;"
                       onclick="event.stopPropagation();">
                        View
                    </a>
                </div>
            </div>
        `).join('');

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
            this.renderWorkout();
            this.closeWorkoutSelector();
            console.log('🏃 Selected workout:', workout.name);
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

    logout() {
        localStorage.removeItem('strava_token');
        
        this.stravaToken = null;
        this.currentWorkout = null;
        this.workouts = [];
        
        document.getElementById('connected')?.classList.add('hidden');
        document.getElementById('not-connected')?.classList.remove('hidden');
        
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <button id="connect-strava-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; justify-content: center;">Connect Strava</button>
            `;
            
            document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        }
        
        if (this.canvasSystem && this.canvasSystem.ctx) {
            this.canvasSystem.ctx.clearRect(0, 0, this.canvasSystem.canvas.width, this.canvasSystem.canvas.height);
        }
        
        this.backgroundImage = null;
        this.originalBackgroundImage = null;
        this.isMonochrome = false;
        
        console.log('Logged out successfully');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Enhanced TrinkyApp');
    new EnhancedTrinkyApp();
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
