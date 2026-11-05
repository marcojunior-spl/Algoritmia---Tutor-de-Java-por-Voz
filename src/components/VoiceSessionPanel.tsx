import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Volume2,
  Sparkles,
  Send,
  HelpCircle,
  Brain,
  GraduationCap,
  VolumeX,
  History,
  BookmarkCheck,
  Camera,
  Upload,
  FileCode,
  Download,
  SearchCode,
  Briefcase,
  Bug,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { LiveAudioPlayer, LiveAudioRecorder } from '../utils/audio';
import { CodeSnippetItem } from './CodeWhiteboard';
import { VoiceSessionRecord, extractConceptsFromText } from '../data/sessionHistory';
import { LearningMode, StudentLevel } from '../types';
import { InterviewTimer } from './InterviewTimer';
import { ImageCaptureModal } from './ImageCaptureModal';
import { SessionQuizModal } from './SessionQuizModal';
import { exportSessionToMarkdown } from '../utils/markdownExport';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  isInterrupted?: boolean;
  imageThumbnail?: string;
}

interface VoiceSessionPanelProps {
  onCodeSnippetReceived: (snippet: CodeSnippetItem) => void;
  onSessionFinished?: (session: VoiceSessionRecord) => void;
  onOpenHistory?: () => void;
  savedSessionCount?: number;
  externalSpokenPrompt: string | null;
  onClearExternalPrompt: () => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  pedagogicalMode: LearningMode;
  setPedagogicalMode: (mode: LearningMode) => void;
  studentLevel: StudentLevel;
  setStudentLevel: (level: StudentLevel) => void;
  onRecordProgress?: (topic: string, result: 'acerto' | 'erro', observation: string) => void;
  onUploadCodeToWhiteboard?: (code: string, filename: string) => void;
}

export const VoiceSessionPanel: React.FC<VoiceSessionPanelProps> = ({
  onCodeSnippetReceived,
  onSessionFinished,
  onOpenHistory,
  savedSessionCount = 0,
  externalSpokenPrompt,
  onClearExternalPrompt,
  selectedVoice,
  setSelectedVoice,
  pedagogicalMode,
  setPedagogicalMode,
  studentLevel,
  setStudentLevel,
  onRecordProgress,
  onUploadCodeToWhiteboard,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<
    'idle' | 'listening' | 'speaking' | 'interrupted' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');

  // Modals state
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const messagesRef = useRef<ChatMessage[]>([]);
  const sessionStartTimeRef = useRef<number | null>(null);
  const capturedSnippetsRef = useRef<CodeSnippetItem[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<LiveAudioPlayer | null>(null);
  const recorderRef = useRef<LiveAudioRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Audio visualization loop
  const startVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tutorAnalyser = playerRef.current?.getAnalyser();
      const userAnalyser = recorderRef.current?.getAnalyser();

      let isTutorSpeaking = false;
      let isUserSpeaking = false;

      // Draw audio waveform bars
      const barCount = 32;
      const barWidth = 4;
      const gap = 3;
      const startX = (canvas.width - barCount * (barWidth + gap)) / 2;

      let tutorData = new Uint8Array(32);
      if (tutorAnalyser) {
        tutorAnalyser.getByteFrequencyData(tutorData);
        const sum = tutorData.reduce((acc, v) => acc + v, 0);
        if (sum > 120) isTutorSpeaking = true;
      }

      let userData = new Uint8Array(32);
      if (userAnalyser) {
        userAnalyser.getByteFrequencyData(userData);
        const sum = userData.reduce((acc, v) => acc + v, 0);
        if (sum > 120) isUserSpeaking = true;
      }

      if (isTutorSpeaking) {
        setSessionStatus('speaking');
      } else if (isUserSpeaking) {
        setSessionStatus('listening');
      } else if (isConnected) {
        setSessionStatus('idle');
      }

      for (let i = 0; i < barCount; i++) {
        const val = isTutorSpeaking
          ? tutorData[i] || 0
          : isUserSpeaking
          ? userData[i] || 0
          : 6;

        const percent = Math.min(1, Math.max(0.08, val / 255));
        const height = percent * (canvas.height - 12);
        const x = startX + i * (barWidth + gap);
        const y = (canvas.height - height) / 2;

        if (isTutorSpeaking) {
          ctx.fillStyle = '#f59e0b'; // Amber for Tutor
        } else if (isUserSpeaking) {
          ctx.fillStyle = '#10b981'; // Emerald for User
        } else {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.4)'; // Slate idle
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, height, 2);
        ctx.fill();
      }
    };

    draw();
  }, [isConnected]);

  // Clean disconnect and save session history
  const disconnectSession = useCallback(() => {
    // Save session if messages exist
    if (messagesRef.current.length > 0 && onSessionFinished) {
      const currentMsgs = [...messagesRef.current];
      const duration = Math.max(
        5,
        Math.round((Date.now() - (sessionStartTimeRef.current || Date.now())) / 1000)
      );
      const fullText = currentMsgs.map((m) => m.text).join(' ');
      const concepts = extractConceptsFromText(fullText);
      const firstUserMsg = currentMsgs.find((m) => m.sender === 'user')?.text || '';
      const title = firstUserMsg
        ? firstUserMsg.slice(0, 48) + (firstUserMsg.length > 48 ? '...' : '')
        : `Sessão sobre ${concepts[0] || 'Java & Algoritmos'}`;
      const firstTutorMsg =
        currentMsgs.find((m) => m.sender === 'tutor')?.text ||
        'Discussão sobre Java e estruturas de dados.';
      const summary =
        firstTutorMsg.slice(0, 160) + (firstTutorMsg.length > 160 ? '...' : '');

      const record: VoiceSessionRecord = {
        id: `session-${Date.now()}`,
        title,
        date: new Date().toISOString(),
        formattedDate: `Hoje às ${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        durationSeconds: duration,
        voiceUsed: selectedVoice,
        pedagogicalMode,
        studentLevel,
        messages: currentMsgs,
        codeSnippets: [...capturedSnippetsRef.current],
        conceptsDiscussed: concepts,
        summary,
      };

      onSessionFinished(record);
    }

    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.close();
      playerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setSessionStatus('idle');
  }, [onSessionFinished, selectedVoice, pedagogicalMode]);

  // Connect to Gemini Live
  const connectSession = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setErrorMessage(null);
    sessionStartTimeRef.current = Date.now();
    capturedSnippetsRef.current = [];

    try {
      // 1. Initialize Player
      const player = new LiveAudioPlayer();
      playerRef.current = player;

      // 2. Initialize Recorder
      const recorder = new LiveAudioRecorder((base64) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64,
            })
          );
        }
      });
      await recorder.start();
      recorderRef.current = recorder;

      // 3. Connect WebSocket with voice, mode, and level
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${encodeURIComponent(
        selectedVoice
      )}&mode=${encodeURIComponent(pedagogicalMode)}&level=${encodeURIComponent(studentLevel)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setSessionStatus('idle');
        startVisualizer();
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'audio') {
            player.playChunk(msg.audio);
          } else if (msg.type === 'outputTranscript') {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'tutor') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + msg.text },
                ];
              }
              return [
                ...prev,
                {
                  id: Math.random().toString(),
                  sender: 'tutor',
                  text: msg.text,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ];
            });
          } else if (msg.type === 'inputTranscript') {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'user') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, text: last.text + ' ' + msg.text },
                ];
              }
              return [
                ...prev,
                {
                  id: Math.random().toString(),
                  sender: 'user',
                  text: msg.text,
                  timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              ];
            });
          } else if (msg.type === 'interrupted') {
            player.stopPlayback();
            setSessionStatus('interrupted');
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'tutor') {
                return [
                  ...prev.slice(0, -1),
                  { ...last, isInterrupted: true },
                ];
              }
              return prev;
            });
          } else if (msg.type === 'codeSnippet') {
            if (msg.snippet) {
              capturedSnippetsRef.current.push(msg.snippet);
              onCodeSnippetReceived(msg.snippet);
            }
          } else if (msg.type === 'progressUpdate') {
            if (msg.progress && onRecordProgress) {
              onRecordProgress(
                msg.progress.topic,
                msg.progress.result,
                msg.progress.observation
              );
            }
          } else if (msg.type === 'error') {
            setErrorMessage(msg.error);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket connection error:', e);
        setErrorMessage('Não foi possível conectar ao servidor Live.');
        disconnectSession();
      };

      ws.onclose = () => {
        disconnectSession();
      };
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Permissão de microfone negada no navegador. Habilite o microfone para conversar por voz.'
          : 'Erro ao inicializar sessão de voz com Gemini Live.'
      );
      disconnectSession();
    }
  }, [
    isConnected,
    isConnecting,
    selectedVoice,
    pedagogicalMode,
    studentLevel,
    startVisualizer,
    disconnectSession,
    onCodeSnippetReceived,
    onRecordProgress,
  ]);

  // Handle external prompt click
  useEffect(() => {
    if (externalSpokenPrompt) {
      if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'text',
            text: externalSpokenPrompt,
          })
        );
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: 'user',
            text: externalSpokenPrompt,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        // If not connected, connect first or ask via REST
        connectSession().then(() => {
          setTimeout(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'text',
                  text: externalSpokenPrompt,
                })
              );
            }
          }, 1200);
        });
      }
      onClearExternalPrompt();
    }
  }, [externalSpokenPrompt, isConnected, connectSession, onClearExternalPrompt]);

  // Send Image to Live Session
  const handleSendImage = (base64Jpeg: string, promptText: string) => {
    const userMsgText = `[Foto de exercício enviada] ${promptText}`;

    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        sender: 'user',
        text: userMsgText,
        imageThumbnail: base64Jpeg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'image',
          image: base64Jpeg,
          mimeType: 'image/jpeg',
          prompt: promptText,
        })
      );
    } else {
      // Connect first then send
      connectSession().then(() => {
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                type: 'image',
                image: base64Jpeg,
                mimeType: 'image/jpeg',
                prompt: promptText,
              })
            );
          }
        }, 1200);
      });
    }
  };

  // Upload .java file in chat
  const handleUploadJavaFileChat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const code = reader.result as string;
      if (onUploadCodeToWhiteboard) {
        onUploadCodeToWhiteboard(code, file.name);
      }

      const promptText = `Enviei o arquivo Java "${file.name}" para a lousa:\n\n\`\`\`java\n${code}\n\`\`\`\nPor favor, comente e analise por voz.`;

      if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'text', text: promptText }));
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: `[Arquivo carregado: ${file.name}]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Export current session to Markdown
  const handleExportSessionMarkdown = () => {
    const fullText = messages.map((m) => m.text).join(' ');
    const concepts = extractConceptsFromText(fullText);
    const title = messages[0]?.text
      ? messages[0].text.slice(0, 40)
      : `Sessão sobre ${concepts[0] || 'Java'}`;

    const duration = Math.max(
      5,
      Math.round((Date.now() - (sessionStartTimeRef.current || Date.now())) / 1000)
    );
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;

    exportSessionToMarkdown({
      title,
      date: new Date().toLocaleDateString('pt-BR'),
      durationFormatted: `${mins}m ${secs}s`,
      level: studentLevel,
      mode: pedagogicalMode,
      voice: selectedVoice,
      messages,
      codeSnippets: capturedSnippetsRef.current,
    });
  };

  // Toggle mute
  const handleToggleMute = () => {
    if (recorderRef.current) {
      const nextMute = !isMuted;
      recorderRef.current.setMute(nextMute);
      setIsMuted(nextMute);
    }
  };

  // Immediate interruption
  const handleInterrupt = () => {
    if (playerRef.current) {
      playerRef.current.stopPlayback();
    }
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'interrupted' }));
    }
  };

  // Send typed message
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const txt = textInput.trim();
    setTextInput('');

    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'text', text: txt }));
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: txt,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } else {
      // Send via REST fallback
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'user',
          text: txt,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);

      fetch('/api/ask-tutor-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: txt, mode: pedagogicalMode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.text) {
            setMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                sender: 'tutor',
                text: data.text,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ]);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Session Top Bar: Voice & Controls */}
      <div className="flex flex-col gap-3 px-6 py-4 bg-slate-950/80 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isConnected
                  ? sessionStatus === 'speaking'
                    ? 'bg-amber-400 ring-4 ring-amber-400/20'
                    : sessionStatus === 'listening'
                    ? 'bg-emerald-400 ring-4 ring-emerald-400/20'
                    : 'bg-emerald-500'
                  : isConnecting
                  ? 'bg-blue-400 animate-pulse'
                  : 'bg-slate-600'
              }`}
            />
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                Gemini 3.8 Live Voice
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  (16kHz Mic / 24kHz Voz)
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                {isConnected
                  ? sessionStatus === 'speaking'
                    ? 'Tutor explicando por voz...'
                    : sessionStatus === 'listening'
                    ? 'Ouvindo você...'
                    : 'Conectado · Fale naturalmente ao microfone'
                  : isConnecting
                  ? 'Estabelecendo ponte WebSocket...'
                  : 'Pronto para iniciar sessão'}
              </span>
            </div>
          </div>

          {/* Level and Voice selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Level Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300">
              <span className="text-slate-500 text-[10px] uppercase font-bold">Nível:</span>
              <select
                value={studentLevel}
                onChange={(e) => setStudentLevel(e.target.value as StudentLevel)}
                disabled={isConnected}
                className="bg-transparent text-xs text-amber-300 font-medium focus:outline-none disabled:opacity-50 cursor-pointer"
              >
                <option value="iniciante" className="bg-slate-900 text-slate-200">Iniciante (Mais analogias)</option>
                <option value="intermediário" className="bg-slate-900 text-slate-200">Intermediário (Rigor & Java)</option>
                <option value="avançado" className="bg-slate-900 text-slate-200">Avançado (JVM & Big-O)</option>
              </select>
            </div>

            {/* Voice Picker */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isConnected}
              className="text-xs bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-amber-500 disabled:opacity-50"
            >
              <option value="Zephyr">Voz: Zephyr (Calma)</option>
              <option value="Puck">Voz: Puck (Dinâmica)</option>
              <option value="Charon">Voz: Charon (Profunda)</option>
              <option value="Kore">Voz: Kore (Clara)</option>
              <option value="Fenrir">Voz: Fenrir (Firme)</option>
              <option value="Aoede">Voz: Aoede (Expressiva)</option>
            </select>
          </div>
        </div>

        {/* 5 Modes Selector Strip */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl overflow-x-auto text-xs">
          {[
            { id: 'explanatory', label: 'Explicativo', icon: GraduationCap, tip: 'Analogias, passo a passo e complexidade' },
            { id: 'socratic', label: 'Socrático', icon: Brain, tip: 'Dicas e perguntas guiadas' },
            { id: 'review', label: 'Revisão de Código', icon: SearchCode, tip: '2 a 3 pontos de complexidade e desafio' },
            { id: 'interview', label: 'Simulado de Entrevista', icon: Briefcase, tip: '15 min de prova com avaliação final' },
            { id: 'debug', label: 'Debug & Stack Trace', icon: Bug, tip: 'Diagnóstico passo a passo de erros' },
          ].map((m) => {
            const Icon = m.icon;
            const isSelected = pedagogicalMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setPedagogicalMode(m.id as LearningMode)}
                title={m.tip}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* If Interview Mode: Show 15-Minute Technical Interview Timer */}
        {pedagogicalMode === 'interview' && (
          <InterviewTimer
            initialMinutes={15}
            onTimeExpired={() => {
              if (isConnected && wsRef.current) {
                wsRef.current.send(
                  JSON.stringify({
                    type: 'text',
                    text: 'O tempo de 15 minutos do simulado de entrevista acabou. Por favor, faça a avaliação completa do meu desempenho.',
                  })
                );
              }
            }}
            onSubmitSolution={() => {
              const prompt = 'Terminei minha resolução do problema da entrevista. Por favor, faça a avaliação completa de corretude, complexidade, clareza e comunicação, com nota de 0 a 100 e pontos de melhoria.';
              if (isConnected && wsRef.current) {
                wsRef.current.send(JSON.stringify({ type: 'text', text: prompt }));
              }
              setMessages((prev) => [
                ...prev,
                {
                  id: Math.random().toString(),
                  sender: 'user',
                  text: '[Solução da Entrevista Entregue para Avaliação]',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
          />
        )}
      </div>

      {/* Visual Waveform Canvas */}
      <div className="relative h-16 bg-slate-950/90 border-b border-slate-800 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={56}
          className="w-full max-w-md h-14"
        />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Inicie a conversa para ativar a voz em tempo real
            </span>
          </div>
        )}
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="px-6 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 text-xs underline ml-2"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Live Transcript Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-[300px] max-h-[440px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-3 text-amber-400">
              <Mic className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Pronto para conversar sobre Java no modo{' '}
              <span className="text-amber-400 capitalize">{pedagogicalMode}</span>
            </h4>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Você pode falar no microfone, enviar uma foto de um exercício do caderno, carregar um arquivo <code className="text-amber-300 font-mono">.java</code> ou colar código na lousa.
            </p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">
                  {m.sender === 'user' ? 'Você (Aluno)' : 'Tutor Java'}
                </span>
                <span>·</span>
                <span>{m.timestamp}</span>
                {m.isInterrupted && (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                    Interrompido
                  </span>
                )}
              </div>

              {m.imageThumbnail && (
                <div className="mb-2 max-w-[200px] rounded-xl overflow-hidden border border-slate-700">
                  <img
                    src={`data:image/jpeg;base64,${m.imageThumbnail}`}
                    alt="Exercício enviado"
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-xs'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-xs shadow-md'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Voice Controls & Multimodal Inputs */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col gap-3">
        {/* Main Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-98 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{isConnecting ? 'Conectando...' : 'Iniciar Conversa por Voz'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={disconnectSession}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>Encerrar Chamada</span>
                </button>

                <button
                  onClick={handleToggleMute}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-colors ${
                    isMuted
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? 'Mudo' : 'Microfone Ativo'}</span>
                </button>

                <button
                  onClick={handleInterrupt}
                  title="Interrompe o tutor para você falar imediatamente"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Interromper</span>
                </button>
              </>
            )}

            {/* End with Quiz Button */}
            <button
              onClick={() => setIsQuizModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 rounded-xl transition-colors"
              title="Gerar quiz de fixação de 3 a 5 perguntas sobre o que foi discutido"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Encerrar com Quiz</span>
            </button>
          </div>

          {/* Multimodal input shortcuts (Camera & File) */}
          <div className="flex items-center gap-2">
            {/* Camera / Photo Button */}
            <button
              onClick={() => setIsImageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition-colors"
              title="Tirar foto ou enviar imagem de exercício do caderno"
            >
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Foto do Caderno</span>
            </button>

            {/* Upload .java */}
            <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl cursor-pointer transition-colors" title="Carregar arquivo .java">
              <Upload className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Upload .java</span>
              <input
                type="file"
                accept=".java,text/plain"
                onChange={handleUploadJavaFileChat}
                className="hidden"
              />
            </label>

            {/* Export Markdown */}
            {messages.length > 0 && (
              <button
                onClick={handleExportSessionMarkdown}
                className="flex items-center gap-1 px-2.5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl transition-colors"
                title="Exportar sessão atual em Markdown (.md)"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span className="hidden md:inline">Exportar .md</span>
              </button>
            )}

            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors"
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>Histórico ({savedSessionCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Companion Input */}
        <form onSubmit={handleSendText} className="flex items-center gap-2 mt-1">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Digite sua dúvida, cole um stack trace ou enunciado..."
            className="flex-1 px-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>

      {/* Image Capture / Upload Modal */}
      <ImageCaptureModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSendImage={handleSendImage}
      />

      {/* Session Quiz Modal */}
      <SessionQuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        sessionTranscript={messages.map((m) => `${m.sender}: ${m.text}`).join('\n')}
        sessionTopics={extractConceptsFromText(messages.map((m) => m.text).join(' '))}
        studentLevel={studentLevel}
        onRecordProgress={(topic, result, obs) => {
          if (onRecordProgress) {
            onRecordProgress(topic, result, obs);
          }
        }}
      />
    </div>
  );
};
