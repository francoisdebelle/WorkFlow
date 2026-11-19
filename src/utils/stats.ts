import { Course, TaskItem } from '../types/studyflow';

export interface CourseMetrics {
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progressPct: number;
  statusText: string;
}

export interface GlobalMetrics {
  totalCourses: number;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  remainingTasks: number;
  progressPct: number;
  nextDeadlineText: string;
}

export function getTaskCompletionRatio(task: TaskItem): number {
  if (task.status === 'done') return 1;
  if (task.exercises.length > 0) {
    const completed = task.exercises.filter((ex) => ex.done).length;
    return completed / task.exercises.length;
  }
  if (task.status === 'in_progress') return 0.35;
  return 0;
}

export function computeCourseMetrics(courseTasks: TaskItem[]): CourseMetrics {
  const totalTasks = courseTasks.length;
  const doneTasks = courseTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = courseTasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = courseTasks.filter((t) => t.status === 'todo').length;

  if (totalTasks === 0) {
    return {
      totalTasks: 0,
      doneTasks: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      progressPct: 0,
      statusText: 'Nouveau',
    };
  }

  const ratioSum = courseTasks.reduce((acc, task) => acc + getTaskCompletionRatio(task), 0);
  const progressPct = Math.round((ratioSum / totalTasks) * 100);

  let statusText = `${progressPct}% validé`;
  if (progressPct === 100) {
    statusText = '100% à jour';
  } else if (inProgressTasks > 0 && doneTasks === 0) {
    statusText = `${progressPct}% en cours`;
  }

  return {
    totalTasks,
    doneTasks,
    inProgressTasks,
    todoTasks,
    progressPct,
    statusText,
  };
}

export function computeGlobalMetrics(
  courses: Course[],
  tasks: TaskItem[],
  fallbackDeadline: string
): GlobalMetrics {
  const totalCourses = courses.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const remainingTasks = totalTasks - doneTasks;

  const progressPct =
    totalTasks === 0
      ? 0
      : Math.round(
          (tasks.reduce((acc, t) => acc + getTaskCompletionRatio(t), 0) / totalTasks) * 100
        );

  const upcomingTask = tasks.find((t) => t.status !== 'done' && t.dueLabel);
  const nextDeadlineText = upcomingTask
    ? `${upcomingTask.title.split(':')[0].trim()} (${upcomingTask.dueLabel})`
    : fallbackDeadline;

  return {
    totalCourses,
    totalTasks,
    doneTasks,
    inProgressTasks,
    todoTasks,
    remainingTasks,
    progressPct,
    nextDeadlineText,
  };
}
