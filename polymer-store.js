// Polymer Store - Exact copy of nextPoly Zustand store
// Точная копия логики управления состоянием из nextPoly

class PolymerStore {
    constructor() {
        this.state = {
            postStyle: "portrait",
            canvasWidth: "desktop", 
            fontColor: "white",
            title: "TITLE",
            eyeSlash: "/assets/eye-slash.svg",
            titleVisible: {
                visible: true,
                src: "/assets/eye-slash.svg"
            },
            imagesArray: [],
            image: "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg",
            RideData: [{
                dataName: "Distance",
                data: "132km",
                visible: true
            }, {
                dataName: "Elevation", 
                data: "4350hm",
                visible: true
            }, {
                dataName: "MovingTime",
                data: "04:32:21",
                visible: true
            }],
            speedData: [{
                dataName: "KM/Max",
                data: "98.2",
                visible: true
            }, {
                dataName: "KM/H",
                data: "62.2", 
                visible: true
            }, {
                dataName: "KM/Min",
                data: "32.2",
                visible: true
            }],
            date: "Sep 11,2023 at 8:00AM"
        };
        
        this.listeners = new Set();
    }
    
    // Методы как в nextPoly
    setPostStyle(postStyle) {
        this.state.postStyle = postStyle;
        this.notifyListeners();
    }
    
    setCanvasWidth(canvasWidth) {
        this.state.canvasWidth = canvasWidth;
        this.notifyListeners();
    }
    
    setFontColor(fontColor) {
        this.state.fontColor = fontColor;
        this.notifyListeners();
    }
    
    setTitle(title) {
        this.state.title = title;
        this.notifyListeners();
    }
    
    setTitleVisible(titleVisible) {
        this.state.titleVisible = titleVisible;
        this.notifyListeners();
    }
    
    setImagesArray(imagesArray) {
        this.state.imagesArray = imagesArray;
        this.notifyListeners();
    }
    
    setImage(image) {
        this.state.image = image;
        this.notifyListeners();
    }
    
    setActivity(activity) {
        // Точная логика как в nextPoly
        this.state.title = activity.name;
        this.state.date = this.formatDate(activity.start_date_local);
        this.state.RideData = this.formatRideData(activity);
        this.state.speedData = this.formatSpeedData(activity);
        this.notifyListeners();
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month} ${day},${date.getFullYear()} at ${hours}:${minutes}`;
    }
    
    formatRideData(activity) {
        return [{
            dataName: "Distance",
            data: `${Number(activity.distance / 1000).toFixed(2)}km`,
            visible: true
        }, {
            dataName: "Elevation",
            data: `${activity.total_elevation_gain}hm`,
            visible: true
        }, {
            dataName: "Time",
            data: this.formatTime(activity.moving_time),
            visible: true
        }];
    }
    
    formatSpeedData(activity) {
        const speedData = [];
        
        if (activity.average_watts) {
            speedData.push({
                dataName: "Power/avg",
                data: `${activity.average_watts.toFixed(1)} W`,
                visible: true
            });
        }
        
        speedData.push({
            dataName: "Speed/avg", 
            data: `${(3.6 * activity.average_speed).toFixed(1)} km/h`,
            visible: true
        });
        
        return speedData;
    }
    
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let result = '';
        if (hours) result += `${hours}h `;
        result += `${minutes.toString().padStart(2, '0')}m`;
        if (secs && !hours) result += ` ${secs.toString().padStart(2, '0')}s`;
        
        return result;
    }
    
    triggerDownload() {
        this.state.download = {
            downloadNow: true
        };
        this.notifyListeners();
    }
    
    toggleVisibility(dataType, dataName) {
        try {
            const dataArray = this.state[dataType];
            const updatedArray = dataArray.map(item => 
                item.dataName === dataName 
                    ? { ...item, visible: !item.visible }
                    : item
            );
            this.state[dataType] = updatedArray.filter(item => true);
            this.notifyListeners();
        } catch (error) {
            console.log(error);
        }
    }
    
    // Подписка на изменения (как в Zustand)
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }
    
    // Получение состояния (как в Zustand)
    getState() {
        return this.state;
    }
}

// Глобальный store
window.polymerStore = new PolymerStore();

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolymerStore;
} else {
    window.PolymerStore = PolymerStore;
}
