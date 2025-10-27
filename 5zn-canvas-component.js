// SznCanvasComponent - Exact copy of nextPoly canvas logic
// Точная копия компонента canvas из nextPoly
// Version: 2.0 - Updated branding to 5zn

console.log('🎨 Loading SznCanvasComponent v2.0 - Updated branding to 5zn');

class SznCanvasComponent {
    constructor(canvasElement, store) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.store = store;
        
        // Состояние как в nextPoly
        this.fontsLoaded = false;
        this.imageLoading = true;
        this.backgroundImage = new Image();
        this.logoImage = new Image();
        this.dpr = 1; // Инициализируем DPR по умолчанию
        this.polylineData = null; // Данные маршрута
        this.decodedRoute = null; // Декодированный маршрут
        
        // Конфигурация - фиксированный размер canvas 1080x1920
        this.config = {
            canvasWidth: 1080,  // Внутренний размер canvas для рендеринга
            canvasHeight: 1920, // Внутренний размер canvas для рендеринга
            aspectRatio: '9/16',
            maxDPR: 1, // Используем фиксированный размер, не нужно DPR scaling
            // Безопасные зоны для контента
            safeArea: {
                top: 250,
                bottom: 100,
                left: 80,
                right: 80
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('🎯 Initializing SznCanvasComponent...');
        this.setupCanvas();
        this.loadFonts();
        this.loadImages();
        this.subscribeToStore();
        console.log('✅ SznCanvasComponent initialized');
    }
    
    updateCanvasSize() {
        const state = this.store.getState();
        
        // Обновляем размеры в зависимости от postStyle
        if (state.postStyle === 'square') {
            this.config.canvasWidth = 1080;
            this.config.canvasHeight = 1350; // 1080 * 5/4 = 1350 для соотношения 4:5
            this.config.aspectRatio = '4/5';
        } else {
            this.config.canvasWidth = 1080;
            this.config.canvasHeight = 1920; // Стандартное разрешение 9:16
            this.config.aspectRatio = '9/16';
        }
    }
    
    setupCanvas() {
        // Обновляем размеры в зависимости от postStyle
        this.updateCanvasSize();
        
        // Получаем размеры области просмотра (между navbar 48px и editing panel 180px)
        const viewportHeight = window.innerHeight - 48 - 180;
        const viewportWidth = window.innerWidth;
        
        // Используем viewport размеры если контейнер пустой
        let containerWidth = viewportWidth;
        let containerHeight = viewportHeight;
        
        // Пытаемся получить реальные размеры контейнера
        try {
            const container = this.canvas.parentElement;
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
                containerWidth = container.clientWidth;
                containerHeight = container.clientHeight;
            }
        } catch (e) {
            console.warn('⚠️ Could not get container size, using viewport:', e);
        }
        
        // Рассчитываем CSS размеры для отображения (масштабируем под контейнер)
        let displayWidth, displayHeight;
        const canvasAspect = this.config.canvasWidth / this.config.canvasHeight;
        const containerAspect = containerWidth / containerHeight;
        
        if (containerAspect > canvasAspect) {
            // Контейнер шире - ограничены по высоте
            displayHeight = containerHeight;
            displayWidth = displayHeight * canvasAspect;
        } else {
            // Контейнер уже - ограничены по ширине
            displayWidth = containerWidth;
            displayHeight = displayWidth / canvasAspect;
        }
        
        // Минимальные размеры для видимости
        if (displayWidth < 100) displayWidth = containerWidth * 0.9;
        if (displayHeight < 100) displayHeight = containerHeight * 0.9;
        
        // Устанавливаем CSS размеры для отображения
        this.canvas.style.width = Math.floor(displayWidth) + 'px';
        this.canvas.style.height = Math.floor(displayHeight) + 'px';
        this.canvas.style.display = 'block';
        this.canvas.style.margin = '0 auto';
        
        // Устанавливаем фиксированные размеры canvas для рендеринга (1080x1920)
        // Применяем размеры только если они изменились
        if (this.canvas.width !== this.config.canvasWidth || this.canvas.height !== this.config.canvasHeight) {
            this.canvas.width = this.config.canvasWidth;
            this.canvas.height = this.config.canvasHeight;
        }
        
        // DPR = 1 так как используем фиксированный размер
        this.dpr = 1;
        
        console.log(`🎯 Canvas setup: ${this.config.canvasWidth}x${this.config.canvasHeight} (Display: ${Math.floor(displayWidth)}x${Math.floor(displayHeight)}, Container: ${containerWidth}x${containerHeight})`);
        
        // Обработчик resize (добавляем только один раз)
        if (!this._resizeHandlerAdded) {
            this._resizeHandlerAdded = true;
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.setupCanvas();
                    this.render();
                }, 100);
            });
        }
    }
    
    loadFonts() {
        // Загружаем шрифты как в nextPoly
        if (typeof window.WebFont !== 'undefined') {
            window.WebFont.load({
                custom: {
                    families: ["Milligram-Regular", "Milligram-Bold"],
                    urls: ["/fonts/Milligram.woff2"]
                },
                active: () => {
                    this.fontsLoaded = true;
                    // Добавляем небольшую задержку для инициализации canvas
                    setTimeout(() => this.render(), 100);
                },
                inactive: () => {
                    console.error("Font loading failed!");
                    this.fontsLoaded = true; // Fallback
                    // Добавляем небольшую задержку для инициализации canvas
                    setTimeout(() => this.render(), 100);
                }
            });
        } else {
            // Fallback если WebFont не загружен
            this.fontsLoaded = true;
            // Добавляем небольшую задержку для инициализации canvas
            setTimeout(() => this.render(), 100);
        }
    }
    
    loadImages() {
        const state = this.store.getState();
        
        // Загружаем фоновое изображение (пользовательское или дефолтное)
        this.imageLoading = true;
        const imageSrc = state.image || '/bg.jpeg'; // Используем bg.jpeg как дефолт
        this.backgroundImage.src = imageSrc;
        this.backgroundImage.crossOrigin = "anonymous";
        this.backgroundImage.onload = () => {
            this.imageLoading = false;
            this.render();
        };
        this.backgroundImage.onerror = () => {
            console.warn('⚠️ Background image failed to load:', imageSrc);
            this.imageLoading = false;
            this.render();
        };
        
        // Загружаем логотип
        this.logoImage.src = "/logo_NIP.svg";
        this.logoImage.crossOrigin = "anonymous";
        this.logoImage.onload = () => {
            this.render();
        };
        this.logoImage.onerror = () => {
            console.warn('⚠️ Logo image failed to load: /logo_NIP.svg');
            // Используем fallback логотип
            this.logoImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHJ4PSI4IiBmaWxsPSIjZmZmZmZmIi8+CiAgPHRleHQgeD0iMzYiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwMDAwIj41Wk48L3RleHQ+Cjwvc3ZnPg==";
        };
    }
    
    subscribeToStore() {
        let previousImage = this.store.getState().image;
        
        this.store.subscribe((state) => {
            // Проверяем, изменилось ли фоновое изображение
            if (state.image !== previousImage) {
                console.log('🖼️ Background image changed, reloading...');
                previousImage = state.image;
                this.loadImages();
            } else {
                this.render();
            }
        });
    }
    
    render() {
        if (!this.fontsLoaded) return;
        
        const state = this.store.getState();
        
        // Обновляем размеры в зависимости от postStyle
        this.updateCanvasSize();
        
        // Используем фиксированные размеры canvas (1080x1920)
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        // Проверяем, что canvas имеет валидные размеры
        if (width <= 0 || height <= 0) {
            console.warn('⚠️ Canvas has invalid dimensions, forcing setup:', width, 'x', height);
            this.setupCanvas();
            return;
        }
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Рендерим
        this.renderBackground(state, width, height);
        this.renderOverlay(state, width, height);
        this.renderContent(state, width, height);
        this.renderLogo(state, width, height);
        
        console.log(`🎨 Canvas rendered at ${width}x${height}`);
    }
    
    renderBackground(state, width, height) {
        // Проверяем режим фона
        if (state.backgroundMode === 'french') {
            this.drawFrenchFlag(width, height);
            return;
        }
        
        if (state.backgroundMode === 'gradient') {
            this.drawGradient(width, height);
            return;
        }
        
        if (state.backgroundMode === 'solid') {
            this.drawSolidColor(width, height, state.fontColor === 'white' ? '#000000' : '#ffffff');
            return;
        }
        
        // По умолчанию рисуем изображение
        if (this.imageLoading || !this.backgroundImage.complete || this.backgroundImage.naturalWidth === 0) return;
        
        // Адаптивное масштабирование как в nextPoly
        this.drawBackgroundImage(this.backgroundImage, state, width, height);
    }
    
    drawBackgroundImage(img, state, width, height) {
        
        // Точная логика масштабирования как в nextPoly
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
            // Изображение шире - масштабируем по высоте
            drawHeight = height;
            drawWidth = drawHeight * imgAspect;
            drawX = (width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Изображение уже - масштабируем по ширине
            drawWidth = width;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (height - drawHeight) / 2;
        }
        
        this.ctx.save();
        this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        this.ctx.restore();
    }
    
    drawFrenchFlag(width, height) {
        // Французский флаг: синий, белый, красный (вертикальные полосы)
        const stripeWidth = width / 3;
        
        this.ctx.save();
        
        // Синий (Bleu)
        this.ctx.fillStyle = '#0055A4';
        this.ctx.fillRect(0, 0, stripeWidth, height);
        
        // Белый (Blanc)
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(stripeWidth, 0, stripeWidth, height);
        
        // Красный (Rouge)
        this.ctx.fillStyle = '#EF4135';
        this.ctx.fillRect(stripeWidth * 2, 0, stripeWidth, height);
        
        this.ctx.restore();
    }
    
    drawGradient(width, height) {
        // Красивый градиент
        const gradient = this.ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
    }
    
    drawSolidColor(width, height, color) {
        // Однотонный фон
        this.ctx.save();
        this.ctx.fillStyle = color;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.restore();
    }
    
    renderOverlay(state, width, height) {
        // Проверяем, что canvas имеет валидные размеры
        if (width <= 0 || height <= 0) {
            console.warn('⚠️ Canvas has invalid dimensions:', width, 'x', height);
            return;
        }
        
        // Создаем полупрозрачный overlay как в nextPoly
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        const overlayCtx = overlayCanvas.getContext('2d');
        
        // Цвет overlay зависит от основного цвета
        const overlayColor = state.fontColor === 'white' 
            ? 'rgba(0, 0, 0, 0.4)' 
            : 'rgba(255, 255, 255, 0.4)';
        
        overlayCtx.fillStyle = overlayColor;
        overlayCtx.fillRect(0, 0, width, height);
        
        this.ctx.drawImage(overlayCanvas, 0, 0, width, height);
    }
    
    renderContent(state, width, height) {
        
        // Рендерим заголовок
        if (state.titleVisible.visible) {
            this.renderTitle(state, width, height);
        }
        
        // Рендерим метрики
        this.renderMetrics(state, width, height);
        
        // Рендерим маршрут
        this.renderRoute(state, width, height);
    }
    
    renderTitle(state, width, height) {
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Позиция заголовка с учетом безопасной зоны сверху
        const titleTop = safeArea.top * scale;
        
        // Заголовок - 52px
        const titleFontSize = Math.floor(52 * scale);
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        // Используем безопасные зоны слева и справа
        const leftMargin = safeArea.left * scale;
        const maxWidth = width - (safeArea.left + safeArea.right) * scale;
        
        this.wrapText(state.title, leftMargin, titleTop, maxWidth, titleFontSize);
        
        // Подзаголовок (дата) - 32px
        const subtitleFontSize = Math.floor(32 * scale);
        this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
        
        const subtitleY = titleTop + titleFontSize + 10 * scale;
        this.wrapText(state.date.toUpperCase(), leftMargin, subtitleY, maxWidth, subtitleFontSize);
        
        this.ctx.restore();
    }
    
    renderMetrics(state, width, height) {
        const { RideData, speedData } = state;
        
        // Фильтруем только видимые метрики и объединяем
        const visibleRideData = RideData.filter(item => item.visible);
        const visibleSpeedData = speedData.filter(item => item.visible);
        const allMetrics = [...visibleRideData, ...visibleSpeedData];
        
        if (allMetrics.length === 0) return;
        
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Параметры grid
        const columns = 3;
        const labelFontSize = Math.floor(32 * scale);
        const valueFontSize = Math.floor(52 * scale);
        const cellHeight = valueFontSize + labelFontSize + 20 * scale;
        const leftMargin = safeArea.left * scale;
        const availableWidth = width - (safeArea.left + safeArea.right) * scale;
        const cellWidth = availableWidth / columns;
        
        // Начальная позиция снизу с учетом безопасной зоны
        const startY = height - (safeArea.bottom * scale);
        
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.textAlign = 'left';
        
        // Рендерим в grid 2 ряда x 3 колонки (снизу вверх)
        const rows = Math.ceil(allMetrics.length / columns);
        
        for (let row = 0; row < rows; row++) {
            const y = startY - (row * cellHeight) - (row * 44 * scale);
            
            for (let col = 0; col < columns; col++) {
                const index = (rows - 1 - row) * columns + col;
                if (index >= allMetrics.length) continue;
                
                const metric = allMetrics[index];
                let x, textAlign;
                
                // Определяем позицию и выравнивание в зависимости от колонки
                if (col === 0) {
                    // Левая колонка (1, 4) - выравнивание по левому краю
                    x = leftMargin + (col * cellWidth);
                    textAlign = 'left';
                } else if (col === 1) {
                    // Средняя колонка (2, 5) - выравнивание по центру
                    x = leftMargin + (col * cellWidth) + (cellWidth / 2);
                    textAlign = 'center';
                } else {
                    // Правая колонка (3, 6) - выравнивание по правому краю
                    x = leftMargin + (col * cellWidth) + cellWidth;
                    textAlign = 'right';
                }
                
                this.ctx.textAlign = textAlign;
                
                // Label (сверху) - в верхнем регистре
                this.ctx.font = `${labelFontSize}px Inter, sans-serif`;
                this.ctx.fillText(metric.dataName.toUpperCase(), x, y - valueFontSize - 10 * scale);
                
                // Value (снизу)
                this.ctx.font = `bold ${valueFontSize}px Inter, sans-serif`;
                this.ctx.fillText(metric.data, x, y);
            }
        }
        
        this.ctx.restore();
    }
    
    // Этот метод больше не используется - renderMetrics() теперь рендерит в grid
    renderMetricGroup(metrics, width, height, bottomY, scale) {
        // Deprecated - используется новый grid layout в renderMetrics()
        return bottomY;
    }
    
    renderRoute(state, width, height) {
        if (!this.decodedRoute || this.decodedRoute.length === 0) {
            return;
        }
        
        // Получаем границы маршрута
        const bounds = this.getRouteBounds(this.decodedRoute);
        if (!bounds) return;
        
        // Рассчитываем масштаб и смещение для центрирования
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Доступная область для маршрута (между заголовком и метриками)
        const routeTop = (safeArea.top + 150) * scale; // После заголовка
        const routeBottom = height - (safeArea.bottom + 200) * scale; // Над метриками
        const routeLeft = safeArea.left * scale;
        const routeRight = width - (safeArea.right * scale);
        
        const routeWidth = routeRight - routeLeft;
        const routeHeight = routeBottom - routeTop;
        
        // Масштаб для вписывания маршрута
        const latRange = bounds.maxLat - bounds.minLat;
        const lngRange = bounds.maxLng - bounds.minLng;
        
        const scaleX = routeWidth / lngRange;
        const scaleY = routeHeight / latRange;
        const routeScale = Math.min(scaleX, scaleY) * 0.9; // 90% для отступов
        
        // Центрирование
        const centerLat = (bounds.maxLat + bounds.minLat) / 2;
        const centerLng = (bounds.maxLng + bounds.minLng) / 2;
        
        // Создаем линейный градиент с точными координатами из SVG
        const gradient = this.ctx.createLinearGradient(508, 19.5, -106, 633.5);
        gradient.addColorStop(0, '#2A3587');
        gradient.addColorStop(0.495192, 'white');
        gradient.addColorStop(1, '#CF2228');
        
        // Рисуем маршрут с градиентом
        this.ctx.save();
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 8 * scale;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        for (let i = 0; i < this.decodedRoute.length; i++) {
            const point = this.decodedRoute[i];
            const x = routeLeft + routeWidth / 2 + (point[1] - centerLng) * routeScale;
            const y = routeTop + routeHeight / 2 - (point[0] - centerLat) * routeScale;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();
        
        this.ctx.restore();
        
        console.log(`🗺️ Route rendered: ${this.decodedRoute.length} points`);
    }
    
    interpolateColor(color1, color2, factor) {
        // Применяем easing функцию для более плавного перехода
        const easedFactor = this.easeInOutCubic(factor);
        
        // Конвертируем hex цвета в RGB
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        // Интерполируем каждый канал с плавным переходом
        const r = Math.round(r1 + (r2 - r1) * easedFactor);
        const g = Math.round(g1 + (g2 - g1) * easedFactor);
        const b = Math.round(b1 + (b2 - b1) * easedFactor);
        
        // Конвертируем обратно в hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    easeInOutCubic(t) {
        // Кубическая функция easing для более плавных переходов
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    getRouteBounds(route) {
        if (!route || route.length === 0) return null;
        
        let minLat = route[0][0];
        let maxLat = route[0][0];
        let minLng = route[0][1];
        let maxLng = route[0][1];
        
        route.forEach(point => {
            minLat = Math.min(minLat, point[0]);
            maxLat = Math.max(maxLat, point[0]);
            minLng = Math.min(minLng, point[1]);
            maxLng = Math.max(maxLng, point[1]);
        });
        
        return { minLat, maxLat, minLng, maxLng };
    }
    
    renderLogo(state, width, height) {
        if (!this.logoImage.complete || this.logoImage.naturalWidth === 0) return;
        
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Позиционируем логотип в правом верхнем углу с учетом безопасной зоны
        const logoSize = 180 * scale;
        const logoX = width - logoSize - (safeArea.right * scale);
        const logoY = (safeArea.top * scale) - 40 * scale;
        
        this.ctx.save();
        this.ctx.drawImage(this.logoImage, logoX, logoY, logoSize, logoSize);
        this.ctx.restore();
    }
    
    // Утилита для переноса текста как в nextPoly
    wrapText(text, x, y, maxWidth, fontSize) {
        const words = text.split(' ');
        let line = '';
        let lineY = y;
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = this.ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                this.ctx.fillText(line, x, lineY);
                line = words[i] + ' ';
                lineY += fontSize;
            } else {
                line = testLine;
            }
        }
        
        this.ctx.fillText(line, x, lineY);
        return lineY;
    }
    
    // Методы для обновления состояния
    setPolylineData(polyline) {
        if (!polyline) {
            console.warn('⚠️ No polyline data provided');
            return;
        }
        
        this.polylineData = polyline;
        
        // Декодируем polyline используя window.polyline
        if (typeof window.polyline !== 'undefined') {
            try {
                this.decodedRoute = window.polyline.decode(polyline);
                console.log(`✅ Polyline decoded: ${this.decodedRoute.length} points`);
                this.render();
            } catch (error) {
                console.error('❌ Error decoding polyline:', error);
                this.decodedRoute = null;
            }
        } else {
            console.error('❌ Polyline library not loaded');
        }
    }
    
    // Экспорт
    exportAsImage(format = 'image/png', quality = 1.0) {
        return this.canvas.toDataURL(format, quality);
    }
    
    exportAsBlob(format = 'image/png', quality = 1.0) {
        return new Promise((resolve) => {
            this.canvas.toBlob(resolve, format, quality);
        });
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SznCanvasComponent;
} else {
    window.SznCanvasComponent = SznCanvasComponent;
}
