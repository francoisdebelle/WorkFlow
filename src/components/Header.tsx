import { useEffect, useRef } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { StudentProfile } from '../types/studyflow';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  profile: StudentProfile;
  onOpenMobileMenu: () => void;
  onOpenProfileModal: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  profile,
  onOpenMobileMenu,
  onOpenProfileModal,
}: HeaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#FBF8F3]/90 backdrop-blur-md z-30 px-4 sm:px-8 flex items-center justify-between border-b border-[#E8E1D9] gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Ouvrir la navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Champ de recherche interactif avec raccourci Cmd+K */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100/90 border border-stone-200/80 w-full max-w-sm text-stone-500 focus-within:text-stone-800 focus-within:bg-white focus-within:border-orange-300 focus-within:shadow-sm transition-all">
          <Search className="w-4 h-4 shrink-0" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher cours, TP, livrable..."
            type="text"
            aria-label="Rechercher cours, TP ou livrable"
            className="bg-transparent border-0 outline-none w-full text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 font-normal"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-0.5 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-white text-stone-500 border border-stone-200 shrink-0">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Profil Étudiant cliquable */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:block h-6 w-[1px] bg-[#E8E1D9] mx-1" />
        <button
          type="button"
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          title="Paramètres du profil et sauvegarde locale"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {profile.initials}
          </div>
          <div className="hidden md:flex flex-col leading-tight">
            <span className="font-semibold text-xs text-stone-900 whitespace-nowrap">
              {profile.name}
            </span>
            <span className="text-[11px] text-stone-500 whitespace-nowrap">
              {profile.program}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
