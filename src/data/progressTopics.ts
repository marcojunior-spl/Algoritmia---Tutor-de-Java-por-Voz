import { TopicKey, TopicProgress } from '../types';

export const SRS_INTERVAL_DAYS = [1, 3, 7, 14];

export const ALL_TOPIC_KEYS: TopicKey[] = [
  'arrays',
  'listas',
  'pilhas',
  'filas',
  'hash maps',
  'árvores',
  'grafos',
  'recursão',
  'ordenação',
  'busca',
  'programação dinâmica',
];

export const INITIAL_TOPICS_PROGRESS: TopicProgress[] = [
  {
    key: 'arrays',
    name: 'Arrays & Acesso Contíguo',
    category: 'Fundamentos',
    description: 'Indexação O(1), localidade de cache e redimensionamento de ArrayList.',
    status: 'dominado',
    hits: 4,
    misses: 0,
    totalInteractions: 4,
    lastReviewedAt: Date.now() - 86400000 * 2,
    nextReviewAt: Date.now() + 86400000 * 5,
    srsIntervalStep: 2,
    recentObservations: [
      {
        result: 'acerto',
        observation: 'Explicou corretamente o custo O(1) de acesso direto por cálculo de endereço de memória.',
        timestamp: Date.now() - 86400000 * 2,
      },
    ],
  },
  {
    key: 'listas',
    name: 'Listas Encadeadas (LinkedList)',
    category: 'Estruturas Lineares',
    description: 'Ponteiros de nós, inserção nas pontas vs custo de ponteiros e cache.',
    status: 'em andamento',
    hits: 2,
    misses: 1,
    totalInteractions: 3,
    lastReviewedAt: Date.now() - 86400000 * 3,
    nextReviewAt: Date.now() - 3600000, // Due for review today!
    srsIntervalStep: 0,
    recentObservations: [
      {
        result: 'erro',
        observation: 'Confundiu o custo de acesso por índice na LinkedList, achando que era O(1) em vez de O(n).',
        timestamp: Date.now() - 86400000 * 3,
      },
    ],
  },
  {
    key: 'pilhas',
    name: 'Pilhas (Stack & ArrayDeque)',
    category: 'Estruturas Lineares',
    description: 'Política LIFO, por que ArrayDeque é preferido sobre java.util.Stack.',
    status: 'dominado',
    hits: 3,
    misses: 0,
    totalInteractions: 3,
    lastReviewedAt: Date.now() - 86400000 * 1,
    nextReviewAt: Date.now() + 86400000 * 2,
    srsIntervalStep: 1,
    recentObservations: [
      {
        result: 'acerto',
        observation: 'Lembrou que java.util.Stack herda de Vector e tem overhead desnecessário de sincronização.',
        timestamp: Date.now() - 86400000 * 1,
      },
    ],
  },
  {
    key: 'filas',
    name: 'Filas (Queue & Deque)',
    category: 'Estruturas Lineares',
    description: 'Política FIFO, buffers circulares, poll vs peek vs offer.',
    status: 'não visto',
    hits: 0,
    misses: 0,
    totalInteractions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    srsIntervalStep: 0,
    recentObservations: [],
  },
  {
    key: 'hash maps',
    name: 'Tabelas Hash (HashMap & HashSet)',
    category: 'Hash Tables',
    description: 'Função hash, buckets, tratamento de colisões e árvores rubro-negras internas.',
    status: 'em andamento',
    hits: 3,
    misses: 1,
    totalInteractions: 4,
    lastReviewedAt: Date.now() - 86400000 * 1.5,
    nextReviewAt: Date.now() - 1000, // Due for review today!
    srsIntervalStep: 0,
    recentObservations: [
      {
        result: 'erro',
        observation: 'Hesitou sobre o que acontece no Java 8+ quando um bucket tem mais de 8 colisões (conversão para Red-Black Tree).',
        timestamp: Date.now() - 86400000 * 1.5,
      },
    ],
  },
  {
    key: 'árvores',
    name: 'Árvores Binárias & TreeMap',
    category: 'Hierárquicas',
    description: 'Árvores binárias de busca (BST), percursos em ordem e Red-Black Trees.',
    status: 'não visto',
    hits: 0,
    misses: 0,
    totalInteractions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    srsIntervalStep: 0,
    recentObservations: [],
  },
  {
    key: 'grafos',
    name: 'Grafos (BFS, DFS & Dijkstra)',
    category: 'Grafos',
    description: 'Listas de adjacência, percursos em largura e profundidade, caminhos mínimos.',
    status: 'não visto',
    hits: 0,
    misses: 0,
    totalInteractions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    srsIntervalStep: 0,
    recentObservations: [],
  },
  {
    key: 'recursão',
    name: 'Recursão & Pilha de Chamadas',
    category: 'Paradigmas',
    description: 'Caso base, passo recursivo, memória da stack e risco de StackOverflowError.',
    status: 'em andamento',
    hits: 2,
    misses: 0,
    totalInteractions: 2,
    lastReviewedAt: Date.now() - 86400000 * 4,
    nextReviewAt: Date.now() - 5000, // Due today!
    srsIntervalStep: 1,
    recentObservations: [
      {
        result: 'acerto',
        observation: 'Identificou com precisão a importância do caso base para evitar loop infinito na JVM.',
        timestamp: Date.now() - 86400000 * 4,
      },
    ],
  },
  {
    key: 'ordenação',
    name: 'Algoritmos de Ordenação',
    category: 'Algoritmos Clássicos',
    description: 'QuickSort, MergeSort, TimSort e Arrays.sort() para primitivos e objetos.',
    status: 'dominado',
    hits: 5,
    misses: 1,
    totalInteractions: 6,
    lastReviewedAt: Date.now() - 86400000 * 1,
    nextReviewAt: Date.now() + 86400000 * 6,
    srsIntervalStep: 2,
    recentObservations: [
      {
        result: 'acerto',
        observation: 'Demonstrou domínio do particionamento e pivô do QuickSort em O de n log n médio.',
        timestamp: Date.now() - 86400000 * 1,
      },
    ],
  },
  {
    key: 'busca',
    name: 'Algoritmos de Busca',
    category: 'Algoritmos Clássicos',
    description: 'Busca linear vs busca binária em array ordenado, Arrays.binarySearch().',
    status: 'dominado',
    hits: 4,
    misses: 0,
    totalInteractions: 4,
    lastReviewedAt: Date.now() - 86400000 * 1,
    nextReviewAt: Date.now() + 86400000 * 6,
    srsIntervalStep: 2,
    recentObservations: [
      {
        result: 'acerto',
        observation: 'Calculou o mid sem risco de overflow com left + (right - left) / 2.',
        timestamp: Date.now() - 86400000 * 1,
      },
    ],
  },
  {
    key: 'programação dinâmica',
    name: 'Programação Dinâmica & Memoização',
    category: 'Paradigmas Avançados',
    description: 'Subestrutura ótima, sobreposição de subproblemas, tabela bottom-up vs top-down.',
    status: 'não visto',
    hits: 0,
    misses: 0,
    totalInteractions: 0,
    lastReviewedAt: null,
    nextReviewAt: null,
    srsIntervalStep: 0,
    recentObservations: [],
  },
];

// Helper to check if a topic is due for review under SRS
export function isTopicDueForReview(topic: TopicProgress): boolean {
  if (topic.status === 'não visto') return false;
  if (!topic.nextReviewAt) return false;
  return Date.now() >= topic.nextReviewAt;
}

// Normalize strings to match topic key
export function findTopicKey(rawTopic: string): TopicKey {
  const norm = rawTopic.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (norm.includes('array')) return 'arrays';
  if (norm.includes('lista') || norm.includes('linkedlist')) return 'listas';
  if (norm.includes('pilha') || norm.includes('stack')) return 'pilhas';
  if (norm.includes('fila') || norm.includes('queue')) return 'filas';
  if (norm.includes('hash') || norm.includes('map') || norm.includes('tabela')) return 'hash maps';
  if (norm.includes('arvore') || norm.includes('tree') || norm.includes('bst')) return 'árvores';
  if (norm.includes('grafo') || norm.includes('bfs') || norm.includes('dfs')) return 'grafos';
  if (norm.includes('recur')) return 'recursão';
  if (norm.includes('orden') || norm.includes('sort') || norm.includes('quicksort')) return 'ordenação';
  if (norm.includes('busca') || norm.includes('search') || norm.includes('binaria')) return 'busca';
  if (norm.includes('dinamica') || norm.includes('dp') || norm.includes('memo')) return 'programação dinâmica';

  return 'arrays';
}

// Update topic progress after a hit or miss
export function updateTopicProgress(
  topics: TopicProgress[],
  rawTopic: string,
  result: 'acerto' | 'erro',
  observation: string
): TopicProgress[] {
  const targetKey = findTopicKey(rawTopic);

  return topics.map((t) => {
    if (t.key !== targetKey) return t;

    const isHit = result === 'acerto';
    const newHits = t.hits + (isHit ? 1 : 0);
    const newMisses = t.misses + (isHit ? 0 : 1);
    const newTotal = t.totalInteractions + 1;

    let newStep = t.srsIntervalStep;
    if (isHit) {
      newStep = Math.min(SRS_INTERVAL_DAYS.length - 1, t.srsIntervalStep + 1);
    } else {
      // On error, reset interval to day 1 to reinforce
      newStep = 0;
    }

    const intervalDays = SRS_INTERVAL_DAYS[newStep];
    const nextReview = Date.now() + intervalDays * 86400000;

    // Determine status: 3+ hits and >= 75% accuracy = dominado
    let status: 'não visto' | 'em andamento' | 'dominado' = 'em andamento';
    if (newHits >= 3 && newHits / newTotal >= 0.75) {
      status = 'dominado';
    }

    const newObs = [
      {
        result,
        observation: observation || (isHit ? 'Demonstrou boa compreensão.' : 'Teve ponto de dúvida.'),
        timestamp: Date.now(),
      },
      ...t.recentObservations,
    ].slice(0, 5);

    return {
      ...t,
      hits: newHits,
      misses: newMisses,
      totalInteractions: newTotal,
      status,
      lastReviewedAt: Date.now(),
      nextReviewAt: nextReview,
      srsIntervalStep: newStep,
      recentObservations: newObs,
    };
  });
}
