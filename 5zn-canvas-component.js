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
        
        // Загружаем фоновое изображение
        this.imageLoading = true;
        this.backgroundImage.src = state.image;
        this.backgroundImage.crossOrigin = "anonymous";
        this.backgroundImage.onload = () => {
            this.imageLoading = false;
            this.render();
        };
        this.backgroundImage.onerror = () => {
            console.warn('⚠️ Background image failed to load:', state.image);
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
        
        // Заголовок
        const titleFontSize = Math.floor(48 * scale);
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        // Используем безопасные зоны слева и справа
        const leftMargin = safeArea.left * scale;
        const maxWidth = width - (safeArea.left + safeArea.right) * scale;
        
        this.wrapText(state.title, leftMargin, titleTop, maxWidth, titleFontSize);
        
        // Подзаголовок (дата)
        const subtitleFontSize = Math.floor(32 * scale);
        this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
        
        const subtitleY = titleTop + titleFontSize + 15;
        this.wrapText(state.date, leftMargin, subtitleY, maxWidth, subtitleFontSize);
        
        this.ctx.restore();
    }
    
    renderMetrics(state, width, height) {
        const { RideData, speedData } = state;
        
        // Фильтруем только видимые метрики
        const visibleRideData = RideData.filter(item => item.visible);
        const visibleSpeedData = speedData.filter(item => item.visible);
        
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Рендерим RideData снизу с учетом безопасной зоны
        let currentY = height - (safeArea.bottom * scale);
        currentY = this.renderMetricGroup(visibleRideData, width, height, currentY, scale);
        
        // Рендерим SpeedData
        currentY = this.renderMetricGroup(visibleSpeedData, width, height, currentY - 20 * scale, scale);
    }
    
    renderMetricGroup(metrics, width, height, bottomY, scale) {
        if (metrics.length === 0) return bottomY;
        
        const fontSize = Math.floor(28 * scale);
        const lineHeight = fontSize + 8;
        const safeArea = this.config.safeArea;
        const leftPadding = safeArea.left * scale;
        
        this.ctx.save();
        this.ctx.fillStyle = this.store.getState().fontColor;
        this.ctx.font = `${fontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        let currentY = bottomY;
        
        // Рендерим в обратном порядке (снизу вверх)
        for (let i = metrics.length - 1; i >= 0; i--) {
            const metric = metrics[i];
            
            // Value (рисуем первым, так как идем снизу вверх)
            this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            this.ctx.fillText(metric.data, leftPadding, currentY);
            
            // Label (выше value)
            this.ctx.font = `${fontSize}px Inter, sans-serif`;
            this.ctx.fillText(metric.dataName, leftPadding, currentY - lineHeight);
            
            // Двигаемся вверх для следующей метрики
            currentY -= (lineHeight * 2 + 12);
        }
        
        this.ctx.restore();
        return currentY;
    }
    
    renderRoute(state, width, height) {
        // Здесь должна быть логика рендеринга маршрута
        // Пока что заглушка
        console.log('Route rendering placeholder');
    }
    
    renderLogo(state, width, height) {
        if (!this.logoImage.complete || this.logoImage.naturalWidth === 0) return;
        
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        const safeArea = this.config.safeArea;
        
        // Позиционируем логотип в правом верхнем углу с учетом безопасной зоны
        const logoSize = 148 * scale;
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
        // Здесь будет логика установки данных маршрута
        console.log('Polyline data set:', polyline);
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
