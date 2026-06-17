from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Project, Task

class ProjectAndTaskTestCase(TestCase):
    def setUp(self):
        # Création d'un utilisateur de test
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123"
        )
        
        # Création d'un projet de test
        self.project = Project.objects.create(
            name="Projet Agile Test",
            description="Une description de projet pour les tests.",
            owner=self.user
        )

    def test_project_creation(self):
        """Vérifie qu'un projet est correctement créé avec ses attributs."""
        self.assertEqual(self.project.name, "Projet Agile Test")
        self.assertEqual(self.project.description, "Une description de projet pour les tests.")
        self.assertEqual(self.project.owner, self.user)
        self.assertEqual(str(self.project), "Projet Agile Test")

    def test_task_creation(self):
        """Vérifie qu'une tâche peut être créée au sein d'un projet."""
        due_date = timezone.now() + timedelta(days=2)
        task = Task.objects.create(
            title="Tâche de Test DevOps",
            description="Vérifier l'intégration continue.",
            status="TODO",
            priority="HIGH",
            due_date=due_date,
            project=self.project
        )

        self.assertEqual(task.title, "Tâche de Test DevOps")
        self.assertEqual(task.status, "TODO")
        self.assertEqual(task.priority, "HIGH")
        self.assertEqual(task.project, self.project)
        self.assertEqual(str(task), "Tâche de Test DevOps")

    def test_project_tasks_relation(self):
        """Vérifie la relation ForeignKey inverse (un projet contient des tâches)."""
        due_date = timezone.now() + timedelta(days=1)
        
        # Créer deux tâches dans le projet
        Task.objects.create(
            title="Tâche 1",
            due_date=due_date,
            project=self.project
        )
        Task.objects.create(
            title="Tâche 2",
            due_date=due_date,
            project=self.project
        )

        # Vérifier que le projet a bien 2 tâches
        self.assertEqual(self.project.tasks.count(), 2)
