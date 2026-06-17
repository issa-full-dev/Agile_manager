import axios from 'axios';

const api = axios.create({
    // En production, utilise le chemin relatif qui passera par le proxy Nginx (port 80)
    // En développement local hors Docker, utilise l'adresse directe du backend Django
    baseURL: import.meta.env.PROD ? '/api/' : 'http://127.0.0.1:8000/api/',
});

// Ce petit intercepteur ajoutera automatiquement le Token s'il existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;