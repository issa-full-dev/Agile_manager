import api from '../api/axios';

export const taskService = {
    // On ajoute projectId en paramètre (optionnel)
getAllTasks: async (projectId) => {
    try {
        // Si un projectId est fourni, on l'ajoute à l'URL (ex: tasks/?project=1)
        const url = projectId ? `tasks/?project=${projectId}` : 'tasks/';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        throw error;
    }
},
    // Nous ajouterons plus tard createTask, updateTask, etc.
    createTask: async (taskData) => {
        try {
            const response = await api.post('tasks/', taskData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur lors de la création");
        }
    },
    updateTask: async (taskId, taskData) => {
        try {
            const response = await api.patch(`tasks/${taskId}/`, taskData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Dans src/services/taskService.js
    deleteTask: async (taskId) => {
        try {
            await api.delete(`tasks/${taskId}/`);
            return true;
        } catch (error) {
            throw error;
        }
    }
};

