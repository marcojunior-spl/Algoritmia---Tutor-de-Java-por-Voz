import React, { useState } from 'react';
import { Copy, Check, Code2, Terminal, BookOpen, Clock, HardDrive, Sparkles } from 'lucide-react';

export interface CodeSnippetItem {
  id: string;
  title: string;
  code: string;
  explanation: string;
  complexityTime: string;
  complexitySpace: string;
  javaStandardClass?: string;
  timestamp?: number;
}

interface CodeWhiteboardProps {
  currentSnippet: CodeSnippetItem | null;
  onSelectPreset: (id: string) => void;
}

export const CodeWhiteboard: React.FC<CodeWhiteboardProps> = ({
  currentSnippet,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!currentSnippet) return;
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentSnippet) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-xl text-center min-h-[420px]">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
          <Terminal className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200 mb-1">Lousa de Código Java Vazia</h4>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
          Converse com o tutor e diga <span className="text-amber-300 font-medium">&ldquo;coloque o código na lousa&rdquo;</span>, ou selecione um algoritmo nos tópicos rápidos para inspecionar a implementação.
        </p>
        <span className="text-[11px] text-slate-500 font-mono">
          O tutor usará a ferramenta displayCodeSnippet para projetar código em tempo real.
        </span>
      </div>
    );
  }

  const lines = currentSnippet.code.split('\n');

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">{currentSnippet.title}</h3>
            <span className="text-[11px] text-slate-400">Código Java Idiomático para Lousa</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700/70"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Java</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Complexity Metadata Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 bg-slate-950/40 border-b border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2 px-5 py-2.5">
          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 text-[11px] block">Tempo</span>
            <span className="font-mono text-amber-300 font-semibold">{currentSnippet.complexityTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5">
          <HardDrive className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 text-[11px] block">Espaço Auxiliar</span>
            <span className="font-mono text-blue-300 font-semibold">{currentSnippet.complexitySpace}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-2.5">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-slate-500 text-[11px] block">Biblioteca Padrão Java</span>
            <span className="font-mono text-emerald-300 truncate block">
              {currentSnippet.javaStandardClass || 'Personalizada'}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      {currentSnippet.explanation && (
        <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/10 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{currentSnippet.explanation}</p>
        </div>
      )}

      {/* Code Body */}
      <div className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
        <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
          <code>
            {lines.map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/60 py-0.5">
                <span className="table-cell text-right pr-4 select-none text-slate-600 text-xs w-8 tabular-nums">
                  {idx + 1}
                </span>
                <span className="table-cell">{line || ' '}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
