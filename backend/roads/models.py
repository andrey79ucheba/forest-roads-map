from django.contrib.gis.db import models
from django.contrib.auth.models import User

class QuarterGrid(models.Model):
    """Квартальная сетка"""
    geometry = models.MultiPolygonField(srid=4326)
    name = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Квартал'
        verbose_name_plural = 'Квартальная сетка'

    def __str__(self):
        return self.name or f'Квартал #{self.id}'


class RoadObject(models.Model):
    """Объект дорожной инфраструктуры"""
    OBJECT_TYPES = (
        ('POLYLINE', 'Линия'),
        ('POLYGON', 'Полигон'),
    )
    
    name = models.CharField(max_length=255, blank=True)
    geometry = models.GeometryField(srid=4326)
    object_type = models.CharField(max_length=10, choices=OBJECT_TYPES)
    
    # Информация из Label полей
    label = models.CharField(max_length=500, blank=True)
    label2 = models.CharField(max_length=500, blank=True)
    label3 = models.CharField(max_length=500, blank=True)
    
    # Для Type=0x16 и Type=0x1
    type_code = models.CharField(max_length=10, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Дорожный объект'
        verbose_name_plural = 'Дорожные объекты'

    def __str__(self):
        return self.name or f'Объект #{self.id}'


class RoadInfo(models.Model):
    """Информация о дорогах (таблица)"""
    district = models.CharField(max_length=100, verbose_name='Район')
    road_name = models.CharField(max_length=200, verbose_name='Автодорога')
    conditions = models.TextField(verbose_name='Условия проезда')
    
    updated_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        verbose_name='Обновил'
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Информация о дороге'
        verbose_name_plural = 'Информация о дорогах'
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.district} - {self.road_name}'