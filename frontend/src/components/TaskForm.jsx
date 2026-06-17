import React, { useState } from 'react';
import { taskService } from '../services/taskService';
import { PlusCircle, Bell, Calendar } from 'lucide-react';

const TaskForm = ({ onTaskCreated, projectId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [reminderEnabled, setReminderEnabled] = useState(false);

    // On initialise la date à "demain" par défaut pour éviter le retard immédiat
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
    const [dueDate, setDueDate] = useState(tomorrow.toISOString().slice(0, 16));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newTask = await taskService.createTask({
                title,
                description,
                priority,
                project: projectId,
                due_date: dueDate, // On envoie la date choisie par l'utilisateur
                reminder_enabled: reminderEnabled
            });

            onTaskCreated(newTask);
            setTitle('');
            setDescription('');
            setReminderEnabled(false);
            } catch (err) {
                alert("Erreur lors de l'ajout");
            }
        };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text" placeholder="Titre de la tâche" value={title}
                    onChange={(e) => setTitle(e.target.value)} required
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                    value={priority} onChange={(e) => setPriority(e.target.value)}
                    className="p-2 border rounded-lg outline-none bg-white"
                >
                    <option value="LOW">Priorité Basse</option>
                    <option value="MEDIUM">Priorité Moyenne</option>
                    <option value="HIGH">Priorité Haute</option>
                </select>

                {/* CHAMP DATE D'ÉCHÉANCE */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                        <Calendar size={12} /> DATE D'ÉCHÉANCE
                    </label>
                    <input
                        type="datetime-local"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <textarea
                    placeholder="Description (optionnelle)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="p-2 border rounded-lg outline-none h-full"
                />

                {/* Case à cocher pour le rappel */}
                <div className="md:col-span-2 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                    <input
                        type="checkbox"
                        id="reminder"
                        checked={reminderEnabled}
                        onChange={(e) => setReminderEnabled(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor="reminder" className="text-sm text-blue-800 flex items-center gap-2 cursor-pointer select-none">
                        <Bell size={14} /> M'envoyer un rappel par email 24h avant l'échéance
                    </label>
                </div>
            </div>

            <button type="submit" className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-bold shadow-md">
                <PlusCircle size={18} /> Créer la tâche
            </button>
        </form>
    );
};

export default TaskForm;