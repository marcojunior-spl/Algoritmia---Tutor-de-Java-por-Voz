import { ChatMessage } from '../components/VoiceSessionPanel';
import { CodeSnippetItem } from '../components/CodeWhiteboard';
import { LearningMode, StudentLevel } from '../types';

export interface VoiceSessionRecord {
  id: string;
  title: string;
  date: string; // ISO format
  formattedDate: string; // Readable PT-BR
  durationSeconds: number;
  voiceUsed: string;
  pedagogicalMode: LearningMode;
  studentLevel?: StudentLevel;
  messages: ChatMessage[];
  codeSnippets: CodeSnippetItem[];
  conceptsDiscussed: string[];
  summary: string;
}

export const INITIAL_SEED_SESSIONS: VoiceSessionRecord[] = [
  {
    id: 'session-seed-1',
    title: 'Intuição do QuickSort e Dual-Pivot no Java',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    formattedDate: 'Hoje às 17:20',
    durationSeconds: 245,
    voiceUsed: 'Zephyr',
    pedagogicalMode: 'explanatory',
    summary: 'Analogia da fila de pessoas por altura usando pivô e como o Arrays.sort do Java usa Dual-Pivot Quicksort para primitivos.',
    conceptsDiscussed: [
      'QuickSort',
      'Arrays.sort()',
      'Dual-Pivot',
      'O(n log n) médio',
      'Recursão em Java',
    ],
    codeSnippets: [
      {
        id: 'snippet-seed-qs',
        title: 'Particionamento de Lomuto em Java',
        code: `public class QuickSortDemo {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int p = partition(arr, low, high);
            quickSort(arr, low, p - 1);
            quickSort(arr, p + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}`,
        explanation: 'O pivô separa elementos menores à esquerda e maiores à direita, dividindo o espaço em O(n log n) médio.',
        complexityTime: 'O(n log n)',
        complexitySpace: 'O(log n)',
        javaStandardClass: 'java.util.Arrays.sort()',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Como eu explico a lógica do QuickSort numa entrevista técnica sem me enrolar nas contas?',
        timestamp: '17:20',
      },
      {
        id: 'msg-2',
        sender: 'tutor',
        text: 'Pense numa fila de pessoas que você quer ordenar por altura. Você escolhe uma pessoa qualquer como referência, o pivô. Quem for mais baixo fica do lado esquerdo dela, e quem for mais alto vai para a direita. Depois, repete isso para cada grupo.',
        timestamp: '17:20',
      },
      {
        id: 'msg-3',
        sender: 'user',
        text: 'E como isso fica na biblioteca padrão do Java?',
        timestamp: '17:21',
      },
      {
        id: 'msg-4',
        sender: 'tutor',
        text: 'No Java, o método Arrays.sort para arrays de inteiros usa uma variação chamada Dual-Pivot Quicksort. Em vez de um pivô, ele escolhe dois, o que divide o array em três partes e reduz o número de comparações de cache na JVM.',
        timestamp: '17:21',
      },
      {
        id: 'msg-5',
        sender: 'user',
        text: 'Qual a complexidade de tempo falada?',
        timestamp: '17:22',
      },
      {
        id: 'msg-6',
        sender: 'tutor',
        text: 'No caso médio, é O de n log n. No pior caso, se o pivô for sempre o pior possível, pode degradar para O de n ao quadrado. Vou deixar o código no texto da lousa para você consultar.',
        timestamp: '17:22',
      },
    ],
  },
  {
    id: 'session-seed-2',
    title: 'Por que usar ArrayDeque em vez de java.util.Stack?',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    formattedDate: 'Ontem às 15:45',
    durationSeconds: 180,
    voiceUsed: 'Puck',
    pedagogicalMode: 'socratic',
    summary: 'Análise de performance e concorrência sobre por que java.util.Stack é obsoleta devido ao overhead de synchronized da classe Vector.',
    conceptsDiscussed: [
      'ArrayDeque',
      'java.util.Stack',
      'Vector legada',
      'Sincronização',
      'LIFO',
      'O(1) amortizado',
    ],
    codeSnippets: [
      {
        id: 'snippet-seed-deque',
        title: 'Pilha Moderna com Deque em Java',
        code: `import java.util.ArrayDeque;
import java.util.Deque;

public class ModernStackExample {
    public static void main(String[] args) {
        // Recomendado pela documentação oficial da Oracle:
        Deque<Integer> stack = new ArrayDeque<>();
        
        stack.push(10);
        stack.push(20);
        
        while (!stack.isEmpty()) {
            System.out.println(stack.pop()); // 20 depois 10
        }
    }
}`,
        explanation: 'ArrayDeque não possui lock de thread desnecessário e tem excelente localidade de cache de memória contígua.',
        complexityTime: 'O(1) amortizado',
        complexitySpace: 'O(n)',
        javaStandardClass: 'java.util.ArrayDeque<E>',
      },
    ],
    messages: [
      {
        id: 'msg-201',
        sender: 'user',
        text: 'Eu sempre usava a classe Stack do Java, mas meu professor falou para trocar por ArrayDeque. Por que isso?',
        timestamp: '15:45',
      },
      {
        id: 'msg-202',
        sender: 'tutor',
        text: 'Boa pergunta. Você sabia que a classe Stack em Java herda de uma classe bem antiga chamada Vector?',
        timestamp: '15:45',
      },
      {
        id: 'msg-203',
        sender: 'user',
        text: 'Não sabia, qual é o problema do Vector?',
        timestamp: '15:46',
      },
      {
        id: 'msg-204',
        sender: 'tutor',
        text: 'Cada método de Vector tem a palavra synchronized. Isso significa que, mesmo rodando numa única thread, seu programa fica adquirindo travas de concorrência o tempo todo, gastando tempo à toa.',
        timestamp: '15:46',
      },
      {
        id: 'msg-205',
        sender: 'user',
        text: 'E o ArrayDeque resolve isso?',
        timestamp: '15:47',
      },
      {
        id: 'msg-206',
        sender: 'tutor',
        text: 'Exato! O ArrayDeque usa um array circular sem sincronização pesada, operando em O de um amortizado tanto para push quanto para pop, com uso de memória muito menor.',
        timestamp: '15:47',
      },
    ],
  },
];

export function extractConceptsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const concepts: string[] = [];

  const catalog: Array<{ key: string[]; label: string }> = [
    { key: ['binary search', 'busca binária'], label: 'Busca Binária' },
    { key: ['quicksort', 'quick sort'], label: 'QuickSort' },
    { key: ['mergesort', 'merge sort'], label: 'MergeSort' },
    { key: ['hashmap', 'hash map', 'tabela hash'], label: 'HashMap' },
    { key: ['treemap', 'tree map'], label: 'TreeMap' },
    { key: ['arraylist', 'array list'], label: 'ArrayList' },
    { key: ['linkedlist', 'linked list'], label: 'LinkedList' },
    { key: ['arraydeque', 'deque'], label: 'ArrayDeque' },
    { key: ['priorityqueue', 'priority queue', 'heap', 'min-heap'], label: 'PriorityQueue / Heap' },
    { key: ['stack', 'pilha'], label: 'Pilha (Stack)' },
    { key: ['queue', 'fila'], label: 'Fila (Queue)' },
    { key: ['bfs', 'busca em largura'], label: 'BFS (Largura)' },
    { key: ['dfs', 'busca em profundidade'], label: 'DFS (Profundidade)' },
    { key: ['two sum', 'twosum'], label: 'Two Sum' },
    { key: ['recursão', 'recursivo'], label: 'Recursão' },
    { key: ['árvore', 'tree', 'rubro-negra', 'red-black'], label: 'Árvores Balanceadas' },
    { key: ['o(1)', 'o de um'], label: 'O(1) Tempo Constante' },
    { key: ['o(log n)', 'o de log n'], label: 'O(log n) Logarítmico' },
    { key: ['o(n)', 'o de n '], label: 'O(n) Linear' },
    { key: ['o(n log n)', 'o de n log n'], label: 'O(n log n) Quasilinear' },
    { key: ['o(n^2)', 'o(n²)', 'o de n ao quadrado'], label: 'O(n²) Quadrático' },
  ];

  for (const item of catalog) {
    if (item.key.some((k) => lower.includes(k))) {
      concepts.push(item.label);
    }
  }

  if (concepts.length === 0) {
    concepts.push('Java Algoritmos');
  }

  return Array.from(new Set(concepts)).slice(0, 6);
}
