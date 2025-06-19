from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Brigade, Location, Object, Status, Application

class BrigadeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brigade
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class ObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Object
        fields = '__all__'

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Status
        fields = '__all__'

class ApplicationSerializer(serializers.ModelSerializer):
    brigade_number = serializers.ReadOnlyField(source='brigade.brigade', read_only=True)
    location_name = serializers.ReadOnlyField(source='location.location', read_only=True)
    object_name = serializers.ReadOnlyField(source='object_instance.object', read_only=True)
    status_name = serializers.ReadOnlyField(source='status.status', read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'brigade', 'brigade_number', 'location', 'location_name',
            'identifier', 'correction', 'object_instance', 'object_name',
            'status', 'status_name', 'start_time', 'end_time'
        ]

    def validate_brigade(self, value):
        if value and not Brigade.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Бригада с таким ID не существует.")
        return value

    def validate_location(self, value):
        if not Location.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Местоположение с таким ID не существует.")
        return value

    def validate_object_instance(self, value):
        if not Object.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Объект с таким ID не существует.")
        return value

    def validate_status(self, value):
        if not Status.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Статус с таким ID не существует.")
        return value

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'username': {'required': True},
            'email': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Пароли не совпадают."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return