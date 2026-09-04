from django.contrib.auth.models import User
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.gis.geos import GEOSGeometry
from .models import QuarterGrid, RoadObject, RoadInfo
from .serializers import QuarterGridSerializer, RoadObjectSerializer, RoadInfoSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    """Разрешение: администратор или только чтение"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """Разрешение: авторизованный пользователь или только чтение"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class QuarterGridViewSet(viewsets.ReadOnlyModelViewSet):
    """Вьюсет для квартальной сетки (только чтение)"""
    queryset = QuarterGrid.objects.all()
    serializer_class = QuarterGridSerializer
    permission_classes = [permissions.AllowAny]


class RoadObjectViewSet(viewsets.ReadOnlyModelViewSet):
    """Вьюсет для дорожных объектов (только чтение)"""
    queryset = RoadObject.objects.all()
    serializer_class = RoadObjectSerializer
    permission_classes = [permissions.AllowAny]


class RoadInfoViewSet(viewsets.ModelViewSet):
    """Вьюсет для информации о дорогах (полный CRUD)"""
    queryset = RoadInfo.objects.all()
    serializer_class = RoadInfoSerializer
    
    def get_permissions(self):
        """Разные права для разных методов"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update']:
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Автоматически заполняем updated_by при создании"""
        serializer.save(updated_by=self.request.user)
    
    def perform_update(self, serializer):
        """Автоматически заполняем updated_by при обновлении"""
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_roads(self, request):
        """Пример дополнительного метода"""
        # Можно добавить свою логику
        queryset = RoadInfo.objects.filter(updated_by=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)