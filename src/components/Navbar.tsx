import React from 'react';
import { Home, Globe, Settings as SettingsIcon, Plus, Building2 } from 'lucide-react';
import { ProjectSettings } from '../types';
import { translations } from '../utils/translations';
import { formatPKR } from '../utils/calculations';

interface NavbarProps {
  project: ProjectSettings;
  onOpenSettings: () => void;
  onQuickAdd: () => void;
  onToggleLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  onOpenSettings,
  onQuickAdd,
  onToggleLanguage,
}) => {
  const t = translations[project.language];
  const isUrdu = project.language === 'ur';

  return (
    <header className="sticky top-0 z-30 bg-[#143d2b] text-white shadow-md border-b border-[#0f2e20]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand & Project Name */}
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">
                {t.appName}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-emerald-800/80 text-emerald-200 rounded border border-emerald-700/50">
                {project.currency}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-200/80 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-emerald-300" />
              <span className="truncate">{project.name}</span>
              {project.location && (
                <span className="hidden md:inline text-emerald-300/60">• {project.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right actions: Language toggle, Quick Add, Settings */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Language Switcher Button */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-100 text-xs font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Toggle language between English and Urdu"
            title="Toggle English / Urdu"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Quick Add Expense Button (Desktop/Tablet) */}
          <button
            onClick={onQuickAdd}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-sm transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            aria-label={t.addExpense}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t.addExpense}</span>
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-200 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label={t.settings}
            title={t.settings}
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
