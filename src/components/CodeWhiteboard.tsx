import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Code2,
  Terminal,
  BookOpen,
  Clock,
  HardDrive,
  Sparkles,
  Bookmark,
  Send,
  Upload,
  Edit3,
  Eye,
  Tag,
  X,
} from 'lucide-react';
import { LearningMode } from '../types';

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
  onSaveToLibrary?: (snippet: CodeSnippetItem, tags: string[]) => void;
  onSendCodeToTutor?: (code: string, isReview: boolean) => void;
  onUploadJavaFile?: (filename: string, code: string) => void;
  learningMode?: LearningMode;
  isSavedInLibrary?: boolean;
}

export const CodeWhiteboard: React.FC<CodeWhiteboardProps> = ({
  currentSnippet,
  onSaveToLibrary,
  onSendCodeToTutor,
  onUploadJavaFile,
  learningMode = 'explanatory',
  isSavedInLibrary = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (currentSnippet) {
      setEditableCode(currentSnippet.code);
      // Auto suggest initial tags
      const inferred: string[] = [];
      if (currentSnippet.title.toLowerCase().includes('busca')) inferred.push('Busca');
      if (currentSnippet.title.toLowerCase().includes('quick') || currentSnippet.title.toLowerCase().includes('sort')) inferred.push('Ordenação');
      if (currentSnippet.complexityTime) inferred.push(currentSnippet.complexityTime.trim());
      if (currentSnippet.javaStandardClass) inferred.push('Java Standard');
      setSelectedTags(inferred);
    }
  }, [currentSnippet]);

  const handleCopy = () => {
    const codeToCopy = isEditing ? editableCode : currentSnippet?.code || '';
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setEditableCode(content);
      setIsEditing(true);
      if (onUploadJavaFile) {
        onUploadJavaFile(file.name, content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSendToTutor = () => {
    const code = isEditing ? editableCode : currentSnippet?.code || '';
    if (!code || !onSendCodeToTutor) return;
    onSendCodeToTutor(code, learningMode === 'review');
  };

  const handleConfirmSave = () => {
    if (!currentSnippet || !onSaveToLibrary) return;
    const finalSnippet: CodeSnippetItem = {
      ...currentSnippet,
      code: isEditing ? editableCode : currentSnippet.code,
    };
    onSaveToLibrary(finalSnippet, selectedTags.length > 0 ? selectedTags : ['Java']);
    setShowTagModal(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!selectedTags.includes(clean)) {
        setSelectedTags([...selectedTags, clean]);
      }
      setTagInput('');
    }
  };

  if (!currentSnippet) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/60 border border-slate-800 rounded-xl text-center min-h-[420px]">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
          <Terminal className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-slate-200 mb-1">Lousa de Código Java Vazia</h4>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
          Converse com o tutor e diga <span className="text-amber-300 font-medium">&ldquo;coloque o código na lousa&rdquo;</span>, envie um arquivo <code className="text-amber-400 font-mono">.java</code> ou selecione um algoritmo nos tópicos rápidos.
        </p>

        <label className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer transition-colors shadow-sm shadow-amber-500/20">
          <Upload className="w-3.5 h-3.5" />
          <span>Carregar Arquivo .java</span>
          <input
            type="file"
            accept=".java,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  const lines = (isEditing ? editableCode : currentSnippet.code).split('\n');

  return (
    <div className="flex flex-col bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>{currentSnippet.title}</span>
              {isEditing && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Modo Edição
                </span>
              )}
            </h3>
            <span className="text-[11px] text-slate-400">Código Java Idiomático para Lousa</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle View / Edit */}
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setIsEditing(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                !isEditing
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Ver</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                isEditing
                  ? 'bg-slate-800 text-amber-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editar</span>
            </button>
          </div>

          {/* Upload .java */}
          <label className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 cursor-pointer transition-colors">
            <Upload className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">.java</span>
            <input
              type="file"
              accept=".java,text/plain"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Save to Library Button */}
          {onSaveToLibrary && (
            <button
              onClick={() => setShowTagModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors border border-slate-800"
              title="Salvar na Biblioteca de Snippets"
            >
              {justSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Salvo!</span>
                </>
              ) : isSavedInLibrary ? (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>Salvo</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
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
                <span>Copiar</span>
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

      {/* Code Body: Viewer or Editable Textarea */}
      {isEditing ? (
        <div className="p-4 bg-slate-950">
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            rows={14}
            className="w-full h-80 font-mono text-xs sm:text-sm bg-slate-950 text-slate-100 p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-amber-500 resize-y leading-relaxed"
            placeholder="Digite ou edite o código Java aqui..."
          />
        </div>
      ) : (
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
      )}

      {/* Bottom Action Strip: Send Code to Tutor */}
      {onSendCodeToTutor && (
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            {learningMode === 'review'
              ? 'O tutor fará a análise de complexidade e legibilidade sem reescrever o código.'
              : 'Envie o código para o tutor comentar por voz em tempo real.'}
          </span>
          <button
            onClick={handleSendToTutor}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-sm shadow-amber-500/20 ml-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {learningMode === 'review' ? 'Solicitar Code Review' : 'Enviar ao Tutor por Voz'}
            </span>
          </button>
        </div>
      )}

      {/* Save Modal for Tags */}
      {showTagModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>Salvar na Biblioteca de Snippets</span>
              </h4>
              <button
                onClick={() => setShowTagModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Adicione tags para organizar este código na biblioteca (pressione Enter para adicionar).
            </p>

            <div className="flex flex-wrap items-center gap-1 min-h-6">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-amber-300 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-700"
                >
                  #{tag}
                  <button
                    onClick={() => setSelectedTags(selectedTags.filter((t) => t !== tag))}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Digite uma tag (ex: Ordenação, Arrays)..."
              className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTagModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmSave}
                className="px-4 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors"
              >
                Confirmar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
