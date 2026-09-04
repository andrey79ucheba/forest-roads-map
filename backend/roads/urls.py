from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuarterGridViewSet, RoadObjectViewSet, RoadInfoViewSet

router = DefaultRouter()
router.register(r'quarter-grid', QuarterGridViewSet, basename='quarter-grid')
router.register(r'roads', RoadObjectViewSet, basename='roads')
router.register(r'roads-info', RoadInfoViewSet, basename='roads-info')

urlpatterns = [
    path('', include(router.urls)),
]