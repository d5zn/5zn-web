// Trinky Web App - Mobile-First Version

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

class TrinkyApp {
    constructor() {
        this.stravaToken = localStorage.getItem('strava_token');
        this.currentWorkout = null;
        this.workouts = [];
        this.canvas = null;
        this.ctx = null;
        this.currentTab = 'photo';
        this.currentMetric = 'distance';
        this.activeMetrics = new Set(['distance']); // Отслеживаем активные метрики
        this.backgroundImage = null;
        this.originalBackgroundImage = null; // Для хранения оригинального изображения
        this.isMonochrome = false; // Отслеживаем состояние изображения
        this.logoImage = null;
        
        // Фиксированное внутреннее разрешение (как в геймдеве)
        this.internalWidth = 1080;
        this.internalHeight = 1920;
        this.internalAspectRatio = 9 / 16;
        
        // Переменные для масштабирования
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // Переменные для управления фоновым изображением
        this.imageTransform = {
            x: 0,           // Смещение по X
            y: 0,           // Смещение по Y
            scale: 1,       // Масштаб
            rotation: 0     // Поворот
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
    
    forceShowNavigation() {
        // Метод для принудительного показа навигации
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.display = 'flex';
            navbar.style.visibility = 'visible';
            navbar.style.opacity = '1';
        }
    }

    setupEventListeners() {
        // Connect Strava button
        document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        document.getElementById('connect-strava-btn')?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.connectStrava();
        });
        
        // Обработчики для управления фоновым изображением будут добавлены в setupCanvas()
        
        
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
        // Set default ratio to 9:16 and make it active
        this.setRatio('9:16');
    }

    setupMobileOptimizations() {
        // Force mobile display
        this.forceMobileDisplay();
        
        // НОВАЯ СИСТЕМА: Настраиваем масштабирование
        this.setupScaling();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeCanvas();
                this.forceMobileDisplay();
                this.applyFigmaScale();
            }, 100);
        });
        
        // Handle viewport changes
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.forceMobileDisplay();
            this.applyScale();
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
    
    setupScaling() {
        // СИСТЕМА КАК В FIGMA: Фиксированный макет + масштабирование viewport
        this.viewport = document.getElementById('viewport');
        this.connected = document.getElementById('connected');
        
        if (this.viewport && this.connected) {
            // Применяем масштабирование при загрузке
            this.applyFigmaScale();
            
            // Наблюдаем за изменениями размера viewport
            if (window.ResizeObserver) {
                const ro = new ResizeObserver(() => this.applyFigmaScale());
                ro.observe(this.viewport);
            }
        }
    }
    
    applyFigmaScale() {
        if (!this.viewport || !this.connected) return;
        
        const vpRect = this.viewport.getBoundingClientRect();
        const scale = Math.min(vpRect.width / this.internalWidth, vpRect.height / this.internalHeight);
        
        // FIGMA ПРИНЦИП: Масштабируем весь макет как единое целое
        this.connected.style.transform = `scale(${scale})`;
        this.connected.style.transformOrigin = 'center center';
        
        // Центрируем масштабированный макет
        const scaledWidth = this.internalWidth * scale;
        const scaledHeight = this.internalHeight * scale;
        const offsetX = (vpRect.width - scaledWidth) / 2;
        const offsetY = (vpRect.height - scaledHeight) / 2;
        
        this.connected.style.left = offsetX + 'px';
        this.connected.style.top = offsetY + 'px';
        
        console.log('🎨 FIGMA МАСШТАБИРОВАНИЕ:', {
            viewport: `${vpRect.width}x${vpRect.height}`,
            макет: `${this.internalWidth}x${this.internalHeight}`,
            scale: scale.toFixed(3),
            scaled: `${scaledWidth.toFixed(1)}x${scaledHeight.toFixed(1)}`,
            offset: `${offsetX.toFixed(1)}, ${offsetY.toFixed(1)}`
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
            
            // Пересчитываем viewport для фиксированного разрешения
            this.calculateViewport();
            
            console.log('🔧 Простая flex структура установлена с фиксированным разрешением');
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('route-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.calculateViewport();
            this.resizeCanvas();
            window.addEventListener('resize', () => {
                this.calculateViewport();
                this.resizeCanvas();
            });
            
            // Добавляем обработчики для управления фоновым изображением
            this.setupImageManipulation();
            
        // Обработчики для кнопок фото
        this.setupPhotoButtons();
        
        // Инициализируем активные метрики
        this.initializeActiveMetrics();
        }
    }
    
    calculateViewport() {
        // Получаем размеры контейнера превью
        const previewArea = document.querySelector('.preview-area');
        if (!previewArea) return;
        
        const containerRect = previewArea.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Рассчитываем масштаб для фиксированного разрешения
        const scaleX = containerWidth / this.internalWidth;
        const scaleY = containerHeight / this.internalHeight;
        
        // Используем минимальный масштаб для сохранения пропорций
        this.scale = Math.min(scaleX, scaleY);
        
        // Рассчитываем отступы для центрирования
        const scaledWidth = this.internalWidth * this.scale;
        const scaledHeight = this.internalHeight * this.scale;
        
        this.offsetX = (containerWidth - scaledWidth) / 2;
        this.offsetY = (containerHeight - scaledHeight) / 2;
        
        console.log('📐 Viewport calculated:', {
            container: `${containerWidth}x${containerHeight}`,
            internal: `${this.internalWidth}x${this.internalHeight}`,
            scale: this.scale.toFixed(3),
            offset: `${this.offsetX.toFixed(1)}, ${this.offsetY.toFixed(1)}`
        });
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        // НОВАЯ СИСТЕМА: Canvas всегда рисуется в фиксированном разрешении 1080x1920
        const rawDpr = window.devicePixelRatio || 1;
        const dpr = Math.min(rawDpr, 2);
        
        // Canvas рисуется в фиксированном разрешении
        this.canvas.width = this.internalWidth * dpr;
        this.canvas.height = this.internalHeight * dpr;
        
        // Canvas отображается в фиксированном размере (без масштабирования)
        this.canvas.style.width = this.internalWidth + 'px';
        this.canvas.style.height = this.internalHeight + 'px';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        
        // Масштабируем контекст для четкого рендеринга
        this.ctx.scale(dpr, dpr);
        
        console.log('📺 НОВАЯ СИСТЕМА Canvas:', {
            canvas: `${this.canvas.width}x${this.canvas.height}`,
            макет: `${this.internalWidth}x${this.internalHeight}`,
            dpr: dpr
        });
        
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
                this.drawRoute();
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
                    // Токен истек
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
            
            // Показываем пользователю дружественное сообщение
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
        this.drawRoute();
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
        // Convert m/s to km/h
        const kmh = mps * 3.6;
        return `${kmh.toFixed(1)} km/h`;
    }

    drawRoute() {
        if (!this.ctx || !this.currentWorkout) return;

        // Очищаем canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем фоновую картинку если есть
        if (this.backgroundImage) {
            this.drawBackgroundSync();
        }
        
        // Рисуем маршрут
        this.drawDemoRoute();
        
        // Рисуем данные Strava
        this.drawStravaData();
    }

    drawBackgroundSync() {
        if (this.backgroundImage) {
            const img = new Image();
            img.src = this.backgroundImage;
            
            // Если изображение уже загружено, рисуем сразу
            if (img.complete) {
                this.drawBackgroundImage(img);
            } else {
                // Если не загружено, ждем загрузки
            img.onload = () => {
                    this.drawBackgroundImage(img);
                    // Перерисовываем маршрут и данные поверх фона
                    this.drawDemoRoute();
                    this.drawStravaData();
                };
            }
        }
    }

    drawBackgroundImage(img) {
        // НОВАЯ СИСТЕМА: Рисуем в фиксированном разрешении 1080x1920
        const canvasWidth = this.internalWidth;
        const canvasHeight = this.internalHeight;
                
        const imgAspect = img.width / img.height;
        const canvasAspect = canvasWidth / canvasHeight;
                
        let drawWidth, drawHeight, drawX, drawY;
                
        // Адаптируем изображение под фиксированное разрешение (cover)
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
        
        // Применяем трансформации к изображению
        this.ctx.save();
        
        // Применяем смещение и масштаб
        const centerX = drawX + drawWidth / 2;
        const centerY = drawY + drawHeight / 2;
        
        this.ctx.translate(centerX + this.imageTransform.x, centerY + this.imageTransform.y);
        this.ctx.scale(this.imageTransform.scale, this.imageTransform.scale);
        this.ctx.rotate(this.imageTransform.rotation);
        
        // Рисуем изображение с учетом трансформаций
        this.ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        
        this.ctx.restore();
        
        // Добавляем полупрозрачную черную подложку для контраста
        this.drawOrangeOverlay();
        
        console.log('🖼️ НОВАЯ СИСТЕМА: Background image drawn to fixed resolution canvas');
    }

    drawOrangeOverlay() {
        // НОВАЯ СИСТЕМА: Используем фиксированное разрешение
        const canvasWidth = this.internalWidth;
        const canvasHeight = this.internalHeight;
        
        // Рисуем полупрозрачную черную подложку
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'; // Черный с прозрачностью 40%
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        console.log('⚫ НОВАЯ СИСТЕМА: Black overlay drawn for contrast');
    }

    setupImageManipulation() {
        // Обработчики для мыши
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Обработчики для touch
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
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
        
        this.drawRoute(); // Перерисовываем
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
        this.imageTransform.scale = Math.max(0.1, Math.min(5, this.imageTransform.scale)); // Ограничиваем масштаб
        
        this.drawRoute(); // Перерисовываем
        e.preventDefault();
    }

    handleTouchStart(e) {
        if (!this.backgroundImage) return;
        
        this.touchState.startTouches = Array.from(e.touches);
        
        if (e.touches.length === 1) {
            // Один палец - перетаскивание
            this.touchState.isDragging = true;
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        } else if (e.touches.length === 2) {
            // Два пальца - масштабирование
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
            // Перетаскивание одним пальцем
            const deltaX = e.touches[0].clientX - this.touchState.lastTouchCenter.x;
            const deltaY = e.touches[0].clientY - this.touchState.lastTouchCenter.y;
            
            this.imageTransform.x += deltaX;
            this.imageTransform.y += deltaY;
            
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
            
            this.drawRoute(); // Перерисовываем
        } else if (this.touchState.isScaling && e.touches.length === 2) {
            // Масштабирование двумя пальцами
            const currentDistance = this.getTouchDistance(e.touches);
            const scaleFactor = currentDistance / this.touchState.lastTouchDistance;
            
            this.imageTransform.scale *= scaleFactor;
            this.imageTransform.scale = Math.max(0.1, Math.min(5, this.imageTransform.scale)); // Ограничиваем масштаб
            
            this.touchState.lastTouchDistance = currentDistance;
            this.touchState.lastTouchCenter = this.getTouchCenter(e.touches);
            
            this.drawRoute(); // Перерисовываем
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
        // Обработчик для переключаемой кнопки
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
        
        // Создаем canvas для обработки изображения
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        const img = new Image();
        img.onload = () => {
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            
            // Рисуем изображение
            tempCtx.drawImage(img, 0, 0);
            
            // Получаем данные пикселей
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            // Конвертируем в драматичный моно стиль с высоким контрастом
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Используем формулу для получения яркости
                let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                
                // Драматичный моно эффект
                gray = gray / 255; // Нормализуем к 0-1
                
                // Применяем S-образную кривую для драматичного контраста
                if (gray < 0.5) {
                    // Усиливаем тени - делаем их еще темнее
                    gray = Math.pow(gray * 2, 1.5) / 2;
                } else {
                    // Усиливаем светлые области - делаем их еще ярче
                    gray = 0.5 + Math.pow((gray - 0.5) * 2, 0.6) / 2;
                }
                
                // Дополнительное усиление контраста
                gray = Math.pow(gray, 0.8);
                
                // Применяем тональную кривую для драматичного эффекта
                gray = gray * gray * (3 - 2 * gray); // S-образная кривая
                
                gray = Math.round(gray * 255); // Возвращаем к 0-255
                
                // Ограничиваем значения
                gray = Math.max(0, Math.min(255, gray));
                
                data[i] = gray;     // Red
                data[i + 1] = gray; // Green
                data[i + 2] = gray; // Blue
                // Alpha остается без изменений
            }
            
            // Применяем изменения
            tempCtx.putImageData(imageData, 0, 0);
            
            // Сохраняем как новое фоновое изображение
            this.backgroundImage = tempCanvas.toDataURL('image/png');
            
            // Обновляем состояние
            this.isMonochrome = true;
            this.updateMonoButton();
            
            // Перерисовываем
            this.drawRoute();
            
            console.log('🖤 Image converted to monochrome');
        };
        img.src = this.backgroundImage;
    }

    returnToOriginal() {
        if (!this.originalBackgroundImage) {
            console.log('⚠️ No original image to return to');
            return;
        }
        
        // Возвращаем оригинальное изображение
        this.backgroundImage = this.originalBackgroundImage;
        
        // Обновляем состояние
        this.isMonochrome = false;
        this.updateMonoButton();
        
        // Перерисовываем
        this.drawRoute();
        
        console.log('🔄 Returned to original image');
    }

    initializeActiveMetrics() {
        // Устанавливаем активную кнопку Distance по умолчанию
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

    drawBackground() {
        if (this.backgroundImage) {
            const img = new Image();
            img.onload = () => {
                this.drawBackgroundImage(img);
                // Перерисовываем маршрут и данные поверх фона
                this.drawDemoRoute();
                this.drawStravaData();
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
        
        // Для обоих соотношений используем новый layout в стиле карточки
            this.drawStravaDataCard();
    }

    drawStravaDataCard() {
        // НОВАЯ СИСТЕМА: Используем фиксированное разрешение
        const canvasWidth = this.internalWidth;
        const canvasHeight = this.internalHeight;
        
        // Определяем соотношение сторон
        const connectedState = document.getElementById('connected');
        const is4_5 = connectedState && connectedState.classList.contains('ratio-4-5');
        
        // Отступы в зависимости от соотношения
        let topPadding, bottomPadding;
        if (is4_5) {
            // Для 4:5 используем 8% со всех сторон
            topPadding = canvasHeight * 0.08;
            bottomPadding = canvasHeight * 0.08;
        } else {
            // Для 9:16: 7% сверху, 4% снизу
            topPadding = canvasHeight * 0.07;
            bottomPadding = canvasHeight * 0.04;
        }
        
        // Заголовок и дата в безопасной зоне (7% отступ сверху)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '600 22px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        // Используем реальные данные из currentWorkout
        const workoutName = this.currentWorkout?.name || 'Workout';
        this.ctx.fillText(workoutName, 20, topPadding + 50);
        
        this.ctx.font = '13px Inter, sans-serif';
        this.ctx.fillStyle = '#FFFFFF';
        
        // Форматируем дату из start_date
        const workoutDate = this.currentWorkout?.start_date ? 
            this.formatWorkoutDate(this.currentWorkout.start_date) : 
            'Date not available';
        this.ctx.fillText(workoutDate, 20, topPadding + 80);
        
        // Контейнер для логотипа - разное позиционирование для разных соотношений
        if (is4_5) {
            // Для 4:5 - по центру снизу
            const logoX = (canvasWidth - 72) / 2; // Центр по горизонтали
            const logoY = canvasHeight - bottomPadding - 72 - 20; // Отступ снизу
            this.drawLogoContainer(logoX, logoY, 72, 72);
        } else {
            // Для 9:16 - у правого края (как было)
            const logoX = canvasWidth - 72 - 20; // Правый край с отступом 20px
            const logoY = topPadding + 50 - 36; // Центрируем по вертикали относительно заголовка
            this.drawLogoContainer(logoX, logoY, 72, 72);
        }
        
        // Иконка велосипеда справа (в безопасной зоне) - ВРЕМЕННО СКРЫТА
        // this.drawBikeIcon(canvasWidth - 60, topPadding + 30);
        
        // График убран - используем только маршрут из drawDemoRoute()
        const availableHeight = canvasHeight - topPadding - bottomPadding;
        
        // Статистики в самом низу канваса (3x2 сетка)
        const statsHeight = availableHeight * 0.3; // 30% от доступной высоты для статистик
        const statsY = canvasHeight - statsHeight + 20; // В самом низу канваса + 20px ниже
        const statsWidth = canvasWidth - 40;
        const colWidth = statsWidth / 3;
        const rowHeight = statsHeight / 2;
        
        // Создаем массив только активных метрик
        const allStats = [
            { key: 'distance', label: 'DISTANCE', value: this.formatDistance(this.currentWorkout.distance) },
            { key: 'elevation', label: 'ELEVATION', value: this.formatElevation(this.currentWorkout.total_elevation_gain) },
            { key: 'time', label: 'TIME', value: this.formatTime(this.currentWorkout.moving_time) },
            { key: 'speed', label: 'SPEED/AVG', value: this.formatSpeed(this.currentWorkout.average_speed) },
            { key: 'calories', label: 'CALORIES', value: '1,200' },
            { key: 'power', label: 'POWER/AVG', value: '180W' }
        ];
        
        // Простая логика - показываем только активные метрики
        const stats = allStats.filter(stat => this.activeMetrics.has(stat.key));
        
        if (is4_5) {
            // Для 4:5 - позиционирование по углам и центру сторон
            this.drawMetrics4_5(stats, canvasWidth, canvasHeight, topPadding, bottomPadding);
        } else {
            // Для 9:16 - стандартная сетка 3x2
        for (let i = 0; i < stats.length; i++) {
            const col = i % 3;
            const row = Math.floor(i / 3);
                const y = statsY + row * 70;
                
                let x, textAlign;
                
                // Определяем позицию и выравнивание для каждой метрики
                if (col === 0) {
                    // 1-я и 4-я колонка (DISTANCE, SPEED/AVG) - слева
                    x = 20;
                    textAlign = 'left';
                } else if (col === 1) {
                    // 2-я и 5-я колонка (ELEVATION, CALORIES) - по центру
                    x = 20 + colWidth + colWidth / 2;
                    textAlign = 'center';
                } else {
                    // 3-я и 6-я колонка (TIME, POWER/AVG) - справа
                    x = canvasWidth - 20;
                    textAlign = 'right';
                }
            
            // Label
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '13px Inter, sans-serif';
                this.ctx.textAlign = textAlign;
            this.ctx.fillText(stats[i].label, x, y + 20);
            
            // Value
            this.ctx.fillStyle = '#FFFFFF';
                this.ctx.font = '600 22px Inter, sans-serif';
                this.ctx.fillText(stats[i].value, x, y + 50); // 30px отступ от названия (20 + 30)
            }
        }
        
        console.log('📊 Strava data card drawn to canvas');
    }

    drawMetrics4_5(stats, canvasWidth, canvasHeight, topPadding, bottomPadding) {
        // Позиции для метрик в соотношении 4:5 с учетом 8% отступов
        // 1. Верхний левый угол
        // 2. Верхний правый угол  
        // 3. Центр левой стороны
        // 4. Центр правой стороны
        // 5. Нижний левый угол
        // 6. Нижний правый угол
        
        const leftPadding = canvasWidth * 0.08;
        const rightPadding = canvasWidth * 0.08;
        const centerY = canvasHeight / 2;
        
        const positions = [
            // Позиция 1: Верхний левый угол
            { x: leftPadding + 20, y: topPadding + 60, textAlign: 'left' },
            // Позиция 2: Верхний правый угол
            { x: canvasWidth - rightPadding - 20, y: topPadding + 60, textAlign: 'right' },
            // Позиция 3: Центр левой стороны
            { x: leftPadding + 20, y: centerY, textAlign: 'left' },
            // Позиция 4: Центр правой стороны
            { x: canvasWidth - rightPadding - 20, y: centerY, textAlign: 'right' },
            // Позиция 5: Нижний левый угол
            { x: leftPadding + 20, y: canvasHeight - bottomPadding - 40, textAlign: 'left' },
            // Позиция 6: Нижний правый угол
            { x: canvasWidth - rightPadding - 20, y: canvasHeight - bottomPadding - 40, textAlign: 'right' }
        ];
        
        // Отображаем только активные метрики в соответствии с их позициями
        for (let i = 0; i < stats.length && i < positions.length; i++) {
            const pos = positions[i];
            
            // Label
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '13px Inter, sans-serif';
            this.ctx.textAlign = pos.textAlign;
            this.ctx.fillText(stats[i].label, pos.x, pos.y);
            
            // Value
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '600 22px Inter, sans-serif';
            this.ctx.fillText(stats[i].value, pos.x, pos.y + 30);
        }
        
        console.log('📊 Metrics positioned for 4:5 ratio - showing', stats.length, 'active metrics');
    }

    drawStravaDataOld() {
        // Получаем реальные размеры канваса (без DPR)
        const canvasWidth = this.canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = this.canvas.height / (window.devicePixelRatio || 1);
        
        // Настройки текста
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '600 22px Inter, sans-serif';
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

    drawLogoContainer(x, y, width, height) {
        // Загружаем и отображаем SVG логотип
        this.drawSVGLogo(x, y, width, height);
        
        console.log('🖼️ Logo container drawn:', x, y, width, height);
    }

    drawSVGLogo(x, y, width, height) {
        // Создаем изображение из SVG
        const img = new Image();
        img.onload = () => {
            // Рисуем SVG логотип в контейнере
            this.ctx.drawImage(img, x, y, width, height);
            console.log('🖼️ SVG logo loaded and drawn at:', x, y, width, height);
        };
        img.onerror = () => {
                   // Если SVG не загрузился, показываем плейсхолдер
                   this.ctx.fillStyle = '#FFFFFF';
                   this.ctx.font = '13px Inter, sans-serif';
                   this.ctx.textAlign = 'center';
                   this.ctx.fillText('LOGO', x + width/2, y + height/2 + 4);
            console.log('⚠️ SVG logo failed to load, showing placeholder at:', x, y);
        };
        img.src = 'logo_NIP.svg';
        console.log('🖼️ Attempting to load SVG logo from: logo_NIP.svg');
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
        // Рисуем график активности в цвета французского флага
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
        
        // Создаем градиент для французского флага
        const gradient = this.ctx.createLinearGradient(x, 0, x + width, 0);
        gradient.addColorStop(0, '#002395');    // Синий
        gradient.addColorStop(0.5, '#FFFFFF');  // Белый
        gradient.addColorStop(1, '#ED2939');    // Красный
        
        this.ctx.strokeStyle = gradient;
        
        // Рисуем линию графика
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
    }

    drawDemoRoute() {
        // НОВАЯ СИСТЕМА: Используем фиксированное разрешение
        const width = this.internalWidth;
        const height = this.internalHeight;
        
        // Проверяем соотношение для определения отступов
        const connectedState = document.getElementById('connected');
        const is4_5 = connectedState && connectedState.classList.contains('ratio-4-5');
        
        if (!is4_5) {
            // Для 9:16 используем те же отступы что и в drawStravaDataCard (как было)
            const topPadding = height * 0.07;
            const bottomPadding = height * 0.04;
            
            // Ограничиваем область маршрута между заголовком и метриками
            const routeTopPadding = topPadding + 120; // После заголовка и логотипа
            const availableHeight = height - topPadding - bottomPadding;
            const routeBottomPadding = availableHeight * 0.3; // Оставляем место для метрик (30% от доступной высоты)
            const routeHeight = height - routeTopPadding - routeBottomPadding;
            
            // Используем реальные данные маршрута из Strava
            const points = this.generateStravaRoute(width, routeHeight, 20, routeTopPadding);
            
            // Draw main route (только одна линия)
            this.drawSingleRoute(points);
        } else {
            // Для 4:5 используем 8% отступы со всех сторон
            const topPadding = height * 0.08;
            const bottomPadding = height * 0.08;
            const leftPadding = width * 0.08;
            const rightPadding = width * 0.08;
            
            // Область для маршрута с учетом отступов
            const routeWidth = width - leftPadding - rightPadding;
            const routeHeight = height - topPadding - bottomPadding;
            const routeTopPadding = topPadding;
            
            const points = this.generateStravaRoute(routeWidth, routeHeight, 20, routeTopPadding);
            
            // Draw main route (только одна линия)
            this.drawSingleRoute(points);
        }
    }

    drawSingleRoute(points) {
        // Рисуем линию маршрута в цвета флага Франции
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Создаем градиент для французского флага
        // Находим границы линии для правильного градиента
        let minX = Math.min(...points.map(p => p.x));
        let maxX = Math.max(...points.map(p => p.x));
        
        const gradient = this.ctx.createLinearGradient(minX, 0, maxX, 0);
        gradient.addColorStop(0, '#002395');    // Синий (французский синий)
        gradient.addColorStop(0.4, '#FFFFFF');  // Белый (плавный переход)
        gradient.addColorStop(0.6, '#FFFFFF');  // Белый (плавный переход)
        gradient.addColorStop(1, '#ED2939');     // Красный (французский красный)
        
        this.ctx.strokeStyle = gradient;
        
        // Рисуем путь правильно
        this.ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            if (i === 0) {
                this.ctx.moveTo(points[i].x, points[i].y);
            } else {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
        }
        this.ctx.stroke();
    }

    generateStravaRoute(width, height, padding, topPadding = 0) {
        console.log('🗺️ Generating route for workout:', this.currentWorkout?.name);
        console.log('🗺️ Full workout data:', this.currentWorkout);
        console.log('🗺️ Workout map data:', this.currentWorkout?.map);
        
        // Пытаемся использовать реальные данные маршрута из Strava
        const polylineData = this.currentWorkout?.map?.polyline || this.currentWorkout?.map?.summary_polyline;
        
        if (polylineData) {
            console.log('🗺️ Found polyline data!');
            console.log('🗺️ Polyline length:', polylineData.length);
            console.log('🗺️ First 100 chars:', polylineData.substring(0, 100));
            
            try {
                const points = this.decodePolyline(polylineData, width, height, padding, topPadding);
                console.log('✅ Successfully decoded Strava route with', points.length, 'points');
                return points;
            } catch (error) {
                console.error('❌ Failed to decode Strava polyline:', error);
                console.log('🗺️ Using demo route as fallback');
            }
        } else {
            console.log('⚠️ No polyline data found in workout');
            console.log('🗺️ Available map keys:', Object.keys(this.currentWorkout?.map || {}));
            console.log('🗺️ Using demo route');
        }
        
        // Fallback к демо маршруту если нет данных Strava
        return this.generateDemoRoute(width, height, padding, topPadding);
    }
    
    decodePolyline(encodedPolyline, width, height, padding, topPadding) {
        console.log('🔍 Decoding polyline, length:', encodedPolyline?.length);
        console.log('🔍 window.polyline exists:', typeof window.polyline);
        
        // Проверяем наличие polyline
        if (!encodedPolyline || encodedPolyline.length < 10) {
            console.log('⚠️ Invalid polyline, using demo route');
            return this.generateDemoRoute(width, height, padding, topPadding);
        }
        
        try {
            // Декодируем polyline с помощью библиотеки
            if (!window.polyline || !window.polyline.decode) {
                console.log('⚠️ Polyline library not loaded!');
                console.log('⚠️ window.polyline:', window.polyline);
                console.log('⚠️ Checking if polyline.js is loaded...');
                console.log('⚠️ Available in window:', Object.keys(window).filter(k => k.includes('poly')));
                return this.generateDemoRoute(width, height, padding, topPadding);
            }
            
            console.log('🔍 Polyline library loaded, decoding...');
            const decodedPoints = window.polyline.decode(encodedPolyline);
            console.log('✅ Decoded points count:', decodedPoints?.length);
            console.log('✅ First 3 points:', decodedPoints?.slice(0, 3));
            
            if (!decodedPoints || decodedPoints.length === 0) {
                console.log('⚠️ Empty decoded points, using demo route');
                return this.generateDemoRoute(width, height, padding, topPadding);
            }
            
            // ВАЖНО: polyline возвращает [lat, lng], а не [lng, lat]!
            // Находим границы маршрута для масштабирования
            const lats = decodedPoints.map(p => p[0]); // широта
            const lngs = decodedPoints.map(p => p[1]); // долгота
            
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            
            console.log('📍 Route bounds:', { minLat, maxLat, minLng, maxLng });
            
            // Рассчитываем масштаб для проецирования на canvas
            const latRange = maxLat - minLat;
            const lngRange = maxLng - minLng;
            const canvasWidth = width - 2 * padding;
            const canvasHeight = height - 2 * padding;
            
            console.log('📏 Canvas dimensions:', { width, height, padding, canvasWidth, canvasHeight });
            console.log('📏 Route ranges:', { latRange, lngRange });
            
            // Рассчитываем scale для сохранения пропорций
            // Важно: учитываем, что lng соответствует X, а lat соответствует Y
            const scaleLng = canvasWidth / lngRange;
            const scaleLat = canvasHeight / latRange;
            const scale = Math.min(scaleLng, scaleLat) * 0.9; // 0.9 для отступов
            
            console.log('🔍 Scale calculation:', { scaleLng, scaleLat, scale });
            
            // Центрируем маршрут
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            
            // Преобразуем координаты в пиксели canvas
            // lng -> X (горизонталь), lat -> Y (вертикаль)
            const canvasPoints = decodedPoints.map(([lat, lng]) => {
                // Инвертируем Y для правильного отображения (lat растет вверх, canvas Y растет вниз)
                const x = padding + canvasWidth / 2 + (lng - centerLng) * scale;
                const y = topPadding + padding + canvasHeight / 2 - (lat - centerLat) * scale;
                return { x, y };
            });
            
            // Фильтруем валидные точки
            const validPoints = canvasPoints.filter(p => 
                !isNaN(p.x) && !isNaN(p.y) && isFinite(p.x) && isFinite(p.y)
            );
            
            if (validPoints.length === 0) {
                console.log('⚠️ No valid points after conversion, using demo route');
                return this.generateDemoRoute(width, height, padding, topPadding);
            }
            
            console.log(`✅ Successfully decoded ${validPoints.length} points from Strava polyline`);
            console.log('📍 First point:', validPoints[0], 'Last point:', validPoints[validPoints.length - 1]);
            return validPoints;
        } catch (error) {
            console.warn('❌ Polyline decoding error:', error);
            return this.generateDemoRoute(width, height, padding, topPadding);
        }
    }
    
    generateDemoRoute(width, height, padding, topPadding = 0) {
        const points = [];
        const numPoints = 40;
        
        for (let i = 0; i <= numPoints; i++) {
            const t = i / numPoints;
            const x = padding + (width - 2 * padding) * t;
            const y = topPadding + padding + (height - 2 * padding) * (0.5 + 0.3 * Math.sin(t * Math.PI * 3) + 0.2 * Math.sin(t * Math.PI * 7));
            
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
        const button = document.querySelector(`[data-metric="${metric}"]`);
        
        if (this.activeMetrics.has(metric)) {
            // Если метрика уже активна - отключаем её
            this.activeMetrics.delete(metric);
            button.classList.remove('active');
            
            // Если это была единственная активная метрика, оставляем distance
            if (this.activeMetrics.size === 0) {
                this.activeMetrics.add('distance');
                document.querySelector(`[data-metric="distance"]`).classList.add('active');
            }
        } else {
            // Если метрика неактивна - включаем её
            this.activeMetrics.add(metric);
            button.classList.add('active');
        }
        
        this.updateWorkoutDisplay();
        this.drawRoute();
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
        
        // Update preview-area ratio
        const previewArea = document.querySelector('.preview-area');
        const connectedState = document.getElementById('connected');
        
        if (previewArea && connectedState) {
            // Переключаем ratio классы
            previewArea.classList.remove('ratio-9-16', 'ratio-4-5');
            connectedState.classList.remove('ratio-9-16', 'ratio-4-5');
            
            switch(ratio) {
                case '9:16':
                    // Для 9:16 используем стандартную формулу
                    const screenHeight = window.innerHeight;
                    const navBarHeight = 60;
                    const tabBarHeight = 180;
                    const safeAreaInsets = 0;
                    
                    const viewportHeight9_16 = screenHeight - navBarHeight - tabBarHeight - safeAreaInsets;
                    const viewportWidth9_16 = viewportHeight9_16 * 9 / 16;
                    
                    previewArea.classList.add('ratio-9-16');
                    connectedState.classList.add('ratio-9-16');
                    
                    // Устанавливаем размеры для preview-area
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
                    // Для 4:5 используем ту же логику что и для 9:16
                    const screenHeight4_5 = window.innerHeight;
                    const navBarHeight4_5 = 60;
                    const tabBarHeight4_5 = 180;
                    const safeAreaInsets4_5 = 0;
                    
                    const viewportHeight4_5 = screenHeight4_5 - navBarHeight4_5 - tabBarHeight4_5 - safeAreaInsets4_5;
                    const viewportWidth4_5 = viewportHeight4_5 * 4 / 5;
                    
                    previewArea.classList.add('ratio-4-5');
                    connectedState.classList.add('ratio-4-5');
                    
                    // Устанавливаем размеры для preview-area
                    previewArea.style.setProperty('width', `${viewportWidth4_5}px`, 'important');
                    previewArea.style.setProperty('height', `${viewportHeight4_5}px`, 'important');
                    previewArea.style.setProperty('max-width', `${viewportWidth4_5}px`, 'important');
                    previewArea.style.setProperty('max-height', `${viewportHeight4_5}px`, 'important');
                    
                    connectedState.style.setProperty('aspect-ratio', '4 / 5', 'important');
                    connectedState.style.setProperty('width', '100%', 'important');
                    connectedState.style.setProperty('height', '100%', 'important');
                    
                    console.log('🔧 Установлено соотношение 4:5:', viewportWidth4_5, 'x', viewportHeight4_5);
                    break;
            }
        }
        
        console.log('🔧 Ratio изменен на:', ratio, '- превью обновлен');
        
        // Пересчитываем viewport и перерисовываем canvas
        setTimeout(() => {
            this.calculateViewport();
            this.resizeCanvas();
            this.applyScale();
            console.log('🔧 Canvas перерисован после изменения соотношения');
        }, 100);
    }

    // File Upload Handlers
    handlePhotoUpload(file) {
        if (!file) return;
        
        // Валидация типа файла
        if (!file.type.startsWith('image/')) {
            this.showError('Пожалуйста, загрузите изображение');
            return;
        }
        
        // Валидация размера (максимум 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.showError('Файл слишком большой. Максимальный размер: 10MB');
            return;
        }
        
        // Проверка расширения файла
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validExtensions.includes(file.type)) {
            this.showError('Неподдерживаемый формат изображения. Используйте JPG, PNG или WEBP');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.backgroundImage = e.target.result;
            this.originalBackgroundImage = e.target.result; // Сохраняем оригинал
            this.isMonochrome = false; // Сбрасываем состояние
            this.updateMonoButton(); // Обновляем кнопку
            this.updateBackground();
            
            // Показываем кнопку монохром
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
        
        // Валидация типа файла
        if (!file.type.startsWith('image/')) {
            this.showError('Пожалуйста, загрузите изображение');
            return;
        }
        
        // Валидация размера (максимум 2MB для логотипа)
        const maxSize = 2 * 1024 * 1024; // 2MB
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
        
        // Show connect button in nav and hide navigation icons
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <button id="connect-strava-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; justify-content: center;">Connect Strava</button>
            `;
            
            // Re-add event listener for connect button
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
            
            // Принудительно скрываем кнопку Connect Strava
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
            
            // Принудительно показываем навигацию сразу
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
            
            // Показываем навигационные кнопки с задержкой
            setTimeout(() => {
                const navActions = document.querySelector('.nav-actions');
                
                console.log('🔍 Navigation elements found (with delay):', {
                    navActions: !!navActions
                });
                
                // Show all navigation icons when connected
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
                
                // Re-add event listeners after innerHTML update - wait for DOM to be ready
                setTimeout(() => {
                    const workoutBtn = document.getElementById('workout-selector-btn');
                    const shareBtn = document.getElementById('share-btn');
                    const logoutBtn = document.getElementById('logout-btn');
                    
                    if (workoutBtn) {
                        // Clone and replace to remove old listeners
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
                
                // Проверим навигацию
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
            }, 500); // Задержка 500ms
            // Принудительно устанавливаем правильные пропорции 9:16
            connected.style.setProperty('aspect-ratio', '9 / 16', 'important');
            connected.style.setProperty('max-height', '100%', 'important');
            connected.style.setProperty('overflow', 'hidden', 'important');
            connected.style.setProperty('box-sizing', 'border-box', 'important');
            connected.style.setProperty('width', '100%', 'important');
            connected.style.setProperty('height', 'auto', 'important');
            
            // Просто показываем connected state
            console.log('🔧 Connected state показан');
            
            // Пересчитываем viewport и перерисовываем canvas
            setTimeout(() => {
                this.calculateViewport();
                this.resizeCanvas();
                this.applyFigmaScale();
                console.log('🔧 Canvas перерисован при показе connected state');
            }, 100);
            
            console.log('🔧 Connected state с правильными пропорциями 9:16');
            
            // Принудительно обновляем отображение
            setTimeout(() => {
                console.log('🔄 Force refresh after connected state');
                this.updateWorkoutDisplay();
                this.drawRoute();
                
                // Принудительно обновляем DOM
                document.body.offsetHeight; // Force reflow
                console.log('🔄 DOM forced reflow');
            }, 200);
        }
    }

    showError(message) {
        // В development показываем alert, в production можно использовать toast
        if (isDev) {
            alert(message);
        } else {
            // Создаем toast уведомление
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
            
            // Удаляем через 4 секунды
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
        // Clear Strava token
        localStorage.removeItem('strava_token');
        
        // Reset app state
        this.stravaToken = null;
        this.currentWorkout = null;
        this.workouts = [];
        
        // Hide connected state and show not connected state
        document.getElementById('connected')?.classList.add('hidden');
        document.getElementById('not-connected')?.classList.remove('hidden');
        
        // Show connect button in nav
        const navActions = document.querySelector('.nav-actions');
        if (navActions) {
            navActions.innerHTML = `
                <button id="connect-strava-btn" class="btn btn-primary" style="height: 40px; display: flex; align-items: center; justify-content: center;">Connect Strava</button>
            `;
            
            // Re-add event listener for connect button
            document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        }
        
        // Clear canvas
        if (this.canvas && this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Reset background image
        this.backgroundImage = null;
        this.originalBackgroundImage = null;
        this.isMonochrome = false;
        
        console.log('Logged out successfully');
    }

    // Export functionality with proper 1080x1920 resolution
    exportData() {
        if (!this.currentWorkout) {
            this.showError('No workout data to export');
            return;
        }

        // Create a new canvas with exact 1080x1920 resolution (фиксированное разрешение)
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.internalWidth;
        exportCanvas.height = this.internalHeight;
        const exportCtx = exportCanvas.getContext('2d');

        // Fill background
        exportCtx.fillStyle = '#000000';
        exportCtx.fillRect(0, 0, this.internalWidth, this.internalHeight);

        // Draw route with proper scaling for фиксированное разрешение
        const padding = 40;
        const routeWidth = this.internalWidth - (padding * 2);
        const routeHeight = this.internalHeight - (padding * 2) - 200; // Leave space for stats

        // Generate route points for export resolution
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

        console.log(`📸 Exported workout image: ${this.internalWidth}x${this.internalHeight} (фиксированное разрешение)`);
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