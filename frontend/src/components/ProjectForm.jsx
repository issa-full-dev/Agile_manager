import React, { useState } from 'react';
import { projectService } from '../services/projectService';
import { FolderPlus, X } from 'lucide-react';

const ProjectForm = ({ onProjectCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newProject = await projectService.createProject({ name, description });
            onProjectCreated(newProject);
            setName('');
            setDescription('');
        } catch (err) {
            alert("Erreur lors de la création du projet");
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
                <input
                    type="text" placeholder="Nom du projet" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                    placeholder="Description du projet" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg outline-none h-24"
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition">
                    Créer le projet
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;