# settings_render_build.py — минимальные настройки для этапа сборки
# Этот файл используется ТОЛЬКО для collectstatic во время сборки на Render.
# Он не требует подключения к базе данных.

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Минимальный SECRET_KEY (не используется в сборке, но требуется Django)
SECRET_KEY = 'dummy-secret-key-for-build-only'

# Отключаем DEBUG
DEBUG = False

# Разрешённые хосты (только для сборки)
ALLOWED_HOSTS = ['*']

# Устанавливаем пустую базу данных (Django не будет пытаться подключиться)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Минимальный набор приложений — только то, что нужно для collectstatic
INSTALLED_APPS = [
    'django.contrib.staticfiles',
]

# Настройки статических файлов
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# Отключаем всё лишнее
MIDDLEWARE = []
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Минимальные настройки для загрузки Django
ROOT_URLCONF = 'forest_roads.urls'
LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'Europe/Moscow'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'