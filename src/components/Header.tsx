import React from 'react';
import { Calculator, BookOpen, Award, History, Volume2, VolumeX, Sparkles, Building2, Home } from 'lucide-react';
import { ApprenticeData } from '../types';

interface HeaderProps {
  apprentice: ApprenticeData | null;
  currentScreen?: string;
  onSelectActivity1?: () => void;
  onSelectActivity2?: () => void;
  onOpenGrammar: () => void;
  onOpenHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apprentice,
  currentScreen,
  onSelectActivity1,
  onSelectActivity2,
  onOpenGrammar,
  onOpenHistory,
  soundEnabled,
  onToggleSound,
  onGoHome,
}) => {
  const isAct1 = currentScreen === 'challenge' || currentScreen === 'results';
  const isAct2 = currentScreen === 'activity2' || currentScreen === 'activity2_results';

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div 
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="app-header-brand"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Calculator className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-300 bg-clip-text text-transparent">
                SENA Accounting English
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gestión Contable &amp; Demonstratives
            </p>
          </div>
        </div>

        {/* Activity Quick Switcher Tabs */}
        {(onSelectActivity1 || onSelectActivity2) && (
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              id="header-nav-activity1"
              onClick={onSelectActivity1}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                isAct1 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Activity 1 (Fotos 30)</span>
            </button>
            <button
              type="button"
              id="header-nav-activity2"
              onClick={onSelectActivity2}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                isAct2 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Activity 2 (Audio 20)</span>
            </button>
          </div>
        )}

        {/* Apprentice Tag & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {apprentice?.fullName && (
            <div className="hidden xl:flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-200 truncate max-w-[130px]">
                {apprentice.fullName}
              </span>
              <span className="text-slate-500 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">
                Ficha {apprentice.ficha}
              </span>
            </div>
          )}

          {/* Home / Main Menu Button */}
          {onGoHome && (
            <button
              id="btn-header-home"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition shadow-sm active:scale-95"
              title="Ir al Menú Principal"
            >
              <Home className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Menú</span>
            </button>
          )}

          {/* Grammar Cheatsheet Button */}
          <button
            id="btn-open-grammar"
            onClick={onOpenGrammar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition shadow-sm active:scale-95"
            title="Grammar Rules (THIS, THAT, THESE, THOSE)"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          {/* History Button */}
          <button
            id="btn-open-history"
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition shadow-sm active:scale-95"
            title="Database History & Records"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Historial</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

