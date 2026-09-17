import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Lightbulb, 
  HelpCircle, 
  Sparkles, 
  BookOpen, 
  Check, 
  Play, 
  Award,
  FastForward,
  Headphones,
  Undo2,
  Trash2
} from 'lucide-react';
import { 
  Activity2Sentence, 
  WordToken, 
  getScrambledTokens, 
  normalizeSentence,
  ACTIVITY_2_SENTENCES
} from '../data/activity2Sentences';
import { Activity2SentenceRecord } from '../types';
import { speakSentence, stopSpeaking } from '../utils/speech';
import { playSuccessSound, playErrorSound, playCelebrationSound } from '../utils/audio';

interface Activity2ScreenProps {
  soundEnabled: boolean;
  initialIndex?: number;
  initialRecords?: Activity2SentenceRecord[];
  onProgressUpdate?: (index: number, records: Activity2SentenceRecord[]) => void;
  onComplete: (records: Activity2SentenceRecord[]) => void;
  onGoHome: () => void;
  onOpenGrammar: () => void;
  onRestartActivity?: () => void;
}

export const Activity2Screen: React.FC<Activity2ScreenProps> = ({
  soundEnabled,
  initialIndex = 0,
  initialRecords = [],
  onProgressUpdate,
  onComplete,
  onGoHome,
  onOpenGrammar,
  onRestartActivity,
}) => {
  // Current sentence index (0 to 19)
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = ACTIVITY_2_SENTENCES[currentIndex] || ACTIVITY_2_SENTENCES[0];

  // Scrambled pool & user assembled words
  const [availableWords, setAvailableWords] = useState<WordToken[]>([]);
  const [assembledWords, setAssembledWords] = useState<WordToken[]>([]);

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState<0.8 | 1.0>(0.9 as any);
  const [autoPlayOnNext, setAutoPlayOnNext] = useState(true);

  // Evaluation & Feedback State
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Accumulated progress history for final evaluation
  const [completedRecords, setCompletedRecords] = useState<Activity2SentenceRecord[]>(initialRecords);

  // Synchronize when initialIndex changes externally (e.g. state reset or loaded from storage)
  useEffect(() => {
    if (initialIndex !== currentIndex && initialIndex < ACTIVITY_2_SENTENCES.length) {
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex]);

  useEffect(() => {
    if (initialRecords.length > 0 && completedRecords.length === 0) {
      setCompletedRecords(initialRecords);
    }
  }, [initialRecords]);


  // Initialize words whenever currentItem changes
  useEffect(() => {
    const scrambled = getScrambledTokens(currentItem);
    setAvailableWords(scrambled);
    setAssembledWords([]);
    setIsEvaluated(false);
    setIsCorrect(false);
    setAttemptsOnCurrent(0);
    setShowHint(false);
    setShakeError(false);

    // Auto-play sentence speech
    if (autoPlayOnNext && soundEnabled) {
      const timer = setTimeout(() => {
        handlePlayAudio(speechRate);
      }, 400);
      return () => clearTimeout(timer);
    }
    return () => {
      stopSpeaking();
    };
  }, [currentIndex]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Play sentence using Web Speech API
  const handlePlayAudio = (rate: number = speechRate) => {
    if (!soundEnabled) return;
    setIsPlayingAudio(true);
    speakSentence(currentItem.sentence, {
      rate,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  // Add word from available to assembled
  const handleSelectWord = (token: WordToken) => {
    if (isCorrect) return; // Locked once verified correct
    setAvailableWords((prev) => prev.filter((w) => w.id !== token.id));
    setAssembledWords((prev) => [...prev, token]);
    if (shakeError) setShakeError(false);
  };

  // Remove word from assembled back to available
  const handleRemoveWord = (token: WordToken) => {
    if (isCorrect) return; // Locked once verified correct
    setAssembledWords((prev) => prev.filter((w) => w.id !== token.id));
    setAvailableWords((prev) => [...prev, token]);
    if (shakeError) setShakeError(false);
  };

  // Reset current assembled line
  const handleResetWords = () => {
    if (isCorrect) return;
    const scrambled = getScrambledTokens(currentItem);
    setAvailableWords(scrambled);
    setAssembledWords([]);
    setShakeError(false);
  };

  // Verify assembled sentence against target
  const handleCheckSentence = () => {
    if (assembledWords.length === 0) return;

    const userText = assembledWords.map((w) => w.text).join(' ');
    const normalizedUser = normalizeSentence(userText);
    const normalizedTarget = normalizeSentence(currentItem.sentence);

    const matches = normalizedUser === normalizedTarget;
    const newAttemptCount = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(newAttemptCount);
    setIsEvaluated(true);

    if (matches) {
      setIsCorrect(true);
      if (soundEnabled) {
        playSuccessSound();
      }

      // Record result
      const record: Activity2SentenceRecord = {
        order: currentItem.order,
        sentence: currentItem.sentence,
        translation: currentItem.translation,
        demonstrative: currentItem.demonstrative,
        accountingTopic: currentItem.accountingTopic,
        attemptsCount: newAttemptCount,
        solvedOnFirstTry: newAttemptCount === 1,
        userAssembledSentence: userText,
      };

      const updatedRecords = [...completedRecords, record];
      setCompletedRecords(updatedRecords);
      onProgressUpdate?.(currentIndex, updatedRecords);
    } else {
      setIsCorrect(false);
      setShakeError(true);
      if (soundEnabled) {
        playErrorSound();
      }
      setTimeout(() => setShakeError(false), 600);
    }
  };

  // Move to next sentence or finish activity
  const handleNext = () => {
    if (currentIndex + 1 < ACTIVITY_2_SENTENCES.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      onProgressUpdate?.(nextIndex, completedRecords);
    } else {
      // Activity 2 completed!
      if (soundEnabled) {
        playCelebrationSound();
      }
      onComplete(completedRecords);
    }
  };

  const progressPercent = Math.round(((currentIndex + (isCorrect ? 1 : 0)) / ACTIVITY_2_SENTENCES.length) * 100);
  const firstTrySuccessCount = completedRecords.filter((r) => r.solvedOnFirstTry).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center animate-fadeIn" id="screen-activity2">
      {/* Top Header & Progress Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" /> Activity 2 • Listening &amp; Sentence Builder
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline-block">
              {currentItem.accountingTopic}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
            {/* Auto-saved indicator */}
            <div className="hidden md:flex items-center gap-1.5 text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full text-[11px] font-medium" title="Tu avance se guarda automáticamente si sales de la app">
              <Check className="w-3 h-3" />
              <span>Avance guardado</span>
            </div>

            {onRestartActivity && (
              <button
                type="button"
                onClick={onRestartActivity}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-full transition"
                title="Reiniciar esta actividad desde la frase 1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reiniciar</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">First-Try:</span>
              <span className="text-amber-300 font-bold">{firstTrySuccessCount}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
              <span className="text-slate-400">Frase:</span>
              <span className="text-emerald-400 font-bold">{currentIndex + 1} / {ACTIVITY_2_SENTENCES.length}</span>
            </div>
          </div>
        </div>


        {/* Progress bar */}
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Activity Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-950/60 backdrop-blur-sm space-y-6">
        
        {/* Audio Player & Speed Section */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Big Primary Listen Button */}
            <button
              id="btn-play-sentence-audio"
              type="button"
              onClick={() => handlePlayAudio()}
              disabled={isPlayingAudio}
              className={`flex-1 sm:flex-initial py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                isPlayingAudio 
                  ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30 ring-2 ring-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 shadow-cyan-500/20 hover:-translate-y-0.5'
              }`}
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
              <span>{isPlayingAudio ? 'Escuchando audio...' : 'Escuchar Frase (Audio)'}</span>
            </button>

            {/* Slow speed toggle */}
            <button
              type="button"
              id="btn-toggle-slow-audio"
              onClick={() => {
                const nextRate = speechRate === 1.0 ? 0.75 : 1.0;
                setSpeechRate(nextRate as any);
                handlePlayAudio(nextRate);
              }}
              className="px-3.5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
              title="Alternar velocidad normal / más lenta"
            >
              <FastForward className="w-4 h-4 text-cyan-400" />
              <span>{speechRate === 1.0 ? '1.0x Normal' : '0.75x Lenta'}</span>
            </button>
          </div>

          {/* Sound wave visualizer bars */}
          <div className="flex items-center gap-1.5 h-6">
            <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 ${isPlayingAudio ? 'h-6 animate-pulse' : 'h-2 opacity-40'}`} />
            <span className={`w-1 bg-teal-400 rounded-full transition-all duration-300 delay-75 ${isPlayingAudio ? 'h-4 animate-pulse' : 'h-1.5 opacity-40'}`} />
            <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-300 delay-150 ${isPlayingAudio ? 'h-6 animate-pulse' : 'h-3 opacity-40'}`} />
            <span className={`w-1 bg-cyan-400 rounded-full transition-all duration-300 delay-100 ${isPlayingAudio ? 'h-5 animate-pulse' : 'h-2 opacity-40'}`} />
            <span className={`w-1 bg-teal-300 rounded-full transition-all duration-300 delay-200 ${isPlayingAudio ? 'h-3 animate-pulse' : 'h-1.5 opacity-40'}`} />
            <span className="text-[11px] text-slate-400 ml-2 font-mono">
              {isPlayingAudio ? 'Speaking...' : 'Haz clic para escuchar'}
            </span>
          </div>
        </div>

        {/* Instructions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Escucha el audio y selecciona las palabras en el orden correcto para formar la frase contable.</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGrammar}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" /> Reglas de demostrativos
            </button>
          </div>
        </div>

        {/* Workspace: User Assembled Sentence Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Tu Frase Armada (Your Assembled Sentence)
            </span>
            {assembledWords.length > 0 && !isCorrect && (
              <button
                type="button"
                onClick={handleResetWords}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px] font-normal transition"
              >
                <Trash2 className="w-3 h-3" /> Limpiar todo
              </button>
            )}
          </div>

          <div 
            className={`min-h-[90px] p-4 rounded-xl border-2 transition-all flex flex-wrap items-center gap-2.5 ${
              isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                : shakeError
                ? 'bg-rose-950/20 border-rose-500/70 animate-shake'
                : assembledWords.length > 0
                ? 'bg-slate-950/90 border-cyan-500/40 shadow-inner'
                : 'bg-slate-950/50 border-dashed border-slate-700/80'
            }`}
          >
            {assembledWords.length === 0 ? (
              <p className="text-slate-500 text-sm italic w-full text-center py-4 select-none">
                Toca las palabras de abajo en el orden que escuchas en el audio...
              </p>
            ) : (
              assembledWords.map((token, idx) => {
                const isDemonstrativeWord = ['this', 'that', 'these', 'those'].includes(token.cleanText);
                return (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => handleRemoveWord(token)}
                    disabled={isCorrect}
                    className={`group px-3.5 py-2 rounded-xl text-sm font-semibold transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer ${
                      isCorrect
                        ? isDemonstrativeWord
                          ? 'bg-emerald-500 text-slate-950 font-extrabold ring-2 ring-emerald-300'
                          : 'bg-emerald-900/60 text-emerald-100 border border-emerald-500/40'
                        : isDemonstrativeWord
                        ? 'bg-cyan-500 text-slate-950 font-bold hover:bg-rose-500 hover:text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 hover:border-rose-500/60 hover:bg-slate-700'
                    }`}
                    title={isCorrect ? undefined : 'Haz clic para quitar esta palabra'}
                  >
                    <span>{token.text}</span>
                    {!isCorrect && (
                      <span className="text-xs opacity-60 group-hover:opacity-100 text-slate-400 group-hover:text-rose-200">
                        ×
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Word Bank: Scrambled Words in Disorder */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Palabras en Desorden (Click para agregar)
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              {availableWords.length} restantes
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 min-h-[90px] flex flex-wrap items-center gap-2.5">
            {availableWords.length === 0 ? (
              <p className="text-slate-500 text-xs italic w-full text-center py-3 select-none">
                Todas las palabras han sido colocadas en la frase. ¡Haz clic en <strong>Comprobar Frase</strong>!
              </p>
            ) : (
              availableWords.map((token) => {
                const isDemonstrative = ['this', 'that', 'these', 'those'].includes(token.cleanText);
                return (
                  <button
                    key={token.id}
                    type="button"
                    onClick={() => handleSelectWord(token)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:-translate-y-0.5 active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer ${
                      isDemonstrative
                        ? 'bg-cyan-950/80 hover:bg-cyan-900 border-2 border-cyan-500/60 text-cyan-200 font-bold hover:shadow-cyan-500/20'
                        : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <span>{token.text}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Feedback Section (Shown when checked) */}
        {isEvaluated && (
          <div className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
            isCorrect 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100 shadow-xl shadow-emerald-950/40' 
              : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
          }`}>
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl shrink-0 ${isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base sm:text-lg">
                    {isCorrect ? '¡Excelente! Frase armada correctamente 🎉' : 'Orden incorrecto. ¡Escucha de nuevo y corrige!'}
                  </h4>
                  {isCorrect && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                      {attemptsOnCurrent === 1 ? '⭐ Resuelto al primer intento' : `Intentos: ${attemptsOnCurrent}`}
                    </span>
                  )}
                </div>

                {/* Full English sentence & Spanish translation */}
                {isCorrect && (
                  <div className="space-y-2 pt-1 border-t border-emerald-500/20">
                    <div>
                      <p className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Frase en inglés:</p>
                      <p className="text-base font-bold text-white">{currentItem.sentence}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Traducción al español:</p>
                      <p className="text-sm text-slate-200">{currentItem.translation}</p>
                    </div>

                    {/* Phonetic transcription & Grammar note */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-emerald-500/20">
                        <span className="font-bold text-amber-300 block mb-0.5">Pronunciación / Fonética:</span>
                        <span className="font-mono text-slate-300">{currentItem.phonetics}</span>
                      </div>

                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-emerald-500/20">
                        <span className="font-bold text-cyan-300 block mb-0.5">Uso de {currentItem.demonstrative}:</span>
                        <span className="text-slate-300">{currentItem.grammarNote}</span>
                      </div>
                    </div>

                    {/* Accounting terms */}
                    {currentItem.vocabularyNotes && currentItem.vocabularyNotes.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs text-slate-400 font-semibold">Términos Contables Clave:</span>
                        {currentItem.vocabularyNotes.map((v, i) => (
                          <span key={i} className="text-xs bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-300">
                            <strong className="text-emerald-300">{v.term}:</strong> {v.meaning}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isCorrect && (
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>
                      Revisa el orden de las palabras. Puedes hacer clic en cualquier palabra de arriba para devolverla y reordenarla.
                    </p>
                    {showHint ? (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-amber-500/30 text-amber-200">
                        <strong>Pista:</strong> La frase inicia con el pronombre demostrativo <strong>"{currentItem.tokens[0]}"</strong> y tiene en total <strong>{currentItem.tokens.length} palabras</strong>.
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowHint(true)}
                        className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 pt-1"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> ¿Necesitas una pista?
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGoHome}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition active:scale-95"
            >
              Menú Principal
            </button>

            {!isCorrect && assembledWords.length > 0 && (
              <button
                type="button"
                onClick={handleResetWords}
                className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5" /> Desarmar
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!isCorrect ? (
              <button
                id="btn-check-sentence"
                type="button"
                onClick={handleCheckSentence}
                disabled={assembledWords.length === 0}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  assembledWords.length > 0
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/25 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Comprobar Frase</span>
              </button>
            ) : (
              <button
                id="btn-next-sentence"
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                <span>{currentIndex + 1 < ACTIVITY_2_SENTENCES.length ? 'Siguiente Frase ➔' : 'Finalizar Actividad 2 🏆'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
