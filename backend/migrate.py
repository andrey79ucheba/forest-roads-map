import os
import sys

# Указываем, какие настройки использовать
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forest_roads.settings_prod')

from django.core.management import execute_from_command_line

if __name__ == "__main__":
    # Выполняем команду migrate
    execute_from_command_line(['manage.py', 'migrate'])