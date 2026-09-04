from django.urls import path
from .views import UserViewSet

urlpatterns = [
    path('register/', UserViewSet.as_view({'post': 'register'}), name='register'),
    path('login/', UserViewSet.as_view({'post': 'login_view'}), name='login'),
    path('logout/', UserViewSet.as_view({'post': 'logout_view'}), name='logout'),
    path('me/', UserViewSet.as_view({'get': 'me'}), name='me'),
]

urlpatterns = [
    path('register/', UserViewSet.as_view({'post': 'register'}), name='register'),
    path('login/', UserViewSet.as_view({'post': 'login_view'}), name='login'),
    path('logout/', UserViewSet.as_view({'post': 'logout_view'}), name='logout'),
    path('me/', UserViewSet.as_view({'get': 'me'}), name='me'),
    path('change-password/', UserViewSet.as_view({'post': 'change_password'}), name='change-password'),  # НОВЫЙ
]