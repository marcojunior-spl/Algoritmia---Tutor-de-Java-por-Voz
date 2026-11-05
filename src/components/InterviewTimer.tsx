import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface InterviewTimerProps {
  initialMinutes?: number;
  onTimeExpired?: () => void;
  onSubmitSolution?: () => void;
}

export const InterviewTimer: React.FC<InterviewTimerProps> = ({
  initialMinutes = 15,
  onTimeExpired,
  onSubmitSolution,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (interval) clearInterval(interval);
            setIsRunning(false);
            if (onTimeExpired) onTimeExpired();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, onTimeExpired]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isCritical = secondsLeft > 0 && secondsLeft <= 120; // Last 2 minutes
  const isFinished = secondsLeft === 0;

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(initialMinutes * 60);
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl border transition-all ${
        isFinished
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : isCritical
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 animate-pulse'
          : 'bg-slate-950/80 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <Timer
          className={`w-4 h-4 ${
            isFinished
              ? 'text-rose-400'
              : isCritical
              ? 'text-amber-400'
              : 'text-amber-400'
          }`}
        />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Entrevista Técnica:
          </span>
          <span className="font-mono text-base font-bold tabular-nums text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          {isCritical && !isFinished && (
            <span className="text-[11px] text-amber-400 font-medium hidden md:inline">
              (Últimos 2 minutos)
            </span>
          )}
          {isFinished && (
            <span className="text-[11px] text-rose-400 font-medium">
              Tempo esgotado! Apresente sua solução.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={isFinished}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
          title={isRunning ? 'Pausar cronômetro' : 'Continuar cronômetro'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reiniciar 15 minutos"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {onSubmitSolution && (
          <button
            onClick={onSubmitSolution}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Entregar Solução</span>
          </button>
        )}
      </div>
    </div>
  );
};
