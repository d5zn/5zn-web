# 📊 Хранение данных пользователей Strava

## 🔍 Что сохраняется

При авторизации через Strava OAuth сохраняются следующие данные пользователя:

```json
{
  "athlete_id": 123456789,
  "username": "john_doe",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "city": "San Francisco",
  "country": "United States",
  "profile_picture": "https://...",
  "created_at": "2015-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "connected_at": "2024-12-20T12:00:00",
  "access_token_hash": "a1b2c3d4e5f6..."
}
```

### ⚠️ Важная информация об Email

**Strava API обычно НЕ предоставляет email пользователя** по умолчанию. Email будет доступен только если:
1. Пользователь разрешил доступ к email в scope
2. Это ваш собственный аккаунт Strava

В большинстве случаев поле `email` будет содержать `"not_provided"`.

---

## 📁 Где сохраняются данные

Данные сохраняются в директории `data/` в формате:
```
data/
└── athlete_123456789.json
```

Каждый пользователь имеет отдельный файл с его уникальным `athlete_id`.

---

## 🔒 Безопасность

### ✅ Что защищено:

1. **Токены**: Токены доступа **НЕ сохраняются в открытом виде**. Сохраняется только хеш.
2. **Директория данных**: Добавлена в `.gitignore` - не коммитится в git
3. **Приватность**: Данные хранятся локально на сервере

### ⚠️ Важно для production:

1. **Шифрование**: В production стоит использовать шифрование данных
2. **БД**: Для production рекомендуется использовать базу данных вместо JSON файлов
3. **GDPR**: Убедитесь, что соблюдаете GDPR и получаете согласие пользователя
4. **Backup**: Регулярно делайте резервные копии данных

---

## 🛡️ GDPR и Privacy

### Обязанности по GDPR:

1. **Согласие**: Уведомите пользователей, какие данные вы собираете
2. **Право на удаление**: Предоставьте способ удаления данных
3. **Право на доступ**: Позвольте пользователям просмотреть свои данные
4. **Право на исправление**: Дайте возможность обновить данные

### Privacy Policy

Добавьте в вашу Privacy Policy:
- Какие данные собираются
- Зачем они нужны
- Как долго хранятся
- Кто имеет доступ
- Как удалить данные

---

## 📝 Как просмотреть данные пользователя

### Через командную строку:

```bash
# Просмотреть всех пользователей
ls data/

# Просмотреть данные конкретного пользователя
cat data/athlete_123456789.json

# Красивый вывод
cat data/athlete_123456789.json | python -m json.tool
```

### Через Python:

```python
import json
import os

# Список всех пользователей
for filename in os.listdir('data/'):
    with open(f'data/{filename}', 'r') as f:
        user_data = json.load(f)
        print(f"{user_data['firstname']} {user_data['lastname']}")
        print(f"ID: {user_data['athlete_id']}")
        print(f"Email: {user_data.get('email', 'Not provided')}")
        print(f"Connected: {user_data['connected_at']}")
        print("---")
```

---

## 🔄 Обновление данных

Данные автоматически обновляются при каждом входе пользователя:
- Старые данные перезаписываются
- Добавляется новое поле `connected_at` со временем последнего подключения

---

## 🗑️ Удаление данных

### Удалить данные конкретного пользователя:

```bash
rm data/athlete_123456789.json
```

### Удалить все данные:

```bash
rm -rf data/
```

### API для удаления (будущее расширение):

Можно добавить endpoint для удаления данных пользователя:
```python
DELETE /api/user/delete?athlete_id=123456789
```

---

## 📊 Аналитика пользователей

### Простая статистика:

```python
import json
import os
from datetime import datetime

users = []
for filename in os.listdir('data/'):
    if filename.endswith('.json'):
        with open(f'data/{filename}', 'r') as f:
            users.append(json.load(f))

print(f"Total users: {len(users)}")
print(f"Users from last 7 days: {sum(1 for u in users if is_recent(u['connected_at']))}")
```

---

## 🚀 Миграция на базу данных (production)

### Рекомендуемая структура таблицы:

```sql
CREATE TABLE athletes (
    athlete_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255),
    city VARCHAR(255),
    country VARCHAR(255),
    profile_picture TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    connected_at DATETIME,
    access_token_hash VARCHAR(64),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Миграция данных:

```python
import json
import os
import mysql.connector

# Подключение к БД
db = mysql.connector.connect(...)
cursor = db.cursor()

# Миграция из JSON в БД
for filename in os.listdir('data/'):
    with open(f'data/{filename}', 'r') as f:
        user_data = json.load(f)
        
        # Вставка в БД
        sql = "INSERT INTO athletes (...) VALUES (...)"
        cursor.execute(sql, tuple(user_data.values()))

db.commit()
```

---

## ⚡ Быстрый старт

1. **Запустите сервер**: `python3 server.py`
2. **Авторизуйтесь через Strava**
3. **Проверьте данные**: `ls data/`
4. **Просмотрите данные**: `cat data/athlete_*.json`

Готово! 🎉

---

**Внимание**: Убедитесь, что соблюдаете GDPR и получаете согласие пользователей на хранение их данных.

