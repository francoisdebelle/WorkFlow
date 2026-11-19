import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FilePlus2,
  MoreVertical,
  Pencil,
  Plus,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import { Course, TaskItem, TaskStatus } from '../types/studyflow';
import { computeCourseMetrics } from '../utils/stats';
import { TaskChecklistCard } from './TaskChecklistCard';

interface CourseCardProps {
  course: Course;
  tasks: TaskItem[];
  allCourseTasks: TaskItem[];
  onToggleCollapse: (courseId: string) => void;
  onAddTaskForCourse: (courseId: string) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onEditTask: (task: TaskItem) => void;
  onDeleteTask: (taskId: string) => void;
  onChangeTaskStatus: (taskId: string, status: TaskStatus) => void;
  onToggleTaskCollapse: (taskId: string) => void;
  onToggleExercise: (taskId: string, exerciseId: string) => void;
  onAddExercise: (taskId: string, title: string) => void;
  onDeleteExercise: (taskId: string, exerciseId: string) => void;
}

export function CourseCard({
  course,
  tasks,
  allCourseTasks,
  onToggleCollapse,
  onAddTaskForCourse,
  onEditCourse,
  onDeleteCourse,
  onEditTask,
  onDeleteTask,
  onChangeTaskStatus,
  onToggleTaskCollapse,
  onToggleExercise,
  onAddExercise,
  onDeleteExercise,
}: CourseCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const metrics = computeCourseMetrics(allCourseTasks);
  const featuredTasks = tasks.filter((t) => t.featured || t.exercises.length > 0);
  const compactTasks = tasks.filter((t) => !t.featured && t.exercises.length === 0);

  return (
    <section className="rounded-2xl bg-white border border-[#E8E1D9] p-5 shadow-xs flex flex-col gap-4 transition-shadow hover:shadow-md">
      {/* Entête du cours */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0"
            style={{
              backgroundColor: course.color,
              boxShadow: `0 0 0 4px ${course.color}22`,
            }}
          />
          <div className="min-w-0">
            <h2 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight truncate">
              {course.name}
            </h2>
            <span className="text-xs text-stone-500 block truncate">
              {course.code} · {course.teacher}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right mr-1">
            <span
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md tabular-nums inline-block"
              style={
                metrics.progressPct === 100
                  ? { backgroundColor: '#ECFDF5', color: '#047857' }
                  : { backgroundColor: `${course.color}15`, color: course.color }
              }
            >
              {metrics.statusText}
            </span>
            <span className="block text-[11px] text-stone-500 font-mono mt-0.5 tabular-nums">
              {metrics.doneTasks} / {metrics.totalTasks} TP{metrics.totalTasks > 1 ? 's' : ''} validés
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddTaskForCourse(course.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
            title="Ajouter un TP dans ce cours"
            aria-label={`Ajouter un TP dans ${course.name}`}
          >
            <PlusCircle className="w-5 h-5" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((prev) => !prev);
                setConfirmDelete(false);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Options du cours"
              aria-label={`Options pour ${course.name}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-9 w-52 bg-white rounded-xl border border-[#E8E1D9] shadow-lg py-1.5 z-30 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEditCourse(course);
                  }}
                  className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Pencil className="w-3.5 h-3.5 text-stone-400" />
                  <span>Modifier le cours</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onAddTaskForCourse(course.id);
                  }}
                  className="w-full px-3 py-2 text-left text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Plus className="w-3.5 h-3.5 text-stone-400" />
                  <span>Ajouter un TP / Tâche</span>
                </button>
                <div className="my-1 border-t border-stone-100" />
                {confirmDelete ? (
                  <div className="px-3 py-1.5 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDeleteCourse(course.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 cursor-pointer"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-stone-500 hover:text-stone-800 cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer le cours</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleCollapse(course.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title={course.collapsed ? 'Déplier le cours' : 'Replier le cours'}
            aria-label={course.collapsed ? 'Déplier le cours' : 'Replier le cours'}
          >
            {course.collapsed ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Corps du cours */}
      {!course.collapsed && (
        <div className="flex flex-col gap-4">
          {/* Barre de progression du cours */}
          <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${metrics.progressPct}%`,
                backgroundColor: metrics.progressPct === 100 ? '#10B981' : course.color,
              }}
            />
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-stone-300 flex flex-col items-center justify-center text-center gap-2 bg-[#FBF8F3]/50">
              <FilePlus2 className="w-7 h-7 text-stone-400" />
              <p className="text-xs font-semibold text-stone-700">
                Aucun devoir ou TP affiché pour ce cours
              </p>
              <p className="text-[11px] text-stone-500 max-w-xs">
                Ajoutez une première séance, un TP ou une liste d&apos;exercices à suivre.
              </p>
              <button
                type="button"
                onClick={() => onAddTaskForCourse(course.id)}
                className="mt-1 text-xs font-semibold px-3.5 py-1.5 rounded-lg text-white shadow-xs transition-opacity hover:opacity-90 cursor-pointer"
                style={{ backgroundColor: course.color }}
              >
                + Créer un TP
              </button>
            </div>
          ) : (
            <>
              {/* Cartes TP détaillées avec checklists */}
              {featuredTasks.length > 0 && (
                <div
                  className={
                    featuredTasks.length > 1
                      ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start'
                      : 'flex flex-col gap-3.5'
                  }
                >
                  {featuredTasks.map((task) => (
                    <TaskChecklistCard
                      key={task.id}
                      task={task}
                      courseColor={course.color}
                      compactLayout={featuredTasks.length > 1}
                      onToggleExercise={onToggleExercise}
                      onAddExercise={onAddExercise}
                      onDeleteExercise={onDeleteExercise}
                      onToggleCollapse={onToggleTaskCollapse}
                      onChangeStatus={onChangeTaskStatus}
                      onEditTask={onEditTask}
                      onDeleteTask={onDeleteTask}
                    />
                  ))}
                </div>
              )}

              {/* Modules compacts & historique cliquables */}
              {compactTasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  {featuredTasks.length > 0 && (
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-stone-400 px-0.5">
                      Autres modules &amp; Historique
                    </span>
                  )}
                  <div
                    className={`grid grid-cols-1 gap-2.5 ${
                      compactTasks.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
                    }`}
                  >
                    {compactTasks.map((task) => {
                      const isDone = task.status === 'done';
                      const isInProgress = task.status === 'in_progress';
                      const leftColor = isDone
                        ? '#10B981'
                        : isInProgress
                          ? course.color
                          : '#D6D3D1';

                      return (
                        <div
                          key={task.id}
                          onClick={() => onEditTask(task)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onEditTask(task);
                            }
                          }}
                          className={`group relative overflow-hidden p-3 rounded-xl border transition-all flex flex-col justify-between gap-1.5 text-left cursor-pointer ${
                            isInProgress
                              ? 'bg-stone-50/90 border-stone-200 hover:bg-white hover:border-orange-300'
                              : 'bg-stone-50/80 border-stone-200/80 hover:bg-white hover:border-stone-300'
                          }`}
                        >
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{ backgroundColor: leftColor }}
                            aria-hidden="true"
                          />

                          <div className="flex items-center justify-between gap-2 pl-1">
                            <span
                              className={`text-[10px] font-mono font-bold truncate ${
                                isDone
                                  ? 'text-emerald-700'
                                  : isInProgress
                                    ? 'text-stone-800'
                                    : 'text-stone-500'
                              }`}
                              style={isInProgress ? { color: course.color } : undefined}
                            >
                              {task.badgeLabel}
                            </span>

                            <div className="flex items-center gap-1 shrink-0">
                              {task.grade && (
                                <span className="text-[10px] font-mono text-stone-600 font-semibold tabular-nums">
                                  {task.grade}
                                </span>
                              )}
                              {!task.grade && task.deliverableLabel && (
                                <span className="text-[10px] font-mono text-stone-500">
                                  {task.deliverableLabel}
                                </span>
                              )}
                              {!task.grade && !task.deliverableLabel && task.dueLabel && (
                                <span className="text-[10px] font-mono text-stone-500">
                                  {task.dueLabel}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeTaskStatus(
                                    task.id,
                                    isDone ? 'todo' : 'done'
                                  );
                                }}
                                title={isDone ? 'Marquer à faire' : 'Valider ce TP'}
                                aria-label={isDone ? 'Marquer à faire' : 'Valider ce TP'}
                                className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                                  isDone
                                    ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                    : 'text-stone-400 hover:text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {isDone ? (
                                  <BadgeCheck className="w-3.5 h-3.5" />
                                ) : isInProgress ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-semibold text-stone-800 pl-1 line-clamp-2 leading-snug">
                            {task.title}
                          </h4>

                          {task.subtitle && (
                            <span className="text-[10px] text-stone-500 pl-1 truncate">
                              {task.subtitle}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
