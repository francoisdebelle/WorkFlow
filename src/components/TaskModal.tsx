import { FormEvent, useEffect, useState } from 'react';
import { CheckSquare, ClipboardList, Plus, Square, Trash2, X } from 'lucide-react';
import { generateId } from '../db/localDb';
import { Course, ExerciseItem, TaskItem, TaskStatus } from '../types/studyflow';

interface TaskModalProps {
  isOpen: boolean;
  courses: Course[];
  defaultCourseId?: string;
  editingTask: TaskItem | null;
  onClose: () => void;
  onSave: (task: Omit<TaskItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  onDelete?: (taskId: string) => void;
}

export function TaskModal({
  isOpen,
  courses,
  defaultCourseId,
  editingTask,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [courseId, setCourseId] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [dueLabel, setDueLabel] = useState('');
  const [deliverableLabel, setDeliverableLabel] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [featured, setFeatured] = useState(true);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [newExerciseTitle, setNewExerciseTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingTask) {
      setCourseId(editingTask.courseId);
      setBadgeLabel(editingTask.badgeLabel);
      setTitle(editingTask.title);
      setSubtitle(editingTask.subtitle || '');
      setDueLabel(editingTask.dueLabel || '');
      setDeliverableLabel(editingTask.deliverableLabel || '');
      setGrade(editingTask.grade || '');
      setStatus(editingTask.status);
      setFeatured(Boolean(editingTask.featured || editingTask.exercises.length > 0));
      setExercises(editingTask.exercises.map((ex) => ({ ...ex })));
    } else {
      const initialCourse =
        (defaultCourseId && defaultCourseId !== 'all' ? defaultCourseId : courses[0]?.id) || '';
      setCourseId(initialCourse);
      setBadgeLabel('TP');
      setTitle('');
      setSubtitle('');
      setDueLabel('');
      setDeliverableLabel('');
      setGrade('');
      setStatus('in_progress');
      setFeatured(true);
      setExercises([]);
    }
    setNewExerciseTitle('');
    setConfirmDelete(false);
  }, [isOpen, editingTask, defaultCourseId, courses]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddExercise = () => {
    const trimmed = newExerciseTitle.trim();
    if (!trimmed) return;
    setExercises((prev) => [
      ...prev,
      {
        id: generateId('ex'),
        title: trimmed,
        done: false,
      },
    ]);
    setNewExerciseTitle('');
  };

  const handleToggleExercise = (exId: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exId ? { ...ex, done: !ex.done } : ex))
    );
  };

  const handleRemoveExercise = (exId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exId));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !courseId) return;

    const finalExercises = newExerciseTitle.trim()
      ? [
          ...exercises,
          { id: generateId('ex'), title: newExerciseTitle.trim(), done: false },
        ]
      : exercises;

    const defaultBadge =
      badgeLabel.trim() ||
      (status === 'done' ? 'Validé' : status === 'in_progress' ? 'En cours' : 'À faire');

    onSave({
      id: editingTask?.id,
      courseId,
      badgeLabel: defaultBadge,
      title: trimmedTitle,
      subtitle: subtitle.trim() || undefined,
      dueLabel: dueLabel.trim() || undefined,
      deliverableLabel: deliverableLabel.trim() || undefined,
      grade: grade.trim() || undefined,
      status,
      featured: featured || finalExercises.length > 0,
      collapsed: editingTask?.collapsed ?? false,
      exercises: finalExercises,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xl max-w-xl w-full p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 id="task-modal-title" className="font-bold text-lg text-stone-900 tracking-tight">
                {editingTask ? 'Modifier le TP / Tâche' : 'Nouveau TP / Tâche'}
              </h3>
              <p className="text-xs text-stone-500">
                Ajoutez un travail pratique, devoir maison ou liste d&apos;exercices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-course-select">
                Matière / Cours *
              </label>
              <select
                id="task-course-select"
                required
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 bg-white"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-status-select">
                Statut
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 bg-white"
              >
                <option value="todo">À faire</option>
                <option value="in_progress">En cours</option>
                <option value="done">Validé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-badge-input">
                Type / Badge
              </label>
              <input
                id="task-badge-input"
                type="text"
                value={badgeLabel}
                onChange={(e) => setBadgeLabel(e.target.value)}
                placeholder="ex: TP 6, DM 3, Projet..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-title-input">
                Intitulé du TP ou devoir *
              </label>
              <input
                id="task-title-input"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: TP 6 : Graphes & Dijkstra"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-due-input">
                Échéance
              </label>
              <input
                id="task-due-input"
                type="text"
                value={dueLabel}
                onChange={(e) => setDueLabel(e.target.value)}
                placeholder="ex: Vendredi 18h, J-3"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-deliverable-input">
                Livrable
              </label>
              <input
                id="task-deliverable-input"
                type="text"
                value={deliverableLabel}
                onChange={(e) => setDeliverableLabel(e.target.value)}
                placeholder="ex: Rapport.pdf, .ipynb"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="task-grade-input">
                Note (optionnel)
              </label>
              <input
                id="task-grade-input"
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="ex: 18/20"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700" htmlFor="task-subtitle-input">
              Description / Salle / Outils (optionnel)
            </label>
            <input
              id="task-subtitle-input"
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="ex: Banc de mesure salle E-104, Python Scipy..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
            />
          </div>

          {/* Gestion des exercices / sous-tâches */}
          <div className="bg-[#FBF8F3] rounded-xl border border-[#E8E1D9] p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-800">
                Exercices du livrable ({exercises.length})
              </span>
              <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-stone-300 accent-orange-600 cursor-pointer"
                />
                <span>Afficher en carte détaillée</span>
              </label>
            </div>

            {exercises.length > 0 && (
              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200/80"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleExercise(ex.id)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0 cursor-pointer"
                    >
                      {ex.done ? (
                        <CheckSquare className="w-4 h-4 text-orange-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400 shrink-0" />
                      )}
                      <span
                        className={`text-xs truncate ${
                          ex.done ? 'line-through text-stone-400' : 'text-stone-800 font-medium'
                        }`}
                      >
                        {ex.title}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(ex.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer shrink-0"
                      aria-label="Supprimer l'exercice"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newExerciseTitle}
                onChange={(e) => setNewExerciseTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExercise();
                  }
                }}
                placeholder="Ajouter un exercice (ex: Exercice 1 : Modélisation)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-800"
              />
              <button
                type="button"
                onClick={handleAddExercise}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-stone-100">
            <div>
              {editingTask && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(editingTask.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                    >
                      Confirmer suppression
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={courses.length === 0}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {editingTask ? 'Enregistrer' : 'Créer la tâche'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
