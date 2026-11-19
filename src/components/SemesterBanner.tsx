import { CheckCircle2, Hourglass, ListPlus, PlusCircle } from 'lucide-react';
import { StudentProfile } from '../types/studyflow';
import { GlobalMetrics } from '../utils/stats';

interface SemesterBannerProps {
  profile: StudentProfile;
  metrics: GlobalMetrics;
  onOpenNewCourse: () => void;
  onOpenNewTask: () => void;
}

export function SemesterBanner({
  profile,
  metrics,
  onOpenNewCourse,
  onOpenNewTask,
}: SemesterBannerProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (metrics.progressPct / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF6E9] via-[#FFFDF9] to-[#FFF1DE] border border-[#F3E2CB] p-6 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6">
      <div className="flex items-center gap-5 flex-1 min-w-[260px]">
        {/* Jauge Circulaire Progression */}
        <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle
              className="text-orange-100 fill-none"
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeWidth="5"
            />
            <circle
              className="text-orange-500 fill-none transition-all duration-500 ease-out"
              cx="32"
              cy="32"
              r={radius}
              stroke="currentColor"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="5"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-base text-stone-900 tabular-nums">
              {metrics.progressPct}%
            </span>
          </div>
        </div>

        {/* Résumé Statut Semestre */}
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
            <span className="font-mono uppercase tracking-wider text-orange-700 font-semibold">
              {profile.semesterLabel}
            </span>
            <span aria-hidden="true" className="text-stone-400">·</span>
            <span className="text-stone-500">{profile.sessionLabel}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight tabular-nums mt-0.5">
            {metrics.doneTasks} sur {metrics.totalTasks} TPs &amp; Projets validés
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-stone-600">
            <span className="flex items-center gap-1.5 tabular-nums">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {metrics.remainingTasks} livrable{metrics.remainingTasks > 1 ? 's' : ''} restant
              {metrics.remainingTasks > 1 ? 's' : ''}
            </span>
            <span className="text-stone-300 hidden sm:inline" aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5 truncate max-w-md">
              <Hourglass className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">Prochain rendu : {metrics.nextDeadlineText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Boutons Rapides */}
      <div className="flex flex-wrap items-center gap-3 shrink-0 self-end xl:self-center">
        <button
          type="button"
          onClick={onOpenNewCourse}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white border border-orange-200 text-orange-700 hover:bg-orange-50/70 hover:border-orange-300 font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <ListPlus className="w-4 h-4" />
          <span>Ajouter un cours</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewTask}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ajouter Tâche</span>
        </button>
      </div>
    </div>
  );
}
