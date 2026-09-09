FROM python:3.11-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Настройка переменных окружения для GDAL
ENV GDAL_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgdal.so
ENV GEOS_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu/libgeos_c.so

WORKDIR /app

# Копируем requirements.txt из папки backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код из папки backend
COPY backend/ .

# Сборка статики
RUN python manage.py collectstatic --noinput --settings=forest_roads.settings_prod

# Создаем скрипт для запуска с миграциями
RUN echo '#!/bin/bash\n\
    python manage.py migrate --settings=forest_roads.settings_prod\n\
    gunicorn forest_roads.wsgi:application --bind 0.0.0.0:$PORT --workers 3\n\
    ' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080

CMD ["/app/start.sh"]