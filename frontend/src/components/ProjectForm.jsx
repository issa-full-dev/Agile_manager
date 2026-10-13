import React, { useState } from 'react';
import { projectService } from '../services/projectService';
import { FolderPlus, X } from 'lucide-react';

const ProjectForm = ({ onProjectCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const trimmedName = name.trim();
    const isValid = trimmedName.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValid) {
            setError('Le nom du projet est obligatoire.');
            return;
        }

        try {
            setError('');
            const newProject = await projectService.createProject({
                name: trimmedName,
                description: description.trim(),
            });
            onProjectCreated(newProject);
            setName('');
            setDescription('');
        } catch (err) {
            const serverMessage = err?.response?.data?.detail || err?.response?.data?.name?.[0] || "Erreur lors de la création du projet";
            setError(serverMessage);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border-2 border-blue-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-blue-600">Nouveau Projet</h3>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <input
                        type="text" placeholder="Nom du projet" value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError('');
                        }}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    {!isValid && name.length > 0 && (
                        <p className="mt-1 text-xs text-red-500">Le nom ne peut pas être vide.</p>
                    )}
                </div>
                <textarea
                    placeholder="Description du projet" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg outline-none h-24"
                />
                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={!isValid}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Créer le projet
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;