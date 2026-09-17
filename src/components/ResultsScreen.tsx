import React, { useState, useEffect } from 'react';
import { 
  Award, 
  RotateCcw, 
  Download, 
  CheckCircle2, 
  XCircle, 
  User, 
  BookOpen, 
  Hash, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building2,
  Calendar,
  Home,
  Flame,
  Languages
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttemptResult, AnswerRecord } from '../types';
import { downloadCertificatePdf } from '../utils/pdfGenerator';
import { playCelebrationSound } from '../utils/audio';

interface ResultsScreenProps {
  result: AttemptResult;
  answerRecords: AnswerRecord[];
  soundEnabled: boolean;
  onPlayAgain: () => void;
  onOpenHistory: () => void;
  onGoHome: () => void;
  onDownloadCertificate?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  answerRecords,
  soundEnabled,
  onPlayAgain,
  onOpenHistory,
  onGoHome,
  onDownloadCertificate,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti
    if (result.score >= 80 || (result.streakAchieved && result.streakAchieved >= 30)) {
      if (soundEnabled) {
        playCelebrationSound();
      }
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#8b5cf6'],
        });
      } catch {
        // Fallback
      }
    }
  }, [result.score, result.streakAchieved, soundEnabled]);

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      if (onDownloadCertificate) {
        await onDownloadCertificate();
      } else {
        await downloadCertificatePdf(result);
      }
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Performance category styling & label
  const getBadgeDetails = () => {
    if (result.streakAchieved && result.streakAchieved >= 30) {
      return {
        icon: '🏆',
        label: '¡RETO APROBADO! 30 FRASES IN A ROW',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        titleColor: 'text-emerald-400',
      };
    }

    switch (result.performanceCategory) {
      case 'excellent':
        return {
          icon: '🏆',
          label: 'Excellent performance (90–100)',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          titleColor: 'text-amber-400',
        };
      case 'very_good':
        return {
          icon: '⭐',
          label: 'Very good performance (80–89)',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          titleColor: 'text-emerald-400',
        };
      case 'good':
        return {
          icon: '👍',
          label: 'Good performance (70–79)',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          titleColor: 'text-blue-400',
        };
      case 'keep_practicing':
      default:
        return {
          icon: '📚',
          label: 'Keep practicing (0–69)',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          titleColor: 'text-rose-400',
        };
    }
  };

  const badge = getBadgeDetails();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-fadeIn" id="screen-results">
      {/* Title Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Reto Superado con Éxito
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
          ACCOUNTING DEMONSTRATIVES CHALLENGE COMPLETED!
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Has superado el desafío de <strong>30 frases seguidas ('in a row')</strong> con límite de 20s sobre <strong>THIS, THAT, THESE y THOSE</strong> aplicado a la gestión contable y financiera.
        </p>
      </div>

      {/* Main Results Dashboard Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Performance Classification Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{badge.icon}</span>
            <div>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${badge.badgeClass}`}>
                {badge.label}
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                {result.performanceLabel}
              </h2>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="text-xs text-slate-400 font-medium block">Puntuación Final</span>
            <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              {result.score} <span className="text-xl font-bold text-slate-400">/ 100</span>
            </span>
          </div>
        </div>

        {/* Apprentice Verification Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Aprendiz</span>
              <span className="font-extrabold text-white text-sm truncate block">{result.apprenticeName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Programa</span>
              <span className="font-medium text-slate-200 truncate block">{result.program}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Ficha SENA</span>
              <span className="font-mono font-bold text-amber-300 text-sm">{result.ficha}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">🔥 Racha 'In a row'</span>
            <span className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-amber-400" />
              {result.streakAchieved || 30} / 30
            </span>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">✅ Respuestas Correctas</span>
            <span className="text-xl font-black text-emerald-400">{result.correctAnswers}</span>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">⏱️ Límite por pregunta</span>
            <span className="text-xl font-black text-cyan-400">20 segundos</span>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3.5">
            <span className="text-xs text-slate-400 block mb-1">📊 Rendimiento</span>
            <span className="text-xl font-black text-emerald-400">{result.percentage}%</span>
          </div>
        </div>

        {/* Action Buttons: DOWNLOAD CERTIFICATE, PLAY AGAIN & MAIN MENU */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 border-t border-slate-800">
          {/* DOWNLOAD CERTIFICATE 📜 */}
          <button
            id="btn-download-certificate"
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
            <span>{downloading ? 'GENERANDO PDF CONSOLIDADO...' : 'DESCARGAR CERTIFICADO CONSOLIDADO 📜'}</span>
          </button>

          {/* TRY AGAIN 🔄 / PLAY AGAIN 🔄 */}
          <button
            id="btn-play-again"
            type="button"
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>NUEVO RETO 🔄</span>
          </button>

          {/* MAIN MENU BUTTON 🏠 */}
          <button
            id="btn-results-main-menu"
            type="button"
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-black text-sm sm:text-base uppercase tracking-wider border border-slate-700 shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5 text-emerald-400" />
            <span>MENÚ PRINCIPAL 🏠</span>
          </button>
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 flex items-center justify-center gap-2 animate-fadeIn">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>¡Certificado PDF generado y descargado con éxito! Archivo: <strong>Accounting_Demonstratives_{result.apprenticeName.replace(/\s+/g, '_')}.pdf</strong></span>
          </div>
        )}
      </div>

      {/* Accordion: Review Answers Detailed Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <button
          type="button"
          onClick={() => setShowReview(!showReview)}
          className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition"
        >
          <span className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Revisión detallada de tus respuestas del reto ({answerRecords.length} frases)
          </span>
          {showReview ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showReview && (
          <div className="p-6 border-t border-slate-800 space-y-4 bg-slate-900/60 max-h-[600px] overflow-y-auto">
            {answerRecords.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start gap-4 ${
                  rec.isCorrect
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-rose-950/20 border-rose-800/40'
                }`}
              >
                <img
                  src={rec.question.imageUrl}
                  alt={rec.question.objectName}
                  className="w-24 h-16 sm:w-28 sm:h-20 object-cover rounded-lg shrink-0 border border-slate-700"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-white text-sm">
                      Frase #{idx + 1}: {rec.question.completedSentence}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      rec.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {rec.isCorrect ? '✅ Acierto' : '❌ Error / Timeout'}
                    </span>
                  </div>

                  {/* Complete Spanish Translation */}
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                    <Languages className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Traducción a español: "{rec.question.translation}"</span>
                  </div>

                  <p className="text-slate-300">
                    Tu respuesta: <strong className={rec.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{rec.selectedAnswer}</strong>
                    {!rec.isCorrect && (
                      <span className="ml-2 text-slate-400">
                        (Correcta: <strong className="text-emerald-400">{rec.question.correctAnswer}</strong>)
                      </span>
                    )}
                  </p>
                  <p className="text-slate-400 italic">
                    {rec.question.explanationEn} — {rec.question.explanationEs}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
