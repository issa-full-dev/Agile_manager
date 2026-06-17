from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from backend.tasks.models import Task

class Command(BaseCommand):
    help = "Envoie des rappels par email pour les tâches proches de l'échéance"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        # On cherche les tâches :
        # 1. Où le rappel est activé
        # 2. Qui ne sont pas encore terminées
        # 3. Où l'email n'a pas encore été envoyé
        # 4. Où la date d'échéance est passée ou arrive dans les 24h
        tasks_to_notify = Task.objects.filter(
            reminder_enabled=True,
            reminder_sent=False,
            status__in=['TODO', 'IN_PROGRESS'],
            due_date__lte=now + timezone.timedelta(days=1)
        )

        for task in tasks_to_notify:
            self.stdout.write(f"Envoi du rappel pour : {task.title}")

            # Logique d'envoi
            send_mail(
                subject=f"Rappel : Votre tâche '{task.title}' arrive à échéance",
                message=f"Bonjour,\n\nVotre tâche liée au projet '{task.project.name}' est prévue pour le {task.due_date}.\n\nBon courage !",
                from_email='noreply@agilemanager.com',
                recipient_list=[task.project.owner.email],
            )

            # Crucial : On marque le rappel comme envoyé pour ne pas spammer
            task.reminder_sent = True
            task.save()

        self.stdout.write(self.style.SUCCESS(f"Terminé : {tasks_to_notify.count()} rappels envoyés."))