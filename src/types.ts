export type Demonstrative = 'THIS' | 'THAT' | 'THESE' | 'THOSE';
export type Distance = 'near' | 'far';
export type Quantity = 'singular' | 'plural';

export interface Question {
  id: string;
  imageUrl: string;
  objectName: string;
  objectNameEs: string;
  distance: Distance;
  quantity: Quantity;
  sentenceWithBlank: string;
  completedSentence: string;
  correctAnswer: Demonstrative;
  distanceDescription: string;
  quantityDescription: string;
  explanationEn: string;
  explanationEs: string;
  translation: string;
}

export interface ApprenticeData {
  fullName: string;
  program: string;
  ficha: string;
}

export interface AnswerRecord {
  question: Question;
  selectedAnswer: Demonstrative;
  isCorrect: boolean;
}

export interface AttemptResult {
  id: string;
  apprenticeName: string;
  program: string;
  ficha: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  percentage: number;
  performanceCategory: 'excellent' | 'very_good' | 'good' | 'keep_practicing';
  performanceLabel: string;
  date: string;
  timestamp: number;
  streakAchieved?: number;
  targetStreak?: number;
  details?: {
    sentence: string;
    selected: Demonstrative;
    correct: Demonstrative;
    isCorrect: boolean;
    translation?: string;
  }[];
}

export type AppScreen = 'welcome' | 'challenge' | 'results' | 'activity2' | 'activity2_results' | 'history';
export type ActivityType = 'activity1' | 'activity2';

export interface Activity2SentenceRecord {
  order: number;
  sentence: string;
  translation: string;
  demonstrative: Demonstrative;
  accountingTopic: string;
  attemptsCount: number;
  solvedOnFirstTry: boolean;
  userAssembledSentence: string;
}

export interface Activity2Result {
  id: string;
  activityType: 'activity2';
  apprenticeName: string;
  program: string;
  ficha: string;
  score: number; // e.g. 20/20
  totalSentences: number; // 20
  firstTryCount: number;
  totalAttempts: number;
  percentage: number;
  date: string;
  timestamp: number;
  performanceCategory: 'excellent' | 'very_good' | 'good' | 'keep_practicing';
  performanceLabel: string;
  details: Activity2SentenceRecord[];
}

export interface Activity1Progress {
  questions: Question[];
  currentIndex: number;
  streak: number;
  correctCount: number;
  incorrectCount: number;
  answerRecords: AnswerRecord[];
  inProgress: boolean;
}

export interface Activity2Progress {
  currentIndex: number;
  completedRecords: Activity2SentenceRecord[];
  inProgress: boolean;
}

export interface SavedAppState {
  version: number;
  lastUpdated: number;
  currentScreen: AppScreen;
  apprentice: ApprenticeData;
  totalTimeWorkedSeconds?: number;
  activity1?: Activity1Progress;
  activity2?: Activity2Progress;
  finalResult?: AttemptResult | null;
  activity2Result?: Activity2Result | null;
}

export interface ConsolidatedCertificateData {
  apprenticeName: string;
  program: string;
  ficha: string;
  date: string;
  timeWorkedFormatted: string;
  timeWorkedSeconds: number;
  activitiesCompleted: {
    activity1?: {
      title: string;
      score: number;
      streak: number;
      date?: string;
    };
    activity2?: {
      title: string;
      completedSentences: number;
      totalSentences: number;
      percentage: number;
      date?: string;
    };
  };
  activitiesPending: string[];
  overallPercentage: number;
  overallStatus: 'completed' | 'partial' | 'started';
}

export interface ActivitiesStatusSummary {
  activity1: {
    isCompleted: boolean;
    inProgress: boolean;
    streakAchieved?: number;
    score?: number;
    date?: string;
    result?: AttemptResult | null;
  };
  activity2: {
    isCompleted: boolean;
    inProgress: boolean;
    completedSentences?: number;
    totalSentences?: number;
    percentage?: number;
    date?: string;
    result?: Activity2Result | null;
  };
}

