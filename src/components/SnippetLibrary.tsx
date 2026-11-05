import React, { useState } from 'react';
import {
  Bookmark,
  Search,
  Tag,
  Copy,
  Check,
  Trash2,
  Download,
  Code2,
  Clock,
  HardDrive,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SavedSnippet } from '../types';
import { exportSnippetLibraryToMarkdown } from '../utils/markdownExport';

interface SnippetLibraryProps {
  snippets: SavedSnippet[];
  onOpenSnippetOnWhiteboard: (snippet: SavedSnippet) => void;
  onDeleteSnippet: (id: string) => void;
}

export const SnippetLibrary: React.FC<SnippetLibraryProps> = ({
  snippets,
  onOpenSnippetOnWhiteboard,
  onDeleteSnippet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(
    new Set(snippets.flatMap((s) => s.tags || []).filter(Boolean))
  );

  const filtered = snippets.filter((s) => {
    const matchesTag = selectedTag === 'ALL' || (s.tags && s.tags.includes(selectedTag));
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.explanation.toLowerCase().includes(q) ||
      (s.tags && s.tags.some((t) => t.toLowerCase().includes(q)));

    return matchesTag && matchesSearch;
  });

  const handleCopyCode = (snippet: SavedSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl text-slate-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Biblioteca Pessoal</span>
            <span aria-hidden="true">·</span>
            <span>Snippets Java Salvos</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono">{snippets.length} salvos</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Snippets e Algoritmos em Java
          </h2>
        </div>

        {snippets.length > 0 && (
          <button
            onClick={() => exportSnippetLibraryToMarkdown(snippets)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-sm shadow-amber-500/20 whitespace-nowrap self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Tudo em Markdown (.md)</span>
          </button>
        )}
      </div>

      {/* Search and Tag Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por algoritmo, código ou tag..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto max-w-full overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                selectedTag === 'ALL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todas as tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                  selectedTag === tag
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid of Snippets */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl">
          <Bookmark className="w-10 h-10 text-slate-600 mb-2" />
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            {snippets.length === 0 ? 'Nenhum snippet salvo ainda' : 'Nenhum snippet encontrado com estes filtros'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md">
            {snippets.length === 0
              ? 'Converse com o tutor na lousa e clique no botão "Salvar na Biblioteca" para guardar códigos com análise de complexidade.'
              : 'Tente alterar os termos de busca ou remover os filtros de tag acima.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((snippet) => (
            <div
              key={snippet.id}
              className="flex flex-col justify-between p-5 bg-slate-950/80 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>{snippet.formattedDate}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyCode(snippet)}
                      title="Copiar código Java"
                      className="p-1 hover:text-white text-slate-400 transition-colors"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteSnippet(snippet.id)}
                      title="Excluir da biblioteca"
                      className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{snippet.title}</span>
                </h3>

                {snippet.explanation && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {snippet.explanation}
                  </p>
                )}

                {/* Complexities */}
                <div className="flex flex-wrap items-center gap-3 p-2.5 bg-slate-900/80 rounded-lg border border-slate-800/80 text-[11px] font-mono mb-3">
                  <div>
                    <span className="text-slate-500">Tempo: </span>
                    <span className="text-amber-300 font-semibold">{snippet.complexityTime}</span>
                  </div>
                  <span className="text-slate-700">|</span>
                  <div>
                    <span className="text-slate-500">Espaço: </span>
                    <span className="text-blue-300 font-semibold">{snippet.complexitySpace}</span>
                  </div>
                  {snippet.javaStandardClass && (
                    <>
                      <span className="text-slate-700">|</span>
                      <span className="text-emerald-300 truncate max-w-[140px]">
                        {snippet.javaStandardClass}
                      </span>
                    </>
                  )}
                </div>

                {/* Code Preview */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 overflow-x-auto max-h-32 mb-3">
                  <pre className="text-[11px] font-mono text-slate-300 leading-tight">
                    <code>{snippet.code.slice(0, 300)}...</code>
                  </pre>
                </div>

                {/* Tags */}
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mb-2">
                    {snippet.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={() => onOpenSnippetOnWhiteboard(snippet)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors shadow-sm shadow-amber-500/10"
              >
                <span>Abrir e Editar na Lousa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
