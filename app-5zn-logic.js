// SznApp with 5zn Logic - Exact copy of nextPoly data handling
// Точная копия логики работы с данными из nextPoly
// Version: 2.0 - Updated branding to 5zn

console.log('🚀 Loading SznApp v2.0 - Updated branding to 5zn');

class SznApp {
    constructor() {
        this.stravaToken = localStorage.getItem('strava_token');
        this.currentWorkout = null;
        this.workouts = [];
        this.polymerCanvas = null;
        this.currentTab = 'photo';
        
        // Инициализируем 5zn Store
        this.store = window.sznStore;
        
        this.init();
    }

    init() {
        console.log('SznApp with 5zn Logic initializing...');
        this.setupEventListeners();
        this.setupCanvas();
        this.setupTabs();
        this.initializeRatio();
        this.setupMobileOptimizations();
        this.checkAuthStatus();
        
        setTimeout(() => {
            console.log('✅ SznApp with 5zn Logic initialized');
            // Синхронизируем кнопки метрик после инициализации
            this.syncMetricButtons();
        }, 100);
    }
    
    setupCanvas() {
        const canvas = document.getElementById('route-canvas');
        if (canvas) {
            // Инициализируем 5zn Canvas Component
            this.polymerCanvas = new SznCanvasComponent(canvas, this.store);
            
            // Настраиваем обработчики для управления изображением
            this.setupImageManipulation();
            this.setupPhotoButtons();
            
            console.log('✅ 5zn Canvas Component setup complete');
        }
    }
    
    updateCanvas() {
        // 5zn Canvas автоматически обрабатывает resize
        if (this.polymerCanvas) {
            this.polymerCanvas.render();
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
                                average_watts: 180,
                                start_date_local: '2023-09-11T08:00:00Z',
                                map: { polyline: 'mock_polyline_data' }
                            },
                            {
                                id: 2,
                                name: 'Evening Run',
                                distance: 8000,
                                moving_time: 2400,
                                total_elevation_gain: 200,
                                average_speed: 3.33,
                                start_date_local: '2023-09-10T18:30:00Z',
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
        const state = this.store.getState();
        
        // Обновляем UI элементы на основе состояния store
        this.updateMetricDisplay('distance', state.RideData);
        this.updateMetricDisplay('elevation', state.RideData);
        this.updateMetricDisplay('time', state.RideData);
        this.updateMetricDisplay('speed', state.speedData);
    }
    
    updateMetricDisplay(metricType, dataArray) {
        const metric = dataArray.find(item => 
            item.dataName.toLowerCase().includes(metricType.toLowerCase())
        );
        
        if (metric) {
            const element = document.getElementById(`${metricType}-value`);
            if (element) {
                element.textContent = metric.visible ? metric.data : '';
            }
        }
    }

    // Новый метод рендеринга с использованием 5zn Store
    renderWorkout() {
        if (!this.polymerCanvas || !this.currentWorkout) return;
        
        console.log('🎨 Rendering workout with 5zn Store');
        
        // Устанавливаем активность в store (как в nextPoly)
        this.store.setActivity(this.currentWorkout);
        
        // Устанавливаем данные маршрута
        const polylineData = this.currentWorkout?.map?.polyline || this.currentWorkout?.map?.summary_polyline;
        if (polylineData) {
            this.polymerCanvas.setPolylineData(polylineData);
        }
        
        console.log('✅ Workout rendered with 5zn Store');
    }

    setupEventListeners() {
        // Connect Strava button (теперь в HTML)
        document.getElementById('connect-strava-btn')?.addEventListener('click', () => this.connectStrava());
        
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
        
        // Logo click handler
        document.querySelector('.nav-logo')?.addEventListener('click', () => {
            window.open('/landing.html', '_blank');
        });
        
        // Nav buttons
        document.getElementById('workout-selector-btn')?.addEventListener('click', () => {
            this.openWorkoutSelector();
        });
        
        document.getElementById('share-btn')?.addEventListener('click', (e) => {
            this.showShareContextMenu(e);
        });
        
        // Context menu items
        document.getElementById('download-share-btn')?.addEventListener('click', () => {
            this.downloadCanvas();
            this.hideShareContextMenu();
        });
        
        document.getElementById('instagram-share-btn')?.addEventListener('click', () => {
            this.shareToInstagram();
            this.hideShareContextMenu();
        });
        
        // Close context menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#share-btn') && !e.target.closest('#share-context-menu')) {
                this.hideShareContextMenu();
            }
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

        // Data metric buttons - используем логику nextPoly
        document.querySelectorAll('.data-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const metric = e.target.dataset.metric;
                this.toggleMetricVisibility(metric);
            });
        });

        // Position buttons
        document.querySelectorAll('.position-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const position = e.target.dataset.position;
                this.setPosition(position);
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
        if (!this.polymerCanvas) return;
        
        const canvas = this.polymerCanvas.canvas;
        
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
        this.touchState = this.touchState || {};
        this.touchState.isDragging = true;
        this.touchState.lastTouchCenter = { x: e.clientX, y: e.clientY };
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.touchState?.isDragging) return;
        
        const deltaX = e.clientX - this.touchState.lastTouchCenter.x;
        const deltaY = e.clientY - this.touchState.lastTouchCenter.y;
        
        this.touchState.lastTouchCenter = { x: e.clientX, y: e.clientY };
        
        this.polymerCanvas.render();
        e.preventDefault();
    }

    handleMouseUp(e) {
        this.touchState = this.touchState || {};
        this.touchState.isDragging = false;
        e.preventDefault();
    }

    handleWheel(e) {
        this.polymerCanvas.render();
        e.preventDefault();
    }

    handleTouchStart(e) {
        this.touchState = this.touchState || {};
        this.touchState.startTouches = Array.from(e.touches);
        
        if (e.touches.length === 1) {
            this.touchState.isDragging = true;
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
        }
        
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (!this.touchState?.isDragging) return;
        
        if (e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - this.touchState.lastTouchCenter.x;
            const deltaY = e.touches[0].clientY - this.touchState.lastTouchCenter.y;
            
            this.touchState.lastTouchCenter = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
            };
            
            this.polymerCanvas.render();
        }
        
        e.preventDefault();
    }

    handleTouchEnd(e) {
        this.touchState = this.touchState || {};
        this.touchState.isDragging = false;
        e.preventDefault();
    }

    setupPhotoButtons() {
        document.getElementById('mono-toggle-btn')?.addEventListener('click', () => {
            // Логика монохромного режима
            console.log('Mono toggle clicked');
        });
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

    // Синхронизация кнопок метрик с состоянием store
    syncMetricButtons() {
        const state = this.store.getState();
        
        // Синхронизируем все кнопки метрик
        document.querySelectorAll('.data-btn').forEach(btn => {
            const metric = btn.dataset.metric;
            if (!metric) return;
            
            // Определяем тип данных
            let dataType = 'RideData';
            if (metric === 'speed' || metric === 'power' || metric === 'calories') {
                dataType = 'speedData';
            }
            
            // Находим соответствующую метрику
            const dataArray = state[dataType];
            const metricItem = dataArray.find(item => 
                item.dataName.toLowerCase().includes(metric.toLowerCase())
            );
            
            if (metricItem) {
                if (metricItem.visible) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
                console.log(`🔄 Synced ${metricItem.dataName}: ${metricItem.visible ? 'active' : 'inactive'}`);
            } else {
                // Если метрика не найдена в данных, оставляем кнопку неактивной
                btn.classList.remove('active');
                console.log(`⚠️ Metric ${metric} not found in data, button set to inactive`);
            }
        });
    }

    // Metric Selection - используем логику nextPoly
    toggleMetricVisibility(metric) {
        const state = this.store.getState();
        
        // Определяем тип данных
        let dataType = 'RideData';
        if (metric === 'speed' || metric === 'power' || metric === 'calories') {
            dataType = 'speedData';
        }
        
        // Находим соответствующую метрику
        const dataArray = state[dataType];
        const metricItem = dataArray.find(item => 
            item.dataName.toLowerCase().includes(metric.toLowerCase())
        );
        
        if (metricItem) {
            console.log(`🔧 Toggling metric: ${metricItem.dataName} (current: ${metricItem.visible})`);
            
            // Используем метод store для переключения видимости
            this.store.toggleVisibility(dataType, metricItem.dataName);
            
            // Обновляем UI после переключения (используем новое состояние)
            const newState = this.store.getState();
            const updatedMetric = newState[dataType].find(item => 
                item.dataName === metricItem.dataName
            );
            
            const button = document.querySelector(`[data-metric="${metric}"]`);
            if (button && updatedMetric) {
                if (updatedMetric.visible) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
                console.log(`✅ Metric ${updatedMetric.dataName} is now ${updatedMetric.visible ? 'visible' : 'hidden'}`);
            }
        } else {
            console.warn(`⚠️ Metric not found: ${metric}`);
            // Если метрика не найдена, просто переключаем состояние кнопки
            const button = document.querySelector(`[data-metric="${metric}"]`);
            if (button) {
                button.classList.toggle('active');
                console.log(`🔄 Button ${metric} toggled (metric not in data)`);
            }
        }
    }

    // Position Setting
    setPosition(position) {
        console.log('Setting position:', position);
    }

    // Ratio Setting
    setRatio(ratio) {
        console.log('Setting ratio:', ratio);
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-ratio="${ratio}"]`)?.classList.add('active');
        
        const connectedState = document.getElementById('connected');
        
        if (connectedState) {
            connectedState.classList.remove('ratio-9-16', 'ratio-4-5');
            
            if (ratio === '9:16') {
                connectedState.classList.add('ratio-9-16');
                console.log('🔧 Установлено соотношение 9:16');
            } else if (ratio === '4:5') {
                connectedState.classList.add('ratio-4-5');
                console.log('🔧 Установлено соотношение 4:5');
            }
        }
        
        console.log('🔧 Ratio изменен на:', ratio);
        
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
            // Устанавливаем изображение в store
            this.store.setImage(e.target.result);
            
            console.log('🖼️ Background image updated in store');
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
            // Здесь можно добавить логику для логотипа
            console.log('Logo updated:', e.target.result);
        };
        reader.onerror = () => {
            this.showError('Ошибка при чтении файла логотипа');
        };
        reader.readAsDataURL(file);
    }

    showNotConnectedState() {
        console.log('Showing not connected state');
        const loading = document.getElementById('loading');
        const notConnected = document.getElementById('not-connected');
        const connected = document.getElementById('connected');
        const editingPanel = document.querySelector('.editing-panel');
        
        if (loading) loading.classList.add('hidden');
        if (notConnected) notConnected.classList.remove('hidden');
        if (connected) connected.classList.add('hidden');
        if (editingPanel) editingPanel.classList.add('hidden'); // Скрываем панель редактирования
        
        // Кнопка теперь в HTML, не создаем её динамически
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
            connected.style.display = 'flex';
            console.log('✅ Connected shown');
            
        // Показываем панель редактирования
        const editingPanel = document.querySelector('.editing-panel');
        if (editingPanel) {
            editingPanel.classList.remove('hidden');
            console.log('✅ Editing panel shown');
        }
        
        // Синхронизируем кнопки метрик с текущим состоянием
        this.syncMetricButtons();
            
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
                // Кнопки теперь в HTML, не создаем их динамически
                
                // Обработчики событий уже добавлены в setupEventListeners
                
                const navbar = document.querySelector('.navbar');
                const navContainer = document.querySelector('.nav-container');
                
                console.log('🔍 Navigation structure:', {
                    navbar: !!navbar,
                    navContainer: !!navContainer
                });
                
                // Кнопки теперь в HTML, не требуют динамического управления
            }, 500);
            
            connected.style.setProperty('aspect-ratio', '9 / 16', 'important');
            connected.style.setProperty('max-height', '100%', 'important');
            connected.style.setProperty('overflow', 'hidden', 'important');
            connected.style.setProperty('box-sizing', 'border-box', 'important');
            connected.style.setProperty('width', '100%', 'important');
            connected.style.setProperty('height', '100%', 'important');
            connected.style.setProperty('display', 'flex', 'important');
            
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
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
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
                    <div style="margin-left: 10px; padding: 8px 12px; background: #333; color: #fff; border-radius: 4px; font-size: 12px; white-space: nowrap; opacity: 0.7;">
                        Click to apply
                    </div>
                </div>
            </div>
        `).join('');

        workoutList.querySelectorAll('.workout-item').forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('🖱️ Workout item clicked:', e.target);
                const workoutId = parseInt(item.dataset.workoutId);
                console.log('🆔 Workout ID:', workoutId);
                this.selectWorkout(workoutId);
            });
            
            // Добавляем визуальную обратную связь
            item.addEventListener('mousedown', () => {
                item.style.backgroundColor = '#333333';
            });
            
            item.addEventListener('mouseup', () => {
                item.style.backgroundColor = '';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = '';
            });
        });
    }

    selectWorkout(workoutId) {
        console.log('🎯 selectWorkout called with ID:', workoutId);
        console.log('📋 Available workouts:', this.workouts.map(w => ({ id: w.id, name: w.name })));
        
        const workout = this.workouts.find(w => w.id === workoutId);
        if (workout) {
            console.log('✅ Found workout:', workout.name);
            this.currentWorkout = workout;
            this.updateWorkoutDisplay();
            this.renderWorkout();
            this.closeWorkoutSelector();
            console.log('🏃 Selected workout:', workout.name);
        } else {
            console.error('❌ Workout not found with ID:', workoutId);
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

    // Share Context Menu Functions
    showShareContextMenu(event) {
        const contextMenu = document.getElementById('share-context-menu');
        if (!contextMenu) return;
        
        // Hide any existing context menu
        this.hideShareContextMenu();
        
        // Position the menu near the button
        const buttonRect = event.target.closest('#share-btn').getBoundingClientRect();
        const menuWidth = 200;
        const menuHeight = 100;
        
        let left = buttonRect.left + (buttonRect.width / 2) - (menuWidth / 2);
        let top = buttonRect.bottom + 8;
        
        // Adjust if menu goes off screen
        if (left < 8) left = 8;
        if (left + menuWidth > window.innerWidth - 8) {
            left = window.innerWidth - menuWidth - 8;
        }
        if (top + menuHeight > window.innerHeight - 8) {
            top = buttonRect.top - menuHeight - 8;
        }
        
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${top}px`;
        contextMenu.classList.remove('hidden');
        
        console.log('📋 Share context menu shown');
    }
    
    hideShareContextMenu() {
        const contextMenu = document.getElementById('share-context-menu');
        if (contextMenu) {
            contextMenu.classList.add('hidden');
        }
    }
    
    downloadCanvas() {
        if (!this.polymerCanvas) {
            this.showError('Canvas not available');
            return;
        }
        
        const canvas = this.polymerCanvas.canvas;
        if (!canvas) {
            this.showError('Canvas not found');
            return;
        }
        
        // Create download link
        const link = document.createElement('a');
        link.download = `5zn-workout-${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('📥 Canvas downloaded');
    }
    
    shareToInstagram() {
        if (!this.polymerCanvas) {
            this.showError('Canvas not available');
            return;
        }
        
        const canvas = this.polymerCanvas.canvas;
        if (!canvas) {
            this.showError('Canvas not found');
            return;
        }
        
        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (!blob) {
                this.showError('Failed to create image');
                return;
            }
            
            // Create a temporary URL for the blob
            const url = URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `5zn-workout-${new Date().toISOString().split('T')[0]}.png`;
            
            // Trigger download first
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            // Show instructions
            alert('Image downloaded! Now you can:\n\n1. Open Instagram Stories\n2. Add the downloaded image\n3. Share your workout!');
            
            console.log('📱 Instagram share prepared');
        }, 'image/png', 0.9);
    }

    logout() {
        localStorage.removeItem('strava_token');
        
        this.stravaToken = null;
        this.currentWorkout = null;
        this.workouts = [];
        
        document.getElementById('connected')?.classList.add('hidden');
        document.getElementById('not-connected')?.classList.remove('hidden');
        
        // Кнопка теперь в HTML, не создаем её динамически
        
        if (this.polymerCanvas && this.polymerCanvas.ctx) {
            this.polymerCanvas.ctx.clearRect(0, 0, this.polymerCanvas.canvas.width, this.polymerCanvas.canvas.height);
        }
        
        console.log('Logged out successfully');
    }

    // Utility methods
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing SznApp with 5zn Logic');
    new SznApp();
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
