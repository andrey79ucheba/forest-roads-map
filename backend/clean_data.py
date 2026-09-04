# clean_data.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'forest_roads.settings')
django.setup()

from roads.models import RoadObject, QuarterGrid

print(f'Дорожных объектов до очистки: {RoadObject.objects.count()}')
print(f'Кварталов до очистки: {QuarterGrid.objects.count()}')

RoadObject.objects.all().delete()
QuarterGrid.objects.all().delete()

print(f'Дорожных объектов после очистки: {RoadObject.objects.count()}')
print(f'Кварталов после очистки: {QuarterGrid.objects.count()}')
print('Очистка завершена!')