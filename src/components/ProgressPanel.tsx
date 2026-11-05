import React, { useState } from 'react';
import {
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { TopicProgress, TopicStatus } from '../types';
import { isTopicDueForReview } from '../data/progressTopics';

interface ProgressPanelProps {
  topics: TopicProgress[];
  onStartTopicSession: (topicName: string) => void;
  onResetProgress?: () => void;
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  topics,
  onStartTopicSession,
  onResetProgress,
}) => {
  const [filterStatus, setFilterStatus] = useState<'ALL' | TopicStatus>('ALL');

  const dueForReview = topics.filter(isTopicDueForReview);

  const filteredTopics = topics.filter(
    (t) => filterStatus === 'ALL' || t.status === filterStatus
  );

  const masteredCount = topics.filter((t) => t.status === 'dominado').length;
  const inProgressCount = topics.filter((t) => t.status === 'em andamento').length;
  const unseenCount = topics.filter((t) => t.status === 'não visto').length;

  const totalHits = topics.reduce((acc, t) => acc + t.hits, 0);
  const totalMisses = topics.reduce((acc, t) => acc + t.misses, 0);
  const totalInteractions = totalHits + totalMisses;
  const overallAccuracy =
    totalInteractions > 0 ? Math.round((totalHits / totalInteractions) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl text-slate-200">
      {/* Top Header & Global Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Progresso Contínuo</span>
            <span aria-hidden="true">·</span>
            <span>Algoritmos & Estruturas Java</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono">Revisão Espaçada (SRS)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Mapa de Domínio e Retenção
          </h2>
        </div>

        {/* Global KPI Strip */}
        <div className="flex items-center gap-4 text-xs bg-slate-950/70 px-4 py-2.5 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Dominados</span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {masteredCount} / {topics.length}
            </span>
          </div>
          <span className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Em Andamento</span>
            <span className="font-mono text-amber-400 font-bold text-sm">{inProgressCount}</span>
          </div>
          <span className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Taxa de Acerto</span>
            <span className="font-mono text-blue-400 font-bold text-sm">{overallAccuracy}%</span>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Due Today Banner */}
      {dueForReview.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Para Revisar Hoje ({dueForReview.length})
                </span>
                <span className="text-[11px] text-slate-400">· Intervalo SRS ativo</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tópicos com revisões pendentes para fixação na memória de longo prazo:{' '}
                <strong className="text-white">
                  {dueForReview.map((t) => t.name).join(', ')}
                </strong>
                .
              </p>
            </div>
          </div>

          <button
            onClick={() => onStartTopicSession(dueForReview[0].name)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors whitespace-nowrap shadow-md shadow-amber-500/20 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Praticar {dueForReview[0].name.split(' (')[0]} por Voz</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
          {[
            { key: 'ALL', label: `Todos (${topics.length})` },
            { key: 'dominado', label: `Dominados (${masteredCount})` },
            { key: 'em andamento', label: `Em Andamento (${inProgressCount})` },
            { key: 'não visto', label: `Não Vistos (${unseenCount})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key as any)}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                filterStatus === f.key
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {onResetProgress && (
          <button
            onClick={onResetProgress}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            Reiniciar dados de progresso
          </button>
        )}
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => {
          const isDue = isTopicDueForReview(topic);
          const total = topic.hits + topic.misses;
          const accuracy = total > 0 ? Math.round((topic.hits / total) * 100) : 0;

          return (
            <div
              key={topic.key}
              className={`flex flex-col justify-between p-5 rounded-xl border transition-all ${
                isDue
                  ? 'bg-amber-500/5 border-amber-500/40 hover:border-amber-500/60'
                  : topic.status === 'dominado'
                  ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40'
                  : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Status & Category */}
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="text-slate-500 font-mono">{topic.category}</span>
                  <span
                    className={`font-medium ${
                      topic.status === 'dominado'
                        ? 'text-emerald-400'
                        : topic.status === 'em andamento'
                        ? 'text-amber-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {topic.status === 'dominado'
                      ? 'Dominado'
                      : topic.status === 'em andamento'
                      ? 'Em Andamento'
                      : 'Não Visto'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 flex items-center justify-between">
                  <span>{topic.name}</span>
                  {isDue && (
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded font-mono">
                      Revisar
                    </span>
                  )}
                </h4>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {topic.description}
                </p>

                {/* Score & Hits/Misses */}
                <div className="space-y-2 p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs mb-4">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Precisão:</span>
                    <span className="font-mono font-semibold text-white">
                      {total > 0 ? `${accuracy}% (${topic.hits}A / ${topic.misses}E)` : 'Sem testes'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        topic.status === 'dominado'
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.max(8, accuracy)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                    <span>
                      SRS: {topic.srsIntervalStep === 0 ? '1 dia' : topic.srsIntervalStep === 1 ? '3 dias' : topic.srsIntervalStep === 2 ? '7 dias' : '14 dias'}
                    </span>
                    <span>{topic.totalInteractions} interações</span>
                  </div>
                </div>

                {/* Recent observation */}
                {topic.recentObservations.length > 0 && (
                  <div className="text-[11px] text-slate-400 mb-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 block mb-0.5">Última observação do tutor:</span>
                    <p className="italic text-slate-300 leading-snug">
                      &ldquo;{topic.recentObservations[0].observation}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onStartTopicSession(topic.name)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg border border-slate-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Praticar Este Tópico por Voz</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
