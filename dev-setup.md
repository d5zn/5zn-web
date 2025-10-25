# Trinky Web - Development Setup

## OAuth Development Setup

Для локальной разработки с Strava OAuth нужно настроить несколько вещей:

### 1. Strava API Application

1. Перейдите на [Strava API Settings](https://www.strava.com/settings/api)
2. Создайте новое приложение:
   - **Application Name**: Trinky Web Dev
   - **Category**: Other
   - **Club**: None
   - **Website**: `http://localhost:8000`
   - **Authorization Callback Domain**: `localhost:8000`

### 2. Получите Client ID и Client Secret

После создания приложения вы получите:
- **Client ID** - публичный идентификатор
- **Client Secret** - секретный ключ (не делитесь им!)

### 3. Обновите конфигурацию

В файле `app.js` замените:

```javascript
const clientId = 'YOUR_STRAVA_CLIENT_ID';
```

на ваш реальный Client ID.

### 4. Настройка для продакшена

Для продакшена используйте:
- **Website**: `https://yourdomain.com`
- **Authorization Callback Domain**: `yourdomain.com`

## Альтернативные решения

### Вариант 1: ngrok (рекомендуется)

1. Установите ngrok: https://ngrok.com/download
2. Запустите туннель:
   ```bash
   ngrok http 8000
   ```
3. Используйте полученный URL (например: `https://abc123.ngrok.io`) в Strava API настройках

### Вариант 2: Локальный туннель

Используйте сервисы типа:
- **localtunnel**: `npx localtunnel --port 8000`
- **serveo**: `ssh -R 80:localhost:8000 serveo.net`

### Вариант 3: GitHub Pages / Netlify

Разверните на GitHub Pages или Netlify для получения публичного URL.

## Тестирование без OAuth

Для тестирования без реального Strava подключения:

1. Откройте Developer Tools (F12)
2. В Console выполните:
   ```javascript
   localStorage.setItem('strava_token', 'mock_token');
   location.reload();
   ```

Это активирует демо-режим с моковыми данными.

## Структура OAuth Flow

```
1. Пользователь нажимает "Connect Strava"
2. Перенаправление на Strava OAuth:
   https://www.strava.com/oauth/authorize?client_id=YOUR_ID&redirect_uri=http://localhost:8000/oauth/&response_type=code&scope=read,activity:read_all

3. Strava перенаправляет на /oauth/ с кодом
4. Обмен кода на токен (в реальном приложении)
5. Сохранение токена в localStorage
6. Перенаправление на главную страницу
```

## Безопасность

⚠️ **Важно**: 
- Никогда не коммитьте Client Secret в репозиторий
- Используйте переменные окружения для продакшена
- Ограничьте scope до минимума необходимого
