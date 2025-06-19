import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from django.conf import settings
from .models import Brigade, Location, Object, Status, Application
from .serializers import (
    BrigadeSerializer, LocationSerializer, ObjectSerializer,
    StatusSerializer, ApplicationSerializer, UserRegisterSerializer
)

logger = logging.getLogger('api')

class BrigadeViewSet(viewsets.ModelViewSet):
    queryset = Brigade.objects.all()
    serializer_class = BrigadeSerializer

    def perform_create(self, serializer):
        logger.info(f"Создание бригады: {serializer.validated_data}")
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        logger.info(f"Обновление бригады (ID: {self.kwargs.get('pk')}): {serializer.validated_data}")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        logger.info(f"Удаление бригады (ID: {instance.pk})")
        return super().perform_destroy(instance)

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    def perform_create(self, serializer):
        logger.info(f"Создание местоположения: {serializer.validated_data}")
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        logger.info(f"Обновление местоположения (ID: {self.kwargs.get('pk')}): {serializer.validated_data}")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        logger.info(f"Удаление местоположения (ID: {instance.pk})")
        return super().perform_destroy(instance)

class ObjectViewSet(viewsets.ModelViewSet):
    queryset = Object.objects.all()
    serializer_class = ObjectSerializer

    def perform_create(self, serializer):
        logger.info(f"Создание объекта: {serializer.validated_data}")
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        logger.info(f"Обновление объекта (ID: {self.kwargs.get('pk')}): {serializer.validated_data}")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        logger.info(f"Удаление объекта (ID: {instance.pk})")
        return super().perform_destroy(instance)

class StatusViewSet(viewsets.ModelViewSet):
    queryset = Status.objects.all()
    serializer_class = StatusSerializer

    def perform_create(self, serializer):
        logger.info(f"Создание статуса: {serializer.validated_data}")
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        logger.info(f"Обновление статуса (ID: {self.kwargs.get('pk')}): {serializer.validated_data}")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        logger.info(f"Удаление статуса (ID: {instance.pk})")
        return super().perform_destroy(instance)

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

    def perform_create(self, serializer):
        logger.info(f"Создание заявки: {serializer.validated_data}")
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        logger.info(f"Обновление заявки (ID: {self.kwargs.get('pk')}): {serializer.validated_data}")
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        logger.info(f"Удаление заявки (ID: {instance.pk})")
        return super().perform_destroy(instance)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = TokenObtainPairSerializer().get_token(user)
        access = refresh.access_token
        logger.info(f"Зарегистрирован новый пользователь: {user.username}")
        response = Response(
            {"message": "Пользователь успешно зарегистрирован", "access_token": str(access)},
            status=status.HTTP_201_CREATED
        )
        response.set_cookie(
            key='refresh_token',
            value=str(refresh),
            httponly=True,
            secure=settings.SECURE_COOKIES,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            max_age=settings.JWT_AUTH_COOKIE_MAX_AGE,
            domain=settings.SESSION_COOKIE_DOMAIN
        )
        return response
    logger.warning(f"Ошибка регистрации пользователя: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        logger.warning("Попытка входа без логина или пароля.")
        return Response(
            {"detail": "Необходимо указать логин и пароль."},
            status=status.HTTP_400_BAD_REQUEST
        )
    user = authenticate(request, username=username, password=password)
    if user is not None:
        serializer = TokenObtainPairSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            logger.warning(f"Ошибка валидации токена для пользователя {username}: {e}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]
        logger.info(f"Пользователь {user.username} успешно вошел.")
        response = Response({"access_token": access_token}, status=status.HTTP_200_OK)
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=settings.SECURE_COOKIES,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            max_age=settings.JWT_AUTH_COOKIE_MAX_AGE,
            domain=settings.SESSION_COOKIE_DOMAIN
        )
        return response
    else:
        logger.warning(f"Неудачная попытка входа для пользователя: {username}")
        return Response(
            {"detail": "Неверные учетные данные."},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def refresh_token(request):
    refresh_token_cookie = request.COOKIES.get('refresh_token')
    if not refresh_token_cookie:
        logger.warning("Попытка обновления токена без refresh token cookie.")
        return Response(
            {"detail": "Refresh token отсутствует."},
            status=status.HTTP_401_UNAUTHORIZED
        )
    serializer = TokenRefreshSerializer(data={'refresh': refresh_token_cookie})
    try:
        serializer.is_valid(raise_exception=True)
    except Exception as e:
        logger.warning(f"Недействительный refresh token: {e}")
        response = Response(
            {"detail": "Недействительный или истекший refresh token. Требуется повторный вход."},
            status=status.HTTP_401_UNAUTHORIZED
        )
        response.delete_cookie('refresh_token', domain=settings.SESSION_COOKIE_DOMAIN)
        return response
    access_token = serializer.validated_data['access']
    new_refresh_token = serializer.validated_data['refresh']
    logger.info(f"Access token успешно обновлен для пользователя: {request.user if request.user.is_authenticated else 'Неизвестный'}")
    response = Response({"access_token": access_token}, status=status.HTTP_200_OK)
    response.set_cookie(
        key='refresh_token',
        value=new_refresh_token,
        httponly=True,
        secure=settings.SECURE_COOKIES,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        max_age=settings.JWT_AUTH_COOKIE_MAX_AGE,
        domain=settings.SESSION_COOKIE_DOMAIN
    )
    return response

@api_view(['POST'])
def logout_user(request):
    logger.info(f"Пользователь {request.user.username if request.user.is_authenticated else 'Неизвестный'} вышел.")
    response = Response({"detail": "Успешный выход."}, status=status.HTTP_200_OK)
    response.delete_cookie('refresh_token', domain=settings.SESSION_COOKIE_DOMAIN)
    return response