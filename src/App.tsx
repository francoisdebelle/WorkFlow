import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Hourglass, SearchX } from 'lucide-react';
import { CourseCard } from './components/CourseCard';
import { CourseModal } from './components/CourseModal';
import { Header } from './components/Header';
import { ProfileModal } from './components/ProfileModal';
import { SemesterBanner } from './components/SemesterBanner';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import {
  generateId,
  loadDatabaseSync,
  loadFromIndexedDb,
  resetDatabase,
  saveDatabase,
} from './db/localDb';
import { Course, StudentProfile, StudyFlowDatabase, TaskItem, TaskStatus } from './types/studyflow';
import { computeGlobalMetrics } from './utils/stats';

export default function App() {
  const [db, setDb] = useState<StudyFlowDatabase>(() => loadDatabaseSync());

  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [taskDefaultCourseId, setTaskDefaultCourseId] = useState<string | undefined>(undefined);

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Sync with IndexedDB on mount if available and valid
  useEffect(() => {
    let active = true;
    loadFromIndexedDb().then((idbData) => {
      if (active && idbData) {
        // Keep localStorage as primary instant source, only hydrate if localStorage was empty
        try {
          const hasLocal = Boolean(window.localStorage.getItem('studyflow_local_db_v1'));
          if (!hasLocal) {
            setDb(idbData);
            saveDatabase(idbData);
          }
        } catch {
          setDb(idbData);
        }
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist every database mutation
  const updateDb = (updater: (prev: StudyFlowDatabase) => StudyFlowDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // Course CRUD
  const handleSaveCourse = (payload: {
    id?: string;
    name: string;
    code: string;
    teacher: string;
    color: string;
    colorName: string;
  }) => {
    if (payload.id) {
      updateDb((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === payload.id
            ? {
                ...c,
                name: payload.name,
                shortName: payload.name.length > 20 ? `${payload.name.slice(0, 18)}…` : payload.name,
                code: payload.code,
                teacher: payload.teacher,
                color: payload.color,
                colorName: payload.colorName,
              }
            : c
        ),
      }));
    } else {
      const newCourse: Course = {
        id: generateId('course'),
        name: payload.name,
        shortName: payload.name.length > 20 ? `${payload.name.slice(0, 18)}…` : payload.name,
        code: payload.code,
        teacher: payload.teacher,
        color: payload.color,
        colorName: payload.colorName,
        collapsed: false,
        createdAt: new Date().toISOString(),
      };
      updateDb((prev) => ({
        ...prev,
        courses: [newCourse, ...prev.courses],
      }));
      setSelectedCourseId('all');
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    updateDb((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== courseId),
      tasks: prev.tasks.filter((t) => t.courseId !== courseId),
    }));
    if (selectedCourseId === courseId) {
      setSelectedCourseId('all');
    }
  };

  const handleToggleCourseCollapse = (courseId: string) => {
    updateDb((prev) => ({
      ...prev,
      courses: prev.courses.map((c) =>
        c.id === courseId ? { ...c, collapsed: !c.collapsed } : c
      ),
    }));
  };

  // Task / TP CRUD
  const handleSaveTask = (payload: Omit<TaskItem, 'id' | 'updatedAt'> & { id?: string }) => {
    const nowLabel = "À l'instant";
    if (payload.id) {
      updateDb((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === payload.id
            ? {
                ...t,
                courseId: payload.courseId,
                badgeLabel: payload.badgeLabel,
                title: payload.title,
                subtitle: payload.subtitle,
                dueLabel: payload.dueLabel,
                deliverableLabel: payload.deliverableLabel,
                grade: payload.grade,
                status: payload.status,
                featured: payload.featured,
                exercises: payload.exercises,
                updatedAt: nowLabel,
              }
            : t
        ),
      }));
    } else {
      const newTask: TaskItem = {
        id: generateId('task'),
        courseId: payload.courseId,
        badgeLabel: payload.badgeLabel,
        title: payload.title,
        subtitle: payload.subtitle,
        dueLabel: payload.dueLabel,
        deliverableLabel: payload.deliverableLabel,
        grade: payload.grade,
        status: payload.status,
        featured: payload.featured,
        collapsed: false,
        exercises: payload.exercises,
        updatedAt: nowLabel,
      };
      updateDb((prev) => ({
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === payload.courseId ? { ...c, collapsed: false } : c
        ),
        tasks: [newTask, ...prev.tasks],
      }));
    }
  };

  const handleDeleteTask = (taskId: string) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  };

  const handleChangeTaskStatus = (taskId: string, status: TaskStatus) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const updatedExercises =
          status === 'done'
            ? t.exercises.map((ex) => ({ ...ex, done: true, inProgress: false }))
            : t.exercises;
        return {
          ...t,
          status,
          badgeLabel:
            status === 'done' && (t.badgeLabel === 'À faire' || t.badgeLabel === 'En cours')
              ? 'Validé'
              : t.badgeLabel,
          exercises: updatedExercises,
          updatedAt: "À l'instant",
        };
      }),
    }));
  };

  const handleToggleTaskCollapse = (taskId: string) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, collapsed: !t.collapsed } : t
      ),
    }));
  };

  // Exercise CRUD
  const handleToggleExercise = (taskId: string, exerciseId: string) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextExercises = t.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, done: !ex.done, inProgress: false } : ex
        );
        const allDone = nextExercises.length > 0 && nextExercises.every((ex) => ex.done);
        const nextStatus: TaskStatus = allDone
          ? 'done'
          : t.status === 'done'
            ? 'in_progress'
            : t.status;
        return {
          ...t,
          exercises: nextExercises,
          status: nextStatus,
          updatedAt: "À l'instant",
        };
      }),
    }));
  };

  const handleAddExercise = (taskId: string, title: string) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          featured: true,
          status: t.status === 'done' ? 'in_progress' : t.status,
          exercises: [
            ...t.exercises,
            {
              id: generateId('ex'),
              title,
              done: false,
            },
          ],
          updatedAt: "À l'instant",
        };
      }),
    }));
  };

  const handleDeleteExercise = (taskId: string, exerciseId: string) => {
    updateDb((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const nextExercises = t.exercises.filter((ex) => ex.id !== exerciseId);
        const allDone = nextExercises.length > 0 && nextExercises.every((ex) => ex.done);
        return {
          ...t,
          exercises: nextExercises,
          status: allDone ? 'done' : t.status,
          updatedAt: "À l'instant",
        };
      }),
    }));
  };

  // Profile & Reset
  const handleSaveProfile = (profile: StudentProfile) => {
    updateDb((prev) => ({ ...prev, profile }));
  };

  const handleResetDatabase = () => {
    const fresh = resetDatabase();
    setDb(fresh);
    setSelectedCourseId('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  // Open Modal helpers
  const openNewCourseModal = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const openNewTaskModal = (courseId?: string) => {
    setEditingTask(null);
    setTaskDefaultCourseId(courseId || (selectedCourseId !== 'all' ? selectedCourseId : undefined));
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task: TaskItem) => {
    setEditingTask(task);
    setTaskDefaultCourseId(task.courseId);
    setTaskModalOpen(true);
  };

  // Computed metrics & filtered lists
  const globalMetrics = useMemo(
    () => computeGlobalMetrics(db.courses, db.tasks, db.profile.nextDeadlineLabel),
    [db.courses, db.tasks, db.profile.nextDeadlineLabel]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredCoursesWithTasks = useMemo(() => {
    return db.courses
      .filter((course) => selectedCourseId === 'all' || course.id === selectedCourseId)
      .map((course) => {
        const allCourseTasks = db.tasks.filter((t) => t.courseId === course.id);
        const courseMatchesQuery =
          !normalizedQuery ||
          course.name.toLowerCase().includes(normalizedQuery) ||
          course.code.toLowerCase().includes(normalizedQuery) ||
          course.teacher.toLowerCase().includes(normalizedQuery);

        const visibleTasks = allCourseTasks.filter((task) => {
          const statusMatches = statusFilter === 'all' || task.status === statusFilter;
          if (!statusMatches) return false;

          if (!normalizedQuery || courseMatchesQuery) return true;

          const taskMatches =
            task.title.toLowerCase().includes(normalizedQuery) ||
            task.badgeLabel.toLowerCase().includes(normalizedQuery) ||
            (task.subtitle && task.subtitle.toLowerCase().includes(normalizedQuery)) ||
            task.exercises.some((ex) => ex.title.toLowerCase().includes(normalizedQuery));

          return taskMatches;
        });

        const shouldShowCourse =
          (!normalizedQuery && statusFilter === 'all') ||
          (courseMatchesQuery && statusFilter === 'all') ||
          visibleTasks.length > 0;

        return {
          course,
          allCourseTasks,
          visibleTasks,
          shouldShowCourse,
        };
      })
      .filter((entry) => entry.shouldShowCourse);
  }, [db.courses, db.tasks, selectedCourseId, statusFilter, normalizedQuery]);

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#1C1917] antialiased selection:bg-orange-100 selection:text-orange-900">
      <Sidebar
        courses={db.courses}
        tasks={db.tasks}
        selectedCourseId={selectedCourseId}
        globalProgressPct={globalMetrics.progressPct}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onSelectCourse={(id) => setSelectedCourseId(id)}
        onOpenNewTask={() => openNewTaskModal()}
        onOpenNewCourse={openNewCourseModal}
        onResetDemo={() => setProfileModalOpen(true)}
      />

      <div className="lg:pl-64">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          profile={db.profile}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenProfileModal={() => setProfileModalOpen(true)}
        />

        <main className="w-full pt-16 min-h-screen">
          <div className="p-4 sm:p-8 max-w-[1680px] mx-auto flex flex-col gap-6">
            {/* Barre de synthèse semestre */}
            <SemesterBanner
              profile={db.profile}
              metrics={globalMetrics}
              onOpenNewCourse={openNewCourseModal}
              onOpenNewTask={() => openNewTaskModal()}
            />

            {/* Filtres des Matières + Badges de statut cliquables */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#E8E1D9] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSelectedCourseId('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCourseId === 'all'
                      ? 'font-semibold bg-[#FFF3E8] text-orange-700 shadow-2xs'
                      : 'font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  Tous les cours{' '}
                  <span className="ml-1 text-[11px] opacity-75 font-mono tabular-nums">
                    {db.courses.length}
                  </span>
                </button>

                {db.courses.map((course) => {
                  const active = selectedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => setSelectedCourseId(active ? 'all' : course.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'font-semibold bg-[#FFF3E8] text-orange-700 shadow-2xs'
                          : 'font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: course.color }}
                      />
                      <span>{course.shortName || course.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Badges de statut interactifs */}
              <div className="flex flex-wrap items-center gap-2 text-stone-500 font-mono text-xs self-end lg:self-center">
                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === 'done' ? 'all' : 'done'))
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer tabular-nums ${
                    statusFilter === 'done'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-white border-[#E8E1D9] hover:border-stone-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <strong className="text-stone-800">{globalMetrics.doneTasks}</strong> validés
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) =>
                      prev === 'in_progress' ? 'all' : 'in_progress'
                    )
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer tabular-nums ${
                    statusFilter === 'in_progress'
                      ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                      : 'bg-white border-[#E8E1D9] hover:border-stone-300'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                  <strong className="text-stone-800">{globalMetrics.inProgressTasks}</strong> en
                  cours
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter((prev) => (prev === 'todo' ? 'all' : 'todo'))
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer tabular-nums ${
                    statusFilter === 'todo'
                      ? 'bg-stone-100 border-stone-400 text-stone-900 font-semibold'
                      : 'bg-white border-[#E8E1D9] hover:border-stone-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <strong className="text-stone-800">{globalMetrics.todoTasks}</strong> à faire
                </button>
              </div>
            </div>

            {/* Grille des cours par matière */}
            {filteredCoursesWithTasks.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                {filteredCoursesWithTasks.map(({ course, allCourseTasks, visibleTasks }) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    tasks={visibleTasks}
                    allCourseTasks={allCourseTasks}
                    onToggleCollapse={handleToggleCourseCollapse}
                    onAddTaskForCourse={(courseId) => openNewTaskModal(courseId)}
                    onEditCourse={openEditCourseModal}
                    onDeleteCourse={handleDeleteCourse}
                    onEditTask={openEditTaskModal}
                    onDeleteTask={handleDeleteTask}
                    onChangeTaskStatus={handleChangeTaskStatus}
                    onToggleTaskCollapse={handleToggleTaskCollapse}
                    onToggleExercise={handleToggleExercise}
                    onAddExercise={handleAddExercise}
                    onDeleteExercise={handleDeleteExercise}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E1D9] p-10 flex flex-col items-center justify-center text-center gap-3">
                <SearchX className="w-9 h-9 text-stone-400" />
                <h2 className="text-base font-bold text-stone-900">
                  Aucun résultat ne correspond à vos filtres
                </h2>
                <p className="text-xs text-stone-500 max-w-md">
                  Essayez d&apos;effacer la recherche ou de réafficher tous les cours et statuts.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCourseId('all');
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                  <button
                    type="button"
                    onClick={openNewCourseModal}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    + Ajouter un cours
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <CourseModal
        isOpen={courseModalOpen}
        editingCourse={editingCourse}
        onClose={() => setCourseModalOpen(false)}
        onSave={handleSaveCourse}
        onDelete={handleDeleteCourse}
      />

      <TaskModal
        isOpen={taskModalOpen}
        courses={db.courses}
        defaultCourseId={taskDefaultCourseId}
        editingTask={editingTask}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        database={db}
        onClose={() => setProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        onResetDatabase={handleResetDatabase}
      />
    </div>
  );
}
