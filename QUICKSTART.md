# 🚀 Trinky Web - Quick Start

## Варианты запуска для OAuth

### 1. 🎯 Простой способ (рекомендуется)

```bash
# Запуск с автоматической настройкой ngrok
./start-dev.sh
```

Этот скрипт:
- Запустит локальный сервер на порту 8000
- Создаст публичный туннель через ngrok
- Покажет URL для настройки Strava API
- Автоматически откроет браузер

### 2. 🔧 Ручная настройка

#### Шаг 1: Настройка Strava API
1. Перейдите на [Strava API Settings](https://www.strava.com/settings/api)
2. Создайте новое приложение:
   - **Application Name**: Trinky Web
   - **Authorization Callback Domain**: `localhost:8000`
3. Скопируйте **Client ID**

#### Шаг 2: Обновите конфигурацию
В файле `config.js` замените:
```javascript
CLIENT_ID: 'YOUR_STRAVA_CLIENT_ID', // На ваш Client ID
```

#### Шаг 3: Запустите сервер
```bash
python3 server.py
```

### 3. 🎭 Демо-режим (без OAuth)

Для тестирования без настройки Strava:

1. Откройте Developer Tools (F12)
2. В Console выполните:
```javascript
localStorage.setItem('strava_token', 'mock_token');
location.reload();
```

## 📁 Структура файлов

```
trinky-web/
├── index.html          # Главная страница
├── styles.css          # Стили
├── app.js             # Основная логика
├── config.js          # Конфигурация
├── server.py          # Python сервер
├── start-dev.sh       # Скрипт с ngrok
├── dev-setup.md       # Подробная настройка
└── QUICKSTART.md      # Этот файл
```

## 🌐 Доступные URL

- **Локальный**: http://localhost:8000
- **ngrok**: https://abc123.ngrok.io (динамический)

## 🔧 Troubleshooting

### Проблема: "ngrok not found"
```bash
# Установите ngrok
# macOS:
brew install ngrok/ngrok/ngrok

# Или скачайте с https://ngrok.com/download
```

### Проблема: "OAuth callback mismatch"
1. Убедитесь, что в Strava API настройках указан правильный домен
2. Для localhost: `localhost:8000`
3. Для ngrok: `abc123.ngrok.io` (без https://)

### Проблема: "Python not found"
```bash
# Установите Python 3
# macOS:
brew install python3

# Ubuntu/Debian:
sudo apt install python3
```

## 🎨 Особенности

- ✅ **Responsive дизайн** - работает на всех устройствах
- ✅ **Bounce анимации** - элементы появляются с подпрыгиванием
- ✅ **Французские цвета маршрутов** - синий, белый, красный
- ✅ **Glassmorphism эффекты** - полупрозрачные карточки
- ✅ **Canvas визуализация** - плавные 2D маршруты

## 🚀 Готово!

После настройки вы получите полнофункциональную веб-версию Trinky с:
- Подключением к Strava
- Визуализацией маршрутов
- Статистикой тренировок
- Экспортом данных
- Кастомными фонами

Удачной разработки! 🎉
