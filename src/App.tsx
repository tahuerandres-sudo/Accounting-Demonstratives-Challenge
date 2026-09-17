/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChallengeScreen } from './components/ChallengeScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Activity2Screen } from './components/Activity2Screen';
import { Activity2ResultsScreen } from './components/Activity2ResultsScreen';
import { GrammarModal } from './components/GrammarModal';
import { HistoryModal } from './components/HistoryModal';
import { 
  AppScreen, 
  ApprenticeData, 
  Question, 
  Demonstrative, 
  AnswerRecord, 
  AttemptResult,
  Activity2Result,
  Activity2SentenceRecord,
  SavedAppState,
  ActivitiesStatusSummary,
  ConsolidatedCertificateData
} from './types';
import { getFreshQuestionPool } from './data/questions';
import { 
  downloadAnyCertificatePdf, 
  downloadConsolidatedCertificatePdf, 
  formatTimeWorked 
} from './utils/pdfGenerator';

const SESSION_STORAGE_KEY = 'accounting_session_state';
const APPRENTICE_STORAGE_KEY = 'accounting_apprentice_data';
const TARGET_STREAK = 30;

function loadSavedSession(): SavedAppState | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not parse local saved session state:', e);
  }
  return null;
}

export default function App() {
  const initialSession = useMemo(() => loadSavedSession(), []);

  // Apprentice Data
  const [apprentice, setApprentice] = useState<ApprenticeData>(() => {
    if (initialSession?.apprentice?.fullName) {
      return initialSession.apprentice;
    }
    const saved = localStorage.getItem(APPRENTICE_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      fullName: '',
      program: 'Gestión Contable y de Información Financiera',
      ficha: '',
    };
  });

  // Navigation Screen
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    if (initialSession?.currentScreen) {
      // If user was actively in challenge and challenge was in progress
      if (initialSession.currentScreen === 'challenge' && initialSession.activity1?.inProgress) {
        return 'challenge';
      }
      // If user was actively in activity 2 and in progress
      if (initialSession.currentScreen === 'activity2' && initialSession.activity2?.inProgress) {
        return 'activity2';
      }
      // If was viewing results
      if (initialSession.currentScreen === 'results' && initialSession.finalResult) {
        return 'results';
      }
      if (initialSession.currentScreen === 'activity2_results' && initialSession.activity2Result) {
        return 'activity2_results';
      }
    }
    return 'welcome';
  });

  // Modals & UI Sound
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- ACTIVITY 1 STATE ---
  const [questions, setQuestions] = useState<Question[]>(() => {
    return initialSession?.activity1?.questions?.length 
      ? initialSession.activity1.questions 
      : [];
  });
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    return initialSession?.activity1?.currentIndex || 0;
  });
  const [streak, setStreak] = useState<number>(() => {
    return initialSession?.activity1?.streak || 0;
  });
  const [correctCount, setCorrectCount] = useState<number>(() => {
    return initialSession?.activity1?.correctCount || 0;
  });
  const [incorrectCount, setIncorrectCount] = useState<number>(() => {
    return initialSession?.activity1?.incorrectCount || 0;
  });
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>(() => {
    return initialSession?.activity1?.answerRecords || [];
  });
  const [activity1InProgress, setActivity1InProgress] = useState<boolean>(() => {
    return Boolean(initialSession?.activity1?.inProgress);
  });
  const [finalResult, setFinalResult] = useState<AttemptResult | null>(() => {
    return initialSession?.finalResult || null;
  });

  // --- ACTIVITY 2 STATE ---
  const [activity2Index, setActivity2Index] = useState<number>(() => {
    return initialSession?.activity2?.currentIndex || 0;
  });
  const [activity2CompletedRecords, setActivity2CompletedRecords] = useState<Activity2SentenceRecord[]>(() => {
    return initialSession?.activity2?.completedRecords || [];
  });
  const [activity2InProgress, setActivity2InProgress] = useState<boolean>(() => {
    return Boolean(initialSession?.activity2?.inProgress);
  });
  const [activity2Result, setActivity2Result] = useState<Activity2Result | null>(() => {
    return initialSession?.activity2Result || null;
  });

  // --- TIME WORKED TRACKER ---
  const [totalTimeWorkedSeconds, setTotalTimeWorkedSeconds] = useState<number>(() => {
    return initialSession?.totalTimeWorkedSeconds || 0;
  });

  // Track active working time across session
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalTimeWorkedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // History records state for completion tracking & certificates
  const [historyRecords, setHistoryRecords] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('accounting_challenge_history');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  const refreshHistory = () => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data?.records && Array.isArray(data.records)) {
          setHistoryRecords(data.records);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  // Check server-side progress on boot if localStorage is empty
  useEffect(() => {
    if (!initialSession) {
      fetch('/api/progress')
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.progress) {
            const p: SavedAppState = data.progress;
            if (p.apprentice?.fullName) {
              setApprentice(p.apprentice);
            }
            if (p.totalTimeWorkedSeconds) {
              setTotalTimeWorkedSeconds(p.totalTimeWorkedSeconds);
            }
            if (p.activity1 && p.activity1.questions?.length) {
              setQuestions(p.activity1.questions);
              setCurrentIndex(p.activity1.currentIndex || 0);
              setStreak(p.activity1.streak || 0);
              setCorrectCount(p.activity1.correctCount || 0);
              setIncorrectCount(p.activity1.incorrectCount || 0);
              setAnswerRecords(p.activity1.answerRecords || []);
              setActivity1InProgress(p.activity1.inProgress);
            }
            if (p.activity2) {
              setActivity2Index(p.activity2.currentIndex || 0);
              setActivity2CompletedRecords(p.activity2.completedRecords || []);
              setActivity2InProgress(p.activity2.inProgress);
            }
            if (p.finalResult) setFinalResult(p.finalResult);
            if (p.activity2Result) setActivity2Result(p.activity2Result);
            if (p.currentScreen && p.currentScreen !== 'welcome') {
              setCurrentScreen(p.currentScreen);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  // Debounce ref for backend sync
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AUTOMATIC STATE PERSISTENCE (Synchronous localStorage + Debounced backend sync)
  useEffect(() => {
    const stateToSave: SavedAppState = {
      version: 2,
      lastUpdated: Date.now(),
      currentScreen,
      apprentice,
      totalTimeWorkedSeconds,
      activity1: {
        questions,
        currentIndex,
        streak,
        correctCount,
        incorrectCount,
        answerRecords,
        inProgress: activity1InProgress,
      },
      activity2: {
        currentIndex: activity2Index,
        completedRecords: activity2CompletedRecords,
        inProgress: activity2InProgress,
      },
      finalResult,
      activity2Result,
    };

    // Save immediately and synchronously to localStorage
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
      if (apprentice.fullName) {
        localStorage.setItem(APPRENTICE_STORAGE_KEY, JSON.stringify(apprentice));
      }
    } catch (e) {
      console.warn('Error saving session to localStorage:', e);
    }

    // Debounced sync to server
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stateToSave),
      }).catch(() => {});
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    currentScreen,
    apprentice,
    questions,
    currentIndex,
    streak,
    correctCount,
    incorrectCount,
    answerRecords,
    activity1InProgress,
    activity2Index,
    activity2CompletedRecords,
    activity2InProgress,
    finalResult,
    activity2Result,
  ]);

  // Compute Active Session Info to show on Welcome Screen
  const activeSessionInfo = useMemo(() => {
    if (activity1InProgress && questions.length > 0 && streak < TARGET_STREAK) {
      return {
        activity: 'activity1' as const,
        summary: `Activity 1: Reto de Fotos (Racha actual: ${streak}/30)`,
        details: `Pregunta #${currentIndex + 1} • ${correctCount} aciertos acumulados • ${TARGET_STREAK - streak} para completar.`,
      };
    }
    if (activity2InProgress && activity2CompletedRecords.length < 20) {
      return {
        activity: 'activity2' as const,
        summary: `Activity 2: Audio & Sentence Builder (Frase ${activity2Index + 1} de 20)`,
        details: `${activity2CompletedRecords.length} de 20 frases armadas con éxito.`,
      };
    }
    return null;
  }, [
    activity1InProgress, 
    questions.length, 
    streak, 
    currentIndex, 
    correctCount, 
    activity2InProgress, 
    activity2Index, 
    activity2CompletedRecords.length
  ]);

  // Compute Activities Status Summary (Done vs Pending)
  const activitiesStatus = useMemo<ActivitiesStatusSummary>(() => {
    // Check Activity 1 status
    const act1History = historyRecords.find(
      (r: any) => (!r.activityType || r.activityType === 'activity1') && (r.streakAchieved >= 30 || r.score >= 70)
    ) || historyRecords.find((r: any) => !r.activityType || r.activityType === 'activity1');

    const act1Result = finalResult || (act1History as AttemptResult | undefined) || null;
    const isAct1Completed = Boolean(finalResult || (act1History && (act1History.streakAchieved >= 30 || act1History.score >= 70)));

    // Check Activity 2 status
    const act2History = historyRecords.find((r: any) => r.activityType === 'activity2');
    const act2Res = activity2Result || (act2History as Activity2Result | undefined) || null;
    const isAct2Completed = Boolean(activity2Result || act2History);

    return {
      activity1: {
        isCompleted: isAct1Completed,
        inProgress: !isAct1Completed && activity1InProgress && streak > 0,
        streakAchieved: act1Result?.streakAchieved || streak,
        score: act1Result?.score,
        date: act1Result?.date,
        result: act1Result,
      },
      activity2: {
        isCompleted: isAct2Completed,
        inProgress: !isAct2Completed && activity2InProgress && (activity2Index > 0 || activity2CompletedRecords.length > 0),
        completedSentences: act2Res?.totalSentences || activity2CompletedRecords.length,
        totalSentences: 20,
        percentage: act2Res?.percentage,
        date: act2Res?.date,
        result: act2Res,
      },
    };
  }, [
    finalResult,
    activity2Result,
    historyRecords,
    activity1InProgress,
    streak,
    activity2InProgress,
    activity2Index,
    activity2CompletedRecords.length,
  ]);

  // Helper to format worked time
  const timeWorkedFormatted = useMemo(() => {
    return formatTimeWorked(totalTimeWorkedSeconds);
  }, [totalTimeWorkedSeconds]);

  // Unified Consolidated Certificate Data (Single Official Certificate)
  const getConsolidatedCertificateData = (customInfo?: any): ConsolidatedCertificateData => {
    // Check Activity 1 status
    const act1History = historyRecords.find(
      (r: any) => (!r.activityType || r.activityType === 'activity1') && (r.streakAchieved >= 30 || r.score >= 70)
    ) || historyRecords.find((r: any) => !r.activityType || r.activityType === 'activity1');

    const act1Res = finalResult || (act1History as AttemptResult | undefined) || null;
    const isAct1Done = Boolean(finalResult || (act1History && (act1History.streakAchieved >= 30 || act1History.score >= 70)));

    // Check Activity 2 status
    const act2History = historyRecords.find((r: any) => r.activityType === 'activity2');
    const act2Res = activity2Result || (act2History as Activity2Result | undefined) || null;
    const isAct2Done = Boolean(activity2Result || act2History);

    const completedActs: ConsolidatedCertificateData['activitiesCompleted'] = {};
    const pendingActs: string[] = [];

    if (isAct1Done && act1Res) {
      completedActs.activity1 = {
        title: 'Reto de Fotografías Contables (30 in a row)',
        score: act1Res.score || 100,
        streak: act1Res.streakAchieved || 30,
        date: act1Res.date || new Date().toLocaleDateString('es-CO'),
      };
    } else {
      pendingActs.push('Actividad 1: Reto de Fotografías (Requiere 30 aciertos consecutivos)');
    }

    if (isAct2Done && act2Res) {
      completedActs.activity2 = {
        title: 'Audio & Sentence Builder (20 frases cortas)',
        completedSentences: act2Res.score || act2Res.totalSentences || 20,
        totalSentences: 20,
        percentage: act2Res.percentage || 100,
        date: act2Res.date || new Date().toLocaleDateString('es-CO'),
      };
    } else {
      pendingActs.push('Actividad 2: Audio & Sentence Builder (Requiere 20 frases de audio)');
    }

    const doneCount = (isAct1Done ? 1 : 0) + (isAct2Done ? 1 : 0);
    const overallPercentage = Math.round((doneCount / 2) * 100);

    const todayStr = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const candidateName = customInfo?.apprenticeName || apprentice.fullName || 'Aprendiz SENA';
    const candidateProgram = customInfo?.program || apprentice.program || 'Gestión Contable y de Información Financiera';
    const candidateFicha = customInfo?.ficha || apprentice.ficha || 'N/A';

    return {
      apprenticeName: candidateName,
      program: candidateProgram,
      ficha: candidateFicha,
      date: todayStr,
      timeWorkedFormatted,
      timeWorkedSeconds: totalTimeWorkedSeconds,
      activitiesCompleted: completedActs,
      activitiesPending: pendingActs,
      overallPercentage,
      overallStatus: doneCount === 2 ? 'completed' : doneCount === 1 ? 'partial' : 'started',
    };
  };

  // Handler to download the single consolidated certificate
  const handleDownloadCertificate = async (customRecord?: any) => {
    try {
      const certData = getConsolidatedCertificateData(customRecord);
      await downloadConsolidatedCertificatePdf(certData);
    } catch (err) {
      console.error('Error downloading consolidated certificate:', err);
    }
  };

  // Resume the in-progress activity directly
  const handleResumeSession = () => {
    if (activeSessionInfo?.activity === 'activity1' || activity1InProgress) {
      if (questions.length === 0) {
        const pool = getFreshQuestionPool(40);
        setQuestions(pool);
      }
      setCurrentScreen('challenge');
    } else if (activeSessionInfo?.activity === 'activity2' || activity2InProgress) {
      setCurrentScreen('activity2');
    }
  };

  // Reset in-progress session
  const handleResetSession = () => {
    setActivity1InProgress(false);
    setActivity2InProgress(false);
    setStreak(0);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswerRecords([]);
    setActivity2Index(0);
    setActivity2CompletedRecords([]);
  };

  // Launch Activity 1
  const handleStartChallenge = (data: ApprenticeData) => {
    setApprentice(data);
    const selectedQuestions = getFreshQuestionPool(40);
    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswerRecords([]);
    setFinalResult(null);
    setActivity1InProgress(true);
    setCurrentScreen('challenge');
  };

  // Launch Activity 2
  const handleStartActivity2 = (data: ApprenticeData) => {
    setApprentice(data);
    setActivity2Result(null);
    setActivity2InProgress(true);
    // If not already in progress, start at 0
    if (!activity2InProgress) {
      setActivity2Index(0);
      setActivity2CompletedRecords([]);
    }
    setCurrentScreen('activity2');
  };

  // Restart Activity 2 from sentence 1
  const handleRestartActivity2 = () => {
    setActivity2Index(0);
    setActivity2CompletedRecords([]);
    setActivity2Result(null);
    setActivity2InProgress(true);
  };

  // Update Activity 2 progress
  const handleActivity2ProgressUpdate = (index: number, records: Activity2SentenceRecord[]) => {
    setActivity2Index(index);
    setActivity2CompletedRecords(records);
    setActivity2InProgress(true);
  };

  // Complete Activity 2 and persist results
  const handleCompleteActivity2 = async (records: Activity2SentenceRecord[]) => {
    const totalSentences = 20;
    const score = records.length;
    const firstTryCount = records.filter((r) => r.solvedOnFirstTry).length;
    const totalAttempts = records.reduce((sum, r) => sum + r.attemptsCount, 0);
    const percentage = Math.round((firstTryCount / totalSentences) * 100);

    const todayStr = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const resultObj: Activity2Result = {
      id: 'act2_res_' + Date.now(),
      activityType: 'activity2',
      apprenticeName: apprentice.fullName,
      program: apprentice.program,
      ficha: apprentice.ficha,
      score,
      totalSentences,
      firstTryCount,
      totalAttempts,
      percentage,
      date: todayStr,
      timestamp: Date.now(),
      performanceCategory: percentage >= 80 ? 'excellent' : percentage >= 60 ? 'very_good' : 'good',
      performanceLabel: `Activity 2: ${score}/20 Sentences (${percentage}% First Try)`,
      details: records,
    };

    setActivity2Result(resultObj);
    setActivity2InProgress(false); // Finished!
    setCurrentScreen('activity2_results');

    // Persist to history database
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultObj),
      });
    } catch (err) {
      console.warn('Failed to post Activity 2 result to /api/history:', err);
      try {
        const local = JSON.parse(localStorage.getItem('accounting_challenge_history') || '[]');
        local.unshift(resultObj);
        localStorage.setItem('accounting_challenge_history', JSON.stringify(local));
      } catch {
        // ignore
      }
    }
    refreshHistory();
  };

  // Restart Activity 1 after streak loss
  const handleRestartChallenge = () => {
    const recentIds = answerRecords.map((r) => r.question.id);
    const freshQuestions = getFreshQuestionPool(recentIds);
    setQuestions(freshQuestions);
    setCurrentIndex(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAnswerRecords([]);
    setFinalResult(null);
    setActivity1InProgress(true);
  };

  // Return to Main Menu
  const handleGoHome = () => {
    setCurrentScreen('welcome');
  };

  // Record an answer for Activity 1
  const handleAnswer = (
    question: Question, 
    selected: Demonstrative | 'TIMEOUT', 
    isCorrect: boolean
  ) => {
    if (isCorrect) {
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);
    } else {
      setStreak(0);
      setIncorrectCount((prev) => prev + 1);
    }

    setAnswerRecords((prev) => [
      ...prev,
      {
        question,
        selectedAnswer: selected,
        isCorrect,
      },
    ]);
  };

  // Advance to next question or complete challenge in Activity 1
  const handleNextQuestion = () => {
    if (streak >= TARGET_STREAK) {
      finishChallenge(streak);
      return;
    }

    if (currentIndex + 2 >= questions.length) {
      const moreQuestions = getFreshQuestionPool(20);
      setQuestions((prev) => [...prev, ...moreQuestions]);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // Finalize Activity 1
  const finishChallenge = async (finalStreakAchieved: number) => {
    const finalScore = 100;
    const finalCorrect = correctCount;
    const finalIncorrect = incorrectCount;
    const percentage = 100;

    const todayStr = new Date().toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const resultObj: AttemptResult = {
      id: 'res_' + Date.now(),
      apprenticeName: apprentice.fullName,
      program: apprentice.program,
      ficha: apprentice.ficha,
      score: finalScore,
      totalQuestions: TARGET_STREAK,
      correctAnswers: finalCorrect,
      incorrectAnswers: finalIncorrect,
      percentage,
      performanceCategory: 'excellent',
      performanceLabel: 'Excellent performance (30 in a row)',
      streakAchieved: finalStreakAchieved,
      targetStreak: TARGET_STREAK,
      date: todayStr,
      timestamp: Date.now(),
      details: answerRecords.map((r) => ({
        sentence: r.question.completedSentence,
        translation: r.question.translation,
        selected: r.selectedAnswer,
        correct: r.question.correctAnswer,
        isCorrect: r.isCorrect,
      })),
    };

    setFinalResult(resultObj);
    setActivity1InProgress(false); // Marked finished
    setCurrentScreen('results');

    // Persist attempt into backend database
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultObj),
      });
    } catch (err) {
      console.warn('Failed to post result to /api/history:', err);
      try {
        const local = JSON.parse(localStorage.getItem('accounting_challenge_history') || '[]');
        local.unshift(resultObj);
        localStorage.setItem('accounting_challenge_history', JSON.stringify(local));
      } catch {
        // ignore
      }
    }
    refreshHistory();
  };

  const currentQuestion = questions[currentIndex] || questions[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Persistent Navigation Header */}
      <Header
        apprentice={apprentice}
        currentScreen={currentScreen}
        onSelectActivity1={() => {
          if (questions.length > 0 && activity1InProgress) {
            setCurrentScreen('challenge');
          } else {
            handleStartChallenge(apprentice);
          }
        }}
        onSelectActivity2={() => {
          if (activity2InProgress) {
            setCurrentScreen('activity2');
          } else {
            handleStartActivity2(apprentice);
          }
        }}
        onOpenGrammar={() => setIsGrammarOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onGoHome={handleGoHome}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col">
        {currentScreen === 'welcome' && (
          <WelcomeScreen
            initialData={apprentice}
            activeSession={activeSessionInfo}
            activitiesStatus={activitiesStatus}
            timeWorkedFormatted={timeWorkedFormatted}
            timeWorkedSeconds={totalTimeWorkedSeconds}
            onDownloadCertificate={handleDownloadCertificate}
            onResumeSession={handleResumeSession}
            onResetSession={handleResetSession}
            onStartActivity1={handleStartChallenge}
            onStartActivity2={handleStartActivity2}
            onOpenGrammar={() => setIsGrammarOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />
        )}

        {currentScreen === 'challenge' && currentQuestion && (
          <ChallengeScreen
            currentQuestion={currentQuestion}
            streak={streak}
            targetStreak={TARGET_STREAK}
            totalAnswered={correctCount + incorrectCount}
            soundEnabled={soundEnabled}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            onRestart={handleRestartChallenge}
            onGoHome={handleGoHome}
            onOpenGrammar={() => setIsGrammarOpen(true)}
          />
        )}

        {currentScreen === 'results' && finalResult && (
          <ResultsScreen
            result={finalResult}
            answerRecords={answerRecords}
            soundEnabled={soundEnabled}
            onPlayAgain={() => handleStartChallenge(apprentice)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onGoHome={handleGoHome}
            onDownloadCertificate={() => handleDownloadCertificate()}
          />
        )}

        {currentScreen === 'activity2' && (
          <Activity2Screen
            soundEnabled={soundEnabled}
            initialIndex={activity2Index}
            initialRecords={activity2CompletedRecords}
            onProgressUpdate={handleActivity2ProgressUpdate}
            onComplete={handleCompleteActivity2}
            onRestartActivity={handleRestartActivity2}
            onGoHome={handleGoHome}
            onOpenGrammar={() => setIsGrammarOpen(true)}
          />
        )}

        {currentScreen === 'activity2_results' && activity2Result && (
          <Activity2ResultsScreen
            result={activity2Result}
            apprentice={apprentice}
            soundEnabled={soundEnabled}
            onRestartActivity2={() => {
              handleRestartActivity2();
              setCurrentScreen('activity2');
            }}
            onGoToActivity1={() => handleStartChallenge(apprentice)}
            onGoHome={handleGoHome}
            onDownloadCertificate={() => handleDownloadCertificate()}
          />
        )}
      </main>

      {/* Modals */}
      <GrammarModal
        isOpen={isGrammarOpen}
        onClose={() => setIsGrammarOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>
          Accounting Demonstratives Challenge • SENA Gestión Contable y de Información Financiera
        </p>
      </footer>
    </div>
  );
}
