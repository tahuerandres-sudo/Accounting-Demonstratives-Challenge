import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Volume2, 
  VolumeX, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Headphones,
  Calendar,
  Layers
} from 'lucide-react';
import { Activity2Result, ApprenticeData } from '../types';
import { downloadAnyCertificatePdf } from '../utils/pdfGenerator';
import { speakSentence } from '../utils/speech';

interface Activity2ResultsScreenProps {
  result: Activity2Result;
  apprentice: ApprenticeData | null;
  soundEnabled: boolean;
  onRestartActivity2: () => void;
  onGoToActivity1: () => void;
  onGoHome: () => void;
  onDownloadCertificate?: () => void;
}

export const Activity2ResultsScreen: React.FC<Activity2ResultsScreenProps> = ({
  result,
  apprentice,
  soundEnabled,
  onRestartActivity2,
  onGoToActivity1,
  onGoHome,
  onDownloadCertificate,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(null);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Play audio for specific sentence in review
  const handlePlaySentenceAudio = (text: string, idx: number) => {
    if (!soundEnabled) return;
    setPlayingSentenceIdx(idx);
    speakSentence(text, {
      rate: 0.9,
      onEnd: () => setPlayingSentenceIdx(null),
      onError: () => setPlayingSentenceIdx(null),
    });
  };

  // Generate and download Consolidated PDF Certificate
  const handleDownloadCertificate = async () => {
    try {
      setIsGeneratingPdf(true);
      if (onDownloadCertificate) {
        await onDownloadCertificate();
      } else {
        await downloadAnyCertificatePdf(result);
      }
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      alert('Error generando el certificado en PDF. Por favor reintenta.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn space-y-8" id="screen-activity2-results">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900/50 via-slate-900 to-teal-900/50 border border-cyan-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center sm:text-left">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Activity 2 Completed • 20 Sentences
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              ¡Felicitaciones, {result.apprenticeName}! 🎓
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Has completado con éxito la actividad de comprensión auditiva y construcción de <strong>20 frases contables</strong> en inglés con pronombres demostrativos.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <strong>Programa:</strong> {result.program}
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <strong>Ficha:</strong> {result.ficha}
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                <Calendar className="w-3 h-3 text-cyan-400" /> {result.date}
              </span>
            </div>
          </div>

          {/* Big Score Badge */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-xl text-center min-w-[180px] shrink-0">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              {result.score}/{result.totalSentences}
            </div>
            <div className="text-xs uppercase font-bold text-cyan-300 tracking-wider mt-1">
              Frases Completadas
            </div>
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Precisión inicial: {result.percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Certificate, Restart, Switch Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Certificate Button */}
        <button
          id="btn-download-pdf-cert-act2"
          type="button"
          onClick={handleDownloadCertificate}
          disabled={isGeneratingPdf}
          className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>{isGeneratingPdf ? 'Generando PDF Consolidado...' : 'Descargar Certificado Consolidado 📜'}</span>
        </button>

        {/* Restart Activity 2 */}
        <button
          id="btn-restart-activity2"
          type="button"
          onClick={onRestartActivity2}
          className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Practicar Activity 2 de Nuevo</span>
        </button>

        {/* Switch to Activity 1 */}
        <button
          id="btn-switch-to-act1"
          type="button"
          onClick={onGoToActivity1}
          className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <Layers className="w-4 h-4 text-emerald-300" />
          <span>Ir a Activity 1 (Reto de Fotos)</span>
        </button>
      </div>

      {/* Review Section: All 20 Sentences with Audio Replay */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Headphones className="w-5 h-5 text-cyan-400" />
              Revisión Auditiva y Gramatical de las 20 Frases
            </h2>
            <p className="text-xs text-slate-400">
              Escucha cualquier frase nuevamente para perfeccionar tu comprensión auditiva y pronunciación contable.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {result.firstTryCount} resueltas al primer intento
          </span>
        </div>

        <div className="space-y-3">
          {result.details.map((item, idx) => {
            const isPlaying = playingSentenceIdx === idx;
            const isExpanded = expandedRow === idx;

            return (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Index & Audio button */}
                    <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                      <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                        {item.order}
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlaySentenceAudio(item.sentence, idx)}
                        disabled={isPlaying}
                        className={`p-2 rounded-lg border transition ${
                          isPlaying 
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                            : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border-slate-700'
                        }`}
                        title="Escuchar audio de esta frase"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sentence Content */}
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                          {item.demonstrative}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {item.accountingTopic}
                        </span>
                        {item.solvedOnFirstTry ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Primer intento
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400">
                            {item.attemptsCount} intentos
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-white leading-relaxed">
                        {item.sentence}
                      </p>

                      <p className="text-xs text-slate-300">
                        {item.translation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Back to Home */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onGoHome}
          className="text-xs text-slate-400 hover:text-white underline font-semibold transition"
        >
          Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};
