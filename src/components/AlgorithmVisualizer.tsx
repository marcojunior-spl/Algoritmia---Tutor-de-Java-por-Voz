import React, { useState } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { ALGORITHM_PRESETS, AlgorithmPreset } from '../data/javaTopics';

interface AlgorithmVisualizerProps {
  onAskTutor: (prompt: string) => void;
  onSendCodeToWhiteboard: (preset: AlgorithmPreset) => void;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  onAskTutor,
  onSendCodeToWhiteboard,
}) => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>('binary-search');

  // Binary Search State
  const bsArray = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const [bsTarget, setBsTarget] = useState<number>(23);
  const [bsStep, setBsStep] = useState<number>(0);

  // Compute Binary Search steps
  const computeBinarySearchSteps = (arr: number[], target: number) => {
    const steps: Array<{
      left: number;
      right: number;
      mid: number;
      found: boolean;
      description: string;
      spokenExplanation: string;
    }> = [];

    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
      const mid = Math.floor(left + (right - left) / 2);
      const val = arr[mid];

      if (val === target) {
        steps.push({
          left,
          right,
          mid,
          found: true,
          description: `Elemento ${target} encontrado no índice ${mid}!`,
          spokenExplanation: `Comparou o meio arr[${mid}] (${val}) com ${target}. Bateu exatamente! Finaliza em O de 1 comparações restantes.`,
        });
        break;
      } else if (val < target) {
        steps.push({
          left,
          right,
          mid,
          found: false,
          description: `arr[${mid}] = ${val} < ${target}. Descarte da metade esquerda. left avança para ${mid + 1}.`,
          spokenExplanation: `O meio é ${val}, que é menor que o alvo ${target}. Como o array é ordenado, todo mundo à esquerda também é menor. Eliminamos metade do espaço!`,
        });
        left = mid + 1;
      } else {
        steps.push({
          left,
          right,
          mid,
          found: false,
          description: `arr[${mid}] = ${val} > ${target}. Descarte da metade direita. right recua para ${mid - 1}.`,
          spokenExplanation: `O meio é ${val}, que é maior que o alvo ${target}. Eliminamos toda a metade direita e recuamos right.`,
        });
        right = mid - 1;
      }
    }
    return steps;
  };

  const bsSteps = computeBinarySearchSteps(bsArray, bsTarget);
  const currentBs = bsSteps[Math.min(bsStep, bsSteps.length - 1)] || {
    left: 0,
    right: bsArray.length - 1,
    mid: 4,
    found: false,
    description: 'Início da busca',
    spokenExplanation: 'Pronto para começar a divisão por 2.',
  };

  // Two Sum State
  const twoSumArr = [2, 7, 11, 15];
  const twoSumTarget = 9;
  const [twoSumStep, setTwoSumStep] = useState<number>(0);
  const twoSumSteps = [
    {
      index: 0,
      val: 2,
      complement: 7,
      found: false,
      map: { 2: 0 },
      description: 'Elemento 2: complemento necessário é 9 - 2 = 7. HashMap não tem 7. Armazena {2: 0}.',
    },
    {
      index: 1,
      val: 7,
      complement: 2,
      found: true,
      map: { 2: 0 },
      description: 'Elemento 7: complemento necessário é 9 - 7 = 2. Encontrado na chave do HashMap com índice 0! Resposta: [0, 1].',
    },
  ];

  const currentPreset = ALGORITHM_PRESETS.find((p) => p.id === selectedAlgo) || ALGORITHM_PRESETS[0];

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200">
      {/* Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Visualizador Interativo</span>
            <span aria-hidden="true">·</span>
            <span>Passo a Passo</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono">Tempo {currentPreset.complexityTime}</span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">{currentPreset.name}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ALGORITHM_PRESETS.map((algo) => (
            <button
              key={algo.id}
              onClick={() => {
                setSelectedAlgo(algo.id);
                setBsStep(0);
                setTwoSumStep(0);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedAlgo === algo.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {algo.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Workspace */}
      {selectedAlgo === 'binary-search' && (
        <div className="flex flex-col gap-5">
          {/* Target input & Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Buscar valor:</span>
              <div className="flex items-center gap-1.5">
                {[5, 16, 23, 72, 91].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setBsTarget(val);
                      setBsStep(0);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                      bsTarget === val
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBsStep((s) => Math.max(0, s - 1))}
                disabled={bsStep === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <span className="text-xs font-mono text-slate-400 px-2 tabular-nums">
                Passo {bsStep + 1} de {bsSteps.length}
              </span>
              <button
                onClick={() => setBsStep((s) => Math.min(bsSteps.length - 1, s + 1))}
                disabled={bsStep >= bsSteps.length - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold transition-colors"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBsStep(0)}
                title="Reiniciar"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Graphical Array */}
          <div className="bg-slate-950/80 p-6 rounded-xl border border-slate-800/80">
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
              {bsArray.map((val, idx) => {
                const isMid = idx === currentBs.mid;
                const isWithinRange = idx >= currentBs.left && idx <= currentBs.right;
                const isMatch = isMid && currentBs.found;

                return (
                  <div key={idx} className="flex flex-col items-center">
                    <span className="text-[10px] font-mono text-slate-500 mb-1">[{idx}]</span>
                    <div
                      className={`w-full aspect-square flex items-center justify-center font-mono font-bold text-sm sm:text-base rounded-lg border transition-all duration-300 ${
                        isMatch
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                          : isMid
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 scale-105 shadow-md shadow-amber-500/10'
                          : isWithinRange
                          ? 'bg-slate-800/90 text-slate-100 border-slate-700'
                          : 'bg-slate-900/40 text-slate-600 border-slate-800/40 line-through opacity-40'
                      }`}
                    >
                      {val}
                    </div>
                    <div className="h-4 mt-1 flex items-center justify-center">
                      {idx === currentBs.left && idx === currentBs.right && idx === currentBs.mid ? (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">L/R/M</span>
                      ) : idx === currentBs.mid ? (
                        <span className="text-[10px] font-mono text-amber-400 font-bold">MID</span>
                      ) : idx === currentBs.left ? (
                        <span className="text-[10px] font-mono text-blue-400">LEFT</span>
                      ) : idx === currentBs.right ? (
                        <span className="text-[10px] font-mono text-purple-400">RIGHT</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step explanation card */}
            <div className="p-3.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Explicação do Passo:</span>
                <span className="text-xs font-mono text-slate-400">
                  left={currentBs.left}, right={currentBs.right}, mid={currentBs.mid}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentBs.description}</p>
              <div className="text-[11px] text-amber-300/80 flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Como o tutor falaria: &ldquo;{currentBs.spokenExplanation}&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === 'two-sum' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Array: [2, 7, 11, 15] · Alvo (Target): <strong className="text-white">9</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTwoSumStep((s) => Math.max(0, s - 1))}
                disabled={twoSumStep === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
              >
                Anterior
              </button>
              <button
                onClick={() => setTwoSumStep((s) => Math.min(twoSumSteps.length - 1, s + 1))}
                disabled={twoSumStep >= twoSumSteps.length - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 disabled:opacity-40"
              >
                Próximo
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-around py-3">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">Elemento Atual no Laço:</span>
                <div className="text-2xl font-mono font-bold text-amber-300 px-4 py-2 bg-slate-900 border border-amber-500/30 rounded-lg">
                  nums[{twoSumSteps[twoSumStep].index}] = {twoSumSteps[twoSumStep].val}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-5 h-5 text-slate-500" />
                <span className="text-[10px] text-slate-500">9 - {twoSumSteps[twoSumStep].val}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">Complemento Buscado:</span>
                <div className="text-2xl font-mono font-bold text-blue-300 px-4 py-2 bg-slate-900 border border-blue-500/30 rounded-lg">
                  {twoSumSteps[twoSumStep].complement}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400">Estado do HashMap:</span>
                <div className="text-xs font-mono bg-slate-900 px-3 py-2 border border-slate-800 rounded-lg text-emerald-300">
                  {Object.entries(twoSumSteps[twoSumStep].map).map(([k, v]) => `{ ${k} → índice ${v} }`)}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 mt-4 text-xs text-slate-300">
              {twoSumSteps[twoSumStep].description}
            </div>
          </div>
        </div>
      )}

      {selectedAlgo !== 'binary-search' && selectedAlgo !== 'two-sum' && (
        <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Analogia do dia a dia</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-300">Como pensar intuitivamente</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed italic">
            &ldquo;{currentPreset.analogy}&rdquo;
          </p>
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              Classe padrão Java: <code className="text-amber-400 font-mono">{currentPreset.javaClass}</code>
            </span>
            <span>
              Pronúncia: <span className="text-slate-300">{currentPreset.spokenComplexity}</span>
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onSendCodeToWhiteboard(currentPreset)}
          className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
        >
          Carregar Código na Lousa
        </button>

        <button
          onClick={() => onAskTutor(currentPreset.spokenPrompt)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-amber-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Perguntar ao Tutor por Voz
        </button>
      </div>
    </div>
  );
};
