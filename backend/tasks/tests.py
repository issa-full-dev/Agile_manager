from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import timedelta
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer

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

    def test_anonymous_user_cannot_access_project_or_task_endpoints(self):
        client = APIClient()

        project_response = client.get(reverse('project-list'))
        task_response = client.get(reverse('task-list'))
        project_create_response = client.post(
            reverse('project-list'),
            {"name": "Projet anonyme"},
            format='json'
        )

        self.assertEqual(project_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(task_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(project_create_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(Project.objects.filter(name="Projet anonyme").exists())

    def test_project_creation_uses_authenticated_user_as_owner(self):
        other_user = User.objects.create_user(
            username="owner_spoof_target",
            email="owner-spoof@example.com",
            password="testpassword123"
        )
        client = APIClient()
        client.force_authenticate(user=self.user)

        response = client.post(
            reverse('project-list'),
            {
                "name": "Projet avec propriétaire imposé",
                "description": "Le propriétaire vient de la session.",
                "owner": other_user.id,
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['owner'], self.user.id)
        self.assertEqual(
            Project.objects.get(id=response.data['id']).owner,
            self.user
        )

    def test_project_and_task_content_is_sanitized_through_api(self):
        client = APIClient()
        client.force_authenticate(user=self.user)

        project_response = client.post(
            reverse('project-list'),
            {
                "name": "<img src=x onerror=alert(1)>Projet sûr",
                "description": "<script>alert(1)</script>Description sûre",
            },
            format='json'
        )

        self.assertEqual(project_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(project_response.data['name'], "Projet sûr")
        self.assertNotIn('<', project_response.data['description'])
        self.assertNotIn('<script', project_response.data['description'])

        task_response = client.post(
            reverse('task-list'),
            {
                "title": "<svg onload=alert(1)>Tâche sûre</svg>",
                "description": "<b>Description</b> sûre",
                "status": "TODO",
                "priority": "MEDIUM",
                "due_date": (timezone.now() + timedelta(days=1)).isoformat(),
                "project": project_response.data['id'],
            },
            format='json'
        )

        self.assertEqual(task_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(task_response.data['title'], "Tâche sûre")
        self.assertNotIn('<', task_response.data['description'])
        self.assertNotIn('onload', task_response.data['title'])

    def test_registration_hashes_password_and_does_not_return_it(self):
        client = APIClient()
        response = client.post(
            reverse('register'),
            {
                "username": "registered_user",
                "email": "registered@example.com",
                "password": "Sup3rSecure!Phrase",
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotIn('password', response.data)
        self.assertNotIn('password', response.data['user'])
        user = User.objects.get(username="registered_user")
        self.assertTrue(user.check_password("Sup3rSecure!Phrase"))
        self.assertNotEqual(user.password, "Sup3rSecure!Phrase")

    def test_registration_rejects_duplicate_email(self):
        client = APIClient()
        response = client.post(
            reverse('register'),
            {
                "username": "duplicate_email_user",
                "email": self.user.email,
                "password": "An0ther-Secure!Phrase",
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertFalse(User.objects.filter(username="duplicate_email_user").exists())

    def test_registration_rejects_weak_password(self):
        client = APIClient()
        response = client.post(
            reverse('register'),
            {
                "username": "weak_password_user",
                "email": "weak-password@example.com",
                "password": "123",
            },
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertFalse(User.objects.filter(username="weak_password_user").exists())

    def test_user_cannot_create_task_for_other_user_project(self):
        """Un utilisateur ne peut pas créer de tâches sur un projet qui ne lui appartient pas."""
        other_user = User.objects.create_user(
            username="otheruser",
            email="other@example.com",
            password="testpassword123"
        )
        other_project = Project.objects.create(
            name="Projet d'un autre",
            description="Projet privé",
            owner=other_user
        )

        client = APIClient()
        client.force_authenticate(user=self.user)

        payload = {
            "title": "Tâche interdite",
            "description": "Cette tâche ne doit pas être créee.",
            "status": "TODO",
            "priority": "HIGH",
            "due_date": (timezone.now() + timedelta(days=2)).isoformat(),
            "project": other_project.id,
        }

        response = client.post(reverse('task-list'), payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Task.objects.filter(title="Tâche interdite").count(), 0)

    def test_user_cannot_read_other_users_projects(self):
        other_user = User.objects.create_user(
            username="otherprojectuser",
            email="otherproject@example.com",
            password="testpassword123"
        )
        other_project = Project.objects.create(
            name="Projet privé",
            description="Projet d'un autre utilisateur",
            owner=other_user
        )

        client = APIClient()
        client.force_authenticate(user=self.user)

        list_response = client.get(reverse('project-list'))
        detail_response = client.get(reverse('project-detail', args=[other_project.id]))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual([project['id'] for project in list_response.data], [self.project.id])
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_read_other_users_tasks(self):
        other_user = User.objects.create_user(
            username="othertaskuser",
            email="othertask@example.com",
            password="testpassword123"
        )
        other_project = Project.objects.create(
            name="Projet privé tâches",
            description="Projet d'un autre utilisateur",
            owner=other_user
        )
        other_task = Task.objects.create(
            title="Tâche privée",
            due_date=timezone.now() + timedelta(days=1),
            project=other_project
        )

        client = APIClient()
        client.force_authenticate(user=self.user)

        list_response = client.get(reverse('task-list'))
        detail_response = client.get(reverse('task-detail', args=[other_task.id]))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data, [])
        self.assertEqual(detail_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_project_name_cannot_be_blank(self):
        """Le nom d'un projet ne peut pas être vide ou composé uniquement d'espaces."""
        data = {"name": "   ", "description": "Description valide", "owner": self.user.id}

        serializer_obj = ProjectSerializer(data=data)
        self.assertFalse(serializer_obj.is_valid())
        self.assertIn('name', serializer_obj.errors)

    def test_task_title_cannot_be_blank(self):
        """Le titre d'une tâche ne peut pas être vide ou composé uniquement d'espaces."""
        data = {
            "title": "   ",
            "description": "Description valide",
            "status": "TODO",
            "priority": "MEDIUM",
            "due_date": (timezone.now() + timedelta(days=1)).isoformat(),
            "project": self.project.id,
        }

        serializer_obj = TaskSerializer(data=data)
        self.assertFalse(serializer_obj.is_valid())
        self.assertIn('title', serializer_obj.errors)
