import { FormEvent, useEffect, useState } from 'react';
import { BookPlus, Check, Trash2, X } from 'lucide-react';
import { Course, COURSE_COLOR_PALETTE } from '../types/studyflow';

interface CourseModalProps {
  isOpen: boolean;
  editingCourse: Course | null;
  onClose: () => void;
  onSave: (payload: {
    id?: string;
    name: string;
    code: string;
    teacher: string;
    color: string;
    colorName: string;
  }) => void;
  onDelete?: (courseId: string) => void;
}

export function CourseModal({
  isOpen,
  editingCourse,
  onClose,
  onSave,
  onDelete,
}: CourseModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teacher, setTeacher] = useState('');
  const [color, setColor] = useState('#F97316');
  const [colorName, setColorName] = useState('Orange');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editingCourse) {
      setName(editingCourse.name);
      setCode(editingCourse.code);
      setTeacher(editingCourse.teacher);
      setColor(editingCourse.color);
      setColorName(editingCourse.colorName);
    } else {
      setName('');
      setCode('');
      setTeacher('');
      setColor('#F97316');
      setColorName('Orange');
    }
    setConfirmDelete(false);
  }, [isOpen, editingCourse]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      id: editingCourse?.id,
      name: trimmed,
      code: code.trim() || 'UE GEN 101',
      teacher: teacher.trim() || 'Enseignant référent',
      color,
      colorName,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-modal-title"
    >
      <div
        className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xl max-w-lg w-full p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 id="course-modal-title" className="font-bold text-lg text-stone-900 tracking-tight">
                {editingCourse ? 'Modifier le cours' : 'Ajouter un nouveau cours'}
              </h3>
              <p className="text-xs text-stone-500">
                {editingCourse
                  ? 'Mettez à jour les informations de cette matière'
                  : "Créez un module d'enseignement pour votre semestre"}
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-stone-700" htmlFor="course-name-input">
              Intitulé du cours *
            </label>
            <input
              id="course-name-input"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Thermodynamique appliquée, Droit du numérique..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="course-code-input">
                Code UE / Référence
              </label>
              <input
                id="course-code-input"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ex: UE THERMO 402"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700" htmlFor="course-teacher-input">
                Enseignant référent
              </label>
              <input
                id="course-teacher-input"
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="ex: Prof. Dubois"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                Couleur d&apos;identification visuelle
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                {colorName} ({color})
              </span>
            </div>
            <div className="grid grid-cols-8 gap-2 p-2.5 bg-[#FBF8F3] rounded-xl border border-[#E8E1D9]">
              {COURSE_COLOR_PALETTE.map((option) => {
                const selected = color.toLowerCase() === option.hex.toLowerCase();
                return (
                  <button
                    key={option.hex}
                    type="button"
                    onClick={() => {
                      setColor(option.hex);
                      setColorName(option.name);
                    }}
                    title={option.name}
                    aria-label={option.name}
                    className={`flex items-center justify-center p-1.5 rounded-lg hover:scale-110 transition-transform cursor-pointer ${
                      selected ? 'ring-2 ring-orange-600 ring-offset-2 bg-white' : ''
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: option.hex }}
                    >
                      {selected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-stone-100 mt-1">
            <div>
              {editingCourse && onDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(editingCourse.id);
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
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                {editingCourse ? 'Mettre à jour' : 'Enregistrer le cours'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
