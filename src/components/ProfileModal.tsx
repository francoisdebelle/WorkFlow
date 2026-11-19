import { FormEvent, useEffect, useState } from 'react';
import { Download, RotateCcw, User, X } from 'lucide-react';
import { StudentProfile, StudyFlowDatabase } from '../types/studyflow';

interface ProfileModalProps {
  isOpen: boolean;
  database: StudyFlowDatabase;
  onClose: () => void;
  onSaveProfile: (profile: StudentProfile) => void;
  onResetDatabase: () => void;
}

export function ProfileModal({
  isOpen,
  database,
  onClose,
  onSaveProfile,
  onResetDatabase,
}: ProfileModalProps) {
  const [name, setName] = useState(database.profile.name);
  const [program, setProgram] = useState(database.profile.program);
  const [semesterLabel, setSemesterLabel] = useState(database.profile.semesterLabel);
  const [sessionLabel, setSessionLabel] = useState(database.profile.sessionLabel);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setName(database.profile.name);
    setProgram(database.profile.program);
    setSemesterLabel(database.profile.semesterLabel);
    setSessionLabel(database.profile.sessionLabel);
    setConfirmReset(false);
  }, [isOpen, database.profile]);

  if (!isOpen) return null;

  const computeInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'ET';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim() || 'Étudiant';
    onSaveProfile({
      ...database.profile,
      name: trimmedName,
      initials: computeInitials(trimmedName),
      program: program.trim() || "Sciences de l'Ingénieur",
      semesterLabel: semesterLabel.trim() || 'Bilan Semestre',
      sessionLabel: sessionLabel.trim() || 'Session en cours',
    });
    onClose();
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(database, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `studyflow-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className="bg-white rounded-2xl border border-[#E8E1D9] shadow-xl max-w-md w-full p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 id="profile-modal-title" className="font-bold text-lg text-stone-900">
                Profil &amp; Base locale
              </h3>
              <p className="text-xs text-stone-500">
                Sauvegarde automatique dans votre navigateur
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700" htmlFor="profile-name">
              Nom affiché
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-stone-700" htmlFor="profile-program">
              Filière / Formation
            </label>
            <input
              id="profile-program"
              type="text"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-700" htmlFor="profile-semester">
                Semestre
              </label>
              <input
                id="profile-semester"
                type="text"
                value={semesterLabel}
                onChange={(e) => setSemesterLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-stone-700" htmlFor="profile-session">
                Session
              </label>
              <input
                id="profile-session"
                type="text"
                value={sessionLabel}
                onChange={(e) => setSessionLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exporter JSON</span>
            </button>

            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onResetDatabase();
                    onClose();
                  }}
                  className="px-3 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 cursor-pointer"
                >
                  Confirmer RAZ
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser démo</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-sm cursor-pointer"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
