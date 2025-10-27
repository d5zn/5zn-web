// Polymer Canvas Component - Exact copy of nextPoly canvas logic
// Точная копия компонента canvas из nextPoly

class PolymerCanvasComponent {
    constructor(canvasElement, store) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.store = store;
        
        // Состояние как в nextPoly
        this.fontsLoaded = false;
        this.imageLoading = true;
        this.backgroundImage = new Image();
        this.logoImage = new Image();
        
        // Конфигурация как в nextPoly
        this.config = {
            width: 400,
            height: 1400,
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
    
    setupCanvas() {
        const rawDPR = window.devicePixelRatio || 1;
        const dpr = Math.min(rawDPR, this.config.maxDPR);
        
        // Устанавливаем размеры как в nextPoly
        this.canvas.width = this.config.width * dpr;
        this.canvas.height = this.config.height * dpr;
        
        // CSS управляет отображением
        this.canvas.style.width = this.config.width + 'px';
        this.canvas.style.height = this.config.height + 'px';
        this.canvas.style.aspectRatio = this.config.aspectRatio;
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.maxHeight = '95%';
        this.canvas.style.margin = 'auto';
        this.canvas.style.transition = 'height 0.3s ease-out, transform 0.3s ease-out';
        
        // Применяем DPR масштаб
        this.ctx.scale(dpr, dpr);
        
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
                    this.render();
                },
                inactive: () => {
                    console.error("Font loading failed!");
                    this.fontsLoaded = true; // Fallback
                    this.render();
                }
            });
        } else {
            // Fallback если WebFont не загружен
            this.fontsLoaded = true;
            this.render();
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
            this.imageLoading = false;
            this.render();
        };
        
        // Загружаем логотип
        this.logoImage.src = "/assets/polymer-symbol.svg";
        this.logoImage.crossOrigin = "anonymous";
    }
    
    subscribeToStore() {
        this.store.subscribe((state) => {
            this.render();
        });
    }
    
    render() {
        if (!this.fontsLoaded) return;
        
        const state = this.store.getState();
        const { width, height } = this.config;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Рендерим как в nextPoly
        this.renderBackground(state);
        this.renderOverlay(state);
        this.renderContent(state);
        this.renderLogo(state);
        
        console.log('🎨 Polymer Canvas rendered');
    }
    
    renderBackground(state) {
        if (this.imageLoading || !this.backgroundImage.complete) return;
        
        // Адаптивное масштабирование как в nextPoly
        this.drawBackgroundImage(this.backgroundImage, state);
    }
    
    drawBackgroundImage(img, state) {
        const { width, height } = this.config;
        
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
    
    renderOverlay(state) {
        const { width, height } = this.config;
        
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
    
    renderContent(state) {
        const { width, height } = this.config;
        
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
        const titleTop = state.postStyle === 'portrait' 
            ? height * 0.05 
            : height * 0.15;
        
        // Заголовок
        const titleFontSize = Math.floor(width / 1000 * 35);
        this.ctx.save();
        this.ctx.fillStyle = state.fontColor;
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        this.wrapText(state.title, 40, titleTop, width - 80, titleFontSize);
        
        // Подзаголовок (дата)
        const subtitleFontSize = Math.floor(width / 1000 * 24);
        this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
        
        const subtitleY = titleTop + titleFontSize + 10;
        this.wrapText(state.date, 40, subtitleY, width - 80, subtitleFontSize);
        
        this.ctx.restore();
    }
    
    renderMetrics(state, width, height) {
        const { RideData, speedData } = state;
        
        // Фильтруем только видимые метрики
        const visibleRideData = RideData.filter(item => item.visible);
        const visibleSpeedData = speedData.filter(item => item.visible);
        
        // Рендерим RideData
        let currentY = height - height * 0.05;
        currentY = this.renderMetricGroup(visibleRideData, width, height, currentY);
        
        // Рендерим SpeedData
        currentY = this.renderMetricGroup(visibleSpeedData, width, height, currentY - height * 0.01);
    }
    
    renderMetricGroup(metrics, width, height, bottomY) {
        if (metrics.length === 0) return bottomY;
        
        const fontSize = Math.floor(width / 1000 * 20);
        const lineHeight = fontSize + 5;
        const padding = 40;
        
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
    
    renderLogo(state) {
        if (!this.logoImage.complete) return;
        
        const { width, height } = this.config;
        
        // Позиционируем логотип в правом верхнем углу
        const logoSize = 72;
        const logoX = width - logoSize - 20;
        const logoY = height * 0.05 + 50 - logoSize / 2;
        
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
    module.exports = PolymerCanvasComponent;
} else {
    window.PolymerCanvasComponent = PolymerCanvasComponent;
}
