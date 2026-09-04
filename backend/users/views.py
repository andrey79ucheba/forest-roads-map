from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, LoginSerializer

class UserViewSet(viewsets.GenericViewSet):
    """Вьюсет для работы с пользователями"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Регистрация пользователя"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Создание профиля
            UserProfile.objects.create(
                user=user,
                role='guest'
            )
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Регистрация успешна'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login_view(self, request):
        """Вход в систему"""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return Response({
                    'user': UserSerializer(user).data,
                    'role': user.profile.role if hasattr(user, 'profile') else 'guest'
                })
            return Response({'error': 'Неверное имя пользователя или пароль'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout_view(self, request):
        """Выход из системы"""
        logout(request)
        return Response({'message': 'Вы вышли из системы'})
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получение информации о текущем пользователе"""
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            role = request.user.profile.role if hasattr(request.user, 'profile') else 'guest'
            return Response({
                'user': serializer.data,
                'role': role
            })
        return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Смена пароля пользователя"""
        if not request.user.is_authenticated:
            return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
        
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'Все поля обязательны'}, status=status.HTTP_400_BAD_REQUEST)
        
        if len(new_password) < 8:
            return Response({'error': 'Пароль должен содержать минимум 8 символов'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not user.check_password(old_password):
            return Response({'error': 'Неверный текущий пароль'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Пароль успешно изменён'})