export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface ExerciseItem {
  id: string;
  title: string;
  done: boolean;
  inProgress?: boolean;
}

export interface TaskItem {
  id: string;
  courseId: string;
  badgeLabel: string;
  title: string;
  subtitle?: string;
  dueLabel?: string;
  deliverableLabel?: string;
  grade?: string;
  status: TaskStatus;
  featured?: boolean;
  collapsed?: boolean;
  updatedAt: string;
  exercises: ExerciseItem[];
}

export interface Course {
  id: string;
  name: string;
  shortName: string;
  code: string;
  teacher: string;
  color: string;
  colorName: string;
  collapsed?: boolean;
  createdAt: string;
}

export interface StudentProfile {
  name: string;
  initials: string;
  program: string;
  semesterLabel: string;
  sessionLabel: string;
  nextDeadlineLabel: string;
}

export interface StudyFlowDatabase {
  version: number;
  profile: StudentProfile;
  courses: Course[];
  tasks: TaskItem[];
}

export interface ColorOption {
  hex: string;
  name: string;
}

export const COURSE_COLOR_PALETTE: ColorOption[] = [
  { hex: '#EF4444', name: 'Rouge' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EAB308', name: 'Jaune' },
  { hex: '#10B981', name: 'Vert' },
  { hex: '#0EA5E9', name: 'Bleu clair' },
  { hex: '#1E40AF', name: 'Bleu foncé' },
  { hex: '#64748B', name: 'Gris' },
  { hex: '#EC4899', name: 'Rose' },
];
