import api from '../api/axios'; // On importe votre instance configurée

export const authService = {
    // Fonction pour se connecter
    login: async (username, password) => {
        try {
            const response = await api.post('token/', { username, password });

            // Si Django renvoie les tokens (access et refresh)
            if (response.data.access) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('username', username); // Optionnel, pour l'affichage
            }
            return response.data;
        } catch (error) {
            // On renvoie l'erreur pour que le composant Login puisse l'afficher
            throw error.response ? error.response.data : new Error("Serveur injoignable");
        }
    },

    // Fonction pour se déconnecter
    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        // On pourrait aussi rediriger vers la page de login ici
        window.location.href = '/login';
    },

    // Fonction utilitaire pour vérifier si on est connecté
    isAuthenticated: () => {
        return !!localStorage.getItem('access_token');
    }
};