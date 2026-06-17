from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer
from django.core.mail import send_mail
# Create your views here.

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    # Seuls les utilisateurs connectés peuvent accéder aux projets
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Sécurité cruciale : l'utilisateur ne voit QUE ses propres projets
        return Project.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # On définit automatiquement l'owner lors de la création
        serializer.save(owner=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # On ne récupère que les tâches liées aux projets appartenant à l'utilisateur
        queryset = Task.objects.filter(project__owner=self.request.user)
        # Filtrer par projet si le paramètre 'project' est fourni
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        # On s'assure que la tâche créée appartient à un projet de l'utilisateur
        project = serializer.validated_data['project']
        if project.owner != self.request.user:
            raise PermissionDenied("Vous ne pouvez pas ajouter une tâche à ce projet.")
        serializer.save()

    def perform_create(self, serializer):
        task = serializer.save()
        if task.priority == 'HIGH':
            send_mail(
                f'Nouvelle tâche critique : {task.title}',
                f'Vous avez créé une tâche urgente pour le projet {task.project.name}.',
                'noreply@agilemanager.com',
                [self.request.user.email],
                fail_silently=True,
            )
