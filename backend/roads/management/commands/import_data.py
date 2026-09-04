import json
import os
from pathlib import Path
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import GEOSGeometry
from roads.models import QuarterGrid, RoadObject

# Получаем корень проекта (поднимаемся на 5 уровней от текущего файла)
BASE_DIR = str(Path(__file__).resolve().parent.parent.parent.parent.parent)
print(f'BASE_DIR = {BASE_DIR}')

class Command(BaseCommand):
    help = 'Импорт данных из файлов Map_kvartal.geojson и Map_road.geojson'

    def add_arguments(self, parser):
        parser.add_argument(
            '--kvartal',
            type=str,
            default=os.path.join(BASE_DIR, 'data', 'Map_kvartal.geojson'),
            help='Путь к файлу с квартальной сеткой'
        )
        parser.add_argument(
            '--road',
            type=str,
            default=os.path.join(BASE_DIR, 'data', 'Map_road.geojson'),
            help='Путь к файлу с дорожными объектами'
        )

    def handle(self, *args, **options):
        self.stdout.write('Начинаем импорт данных...')
        
        kvartal_file = options['kvartal']
        if os.path.exists(kvartal_file):
            self.import_kvartal(kvartal_file)
        else:
            self.stdout.write(self.style.WARNING(f'Файл {kvartal_file} не найден'))
        
        road_file = options['road']
        if os.path.exists(road_file):
            self.import_roads(road_file)
        else:
            self.stdout.write(self.style.WARNING(f'Файл {road_file} не найден'))
        
        self.stdout.write(self.style.SUCCESS('Импорт завершен!'))

    def import_kvartal(self, file_path):
        """Импорт квартальной сетки из GeoJSON"""
        self.stdout.write(f'Импорт квартальной сетки из {file_path}...')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            count = 0
            for feature in data.get('features', []):
                geometry = GEOSGeometry(json.dumps(feature.get('geometry')))
                properties = feature.get('properties', {})
                
                QuarterGrid.objects.create(
                    geometry=geometry,
                    name=properties.get('name', '')
                )
                count += 1
            
            self.stdout.write(self.style.SUCCESS(f'Загружено {count} кварталов'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка при импорте кварталов: {e}'))

    def import_roads(self, file_path):
        """Импорт дорожных объектов из GeoJSON с обработкой пустых значений"""
        self.stdout.write(f'Импорт дорожных объектов из {file_path}...')
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            count = 0
            for feature in data.get('features', []):
                try:
                    geometry = GEOSGeometry(json.dumps(feature.get('geometry')))
                    properties = feature.get('properties', {})
                    
                    geom_type = feature.get('geometry', {}).get('type', '')
                    object_type = 'POLYLINE' if geom_type == 'LineString' else 'POLYGON'
                    
                    # Безопасное получение значений с заменой None на пустую строку
                    name = properties.get('Name') or ''
                    label = properties.get('Label') or ''
                    label2 = properties.get('Label2') or ''
                    label3 = properties.get('Label3') or ''
                    type_code = str(properties.get('Type') or '')
                    
                    RoadObject.objects.create(
                        name=name,
                        geometry=geometry,
                        object_type=object_type,
                        label=label,
                        label2=label2,
                        label3=label3,
                        type_code=type_code
                    )
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f'Пропущен объект: {e}'))
                    continue
            
            self.stdout.write(self.style.SUCCESS(f'Загружено {count} дорожных объектов'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Ошибка при импорте дорожных объектов: {e}'))