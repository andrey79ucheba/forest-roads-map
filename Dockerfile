FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    gdal-bin \
    libgdal-dev \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем requirements.txt из папки backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код из папки backend
COPY backend/ .

RUN python manage.py collectstatic --noinput --settings=forest_roads.settings_prod

CMD ["gunicorn", "forest_roads.wsgi:application", "--bind", "0.0.0.0:8080", "--settings=forest_roads.settings_prod"]