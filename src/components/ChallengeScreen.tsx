import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award, 
  RotateCcw,
  Sparkles,
  Info,
  Languages,
  Clock,
  Flame,
  Home,
  AlertTriangle
} from 'lucide-react';
import { Question, Demonstrative, AnswerRecord } from '../types';
import { playSuccessSound, playErrorSound } from '../utils/audio';

interface ChallengeScreenProps {
  currentQuestion: Question;
  streak: number;
  targetStreak: number;
  totalAnswered: number;
  soundEnabled: boolean;
  onAnswer: (question: Question, selected: Demonstrative | 'TIMEOUT', isCorrect: boolean) => void;
  onNext: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  onOpenGrammar: () => void;
}

export const ChallengeScreen: React.FC<ChallengeScreenProps> = ({
  currentQuestion,
  streak,
  targetStreak,
  totalAnswered,
  soundEnabled,
  onAnswer,
  onNext,
  onRestart,
  onGoHome,
  onOpenGrammar,
}) => {
  const [selectedOption, setSelectedOption] = useState<Demonstrative | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);

  // Timer reference to clear accurately
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset question state & start 20s countdown when question changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(null);
    setIsTimeout(false);
    setTimeLeft(20);

    // Start 20s interval
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion.id]);

  const handleTimeOut = () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setIsTimeout(true);
    setIsCorrect(false);

    if (soundEnabled) {
      playErrorSound();
    }

    onAnswer(currentQuestion, 'TIMEOUT', false);
  };

  const handleSelect = (option: Demonstrative) => {
    if (hasAnswered) return; // Prevent double answering

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const correct = option === currentQuestion.correctAnswer;
    setSelectedOption(option);
    setHasAnswered(true);
    setIsCorrect(correct);
    setIsTimeout(false);

    if (soundEnabled) {
      if (correct) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    }

    onAnswer(currentQuestion, option, correct);
  };

  // Replace blank with selected word or active placeholder
  const renderSentence = () => {
    const parts = currentQuestion.sentenceWithBlank.split('_____');
    let displayWord = '_____';

    if (hasAnswered) {
      if (isTimeout) {
        displayWord = 'TIMEOUT';
      } else if (selectedOption) {
        displayWord = selectedOption;
      }
    }

    let wordColorClass = 'text-amber-400 font-black underline decoration-2 underline-offset-4';
    if (hasAnswered) {
      wordColorClass = isCorrect 
        ? 'text-emerald-400 font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shadow-sm' 
        : 'text-rose-400 font-black px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 line-through shadow-sm';
    }

    return (
      <div className="space-y-3">
        <span className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white inline-flex items-center flex-wrap justify-center gap-2">
          {parts[0]}
          <span className={wordColorClass} id="question-active-word">
            {displayWord}
          </span>
          {parts[1]}
        </span>

        {/* PROMINENT COMPLETE SPANISH TRANSLATION */}
        <div className="pt-2 border-t border-slate-700/60 flex flex-col items-center justify-center gap-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>Traducción completa a español:</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1 rounded-xl shadow-inner text-center">
            "{currentQuestion.translation}"
          </p>
        </div>
      </div>
    );
  };

  const streakPercent = Math.min(Math.round((streak / targetStreak) * 100), 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn" id="screen-challenge">
      {/* Top HUD: Persistent Status & Streak Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl shadow-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Streak Tracker & Goal */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-sm sm:text-base">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Racha: <strong>{streak}</strong> / {targetStreak} in a row</span>
            </div>
            <span className="text-xs text-slate-400 hidden md:inline">
              (Meta: 30 frases seguidas)
            </span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-medium" title="Tu racha y respuestas se guardan automáticamente">
              <span>Guardado ✓</span>
            </div>
          </div>

          {/* Quick Actions & Menu Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-nav-main-menu"
              type="button"
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition cursor-pointer shadow-sm active:scale-95"
              title="Volver al Menú Principal"
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <span>Menú Principal</span>
            </button>

            <button
              id="btn-nav-grammar"
              type="button"
              onClick={onOpenGrammar}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Reglas</span>
            </button>
          </div>
        </div>

        {/* Streak Progress Bar towards 30 in a row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Progreso hacia la meta de 30 in a row:</span>
            <span className="font-mono text-emerald-400 font-bold">{streakPercent}% ({streak}/30)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${streakPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Realistic Photograph Stage (Clean without overlays) */}
        <div className="relative w-full aspect-video sm:aspect-[21/9] max-h-[360px] bg-slate-950 overflow-hidden group">
          <img
            src={currentQuestion.imageUrl}
            alt={currentQuestion.objectName}
            className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>

        {/* Challenge Interactive Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* The Sentence with Blank + Full Spanish Translation */}
          <div className="text-center py-5 px-4 bg-slate-800/50 border border-slate-700/70 rounded-2xl shadow-inner">
            {renderSentence()}
          </div>

          {/* ⏱️ 20-SECOND COUNTDOWN TIMER DIRECTLY BELOW QUESTION */}
          <div 
            className={`rounded-2xl p-4 border transition-all duration-300 ${
              hasAnswered 
                ? 'bg-slate-800/30 border-slate-700/40 opacity-70' 
                : timeLeft <= 5
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50'
                : timeLeft <= 10
                ? 'bg-amber-950/30 border-amber-500/50'
                : 'bg-slate-800/50 border-slate-700/70'
            }`}
            id="timer-container"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Clock className={`w-4 h-4 ${
                  hasAnswered 
                    ? 'text-slate-400' 
                    : timeLeft <= 5 
                    ? 'text-rose-400 animate-spin' 
                    : timeLeft <= 10
                    ? 'text-amber-400' 
                    : 'text-emerald-400'
                }`} />
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                  Límite de tiempo: <strong>20 segundos</strong>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`font-mono text-sm sm:text-base font-black px-3 py-0.5 rounded-full border ${
                  hasAnswered
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : timeLeft <= 5
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : timeLeft <= 10
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  ⏱️ {timeLeft}s restantes
                </span>
              </div>
            </div>

            {/* Timer visual shrinking bar */}
            <div className="w-full bg-slate-900/90 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/40">
              <div 
                className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${
                  hasAnswered
                    ? 'bg-slate-600'
                    : timeLeft <= 5
                    ? 'bg-rose-500'
                    : timeLeft <= 10
                    ? 'bg-amber-500'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 Interactive Demonstrative Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" id="demonstrative-buttons-grid">
            {/* 🔵 THIS */}
            <button
              id="btn-choice-THIS"
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect('THIS')}
              className={`py-4 px-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer ${
                selectedOption === 'THIS'
                  ? 'bg-blue-600 border-blue-400 text-white scale-102 ring-4 ring-blue-500/30'
                  : hasAnswered && currentQuestion.correctAnswer === 'THIS'
                  ? 'bg-blue-900/60 border-blue-400 text-blue-200 ring-2 ring-blue-400 animate-pulse'
                  : hasAnswered
                  ? 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800/90 border-blue-500/40 hover:border-blue-400 hover:bg-blue-950/50 text-blue-300 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <span>THIS</span>
              </div>
              <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">
                Singular • Near
              </span>
            </button>

            {/* 🟢 THAT */}
            <button
              id="btn-choice-THAT"
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect('THAT')}
              className={`py-4 px-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer ${
                selectedOption === 'THAT'
                  ? 'bg-emerald-600 border-emerald-400 text-white scale-102 ring-4 ring-emerald-500/30'
                  : hasAnswered && currentQuestion.correctAnswer === 'THAT'
                  ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400 animate-pulse'
                  : hasAnswered
                  ? 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800/90 border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/50 text-emerald-300 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>THAT</span>
              </div>
              <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">
                Singular • Far
              </span>
            </button>

            {/* 🟠 THESE */}
            <button
              id="btn-choice-THESE"
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect('THESE')}
              className={`py-4 px-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer ${
                selectedOption === 'THESE'
                  ? 'bg-amber-600 border-amber-400 text-white scale-102 ring-4 ring-amber-500/30'
                  : hasAnswered && currentQuestion.correctAnswer === 'THESE'
                  ? 'bg-amber-900/60 border-amber-400 text-amber-200 ring-2 ring-amber-400 animate-pulse'
                  : hasAnswered
                  ? 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800/90 border-amber-500/40 hover:border-amber-400 hover:bg-amber-950/50 text-amber-300 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>THESE</span>
              </div>
              <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">
                Plural • Near
              </span>
            </button>

            {/* 🟣 THOSE */}
            <button
              id="btn-choice-THOSE"
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect('THOSE')}
              className={`py-4 px-3 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer ${
                selectedOption === 'THOSE'
                  ? 'bg-purple-600 border-purple-400 text-white scale-102 ring-4 ring-purple-500/30'
                  : hasAnswered && currentQuestion.correctAnswer === 'THOSE'
                  ? 'bg-purple-900/60 border-purple-400 text-purple-200 ring-2 ring-purple-400 animate-pulse'
                  : hasAnswered
                  ? 'bg-slate-800/50 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-slate-800/90 border-purple-500/40 hover:border-purple-400 hover:bg-purple-950/50 text-purple-300 hover:text-white active:scale-95'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span>THOSE</span>
              </div>
              <span className="text-[10px] font-normal uppercase tracking-wider opacity-80">
                Plural • Far
              </span>
            </button>
          </div>

          {/* Immediate Feedback Card */}
          {hasAnswered && (
            <div 
              className={`rounded-2xl p-5 sm:p-6 border transition-all duration-300 animate-fadeIn ${
                isCorrect
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/60 text-rose-200'
              }`}
              id="feedback-card"
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                          <span className="text-lg font-black text-emerald-400 tracking-wide">
                            CORRECT! ✅ Racha: {streak} / {targetStreak} in a row 🔥
                          </span>
                        </>
                      ) : isTimeout ? (
                        <>
                          <Clock className="w-6 h-6 text-rose-400 shrink-0" />
                          <span className="text-lg font-black text-rose-400 tracking-wide">
                            ¡TIEMPO AGOTADO! ⏱️ (Límite de 20s superado)
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                          <span className="text-lg font-black text-rose-400 tracking-wide">
                            INCORRECT! ❌ Racha Interrumpida
                          </span>
                        </>
                      )}
                    </div>

                    {/* Explanations & Translations */}
                    <div className="text-sm space-y-1.5 pl-8">
                      {!isCorrect && (
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-rose-500/40 text-xs text-rose-300 space-y-1">
                          <p className="font-extrabold text-white text-sm">
                            Respuesta correcta: <span className="underline text-amber-300 font-mono text-base">{currentQuestion.correctAnswer}</span>
                          </p>
                          <p className="font-medium text-slate-300">
                            Frase completa: <strong>{currentQuestion.completedSentence}</strong>
                          </p>
                          <p className="text-emerald-400 font-semibold">
                            Traducción completa: "{currentQuestion.translation}"
                          </p>
                        </div>
                      )}

                      <p className="text-slate-200 font-medium">
                        "{currentQuestion.explanationEn}"
                      </p>
                      <p className="text-xs text-slate-300 font-medium">
                        💡 {currentQuestion.explanationEs}
                      </p>

                      {!isCorrect && (
                        <p className="text-xs text-amber-300/90 font-bold pt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          Regla: Para aprobar debes lograr 30 frases in a row sin fallar. Se reiniciará con frases diferentes de nuestro banco de 100.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Next Question if correct OR Restart / Home if incorrect */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                    {isCorrect ? (
                      <button
                        id="btn-next-question"
                        type="button"
                        onClick={onNext}
                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>
                          {streak >= targetStreak 
                            ? '¡30 IN A ROW! VER CERTIFICADO 🏆' 
                            : 'SIGUIENTE FRASE ➡️'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {/* Restart Challenge with new phrases */}
                        <button
                          id="btn-restart-challenge"
                          type="button"
                          onClick={onRestart}
                          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>VOLVER A EMPEZAR 🔄</span>
                        </button>

                        {/* Return to Main Menu */}
                        <button
                          id="btn-feedback-main-menu"
                          type="button"
                          onClick={onGoHome}
                          className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-700 transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-emerald-400" />
                          <span>MENÚ PRINCIPAL 🏠</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grammar & Help Bar */}
          {!hasAnswered && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                Tienes 20 segundos por frase. Responde 30 consecutivas sin fallar para aprobar.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenGrammar}
                  className="text-emerald-400 hover:underline font-medium"
                >
                  ¿Dudas con la regla? Ver tabla
                </button>
                <button
                  type="button"
                  onClick={onGoHome}
                  className="text-slate-400 hover:text-white underline font-medium"
                >
                  Salir al Menú Principal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
