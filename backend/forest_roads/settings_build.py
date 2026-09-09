from .settings_prod import *

# Переопределяем базу данных для сборки (collectstatic)
# Используем SQLite, которая не требует подключения
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'temp_build_db.sqlite3'),
    }
}

print("🔧 Используются настройки для сборки (без PostgreSQL)")