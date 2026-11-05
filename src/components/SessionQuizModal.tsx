import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Volume2,
} from 'lucide-react';
import { QuizQuestion } from '../types';

interface SessionQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTranscript: string;
  sessionTopics: string[];
  studentLevel: string;
  onRecordProgress: (topic: string, result: 'acerto' | 'erro', observation: string) => void;
  onSpeakText?: (text: string) => void;
}

export const SessionQuizModal: React.FC<SessionQuizModalProps> = ({
  isOpen,
  onClose,
  sessionTranscript,
  sessionTopics,
  studentLevel,
  onRecordProgress,
  onSpeakText,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Fallback questions if offline or error
  const fallbackQuestions: QuizQuestion[] = [
    {
      id: 1,
      topic: 'busca',
      question: 'Por que a Busca Binária possui complexidade de tempo O(log n)?',
      options: [
        'Porque percorre todos os elementos do início ao fim.',
        'Porque divide o espaço de busca pela metade a cada comparação.',
        'Porque depende de uma tabela de hash para lookup direto.',
        'Porque precisa ordenar o array a cada passo.',
      ],
      correctAnswerIndex: 1,
      explanation: 'Exato! A cada iteração, metade do array é descartada, o que matematicamente gera log₂ n comparações no pior caso.',
    },
    {
      id: 2,
      topic: 'pilhas',
      question: 'Por que em Java moderno a documentação oficial recomenda ArrayDeque em vez da classe java.util.Stack?',
      options: [
        'Stack só aceita tipos primitivos, não objetos.',
        'ArrayDeque usa arrays encadeados enquanto Stack usa Red-Black Tree.',
        'Stack herda de Vector e tem overhead de sincronização de threads desnecessário.',
        'Stack não possui o método pop().',
      ],
      correctAnswerIndex: 2,
      explanation: 'Perfeito! java.util.Stack herda de Vector e todos os métodos são synchronized, causando lentidão desnecessária em aplicações single-thread.',
    },
    {
      id: 3,
      topic: 'hash maps',
      question: 'No caso médio, qual é a complexidade de tempo para buscar uma chave em um HashMap no Java?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'],
      correctAnswerIndex: 2,
      explanation: 'Correto! Com uma boa função de espalhamento (hash function) e baixa colisão, o acesso ao bucket é em tempo constante O(1).',
    },
  ];

  useEffect(() => {
    if (isOpen) {
      loadQuiz();
    } else {
      // Reset state
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsFinished(false);
    }
  }, [isOpen]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: sessionTranscript,
          topics: sessionTopics,
          level: studentLevel,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
      } else {
        setQuestions(fallbackQuestions);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;
    setSelectedOption(optIndex);
    setIsAnswered(true);

    const currentQ = questions[currentIndex];
    const isCorrect = optIndex === currentQ.correctAnswerIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Feed progress tracker!
    onRecordProgress(
      currentQ.topic,
      isCorrect ? 'acerto' : 'erro',
      `Quiz final: ${isCorrect ? 'Acertou' : 'Errou'} pergunta sobre "${currentQ.question.slice(0, 50)}..."`
    );

    // Speak explanation if speaker function provided
    if (onSpeakText) {
      onSpeakText(
        isCorrect
          ? `Muito bem! ${currentQ.explanation}`
          : `Não foi dessa vez. ${currentQ.explanation}`
      );
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Quiz Rápido de Fixação da Sessão
              </h3>
              <span className="text-[11px] text-slate-400">
                Alimenta automaticamente seu painel de progresso e revisão espaçada
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-xs font-semibold text-white mb-1">
                O tutor está elaborando 3 a 5 perguntas personalizadas...
              </p>
              <span className="text-[11px] text-slate-400">
                Analisando as dúvidas e conceitos discutidos na sua conversa
              </span>
            </div>
          ) : isFinished ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                <Trophy className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Quiz Concluído!</h4>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Seu resultado foi de <strong className="text-amber-300 font-mono text-sm">{score}</strong> acertos de{' '}
                <strong className="text-white font-mono text-sm">{questions.length}</strong> perguntas.
              </p>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 max-w-md text-left mb-6">
                <span className="text-emerald-400 font-semibold block mb-1">
                  ✓ Progresso Atualizado!
                </span>
                Suas respostas foram contabilizadas no Mapa de Domínio. Conceitos com erro foram agendados para revisão espaçada nos próximos dias.
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadQuiz}
                  className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer Quiz</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  Concluir Sessão
                </button>
              </div>
            </div>
          ) : currentQ ? (
            <div className="flex flex-col gap-5">
              {/* Progress step */}
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                <span className="font-mono text-amber-400 font-semibold">
                  Pergunta {currentIndex + 1} de {questions.length}
                </span>
                <span className="font-mono text-[11px] text-slate-400 capitalize">
                  Tópico: {currentQ.topic}
                </span>
              </div>

              {/* Question Text */}
              <h4 className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQ.correctAnswerIndex;

                  let style = 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (isAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-500/15 border-emerald-500 text-emerald-200';
                    } else if (isSelected) {
                      style = 'bg-rose-500/15 border-rose-500 text-rose-200';
                    } else {
                      style = 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3.5 text-xs text-left rounded-xl border transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-snug pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {isAnswered && (
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                    selectedOption === currentQ.correctAnswerIndex
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    {selectedOption === currentQ.correctAnswerIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correto!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>Incorreto</span>
                      </>
                    )}
                  </div>
                  <p>{currentQ.explanation}</p>
                </div>
              )}

              {/* Next Question Button */}
              {isAnswered && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                  >
                    <span>{currentIndex + 1 === questions.length ? 'Ver Resultado' : 'Próxima Pergunta'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
