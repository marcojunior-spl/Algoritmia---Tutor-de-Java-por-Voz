export type StudentLevel = 'iniciante' | 'intermediário' | 'avançado';

export type LearningMode =
  | 'explanatory'
  | 'socratic'
  | 'review'
  | 'interview'
  | 'debug';

export interface SavedSnippet {
  id: string;
  title: string;
  code: string;
  explanation: string;
  complexityTime: string;
  complexitySpace: string;
  javaStandardClass: string;
  date: string;
  formattedDate: string;
  tags: string[];
}

export type TopicKey =
  | 'arrays'
  | 'listas'
  | 'pilhas'
  | 'filas'
  | 'hash maps'
  | 'árvores'
  | 'grafos'
  | 'recursão'
  | 'ordenação'
  | 'busca'
  | 'programação dinâmica';

export type TopicStatus = 'não visto' | 'em andamento' | 'dominado';

export interface TopicProgress {
  key: TopicKey;
  name: string;
  category: string;
  description: string;
  status: TopicStatus;
  hits: number;
  misses: number;
  totalInteractions: number;
  lastReviewedAt: number | null;
  nextReviewAt: number | null;
  srsIntervalStep: number; // 0 -> 1d, 1 -> 3d, 2 -> 7d, 3 -> 14d
  recentObservations: Array<{
    result: 'acerto' | 'erro';
    observation: string;
    timestamp: number;
  }>;
}

export interface QuizQuestion {
  id: number;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  answers: Array<{
    questionId: number;
    selectedOption: number;
    isCorrect: boolean;
    topic: string;
  }>;
  completedAt: number;
}
