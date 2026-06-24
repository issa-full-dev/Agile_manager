import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserPlus } from 'lucide-react'; // Icône sympa de création de compte

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // On efface l'erreur du champ en cours de saisie
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');

        // Validation locale des mots de passe
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setLoading(true);

        try {
            await authService.register(formData.username, formData.email, formData.password);
            setSuccessMessage('Votre compte a été créé avec succès ! Redirection vers la page de connexion...');

            // Redirection après 2 secondes vers la page de login
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            // Si Django renvoie des erreurs de validation (ex: username déjà pris, email existant, etc.)
            if (typeof err === 'object') {
                setErrors(err);
            } else {
                setErrors({ global: "Une erreur est survenue lors de l'inscription." });
            }
        } finally {
            setLightLoading(false); // S'assurer que le bouton se débloque
        }
    };

    // Petit tweak pour débloquer le chargement en fin d'exécution
    const setLightLoading = (val) => {
        setLoading(val);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <UserPlus className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
                    Créer un compte Agile Manager
                </h2>

                {successMessage && (
                    <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-sm">
                        {successMessage}
                    </div>
                )}

                {errors.global && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                        {errors.global}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom d'utilisateur
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Ex: issa_dev"
                            required
                        />
                        {errors.username && (
                            <p className="text-red-500 text-xs mt-1">{errors.username[0] || errors.username}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Ex: monadresse@email.com"
                            required
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email[0] || errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password[0] || errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="••••••••"
                            required
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                            loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }`}
                    >
                        {loading ? 'Création du compte...' : "S'inscrire"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
