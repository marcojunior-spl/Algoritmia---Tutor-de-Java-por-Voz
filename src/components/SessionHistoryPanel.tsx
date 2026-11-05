import React, { useState } from 'react';
import {
  History,
  Search,
  Calendar,
  Clock,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Code2,
  Brain,
  GraduationCap,
  ChevronRight,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { VoiceSessionRecord } from '../data/sessionHistory';
import { CodeSnippetItem } from './CodeWhiteboard';

interface SessionHistoryPanelProps {
  sessions: VoiceSessionRecord[];
  onSelectCodeSnippet: (snippet: CodeSnippetItem) => void;
  onAskTutor: (prompt: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
}

export const SessionHistoryPanel: React.FC<SessionHistoryPanelProps> = ({
  sessions,
  onSelectCodeSnippet,
  onAskTutor,
  onDeleteSession,
  onClearAllSessions,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    sessions.length > 0 ? sessions[0].id : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'explanatory' | 'socratic'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = filterMode === 'all' || s.pedagogicalMode === filterMode;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      s.conceptsDiscussed.some((c) => c.toLowerCase().includes(q)) ||
      s.messages.some((m) => m.text.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const activeSession =
    sessions.find((s) => s.id === selectedSessionId) || filteredSessions[0] || null;

  // Format seconds to min:sec
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder < 10 ? '0' : ''}${remainder}s`;
  };

  const handleCopyTranscript = (session: VoiceSessionRecord) => {
    const transcriptText = session.messages
      .map((m) => `[${m.timestamp}] ${m.sender === 'user' ? 'Aluno' : 'Tutor'}: ${m.text}`)
      .join('\n\n');

    navigator.clipboard.writeText(
      `--- ${session.title} (${session.formattedDate}) ---\nConceitos: ${session.conceptsDiscussed.join(
        ', '
      )}\n\n${transcriptText}`
    );
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalStudyTimeSec = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalConceptsCount = new Set(sessions.flatMap((s) => s.conceptsDiscussed)).size;

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl text-slate-200">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Histórico de Sessões de Voz</span>
            <span aria-hidden="true">·</span>
            <span>Revisão de Transcrições</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400 font-mono">Conceitos Java</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Interações e Conceitos Discutidos por Voz
          </h2>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-5 text-xs text-slate-400 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800/80">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Sessões</span>
            <span className="font-mono text-white font-semibold text-sm">{sessions.length}</span>
          </div>
          <span className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Tempo Estudado</span>
            <span className="font-mono text-amber-300 font-semibold text-sm">
              {formatDuration(totalStudyTimeSec)}
            </span>
          </div>
          <span className="h-6 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Conceitos</span>
            <span className="font-mono text-emerald-300 font-semibold text-sm">
              {totalConceptsCount} únicos
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por conceito Java, termo ou fala (ex: QuickSort, O(1), HashMap)..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Segmented Filter Control */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                filterMode === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({sessions.length})
            </button>
            <button
              onClick={() => setFilterMode('explanatory')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                filterMode === 'explanatory'
                  ? 'bg-slate-800 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Explicativas
            </button>
            <button
              onClick={() => setFilterMode('socratic')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                filterMode === 'socratic'
                  ? 'bg-slate-800 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Socráticas
            </button>
          </div>

          {sessions.length > 2 && (
            <button
              onClick={onClearAllSessions}
              title="Limpar histórico"
              className="p-2 text-xs text-slate-500 hover:text-rose-400 bg-slate-950/80 border border-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Column: Sessions List + Detail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Sessions (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Nenhuma sessão encontrada para a busca.</p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = activeSession?.id === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {session.formattedDate}
                    </span>
                    <span className="font-mono text-amber-400/90 font-medium">
                      {formatDuration(session.durationSeconds)}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-white mb-1.5 line-clamp-1">
                    {session.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {session.summary}
                  </p>

                  {/* Clean unboxed metadata with bullet separators (frontend-design constitution) */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="text-slate-300 font-medium">
                      {session.pedagogicalMode === 'explanatory' ? 'Modo Explicativo' : 'Modo Socrático'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Voz: {session.voiceUsed}</span>
                    <span aria-hidden="true">·</span>
                    <span>{session.messages.length} falas</span>
                    {session.codeSnippets.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-amber-300 font-medium">
                          {session.codeSnippets.length} código
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Session Detail & Full Transcript (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 bg-slate-950/90 border border-slate-800/90 rounded-xl p-6 min-h-[500px]">
          {activeSession ? (
            <>
              {/* Session Detail Top */}
              <div className="flex flex-col gap-3 pb-4 border-b border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{activeSession.formattedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">Duração: {formatDuration(activeSession.durationSeconds)}</span>
                    <span aria-hidden="true">·</span>
                    <span>Voz: {activeSession.voiceUsed}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyTranscript(activeSession)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
                    >
                      {copiedId === activeSession.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Transcrição</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onDeleteSession(activeSession.id)}
                      title="Excluir esta sessão"
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-tight">
                  {activeSession.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <strong className="text-amber-400 font-medium">Resumo do Aprendizado:</strong>{' '}
                  {activeSession.summary}
                </p>

                {/* Concepts Discussed Tags (Unboxed as per constitution) */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Conceitos de Java e Algoritmos Mencionados:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {activeSession.conceptsDiscussed.map((concept, idx) => (
                      <span
                        key={idx}
                        className="text-amber-300/90 font-mono text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Snippets from this session if any */}
              {activeSession.codeSnippets.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-amber-400" />
                    Código Java Gerado Nesta Sessão ({activeSession.codeSnippets.length})
                  </span>
                  <div className="space-y-2">
                    {activeSession.codeSnippets.map((snippet) => (
                      <div
                        key={snippet.id}
                        className="flex items-center justify-between p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg"
                      >
                        <div>
                          <span className="text-xs font-medium text-white block">
                            {snippet.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Tempo {snippet.complexityTime} · Espaço {snippet.complexitySpace}
                          </span>
                        </div>
                        <button
                          onClick={() => onSelectCodeSnippet(snippet)}
                          className="px-3 py-1 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>Abrir na Lousa</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Transcript Area */}
              <div className="flex flex-col gap-2 flex-1">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Transcrição Completa da Conversa de Voz ({activeSession.messages.length} intervenções)
                </span>

                <div className="space-y-3 max-h-[360px] overflow-y-auto p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 pr-2">
                  {activeSession.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-300">
                          {m.sender === 'user' ? 'Aluno (Voz)' : 'Tutor Java (Voz)'}
                        </span>
                        <span>·</span>
                        <span>{m.timestamp}</span>
                        {m.isInterrupted && (
                          <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1 rounded border border-amber-500/20">
                            Interrompido
                          </span>
                        )}
                      </div>
                      <div
                        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                          m.sender === 'user'
                            ? 'bg-amber-500/90 text-slate-950 font-medium rounded-tr-xs'
                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action: Ask Tutor to resume from this session */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Deseja aprofundar esses tópicos na próxima chamada?
                </span>
                <button
                  onClick={() =>
                    onAskTutor(
                      `Quero retomar a discussão da sessão sobre ${activeSession.title}, focando nos conceitos de ${activeSession.conceptsDiscussed.slice(0, 3).join(', ')}.`
                    )
                  }
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-500/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Retomar com o Tutor por Voz</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 text-slate-400">
              <FileText className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs">Selecione uma sessão ao lado para revisar a transcrição e conceitos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
