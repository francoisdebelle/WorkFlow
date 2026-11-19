import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListChecks,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { TaskItem, TaskStatus } from '../types/studyflow';

interface TaskChecklistCardProps {
  task: TaskItem;
  courseColor: string;
  compactLayout?: boolean;
  onToggleExercise: (taskId: string, exerciseId: string) => void;
  onAddExercise: (taskId: string, title: string) => void;
  onDeleteExercise: (taskId: string, exerciseId: string) => void;
  onToggleCollapse: (taskId: string) => void;
  onChangeStatus: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskChecklistCard({
  task,
  courseColor,
  compactLayout = false,
  onToggleExercise,
  onAddExercise,
  onDeleteExercise,
  onToggleCollapse,
  onChangeStatus,
  onEditTask,
  onDeleteTask,
}: TaskChecklistCardProps) {
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseText, setNewExerciseText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAddingExercise) {
      inputRef.current?.focus();
    }
  }, [isAddingExercise]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const totalEx = task.exercises.length;
  const doneEx = task.exercises.filter((ex) => ex.done).length;
  const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : task.status === 'done' ? 100 : 0;

  const isDone = task.status === 'done' || (totalEx > 0 && doneEx === totalEx);

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newExerciseText.trim();
    if (!trimmed) return;
    onAddExercise(task.id, trimmed);
    setNewExerciseText('');
    setIsAddingExercise(false);
  };

  const accentBarColor = isDone ? '#10B981' : courseColor;
  const cardBg = isDone
    ? 'bg-[#F0FDF4]/60 border-emerald-200/80'
    : compactLayout
      ? 'bg-[#F8FAFC] border-blue-200/80'
      : 'bg-[#FFFDF9] border-orange-200/80';

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-3 shadow-2xs relative overflow-visible transition-colors ${cardBg}`}
    >
      {/* Barre d'accent gauche subtile */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentBarColor }}
        aria-hidden="true"
      />

      {/* En-tête du livrable */}
      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1"
              style={
                isDone
                  ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                  : { backgroundColor: `${courseColor}1A`, color: courseColor }
              }
            >
              {isDone && <CheckCircle2 className="w-3 h-3" />}
              {task.badgeLabel}
            </span>

            {task.dueLabel && !isDone && (
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3 h-3 text-stone-400" />
                {task.dueLabel}
              </span>
            )}

            {isDone && totalEx > 0 && (
              <span className="text-[11px] font-mono text-emerald-700 font-bold tabular-nums">
                100%
              </span>
            )}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug mt-0.5">
            {task.title}
          </h3>
          {task.subtitle && (
            <p className="text-xs text-stone-500 leading-relaxed">{task.subtitle}</p>
          )}
        </div>

        {/* Boutons Replier + Menu */}
        <div className="flex items-center gap-1 shrink-0 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => onToggleCollapse(task.id)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            title={task.collapsed ? 'Déplier le livrable' : 'Replier le livrable'}
            aria-label={task.collapsed ? 'Déplier le livrable' : 'Replier le livrable'}
          >
            {task.collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            title="Actions sur le TP"
            aria-label="Actions sur le TP"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl border border-[#E8E1D9] shadow-lg py-1.5 z-30 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onEditTask(task);
                }}
                className="w-full px-3 py-1.5 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Pencil className="w-3.5 h-3.5 text-stone-400" />
                <span>Modifier ce livrable</span>
              </button>

              {task.status !== 'done' ? (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangeStatus(task.id, 'done');
                  }}
                  className="w-full px-3 py-1.5 text-left text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Marquer comme validé</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onChangeStatus(task.id, 'in_progress');
                  }}
                  className="w-full px-3 py-1.5 text-left text-amber-700 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Repasser en cours</span>
                </button>
              )}

              <div className="my-1 border-t border-stone-100" />

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onDeleteTask(task.id);
                }}
                className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Corps du livrable (Exercices interactifs) */}
      {!task.collapsed && (
        <div
          className={`rounded-xl border p-3 flex flex-col gap-2 ${
            isDone
              ? 'bg-white/80 border-emerald-200/60'
              : 'bg-white border-stone-200/75'
          }`}
        >
          <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-stone-100">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
              <ListChecks className="w-3.5 h-3.5" style={{ color: accentBarColor }} />
              <span>Exercices du livrable</span>
            </span>

            {totalEx > 0 && (
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border tabular-nums ${
                  pct === 100
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-orange-50 text-orange-800 border-orange-200'
                }`}
              >
                {doneEx}/{totalEx} complétés ({pct}%)
              </span>
            )}
          </div>

          {/* Liste des exercices cliquables */}
          <div className="flex flex-col gap-1">
            {task.exercises.map((ex) => (
              <div
                key={ex.id}
                className={`group flex items-center gap-2.5 p-1.5 rounded-lg transition-colors ${
                  ex.inProgress && !ex.done
                    ? 'bg-amber-50/70 hover:bg-amber-50 border border-amber-100'
                    : 'hover:bg-stone-50'
                }`}
              >
                <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={ex.done}
                    onChange={() => onToggleExercise(task.id, ex.id)}
                    className="w-4 h-4 rounded border-stone-300 cursor-pointer shrink-0"
                    style={{ accentColor: accentBarColor }}
                  />
                  <span
                    className={`text-xs flex-1 transition-colors ${
                      ex.done
                        ? 'text-stone-400 line-through'
                        : ex.inProgress
                          ? 'text-stone-800 font-semibold'
                          : 'text-stone-700 font-medium'
                    }`}
                  >
                    {ex.title}
                  </span>
                </label>

                <div className="flex items-center gap-1.5 shrink-0">
                  {ex.done ? (
                    <span className="text-[11px] font-mono text-emerald-600 font-medium">
                      Validé
                    </span>
                  ) : ex.inProgress ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-900 font-semibold">
                      En cours
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-400">À faire</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteExercise(task.id, ex.id)}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-0.5 rounded text-stone-400 hover:text-red-600 transition-opacity cursor-pointer"
                    title="Retirer cet exercice"
                    aria-label={`Retirer ${ex.title}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {totalEx === 0 && !isAddingExercise && (
              <p className="text-xs text-stone-400 py-1 px-1">
                Aucun exercice détaillé. Ajoutez des étapes ci-dessous.
              </p>
            )}
          </div>

          {/* Ajout inline d'exercice */}
          {isAddingExercise ? (
            <form onSubmit={handleAddSubmit} className="flex items-center gap-2 pt-1">
              <input
                ref={inputRef}
                type="text"
                value={newExerciseText}
                onChange={(e) => setNewExerciseText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingExercise(false);
                    setNewExerciseText('');
                  }
                }}
                placeholder={`Exercice ${totalEx + 1} : Intitulé...`}
                className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-orange-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-800 bg-white"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer shrink-0"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingExercise(false);
                  setNewExerciseText('');
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer shrink-0"
                aria-label="Annuler"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pl-0.5">
              <button
                type="button"
                onClick={() => setIsAddingExercise(true)}
                className="text-xs text-stone-500 hover:text-orange-600 flex items-center gap-1 transition-colors font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un exercice</span>
              </button>

              <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
                {task.grade && (
                  <span className="text-emerald-800 font-bold tabular-nums">
                    Note : {task.grade}
                  </span>
                )}
                {task.deliverableLabel && (
                  <span className="flex items-center gap-1 text-stone-500">
                    <Paperclip className="w-3 h-3" />
                    {task.deliverableLabel}
                  </span>
                )}
                <span>Modif : {task.updatedAt}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
