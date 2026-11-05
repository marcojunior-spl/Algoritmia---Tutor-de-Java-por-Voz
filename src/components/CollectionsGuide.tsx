import React, { useState } from 'react';
import { JAVA_COLLECTIONS_GUIDE, CollectionComparison } from '../data/javaTopics';
import { Layers, Check, AlertCircle, ArrowUpRight } from 'lucide-react';

interface CollectionsGuideProps {
  onAskTutor: (prompt: string) => void;
}

export const CollectionsGuide: React.FC<CollectionsGuideProps> = ({ onAskTutor }) => {
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const filtered = selectedType === 'ALL'
    ? JAVA_COLLECTIONS_GUIDE
    : JAVA_COLLECTIONS_GUIDE.filter((c) => c.type === selectedType);

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Java Collections Framework</span>
            <span aria-hidden="true">·</span>
            <span>Trade-offs e Estruturas Internas</span>
          </div>
          <h3 className="text-xl font-semibold text-white tracking-tight">
            Guia de Coleções da Biblioteca Padrão Java
          </h3>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-lg">
          {['ALL', 'List', 'Queue', 'Map'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                selectedType === t
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Todas' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.name}
            className="flex flex-col justify-between p-5 bg-slate-950/80 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-amber-400 font-mono font-medium">{item.type}</span>
                <span className="text-[11px] text-slate-500 font-mono">java.util</span>
              </div>
              <h4 className="text-lg font-bold text-white mb-1.5 font-mono">{item.name}</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.backingStructure}
              </p>

              {/* Complexities */}
              <div className="space-y-1.5 p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs font-mono mb-4">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">Inserção:</span>
                  <span className="text-emerald-300">{item.timeInsert}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">Busca:</span>
                  <span className="text-blue-300">{item.timeLookup}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-500">Remoção:</span>
                  <span className="text-amber-300">{item.timeDelete}</span>
                </div>
              </div>

              {/* Best For & Avoid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-white font-medium">Use quando:</strong> {item.bestFor}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-400">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400/80 shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    <strong className="text-slate-300 font-medium">Evite quando:</strong> {item.avoidWhen}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                onAskTutor(
                  `Explique como a classe ${item.name} é implementada por debaixo dos panos em Java e por que ela é melhor ou pior que as alternativas.`
                )
              }
              className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
            >
              <span>Perguntar por voz sobre {item.name}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
