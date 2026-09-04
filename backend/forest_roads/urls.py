from django.contrib import admin
from django.urls import path, include
from roads.views_frontend import index, roads_info

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('roads.urls')),
    path('api/auth/', include('users.urls')),
    
    # Главные страницы
    path('', index, name='index'),
    path('roads-info/', roads_info, name='roads_info'),
]