# 🗄️ Где находится база данных?

## 📁 Текущее состояние

### Development (JSON файлы)
**Расположение**: `data/` папка в корне проекта

```
5zn-web/
└── data/
    ├── athlete_123456789.json
    ├── athlete_987654321.json
    └── athlete_456789123.json
```

**Формат**: JSON файлы  
**Доступ**: Через `server_prod.py` автоматически  
**Просмотр**: Админ панель `admin_panel.html`

---

## 🚀 Production (настоящая БД)

### Вариант 1: PostgreSQL (рекомендуется для production)

```bash
# Установка
sudo apt install postgresql

# Создание БД
createdb trinky_db

# Применение схемы
psql trinky_db < database_schema.sql
```

**Расположение**: Сервер где установлен PostgreSQL  
**Обычно**: `/var/lib/postgresql/` (Linux) или `/usr/local/var/postgres` (macOS)

### Вариант 2: MySQL

```bash
# Установка
sudo apt install mysql-server

# Создание БД
mysql -u root -p
CREATE DATABASE trinky_db;
USE trinky_db;
SOURCE database_schema.sql;
```

**Расположение**: Сервер где установлен MySQL  
**Обычно**: `/var/lib/mysql/` (Linux) или `/usr/local/var/mysql` (macOS)

### Вариант 3: SQLite (для маленьких проектов)

```bash
# Создание БД
sqlite3 trinky.db < database_schema.sql
```

**Расположение**: Файл `trinky.db` в корне проекта

---

## 📊 Как посмотреть данные СЕЙЧАС

### Способ 1: Админ панель (GUI)

```bash
# Запустите сервер
python3 server_prod.py

# Откройте в браузере
http://localhost:8000/admin_panel.html
```

**Возможности:**
- 👥 Список всех пользователей
- 📊 Статистика (всего, активных, за неделю)
- 🔄 Автообновление каждые 30 секунд
- 🎨 Красивый интерфейс

### Способ 2: Командная строка

```bash
# Посмотреть всех пользователей
ls data/

# Посмотреть данные пользователя
cat data/athlete_123456789.json | python -m json.tool

# Красивый вывод
cat data/athlete_123456789.json
```

### Способ 3: Python скрипт

```python
import json
import os

# Список всех пользователей
for filename in os.listdir('data/'):
    with open(f'data/{filename}', 'r') as f:
        user = json.load(f)
        print(f"{user['firstname']} {user['lastname']}")
        print(f"  Email: {user.get('email', 'not provided')}")
        print(f"  Connected: {user.get('connected_at')}")
        print()
```

---

## 🔄 Миграция с JSON в БД

Когда будете готовы перейти на настоящую БД:

### 1. Создайте БД

```bash
createdb trinky_db
psql trinky_db < database_schema.sql
```

### 2. Мигрируйте данные

```python
# migrate_to_db.py
import json
import os
import psycopg2

# Подключение к БД
conn = psycopg2.connect(
    host="localhost",
    database="trinky_db",
    user="your_user",
    password="your_password"
)
cursor = conn.cursor()

# Миграция
for filename in os.listdir('data/'):
    with open(f'data/{filename}', 'r') as f:
        user = json.load(f)
        
        # Вставка в БД
        cursor.execute("""
            INSERT INTO athletes (athlete_id, firstname, lastname, email, ...)
            VALUES (%s, %s, %s, %s, ...)
        """, (user['athlete_id'], user['firstname'], ...))
        
conn.commit()
conn.close()
```

### 3. Обновите код сервера

Измените `save_athlete_data()` чтобы писать в БД вместо JSON.

---

## 📍 Где данные сейчас

### ✅ СЕЙЧАС (Development):
```
5zn-web/data/athlete_*.json
```

### 🔜 БУДУЩЕЕ (Production):
```
PostgreSQL: /var/lib/postgresql/14/main/base/
MySQL: /var/lib/mysql/trinky_db/
```

---

## 🔒 Безопасность

- ✅ `data/` папка в `.gitignore` - не коммитится
- ✅ Токены только хешируются
- ✅ Персональные данные защищены
- ⚠️ В production: настройте backups БД

---

## 📊 Просмотр данных

**Проще всего**: Откройте `admin_panel.html` в браузере!
- Автоматически показывает всех пользователей
- Красивая статистика
- Автообновление

---

**Ответ**: Сейчас данные в папке `data/`, в будущем будут в PostgreSQL/MySQL на сервере.
