from rest_framework import serializers
from django.contrib.gis.geos import GEOSGeometry
from .models import QuarterGrid, RoadObject, RoadInfo

class QuarterGridSerializer(serializers.ModelSerializer):
    geometry = serializers.SerializerMethodField()
    
    class Meta:
        model = QuarterGrid
        fields = ['id', 'geometry', 'name']
    
    def get_geometry(self, obj):
        """Преобразуем геометрию в словарь GeoJSON"""
        if obj.geometry:
            import json
            # .geojson возвращает строку, парсим её в словарь
            return json.loads(obj.geometry.geojson)
        return None
    
    def to_representation(self, instance):
        """Возвращаем полный GeoJSON Feature для кварталов"""
        data = super().to_representation(instance)
        return {
            "type": "Feature",
            "geometry": data.get('geometry'),
            "properties": {
                "id": data.get('id'),
                "name": data.get('name'),
            }
        }


class RoadObjectSerializer(serializers.ModelSerializer):
    geometry = serializers.SerializerMethodField()
    
    class Meta:
        model = RoadObject
        fields = ['id', 'name', 'geometry', 'object_type', 'label', 'label2', 'label3', 'type_code']
    
    def get_geometry(self, obj):
        if obj.geometry:
            import json
            return json.loads(obj.geometry.geojson)
        return None


class RoadInfoSerializer(serializers.ModelSerializer):
    updated_by = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = RoadInfo
        fields = ['id', 'district', 'road_name', 'conditions', 'updated_by', 'updated_at', 'created_at']
        read_only_fields = ['updated_by', 'updated_at', 'created_at']