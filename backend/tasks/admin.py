from django.contrib import admin
from .models import Project, Task
# Register your models here.
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    # On affiche reminder_sent dans la liste pour vérifier,
    # mais on l'empêche d'être modifié manuellement dans le formulaire.
    readonly_fields = ('reminder_sent',)
    list_display = ('title', 'project', 'due_date', 'reminder_enabled', 'reminder_sent')

admin.site.register(Project)

