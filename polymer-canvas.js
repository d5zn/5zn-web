// Polymer Canvas System - Direct Integration
// Минимальная и эффективная реализация на основе nextPoly

class PolymerCanvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        // Конфигурация как в nextPoly
        this.config = {
            width: 400,
            height: 1400,
            aspectRatio: '9/16',
            maxDPR: 2,
            padding: 0.08
        };
        
        // Состояние
        this.state = {
            backgroundImage: null,
            polylineData: null,
            title: '',
            subtitle: '',
            metrics: [],
            logoImage: null,
            fontColor: 'white'
        };
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        console.log('✅ Polymer Canvas initialized');
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
        
        // Обработчик resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }
    
    render() {
        const { width, height } = this.config;
        
        // Очищаем canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Рендерим слои в правильном порядке
        this.renderBackground();
        this.renderOverlay();
        this.renderRoute();
        this.renderContent();
        this.renderLogo();
        
        console.log('🎨 Polymer Canvas rendered');
    }
    
    // Рендеринг фона (как в nextPoly)
    renderBackground() {
        if (!this.state.backgroundImage) return;
        
        const img = new Image();
        img.onload = () => {
            this.drawBackgroundImage(img);
        };
        img.src = this.state.backgroundImage;
    }
    
    drawBackgroundImage(img) {
        const { width, height } = this.config;
        
        // Адаптивное масштабирование как в nextPoly
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
    
    // Overlay эффект (как в nextPoly)
    renderOverlay() {
        const { width, height } = this.config;
        
        // Создаем полупрозрачный overlay
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = width;
        overlayCanvas.height = height;
        const overlayCtx = overlayCanvas.getContext('2d');
        
        // Цвет overlay зависит от основного цвета
        const overlayColor = this.state.fontColor === 'white' 
            ? 'rgba(0, 0, 0, 0.4)' 
            : 'rgba(255, 255, 255, 0.4)';
        
        overlayCtx.fillStyle = overlayColor;
        overlayCtx.fillRect(0, 0, width, height);
        
        this.ctx.drawImage(overlayCanvas, 0, 0, width, height);
    }
    
    // Рендеринг маршрута (как в nextPoly)
    renderRoute() {
        if (!this.state.polylineData) return;
        
        const { width, height, padding } = this.config;
        const paddingPx = height * padding;
        
        // Область для маршрута
        const routeArea = {
            top: paddingPx,
            bottom: height - paddingPx,
            left: paddingPx,
            right: width - paddingPx,
            width: width - (paddingPx * 2),
            height: height - (paddingPx * 2)
        };
        
        // Декодируем полилинию
        const points = this.decodePolyline(this.state.polylineData);
        if (!points || points.length === 0) return;
        
        // Масштабируем точки
        const scaledPoints = this.scalePointsToArea(points, routeArea);
        
        // Рисуем маршрут с градиентом
        this.drawRouteWithGradient(scaledPoints, routeArea);
    }
    
    // Декодер полилинии (упрощенная версия)
    decodePolyline(encodedPolyline) {
        if (!encodedPolyline || encodedPolyline.length < 10) return null;
        
        try {
            // Используем библиотеку polyline если доступна
            if (typeof window.polyline !== 'undefined' && window.polyline.decode) {
                return window.polyline.decode(encodedPolyline);
            }
            
            // Fallback декодер
            const coordinates = [];
            let index = 0;
            let lat = 0;
            let lng = 0;
            
            while (index < encodedPolyline.length) {
                let shift = 0;
                let result = 0;
                let byte;
                
                do {
                    byte = encodedPolyline.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                
                const deltaLat = (result & 1) ? ~(result >> 1) : (result >> 1);
                lat += deltaLat;
                
                shift = 0;
                result = 0;
                
                do {
                    byte = encodedPolyline.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                
                const deltaLng = (result & 1) ? ~(result >> 1) : (result >> 1);
                lng += deltaLng;
                
                coordinates.push([lat / 1e5, lng / 1e5]);
            }
            
            return coordinates;
        } catch (error) {
            console.error('Polyline decoding error:', error);
            return null;
        }
    }
    
    scalePointsToArea(points, area) {
        // Находим границы маршрута
        const bounds = this.calculateBounds(points);
        
        // Рассчитываем масштаб
        const scaleX = area.width / (bounds.maxLng - bounds.minLng);
        const scaleY = area.height / (bounds.maxLat - bounds.minLat);
        const scale = Math.min(scaleX, scaleY) * 0.9;
        
        // Центрируем
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLng = (bounds.minLng + bounds.maxLng) / 2;
        
        // Преобразуем координаты
        return points.map(([lat, lng]) => ({
            x: area.left + area.width / 2 + (lng - centerLng) * scale,
            y: area.top + area.height / 2 - (lat - centerLat) * scale
        }));
    }
    
    calculateBounds(points) {
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;
        
        for (const point of points) {
            minLat = Math.min(minLat, point[0]);
            maxLat = Math.max(maxLat, point[0]);
            minLng = Math.min(minLng, point[1]);
            maxLng = Math.max(maxLng, point[1]);
        }
        
        return { minLat, maxLat, minLng, maxLng };
    }
    
    // Рисуем маршрут с градиентом (как в nextPoly)
    drawRouteWithGradient(points, area) {
        if (!points || points.length === 0) return;
        
        this.ctx.save();
        
        // Настройки линии
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Градиент французского флага
        const gradient = this.ctx.createLinearGradient(area.left, 0, area.right, 0);
        gradient.addColorStop(0, '#002395');    // Синий
        gradient.addColorStop(0.4, '#FFFFFF');  // Белый
        gradient.addColorStop(0.6, '#FFFFFF');  // Белый
        gradient.addColorStop(1, '#ED2939');    // Красный
        
        this.ctx.strokeStyle = gradient;
        
        // Рисуем путь
        this.ctx.beginPath();
        let firstValidPoint = null;
        
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (!isNaN(point.x) && !isNaN(point.y) && isFinite(point.x) && isFinite(point.y)) {
                if (firstValidPoint === null) {
                    firstValidPoint = point;
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
        }
        
        if (firstValidPoint !== null) {
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    // Рендеринг контента
    renderContent() {
        const { width, height, padding } = this.config;
        const paddingPx = height * padding;
        
        // Заголовок
        if (this.state.title) {
            this.renderTitle(this.state.title, this.state.subtitle, paddingPx);
        }
        
        // Метрики
        if (this.state.metrics && this.state.metrics.length > 0) {
            this.renderMetrics(this.state.metrics, width, height, paddingPx);
        }
    }
    
    renderTitle(title, subtitle, topPadding) {
        const { width } = this.config;
        
        this.ctx.save();
        this.ctx.fillStyle = this.state.fontColor;
        
        // Заголовок
        const titleFontSize = Math.floor(width / 1000 * 35);
        this.ctx.font = `bold ${titleFontSize}px Inter, sans-serif`;
        this.ctx.textAlign = 'left';
        
        const titleY = topPadding + 50;
        this.wrapText(title, 40, titleY, width - 80, titleFontSize);
        
        // Подзаголовок
        if (subtitle) {
            const subtitleFontSize = Math.floor(width / 1000 * 24);
            this.ctx.font = `${subtitleFontSize}px Inter, sans-serif`;
            
            const subtitleY = titleY + titleFontSize + 10;
            this.wrapText(subtitle, 40, subtitleY, width - 80, subtitleFontSize);
        }
        
        this.ctx.restore();
    }
    
    renderMetrics(metrics, width, height, padding) {
        this.ctx.save();
        
        // Рассчитываем позиции для метрик
        const metricsArea = {
            top: height - padding - 200,
            bottom: height - padding - 20,
            left: padding,
            right: width - padding,
            width: width - (padding * 2),
            height: 180
        };
        
        const cols = 3;
        const rows = Math.ceil(metrics.length / cols);
        const colWidth = metricsArea.width / cols;
        const rowHeight = metricsArea.height / rows;
        
        metrics.forEach((metric, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            
            const x = metricsArea.left + col * colWidth + colWidth / 2;
            const y = metricsArea.top + row * rowHeight + 20;
            
            // Label
            this.ctx.fillStyle = '#888888';
            this.ctx.font = '13px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(metric.label, x, y);
            
            // Value
            this.ctx.fillStyle = this.state.fontColor;
            this.ctx.font = 'bold 22px Inter, sans-serif';
            this.ctx.fillText(metric.value, x, y + 30);
        });
        
        this.ctx.restore();
    }
    
    // Рендеринг логотипа
    renderLogo() {
        if (!this.state.logoImage) return;
        
        const { width, height, padding } = this.config;
        const paddingPx = height * padding;
        
        // Позиционируем логотип в правом верхнем углу
        const logoSize = 72;
        const logoX = width - logoSize - 20;
        const logoY = paddingPx + 50 - logoSize / 2;
        
        const img = new Image();
        img.onload = () => {
            this.ctx.save();
            this.ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
            this.ctx.restore();
        };
        img.src = this.state.logoImage;
    }
    
    // Утилита для переноса текста
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
    setBackgroundImage(imageSrc) {
        this.state.backgroundImage = imageSrc;
        this.render();
    }
    
    setPolylineData(polyline) {
        this.state.polylineData = polyline;
        this.render();
    }
    
    setTitle(title, subtitle = '') {
        this.state.title = title;
        this.state.subtitle = subtitle;
        this.render();
    }
    
    setMetrics(metrics) {
        this.state.metrics = metrics;
        this.render();
    }
    
    setLogo(logoSrc) {
        this.state.logoImage = logoSrc;
        this.render();
    }
    
    setFontColor(color) {
        this.state.fontColor = color;
        this.render();
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
    module.exports = PolymerCanvas;
} else {
    window.PolymerCanvas = PolymerCanvas;
}
