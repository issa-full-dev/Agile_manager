import bleach
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, Task

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cette adresse email est déjà utilisée.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('reminder_sent',)

    # On surcharge la méthode de validation pour nettoyer le contenu
    def validate_description(self, value):
        # On supprime toutes les balises HTML potentiellement dangereuses
        return bleach.clean(value, tags=[], attributes={}, strip=True)

    def validate_title(self, value):
        return bleach.clean(value, tags=[], attributes={}, strip=True)

class ProjectSerializer(serializers.ModelSerializer):
    # On peut afficher le nombre de tâches par projet (optionnel mais utile pour React)
    tasks_count = serializers.IntegerField(source='tasks.count', read_only=True)

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_at', 'owner', 'tasks_count']
        read_only_fields = ('owner',)

    def validate_name(self, value):
        return bleach.clean(value, tags=[], attributes={}, strip=True)

    def validate_description(self, value):
        return bleach.clean(value, tags=[], attributes={}, strip=True)
