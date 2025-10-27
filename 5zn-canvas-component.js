// 5zn Canvas Component - Exact copy of nextPoly canvas logic
// Точная копия компонента canvas из nextPoly
// Version: 2.0 - Updated branding to 5zn

console.log('🎨 Loading 5znCanvasComponent v2.0 - Updated branding to 5zn');

class 5znCanvasComponent {
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
        
        // Конфигурация как в nextPoly
        this.config = {
            width: 400,
            height: 1400, // Будет изменяться в зависимости от postStyle
            aspectRatio: '9/16',
            maxDPR: 2
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.loadFonts();
        this.loadImages();
        this.subscribeToStore();
        console.log('✅ Polymer Canvas Component initialized');
    }
    
    updateCanvasSize() {
        const state = this.store.getState();
        
        // Обновляем размеры в зависимости от postStyle как в nextPoly
        if (state.postStyle === 'square') {
            this.config.height = 500; // 400 * 5/4 = 500 для соотношения 4:5
            this.config.aspectRatio = '4/5';
        } else {
            this.config.height = 1400;
            this.config.aspectRatio = '9/16';
        }
    }
    
    setupCanvas() {
        const rawDPR = window.devicePixelRatio || 1;
        const dpr = Math.min(rawDPR, this.config.maxDPR);
        
        // Обновляем размеры в зависимости от postStyle
        this.updateCanvasSize();
        
        // Точная логика как в nextPoly
        const clientWidth = this.canvas.clientWidth;
        const clientHeight = this.canvas.clientHeight;
        
        // Рассчитываем размеры canvas
        let canvasWidth = Math.floor(clientWidth * dpr);
        let canvasHeight = Math.floor(clientHeight * dpr);
        
        // Минимальная ширина как в nextPoly
        if (canvasWidth < 800) {
            canvasHeight = 800 * canvasHeight / canvasWidth;
            canvasWidth = 800;
        }
        
        // Устанавливаем размеры canvas
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        
        // CSS управляет отображением - фиксированные размеры
        this.canvas.style.width = this.config.width + 'px';
        this.canvas.style.height = this.config.height + 'px';
        this.canvas.style.aspectRatio = this.config.aspectRatio;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.maxHeight = '95%';
        this.canvas.style.margin = 'auto';
        this.canvas.style.transition = 'height 0.3s ease-out, transform 0.3s ease-out';
        
        // Применяем DPR масштаб только один раз
        this.ctx.scale(dpr, dpr);
        
        // Сохраняем DPR для использования в рендеринге
        this.dpr = dpr;
        
        // Обработчик resize как в nextPoly
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
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
        
        // Используем размеры с учетом DPR масштабирования
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        
        // Проверяем, что canvas имеет валидные размеры
        if (width <= 0 || height <= 0) {
            console.warn('⚠️ Canvas has invalid dimensions, skipping render:', width, 'x', height);
            return;
        }
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Рендерим как в nextPoly
        this.renderBackground(state, width, height);
        this.renderOverlay(state, width, height);
        this.renderContent(state, width, height);
        this.renderLogo(state, width, height);
        
        console.log('🎨 Polymer Canvas rendered');
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
        // Масштабируем размеры как в nextPoly
        const scale = width / 1000;
        const titleTop = state.postStyle === 'portrait' 
            ? height * 0.05 
            : height * 0.15;
        
        // Заголовок
        const titleFontSize = Math.floor(35 * scale);
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        this.wrapText(state.title, 40 * scale, titleTop, width - 80 * scale, titleFontSize);
        
        // Подзаголовок (дата)
        const subtitleFontSize = Math.floor(24 * scale);
        this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
        
        const subtitleY = titleTop + titleFontSize + 10;
        this.wrapText(state.date, 40 * scale, subtitleY, width - 80 * scale, subtitleFontSize);
        
        this.ctx.restore();
    }
    
    renderMetrics(state, width, height) {
        const { RideData, speedData } = state;
        
        // Фильтруем только видимые метрики
        const visibleRideData = RideData.filter(item => item.visible);
        const visibleSpeedData = speedData.filter(item => item.visible);
        
        // Масштабируем размеры как в nextPoly
        const scale = width / 1000;
        
        // Рендерим RideData
        let currentY = height - height * 0.05;
        currentY = this.renderMetricGroup(visibleRideData, width, height, currentY, scale);
        
        // Рендерим SpeedData
        currentY = this.renderMetricGroup(visibleSpeedData, width, height, currentY - height * 0.01, scale);
    }
    
    renderMetricGroup(metrics, width, height, bottomY, scale) {
        if (metrics.length === 0) return bottomY;
        
        const fontSize = Math.floor(20 * scale);
        const lineHeight = fontSize + 5;
        const padding = 40 * scale;
        
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
            
            currentY += lineHeight * 2 + 10;
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
        
        // Масштабируем размеры как в nextPoly
        const scale = width / 1000;
        
        // Позиционируем логотип в правом верхнем углу
        const logoSize = 72 * scale;
        const logoX = width - logoSize - 20 * scale;
        const logoY = height * 0.05 + 50 * scale - logoSize / 2;
        
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
    module.exports = 5znCanvasComponent;
} else {
    window.5znCanvasComponent = 5znCanvasComponent;
}
