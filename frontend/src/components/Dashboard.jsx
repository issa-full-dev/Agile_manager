import React, { useState } from 'react';
import ProjectList from './ProjectList';
import TaskList from './TaskList'; // On réutilisera votre TaskList ici
import TaskForm from './TaskForm';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';
import { ArrowLeft, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);


    // Fonction pour entrer dans un projet et met à jour la variable selectedProject
    const handleSelectProject = async (project) => {
        setSelectedProject(project);
        setLoadingTasks(true);
        try {
            const data = await taskService.getAllTasks(project.id);
            setTasks(data);
        } catch (err) {
            console.error("Erreur chargement tâches", err);
        } finally {
            setLoadingTasks(false);
        }
    };

     // Fonction pour supprimer un projet
    const handleDeleteProject = async (projectId) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce projet ? Toutes les tâches associées seront également supprimées.")) {
            try {
                await projectService.deleteProject(projectId);
                setSelectedProject(null); // Retour à la liste des projets
            }
            catch (err) {
                alert("Erreur lors de la suppression du projet");
            }
        }
    };

    // Fonction pour mettre une tache à jour(changer son statut)
    const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    // Fonction pour supprimer une tache
    const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
    };



    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                <span className="font-bold text-xl text-blue-600 tracking-tight">AgileManager</span>
                <button onClick={() => authService.logout()} className="text-sm font-medium text-gray-500 hover:text-red-600 transition">
                    Déconnexion
                </button>
            </nav>

            <main className="max-w-6xl mx-auto py-8 px-4">
                {selectedProject ? (
                    <div>
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:translate-x-[-4px] transition-transform"
                        >
                            <ArrowLeft size={20} /> Retour aux projets
                        </button>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">{selectedProject.name}</h2>
                            <p className="text-gray-500 mt-2">{selectedProject.description}</p>
                        </div>
                        <button
                            onClick={() => handleDeleteProject(selectedProject.id)}
                            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                        >
                            <Trash2 size={20} /> Supprimer le projet
                        </button>

                        {/* On réutilise vos composants TaskForm et TaskList */}
                        <TaskForm
                            projectId={selectedProject.id}
                            onTaskCreated={(newTask) => setTasks([newTask, ...tasks])}
                        />

                        <TaskList
                        tasks={tasks}
                        loading={loadingTasks}
                        onTaskUpdated={handleTaskUpdated}
                        onTaskDeleted={handleTaskDeleted} />
                    </div>
                ) : (
                    <ProjectList onSelectProject={handleSelectProject} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;