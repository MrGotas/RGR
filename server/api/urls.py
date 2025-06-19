from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BrigadeViewSet, LocationViewSet, ObjectViewSet,
    StatusViewSet, ApplicationViewSet,
    register_user, login_user, logout_user, refresh_token
)

router = DefaultRouter()
router.register(r'brigades', BrigadeViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'objects', ObjectViewSet)
router.register(r'statuses', StatusViewSet)
router.register(r'applications', ApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register_user, name='register'),
    path('login/', login_user, name='login'),
    path('logout/', logout_user, name='logout'),
    path('token/refresh/', refresh_token, name='token_refresh'),
]
