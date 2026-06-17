import React, { useEffect, useState } from 'react';
import { projectService } from '../services/projectService';
import { Folder, ChevronRight, Plus } from 'lucide-react';
// 1. IMPORTATION CORRECTE : On importe le formulaire de Projet, pas de Tâche
import ProjectForm from './ProjectForm';

const ProjectList = ({ onSelectProject }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectService.getAllProjects();
                setProjects(data);
            } catch (err) {
                console.error("Erreur projets:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const handleProjectCreated = (newProject) => {
        setProjects([newProject, ...projects]);
        setShowForm(false);
    }

    if (loading) return <div className="text-center p-10">Chargement des projets...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Mes Projets</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} /> Nouveau Projet
                    </button>
                )}
            </div>

            {/* 2. UTILISATION DU BON COMPOSANT : ProjectForm */}
            {showForm && (
                <ProjectForm
                    onProjectCreated={handleProjectCreated}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects?.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => onSelectProject(project)}
                        className="group cursor-pointer bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
                                <Folder className="text-blue-600" size={24} />
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition" />
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-gray-900">{project.name}</h3>
                        <p className="mt-2 text-gray-500 text-sm line-clamp-2">
                            {project.description || "Aucune description."}
                        </p>
                    </div>
                ))}
            </div>

            {projects?.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
                    <p className="text-gray-500">Vous n'avez pas encore de projet.</p>
                </div>
            )}
        </div>
    );
};

export default ProjectList;