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
            maxDPR: 1 // Используем фиксированный размер, не нужно DPR scaling
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
        
        // Получаем размеры контейнера для CSS масштабирования
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
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
        
        // Устанавливаем CSS размеры для отображения
        this.canvas.style.width = Math.floor(displayWidth) + 'px';
        this.canvas.style.height = Math.floor(displayHeight) + 'px';
        
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
                this.setupCanvas();
                this.render();
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
        this.logoImage.src = "/assets/polymer-symbol.svg";
        this.logoImage.crossOrigin = "anonymous";
        this.logoImage.onload = () => {
            this.render();
        };
        this.logoImage.onerror = () => {
            console.warn('⚠️ Logo image failed to load: /assets/polymer-symbol.svg');
            // Используем fallback логотип
            this.logoImage.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNzIiIGhlaWdodD0iNzIiIHJ4PSI4IiBmaWxsPSIjZmZmZmZmIi8+CiAgPHRleHQgeD0iMzYiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwMDAwIj41Wk48L3RleHQ+Cjwvc3ZnPg==";
        };
    }
    
    subscribeToStore() {
        this.store.subscribe((state) => {
            this.render();
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
        const titleTop = state.postStyle === 'portrait' 
            ? height * 0.05 
            : height * 0.15;
        
        // Заголовок
        const titleFontSize = Math.floor(48 * scale);
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        this.wrapText(state.title, 60 * scale, titleTop, width - 120 * scale, titleFontSize);
        
        // Подзаголовок (дата)
        const subtitleFontSize = Math.floor(32 * scale);
        this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
        
        const subtitleY = titleTop + titleFontSize + 15;
        this.wrapText(state.date, 60 * scale, subtitleY, width - 120 * scale, subtitleFontSize);
        
        this.ctx.restore();
    }
    
    renderMetrics(state, width, height) {
        const { RideData, speedData } = state;
        
        // Фильтруем только видимые метрики
        const visibleRideData = RideData.filter(item => item.visible);
        const visibleSpeedData = speedData.filter(item => item.visible);
        
        // Масштабируем размеры для 1080x1920
        const scale = width / 1080;
        
        // Рендерим RideData
        let currentY = height - height * 0.05;
        currentY = this.renderMetricGroup(visibleRideData, width, height, currentY, scale);
        
        // Рендерим SpeedData
        currentY = this.renderMetricGroup(visibleSpeedData, width, height, currentY - height * 0.01, scale);
    }
    
    renderMetricGroup(metrics, width, height, bottomY, scale) {
        if (metrics.length === 0) return bottomY;
        
        const fontSize = Math.floor(28 * scale);
        const lineHeight = fontSize + 8;
        const padding = 60 * scale;
        
        this.ctx.save();
        this.ctx.fillStyle = this.store.getState().fontColor;
        this.ctx.font = `${fontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        let currentY = bottomY;
        
        metrics.forEach(metric => {
            // Label
            this.ctx.fillText(metric.dataName, padding, currentY);
            
            // Value
            this.ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            this.ctx.fillText(metric.data, padding, currentY + lineHeight);
            
            currentY += lineHeight * 2 + 12;
        });
        
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
        
        // Позиционируем логотип в правом верхнем углу
        const logoSize = 96 * scale;
        const logoX = width - logoSize - 30 * scale;
        const logoY = height * 0.05 + 70 * scale - logoSize / 2;
        
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
