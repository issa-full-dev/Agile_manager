import api from '../api/axios';

export const projectService = {
    getAllProjects: async () => {
        const response = await api.get('projects/');
        return response.data;
    },
    createProject: async (projectData) => {
        const response = await api.post('projects/', projectData);
        return response.data;
    },
    // Dans src/services/projectService.js
    deleteProject: async (projectId) => {
        try {
            await api.delete(`projects/${projectId}/`);
            return true;
        } catch (error) {
            throw error;
        }
    }
};
