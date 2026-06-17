import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'; // Des icônes pour le style
import { taskService } from '../services/taskService';

const TaskList = ({ tasks = [], loading, onTaskUpdated, onTaskDeleted}) => {

   const toggleStatus = async (task) => {
    let newStatus;

    // Logique de rotation des statuts
    switch (task.status) {
        case 'TODO':
            newStatus = 'IN_PROGRESS'; // Passe de À faire -> En cours
            break;
        case 'IN_PROGRESS':
            newStatus = 'DONE';        // Passe de En cours -> Terminé
            break;
        case 'DONE':
            newStatus = 'TODO';        // Passe de Terminé -> À faire (boucle)
            break;
        default:
            newStatus = 'TODO';
    }

    try {
        const updatedTask = await taskService.updateTask(task.id, { status: newStatus });
        if (onTaskUpdated) {
            onTaskUpdated(updatedTask);
        }
    } catch (err) {
        console.error("Erreur lors du changement de statut:", err);
        alert("Impossible de modifier le statut");
    }

    };

    const handleDelete = async (taskId) => {
        if (window.confirm("Voulez-vous vraiment supprimer cette tâche ?")) {
            try {
                await taskService.deleteTask(taskId);
                onTaskDeleted(taskId); // On prévient le Dashboard pour l'enlever de l'écran
            } catch (err) {
                alert("Erreur lors de la suppression");
            }
        }
    };

    const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today; // Retourne vrai si la date est passée
    };
    // Fonction pour définir la couleur selon la priorité
    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'HIGH': return 'text-red-600 bg-red-50 border-red-100';
            case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'LOW': return 'text-green-600 bg-green-50 border-green-100';
            default: return 'text-gray-600 bg-gray-50 border-gray-100';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {tasks?.map((task) => (
                <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            {/* Badge de Priorité */}
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${getPriorityStyle(task.priority)}`}>
                                {task.priority}
                            </span>
                           {/* 2. Groupe d'actions à droite */}
                            <div className="flex items-center gap-1">
                                {/* Bouton de statut */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleStatus(task); }}
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center"
                                    title={`Passer au statut suivant`}
                                >
                                    {task.status === 'DONE' ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    ) : task.status === 'IN_PROGRESS' ? (
                                        <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-gray-400 hover:text-blue-400" />
                                    )}
                                </button>

                                {/* Bouton supprimer */}
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center"
                                    title="Supprimer la tâche"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {task.description || "Aucune description fournie."}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            {/* <span className="text-xs text-gray-400 font-medium">Statut :</span> */}
                            <div className="mt-4 flex items-center gap-2">
                                <Clock size={14} className={isOverdue(task.due_date) && task.status !== 'DONE' ? "text-red-500" : "text-gray-400"} />
                                <span className={`text-xs font-medium ${
                                    isOverdue(task.due_date) && task.status !== 'DONE'
                                    ? "text-red-500"
                                    : "text-gray-500"
                                }`}>
                                    {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                    {isOverdue(task.due_date) && task.status !== 'DONE' && " (Retard !)"}
                                </span>
                            </div>
                            <span className={`text-xs font-semibold ${
                                task.status === 'DONE' ? 'text-green-600' :
                                task.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                                {task.status === 'TODO' ? 'À FAIRE' :
                                 task.status === 'IN_PROGRESS' ? 'EN COURS' : 'TERMINÉ'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TaskList;