import React, { useState, useEffect } from 'react';
import {
  CodeWhiteboard,
  CodeSnippetItem,
} from './components/CodeWhiteboard';
import { AlgorithmVisualizer } from './components/AlgorithmVisualizer';
import { CollectionsGuide } from './components/CollectionsGuide';
import { VoiceSessionPanel } from './components/VoiceSessionPanel';
import { SessionHistoryPanel } from './components/SessionHistoryPanel';
import { ALGORITHM_PRESETS, AlgorithmPreset } from './data/javaTopics';
import { VoiceSessionRecord, INITIAL_SEED_SESSIONS } from './data/sessionHistory';
import {
  Mic,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  History,
} from 'lucide-react';

const STORAGE_KEY = 'algoritmia_voice_sessions';

function loadSavedSessions(): VoiceSessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved sessions from localStorage:', e);
  }
  return INITIAL_SEED_SESSIONS;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'voice' | 'whiteboard' | 'visualizer' | 'collections' | 'history'>('voice');
  const [sessions, setSessions] = useState<VoiceSessionRecord[]>(loadSavedSessions);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippetItem | null>({
    id: 'default-bs',
    title: 'Busca Binária (Binary Search) em Java',
    code: ALGORITHM_PRESETS[0].codeSnippet,
    explanation: 'Busca um elemento num array ordenado em O(log n), dividindo a fatia de busca pela metade.',
    complexityTime: 'O(log n)',
    complexitySpace: 'O(1)',
    javaStandardClass: 'java.util.Arrays.binarySearch()',
  });
  const [externalSpokenPrompt, setExternalSpokenPrompt] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [pedagogicalMode, setPedagogicalMode] = useState<'explanatory' | 'socratic'>('explanatory');

  const handleAskTutor = (prompt: string) => {
    setExternalSpokenPrompt(prompt);
    setActiveTab('voice');
  };

  const handleSendCodeToWhiteboard = (preset: AlgorithmPreset) => {
    setCurrentSnippet({
      id: preset.id,
      title: preset.name,
      code: preset.codeSnippet,
      explanation: preset.shortDescription,
      complexityTime: preset.complexityTime,
      complexitySpace: preset.complexitySpace,
      javaStandardClass: preset.javaClass,
    });
    setActiveTab('whiteboard');
  };

  const handleCodeSnippetReceivedFromVoice = (snippet: CodeSnippetItem) => {
    setCurrentSnippet(snippet);
  };

  const handleSessionFinished = (newSession: VoiceSessionRecord) => {
    setSessions((prev) => {
      const existsIndex = prev.findIndex((s) => s.id === newSession.id);
      let updated: VoiceSessionRecord[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = newSession;
      } else {
        updated = [newSession, ...prev];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClearAllSessions = () => {
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar (Universal Constitution Contract) */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 lg:px-12 py-3.5 bg-[#0a0e17]/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Zone 1: Brand Wordmark (single text element) */}
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 whitespace-nowrap shrink-0 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
          <span>Algoritmia</span>
          <span className="text-xs font-normal text-slate-400">· Tutor de Java</span>
        </a>

        {/* Zone 2: Navigation Links (single line, clean hover) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('voice')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'voice' ? 'text-amber-300 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Sessão de Voz ao Vivo
          </button>
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'whiteboard' ? 'text-amber-300 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Lousa de Código
          </button>
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'visualizer' ? 'text-amber-300 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Visualizador Interativo
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'collections' ? 'text-amber-300 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            Java Collections
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-amber-300 font-semibold' : 'hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Histórico de Sessões</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              {sessions.length}
            </span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('voice')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-amber-500/20"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Falar com o Tutor</span>
          </button>
        </div>
      </header>

      {/* Hero Strip / Context Header */}
      <section className="px-6 lg:px-12 pt-8 pb-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/30 to-transparent">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Live API · Voz Bidirecional em Baixa Latência</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance">
              Seu tutor sênior de Java, algoritmos e estruturas de dados por voz.
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Converse em tempo real como se estivesse diante da lousa de uma sala de estudos.
              Comece pela intuição com analogias cotidianas, veja exemplos pequenos, compreenda a complexidade e veja a lousa de código atualizar automaticamente.
            </p>
          </div>

          {/* Quick Prompts Carousel */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-[11px] text-slate-400">Sugestões de temas para falar agora:</span>
            <div className="flex flex-wrap gap-2 max-w-md">
              {[
                'Explique QuickSort com analogia',
                'Diferença de HashMap e TreeMap',
                'Por que ArrayDeque substitui Stack?',
                'Quando usar busca binária?',
              ].map((promptText) => (
                <button
                  key={promptText}
                  onClick={() => handleAskTutor(promptText)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 rounded-lg transition-colors text-left"
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workspace Navigation Tabs for Mobile / Compact */}
      <div className="md:hidden px-6 pt-4 flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { key: 'voice', label: 'Voz ao Vivo' },
          { key: 'whiteboard', label: 'Lousa' },
          { key: 'visualizer', label: 'Visualizador' },
          { key: 'collections', label: 'Coleções' },
          { key: 'history', label: `Histórico (${sessions.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'bg-amber-400 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Dual-Column Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-12">
        {activeTab === 'history' ? (
          <SessionHistoryPanel
            sessions={sessions}
            onSelectCodeSnippet={(snippet) => {
              setCurrentSnippet(snippet);
              setActiveTab('whiteboard');
            }}
            onAskTutor={(prompt) => {
              handleAskTutor(prompt);
            }}
            onDeleteSession={handleDeleteSession}
            onClearAllSessions={handleClearAllSessions}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Voice Session Studio (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <VoiceSessionPanel
                onCodeSnippetReceived={handleCodeSnippetReceivedFromVoice}
                onSessionFinished={handleSessionFinished}
                onOpenHistory={() => setActiveTab('history')}
                savedSessionCount={sessions.length}
                externalSpokenPrompt={externalSpokenPrompt}
                onClearExternalPrompt={() => setExternalSpokenPrompt(null)}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                pedagogicalMode={pedagogicalMode}
                setPedagogicalMode={setPedagogicalMode}
              />

              {/* Quick Algorithm Carousel below Voice */}
              <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-200">
                    Exercícios e Algoritmos Clássicos para Praticar
                  </h4>
                  <span className="text-[11px] text-slate-500">6 tópicos prontos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALGORITHM_PRESETS.map((algo) => (
                    <div
                      key={algo.id}
                      className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-amber-400 font-mono">{algo.category}</span>
                          <span className="font-mono text-slate-400">{algo.complexityTime}</span>
                        </div>
                        <h5 className="text-xs font-semibold text-white mb-1">{algo.name}</h5>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {algo.shortDescription}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => handleAskTutor(algo.spokenPrompt)}
                          className="flex-1 py-1 text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 transition-colors text-center"
                        >
                          Perguntar por voz
                        </button>
                        <button
                          onClick={() => handleSendCodeToWhiteboard(algo)}
                          className="py-1 px-2 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        >
                          Ver código
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Code Whiteboard / Visualizer / Collections (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* View Switcher Tabs inside right workspace */}
              <div className="flex items-center justify-between p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'whiteboard'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lousa</span>
                </button>
                <button
                  onClick={() => setActiveTab('visualizer')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'visualizer'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Visualizador</span>
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    activeTab === 'collections'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Coleções</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 text-slate-400 hover:text-white"
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>Histórico</span>
                </button>
              </div>

              {/* Display Active Panel */}
              {activeTab === 'whiteboard' || activeTab === 'voice' ? (
                <CodeWhiteboard
                  currentSnippet={currentSnippet}
                  onSelectPreset={(id) => {
                    const preset = ALGORITHM_PRESETS.find((p) => p.id === id);
                    if (preset) handleSendCodeToWhiteboard(preset);
                  }}
                />
              ) : null}

              {activeTab === 'visualizer' && (
                <AlgorithmVisualizer
                  onAskTutor={handleAskTutor}
                  onSendCodeToWhiteboard={handleSendCodeToWhiteboard}
                />
              )}

              {activeTab === 'collections' && (
                <CollectionsGuide onAskTutor={handleAskTutor} />
              )}

              {/* Pedagogical Guideline Card for Student */}
              <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-2">
                <span className="font-semibold text-slate-300 block text-xs">
                  Como aproveitar seu tutor ao máximo:
                </span>
                <p className="leading-relaxed">
                  1. <strong>Interrompa a qualquer momento:</strong> Se você não entendeu uma analogia, basta falar ou clicar no botão &ldquo;Interromper&rdquo;.
                </p>
                <p className="leading-relaxed">
                  2. <strong>Peça dicas em vez da resposta:</strong> No &ldquo;Modo Socrático&rdquo;, ele fará perguntas orientadas para que você chegue à solução por si próprio.
                </p>
                <p className="leading-relaxed">
                  3. <strong>Peça código na lousa:</strong> Diga &ldquo;coloque a implementação de QuickSort na lousa&rdquo; para vê-la aparecer ao lado.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Top Bar Contract Compliant) */}
      <footer className="mt-auto px-6 lg:px-12 py-6 border-t border-slate-800/80 bg-slate-950/60 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>Algoritmia · Tutor de Java por Voz</span>
          <span aria-hidden="true">·</span>
          <span>Gemini 3.8 Live API</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Áudio: 16kHz PCM (mic) / 24kHz PCM (fala)</span>
          <span aria-hidden="true">·</span>
          <span>Java SE 21+ Collections</span>
        </div>
      </footer>
    </div>
  );
}
