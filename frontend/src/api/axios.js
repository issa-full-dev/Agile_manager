import axios from 'axios';

const api = axios.create({
    // En production, utilise le chemin relatif qui passera par le proxy Nginx (port 80)
    // En développement local hors Docker, utilise l'adresse directe du backend Django
    baseURL: import.meta.env.PROD ? '/api/' : 'http://127.0.0.1:8000/api/',
});

let refreshRequest = null;

const clearSession = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
};

// Ce petit intercepteur ajoutera automatiquement le Token s'il existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepte toutes les réponses de l'API : succès d'un côté, erreurs de l'autre.
api.interceptors.response.use(
    // Une réponse réussie continue normalement vers le code qui a appelé api.get/post.
    (response) => response,
    // Une erreur passe ici. async permet d'attendre le renouvellement du token.
    async (error) => {
        // Axios conserve la configuration de la requête qui a échoué (URL, headers, etc.).
        const originalRequest = error.config;

        // Ne tente un renouvellement que pour un 401 sur une requête API ordinaire.
        // Les URLs d'authentification sont exclues pour éviter une boucle de refresh.
        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest.url?.includes('token/')
        ) {
            return Promise.reject(error);
        }

        // Le refresh token sert à demander un nouvel access token.
        const refreshToken = localStorage.getItem('refresh_token');

        // _retry empêche de rejouer indéfiniment une requête qui échoue encore en 401.
        // Sans refresh token, la session ne peut pas être renouvelée : on déconnecte.
        if (originalRequest._retry || !refreshToken) {
            clearSession();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // Marque cette requête comme déjà rejouée et prépare le résultat des nouveaux tokens.
        originalRequest._retry = true;
        let tokens;

        try {
            // Plusieurs requêtes peuvent échouer ensemble : elles partagent la même demande
            // de refresh au lieu d'envoyer plusieurs renouvellements en parallèle.
            if (!refreshRequest) {
                // Utilise Axios directement (sans les intercepteurs de api) pour appeler
                // /token/refresh/ avec le refresh token.
                refreshRequest = axios
                    .post(`${api.defaults.baseURL}token/refresh/`, { refresh: refreshToken })
                    .then((response) => response.data)
                    .finally(() => {
                        // Libère la promesse pour permettre un prochain refresh plus tard.
                        refreshRequest = null;
                    });
            }

            // Attend le refresh en cours, qu'il ait été lancé ici ou par une autre requête.
            tokens = await refreshRequest;
        } catch (refreshError) {
            // Le refresh token est probablement expiré ou invalide : il faut se reconnecter.
            clearSession();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        }

        // Sauvegarde le nouvel access token et, si le serveur en renvoie un, le refresh token.
        localStorage.setItem('access_token', tokens.access);
        if (tokens.refresh) {
            localStorage.setItem('refresh_token', tokens.refresh);
        }

        // Remplace le token expiré sur la requête originale et l'envoie une seule fois à nouveau.
        originalRequest.headers.Authorization = `Bearer ${tokens.access}`;
        return api(originalRequest);
    }
);

export default api;


