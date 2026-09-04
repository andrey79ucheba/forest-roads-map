from django.contrib import admin
from django.contrib.gis.admin import OSMGeoAdmin
from .models import QuarterGrid, RoadObject, RoadInfo

@admin.register(QuarterGrid)
class QuarterGridAdmin(OSMGeoAdmin):
    list_display = ['id', 'name']
    search_fields = ['name']

@admin.register(RoadObject)
class RoadObjectAdmin(OSMGeoAdmin):
    list_display = ['id', 'name', 'object_type', 'type_code']
    list_filter = ['object_type', 'type_code']
    search_fields = ['name', 'label', 'label2', 'label3']

@admin.register(RoadInfo)
class RoadInfoAdmin(admin.ModelAdmin):
    list_display = ['id', 'district', 'road_name', 'conditions', 'updated_by', 'updated_at']
    list_filter = ['district']
    search_fields = ['district', 'road_name', 'conditions']
    readonly_fields = ['updated_by', 'updated_at', 'created_at']