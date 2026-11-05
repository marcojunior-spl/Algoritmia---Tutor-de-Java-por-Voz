import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';
import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Type,
  FunctionDeclaration,
} from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(express.json());

// Server-side shared Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const BASE_SYSTEM_INSTRUCTION = `Você é um tutor de programação por voz amigável, experiente e calmo, especializado em Java, algoritmos e estruturas de dados.
O usuário está conversando com você AO VIVO, falando e ouvindo por voz em tempo real. Adapte tudo para a linguagem falada.

DIRETRIZES DE IDIOMA E TOM:
- Responda sempre em português do Brasil, de forma natural, amigável e descontraída, como um colega de faculdade ou trabalho mais sênior ensinando numa lousa.
- Termos técnicos em inglês consagrados (como array, stack, heap, hash map, linked list, time complexity) são bem-vindos, mas explique-os brevemente na primeira vez que citar.

FORMATO PARA VOZ (ESSENCIAL):
- Respostas curtas: de 3 a 5 frases no máximo por intervenção. Ao final, pare e faça uma pergunta rápida ou pergunte se o aluno quer aprofundar ou testar um exemplo.
- NÃO use markdown, não use listas com asteriscos, não use tabelas nem cite blocos de código na fala.
- NUNCA leia código linha por linha. Descreva a ideia em palavras naturais (exemplo: "a gente cria um ponteiro que avança até a metade, enquanto outro avança o dobro").
- Diga a complexidade de forma falada e fluida: "O de n ao quadrado", "O de n log n", "O de um", "tempo linear", "tempo constante".
- Se um código completo em Java for útil ou se o aluno pedir código, use a ferramenta "displayCodeSnippet" para colocar o código na lousa visual do aluno, e fale: "Vou deixar o código no texto da lousa para você acompanhar".

METODOLOGIA PEDAGÓGICA:
- Comece pela INTUIÇÃO e por uma analogia do cotidiano (exemplo: pilha de pratos para Stack, fila da padaria para Queue, índice de livro para HashMap/Binary Search).
- Mostre o funcionamento passo a passo com um exemplo pequeno (3 a 5 elementos).
- Explique o tempo e o espaço de forma falada.
- Em Java, conecte sempre com a Standard Library: ArrayList vs LinkedList, ArrayDeque, HashMap vs TreeMap, PriorityQueue, Collections.sort, etc.
- Se o aluno disser que quer pensar sozinho ou resolver um exercício, assuma o modo socrático: dê apenas dicas, faça perguntas e aponte armadilhas sem entregar a resposta completa de imediato.
- Se o aluno errar, acolha com gentileza, explique o ponto cego e convide a tentar de novo.`;

// Tool to display code snippet on the interactive whiteboard
const displayCodeSnippetTool: FunctionDeclaration = {
  name: "displayCodeSnippet",
  description: "Envia um código Java formatado e análise de complexidade para a lousa visual do aluno. Use sempre que for benéfico exibir código real ou quando o aluno pedir.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "Título conciso (ex: 'Busca Binária Iterativa em Java')",
      },
      code: {
        type: Type.STRING,
        description: "Código Java completo, moderno, idiomático e com comentários breves",
      },
      explanation: {
        type: Type.STRING,
        description: "Explicação em 2 a 3 frases sobre o funcionamento do código",
      },
      complexityTime: {
        type: Type.STRING,
        description: "Complexidade de tempo (ex: O(log n))",
      },
      complexitySpace: {
        type: Type.STRING,
        description: "Complexidade de espaço auxiliar (ex: O(1))",
      },
      javaStandardClass: {
        type: Type.STRING,
        description: "Equivalente na biblioteca padrão Java (ex: Arrays.binarySearch ou Collections.binarySearch)",
      },
    },
    required: ["title", "code", "explanation", "complexityTime", "complexitySpace"],
  },
};

// WebSocket server for live voice bridging
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket, request) => {
  let session: any = null;
  const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
  const requestedVoice = url.searchParams.get('voice') || 'Zephyr';
  const learningMode = url.searchParams.get('mode') || 'explanatory'; // 'explanatory' | 'socratic'

  let dynamicInstruction = BASE_SYSTEM_INSTRUCTION;
  if (learningMode === 'socratic') {
    dynamicInstruction += `\n\nATENÇÃO: O aluno selecionou o MODO SOCRÁTICO. Não dê respostas prontas nem códigos inteiros de início. Faça perguntas guiadas para ele raciocinar sozinho.`;
  }

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: requestedVoice,
            },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [{ functionDeclarations: [displayCodeSnippetTool] }],
        systemInstruction: dynamicInstruction,
      },
      callbacks: {
        onmessage: async (message: LiveServerMessage) => {
          try {
            // Forward audio chunks to client (24kHz PCM)
            for (const part of message.serverContent?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    audio: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    type: 'modelText',
                    text: part.text,
                  })
                );
              }
            }

            // Real-time transcriptions
            if (message.serverContent?.inputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'inputTranscript',
                  text: message.serverContent.inputTranscription.text,
                })
              );
            }
            if (message.serverContent?.outputTranscription?.text) {
              clientWs.send(
                JSON.stringify({
                  type: 'outputTranscript',
                  text: message.serverContent.outputTranscription.text,
                })
              );
            }

            // User interruption handling
            if (message.serverContent?.interrupted) {
              clientWs.send(
                JSON.stringify({
                  type: 'interrupted',
                })
              );
            }

            if (message.serverContent?.turnComplete) {
              clientWs.send(
                JSON.stringify({
                  type: 'turnComplete',
                })
              );
            }

            // Tool calls handling (interactive code display)
            if (message.toolCall?.functionCalls) {
              const responses = [];
              for (const call of message.toolCall.functionCalls) {
                if (call.name === 'displayCodeSnippet') {
                  const args = call.args as any;
                  clientWs.send(
                    JSON.stringify({
                      type: 'codeSnippet',
                      snippet: {
                        id: call.id,
                        title: args.title,
                        code: args.code,
                        explanation: args.explanation,
                        complexityTime: args.complexityTime,
                        complexitySpace: args.complexitySpace,
                        javaStandardClass: args.javaStandardClass,
                        timestamp: Date.now(),
                      },
                    })
                  );
                  responses.push({
                    id: call.id,
                    name: call.name,
                    response: { result: 'Código exibido com sucesso na lousa do aluno.' },
                  });
                }
              }

              if (responses.length > 0) {
                session.sendToolResponse({
                  functionResponses: responses,
                });
              }
            }
          } catch (err: any) {
            console.error('Error in session onmessage:', err);
          }
        },
        onerror: (err: any) => {
          console.error('Live API Session error:', err);
          clientWs.send(
            JSON.stringify({
              type: 'error',
              error: err?.message || 'Erro na conexão com Gemini Live.',
            })
          );
        },
        onclose: () => {
          clientWs.send(JSON.stringify({ type: 'closed' }));
        },
      },
    });

    clientWs.send(
      JSON.stringify({
        type: 'sessionReady',
        voice: requestedVoice,
        mode: learningMode,
      })
    );
  } catch (err: any) {
    console.error('Failed to connect to Live API:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        error: err?.message || 'Falha ao inicializar sessão com Gemini Live.',
      })
    );
    clientWs.close();
    return;
  }

  clientWs.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'audio' && data.audio && session) {
        // 16kHz PCM little endian base64
        session.sendRealtimeInput({
          audio: { data: data.audio, mimeType: 'audio/pcm;rate=16000' },
        });
      } else if (data.type === 'text' && data.text && session) {
        session.sendRealtimeInput({
          text: data.text,
        });
      }
    } catch (e) {
      console.error('Error processing client message:', e);
    }
  });

  clientWs.on('close', () => {
    if (session && typeof session.close === 'function') {
      try {
        session.close();
      } catch (e) {
        console.error('Error closing live session:', e);
      }
    }
  });
});

// Upgrade handling for WebSockets
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// REST Health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: 'gemini-3.8-live',
    timestamp: new Date().toISOString(),
  });
});

// REST Fallback for generating companion code or answers without mic
app.post('/api/ask-tutor-text', async (req, res) => {
  try {
    const { prompt, mode } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: BASE_SYSTEM_INSTRUCTION + (mode === 'socratic' ? '\nModo socrático ativado: oriente com perguntas.' : ''),
      },
    });

    res.json({
      text: response.text,
    });
  } catch (err: any) {
    console.error('Error in ask-tutor-text:', err);
    res.status(500).json({ error: err?.message || 'Falha ao processar resposta do tutor' });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Algoritmia Voice Tutor running on http://localhost:${port}`);
  });
}

startServer();
