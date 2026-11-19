import { LayoutGrid, Plus, RotateCcw, X } from 'lucide-react';
import { Course, TaskItem } from '../types/studyflow';

interface SidebarProps {
  courses: Course[];
  tasks: TaskItem[];
  selectedCourseId: string;
  globalProgressPct: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectCourse: (courseId: string) => void;
  onOpenNewTask: () => void;
  onOpenNewCourse: () => void;
  onResetDemo: () => void;
}

export function Sidebar({
  courses,
  tasks,
  selectedCourseId,
  globalProgressPct,
  isOpenMobile,
  onCloseMobile,
  onSelectCourse,
  onOpenNewTask,
  onOpenNewCourse,
  onResetDemo,
}: SidebarProps) {
  return (
    <>
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/35 backdrop-blur-[1px] z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#FAF6F0] border-r border-[#E8E1D9] z-50 flex flex-col justify-between p-5 transition-transform duration-200 ease-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-0.5">
          {/* Logo & Identité StudyFlow */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-orange-500/20 shrink-0">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[16px] tracking-tight text-[#1C1917] leading-tight">
                  StudyFlow
                </span>
                <span className="text-[11px] font-mono font-medium text-[#78716C] tracking-wide">
                  Poste Académique
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Action Rapide Nouvelle Tâche */}
          <button
            type="button"
            onClick={() => {
              onOpenNewTask();
              onCloseMobile();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3.5 rounded-xl bg-orange-600 text-white font-semibold text-sm shadow-sm hover:bg-orange-700 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau TP / Tâche</span>
          </button>

          {/* Navigation Active */}
          <nav className="flex flex-col gap-1" aria-label="Navigation principale">
            <button
              type="button"
              onClick={() => {
                onSelectCourse('all');
                onCloseMobile();
              }}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedCourseId === 'all'
                  ? 'bg-white text-orange-600 shadow-sm border border-[#E8E1D9]'
                  : 'text-[#57534E] hover:bg-white/70 hover:text-[#1C1917]'
              }`}
            >
              <LayoutGrid className="w-[18px] h-[18px]" />
              <span>Vue par Cours</span>
            </button>
          </nav>

          {/* Section Matières Actives */}
          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-semibold text-[#78716C] uppercase tracking-wider">
                Matières actives
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-stone-600 tabular-nums font-medium">
                  {courses.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onOpenNewCourse();
                    onCloseMobile();
                  }}
                  title="Ajouter un cours"
                  aria-label="Ajouter un cours"
                  className="w-5 h-5 rounded-md flex items-center justify-center text-stone-500 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-0.5">
              {courses.map((course) => {
                const courseTaskCount = tasks.filter((t) => t.courseId === course.id).length;
                const isSelected = selectedCourseId === course.id;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => {
                      onSelectCourse(isSelected ? 'all' : course.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all group cursor-pointer text-left ${
                      isSelected
                        ? 'bg-white text-[#1C1917] shadow-xs border border-[#E8E1D9]'
                        : 'hover:bg-white/80 text-[#57534E] hover:text-[#1C1917] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: course.color,
                          boxShadow: `0 0 0 3px ${course.color}20`,
                        }}
                      />
                      <span
                        className={`text-xs truncate ${
                          isSelected ? 'font-semibold text-stone-900' : 'font-medium group-hover:font-semibold'
                        }`}
                      >
                        {course.shortName || course.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#78716C] bg-stone-100 px-1.5 py-0.5 rounded tabular-nums shrink-0 ml-2">
                      {courseTaskCount} TP
                    </span>
                  </button>
                );
              })}

              {courses.length === 0 && (
                <p className="text-xs text-stone-400 px-3 py-2">
                  Aucune matière enregistrée.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pied de barre latérale : Progression globale + Sauvegarde locale */}
        <div className="pt-4 border-t border-[#E8E1D9] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C]">
            <span>Avancement global</span>
            <span className="font-semibold text-stone-800 tabular-nums">{globalProgressPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${globalProgressPct}%` }}
            />
          </div>
          <button
            type="button"
            onClick={onResetDemo}
            className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-[11px] font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Réinitialiser les données</span>
          </button>
        </div>
      </aside>
    </>
  );
}
