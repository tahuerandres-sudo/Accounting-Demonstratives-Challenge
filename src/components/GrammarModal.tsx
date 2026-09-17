import React from 'react';
import { X, CheckCircle, Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface GrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarModal: React.FC<GrammarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-white overflow-hidden max-h-[90vh] flex flex-col"
        id="modal-grammar-rules"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Demonstrative Pronouns Guide</h3>
              <p className="text-xs text-slate-400">Reglas gramaticales para el área contable y financiera</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Quick Matrix Overview */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Matriz de Decisión (Distance + Quantity)
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {/* THIS */}
              <div className="bg-blue-950/40 border border-blue-600/40 rounded-xl p-3.5 hover:border-blue-500 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-black text-blue-400 tracking-wider">🔵 THIS</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">
                    1 + Cerca
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1">
                  Singular + Near
                </div>
                <p className="text-xs text-slate-300 italic mb-2">
                  "This is a calculator."
                </p>
                <div className="text-[11px] text-blue-300/80 bg-blue-950/60 p-1.5 rounded border border-blue-800/40">
                  <span className="font-bold">Significado:</span> este / esta (en mis manos / sobre el escritorio cerca).
                </div>
              </div>

              {/* THAT */}
              <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl p-3.5 hover:border-emerald-500 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-black text-emerald-400 tracking-wider">🟢 THAT</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                    1 + Lejos
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1">
                  Singular + Far
                </div>
                <p className="text-xs text-slate-300 italic mb-2">
                  "That is a computer."
                </p>
                <div className="text-[11px] text-emerald-300/80 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/40">
                  <span className="font-bold">Significado:</span> ese / aquel / esa / aquella (al fondo de la oficina).
                </div>
              </div>

              {/* THESE */}
              <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-3.5 hover:border-amber-500 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-black text-amber-400 tracking-wider">🟠 THESE</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    Varios + Cerca
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1">
                  Plural + Near
                </div>
                <p className="text-xs text-slate-300 italic mb-2">
                  "These are invoices."
                </p>
                <div className="text-[11px] text-amber-300/80 bg-amber-950/60 p-1.5 rounded border border-amber-800/40">
                  <span className="font-bold">Significado:</span> estos / estas (varios objetos cerca de ti).
                </div>
              </div>

              {/* THOSE */}
              <div className="bg-purple-950/40 border border-purple-600/40 rounded-xl p-3.5 hover:border-purple-500 transition">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-base font-black text-purple-400 tracking-wider">🟣 THOSE</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                    Varios + Lejos
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mb-1">
                  Plural + Far
                </div>
                <p className="text-xs text-slate-300 italic mb-2">
                  "Those are folders."
                </p>
                <div className="text-[11px] text-purple-300/80 bg-purple-950/60 p-1.5 rounded border border-purple-800/40">
                  <span className="font-bold">Significado:</span> esos / aquellos / esas / aquellas (en la estantería lejana).
                </div>
              </div>
            </div>
          </div>

          {/* Verb Clue (is vs are) */}
          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" /> Pistas gramaticales clave en el reto:
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Si la oración usa "is" (singular):</strong> la respuesta solo puede ser <strong className="text-blue-400">THIS</strong> (cerca) o <strong className="text-emerald-400">THAT</strong> (lejos).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Si la oración usa "are" (plural):</strong> la respuesta solo puede ser <strong className="text-amber-400">THESE</strong> (cerca) o <strong className="text-purple-400">THOSE</strong> (lejos).
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md active:scale-95"
          >
            Entendido / Got It! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
