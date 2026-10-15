import api from '../api/axios';

export const taskService = {
    // On ajoute projectId en paramètre (optionnel)
getAllTasks: async (projectId) => {
    // Si un projectId est fourni, on l'ajoute à l'URL (ex: tasks/?project=1)
    const url = projectId ? `tasks/?project=${projectId}` : 'tasks/';
    const response = await api.get(url);
    return response.data;
},
    // Nous ajouterons plus tard createTask, updateTask, etc.
    createTask: async (taskData) => {
        const response = await api.post('tasks/', taskData);
        return response.data;
    },
    updateTask: async (taskId, taskData) => {
        const response = await api.patch(`tasks/${taskId}/`, taskData);
        return response.data;
    },
    // Dans src/services/taskService.js
    deleteTask: async (taskId) => {
        await api.delete(`tasks/${taskId}/`);
        return true;
    }
};

