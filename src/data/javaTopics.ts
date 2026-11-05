export interface AlgorithmPreset {
  id: string;
  name: string;
  category: 'Busca' | 'Ordenação' | 'Estrutura de Dados' | 'Grafos' | 'Programação Dinâmica';
  shortDescription: string;
  spokenPrompt: string;
  complexityTime: string;
  complexitySpace: string;
  spokenComplexity: string;
  analogy: string;
  javaClass: string;
  codeSnippet: string;
  initialArray?: number[];
  targetValue?: number;
}

export const ALGORITHM_PRESETS: AlgorithmPreset[] = [
  {
    id: 'binary-search',
    name: 'Busca Binária (Binary Search)',
    category: 'Busca',
    shortDescription: 'Localiza um elemento em um array ordenado dividindo o espaço de busca pela metade a cada passo.',
    spokenPrompt: 'Explique como funciona a busca binária em Java com uma analogia do dia a dia e me mostre a complexidade.',
    complexityTime: 'O(log n)',
    complexitySpace: 'O(1)',
    spokenComplexity: 'O de log n no tempo e O de 1 no espaço',
    analogy: 'Como procurar um nome numa lista telefônica ou palavra no dicionário: você abre no meio; se o nome vier depois, descarta a primeira metade inteira.',
    javaClass: 'java.util.Arrays.binarySearch() / Collections.binarySearch()',
    initialArray: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91],
    targetValue: 23,
    codeSnippet: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            // Evita overflow de inteiros comparado a (left + right) / 2
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) {
                return mid; // Encontrado no índice mid
            } else if (arr[mid] < target) {
                left = mid + 1; // Busca na metade superior
            } else {
                right = mid - 1; // Busca na metade inferior
            }
        }
        return -1; // Não encontrado
    }
}`,
  },
  {
    id: 'two-sum',
    name: 'Two Sum com HashMap',
    category: 'Estrutura de Dados',
    shortDescription: 'Encontra dois índices cujo somatório resulte no alvo usando HashMap para lookup em tempo constante.',
    spokenPrompt: 'Como resolvo o problema Two Sum em Java em tempo linear em vez de quadrático?',
    complexityTime: 'O(n)',
    complexitySpace: 'O(n)',
    spokenComplexity: 'O de n no tempo e O de n no espaço',
    analogy: 'Em vez de comparar todo mundo com todo mundo na festa, cada pessoa anota num crachá quem está procurando; quando o par entra, o match é instantâneo.',
    javaClass: 'java.util.HashMap<K, V>',
    initialArray: [2, 7, 11, 15],
    targetValue: 9,
    codeSnippet: `import java.util.HashMap;
import java.util.Map;

public class TwoSum {
    public static int[] findIndices(int[] nums, int target) {
        // Mapeia: valor do complemento -> índice original
        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {}; // Nenhum par encontrado
    }
}`,
  },
  {
    id: 'quicksort',
    name: 'QuickSort (Dividir para Conquistar)',
    category: 'Ordenação',
    shortDescription: 'Escolhe um pivô e particiona o array colocando menores à esquerda e maiores à direita recursivamente.',
    spokenPrompt: 'Explique a lógica do QuickSort em Java e a diferença para o Arrays.sort da biblioteca padrão.',
    complexityTime: 'O(n log n) médio / O(n²) pior caso',
    complexitySpace: 'O(log n) pilha de recursão',
    spokenComplexity: 'O de n log n em média e O de log n de pilha',
    analogy: 'Organizar uma fila de pessoas por altura elegendo uma pessoa aleatória como referência: quem for mais baixo vai para a esquerda, quem for mais alto vai para a direita.',
    javaClass: 'java.util.Arrays.sort() (usa Dual-Pivot Quicksort para primitivos)',
    initialArray: [38, 27, 43, 3, 9, 82, 10],
    codeSnippet: `public class QuickSort {
    public static void sort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            sort(arr, low, pivotIndex - 1);
            sort(arr, pivotIndex + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;

        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);
        return i + 1;
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}`,
  },
  {
    id: 'stack-parentheses',
    name: 'Validador de Parênteses com Pilha (Stack)',
    category: 'Estrutura de Dados',
    shortDescription: 'Verifica o balanceamento correto de chaves, colchetes e parênteses usando política LIFO.',
    spokenPrompt: 'Como validar parênteses balanceados em Java e por que usamos ArrayDeque em vez da classe Stack legada?',
    complexityTime: 'O(n)',
    complexitySpace: 'O(n)',
    spokenComplexity: 'O de n no tempo e O de n no espaço',
    analogy: 'Uma pilha de pratos: o último prato colocado deve ser o primeiro a ser retirado quando fechamos um bloco.',
    javaClass: 'java.util.ArrayDeque<Character> (recomendado sobre java.util.Stack)',
    codeSnippet: `import java.util.ArrayDeque;
import java.util.Deque;

public class ValidParentheses {
    public static boolean isValid(String s) {
        // ArrayDeque é a implementação moderna e não sincronizada preferida para Pilhas em Java
        Deque<Character> stack = new ArrayDeque<>();

        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) {
                return false;
            }
        }
        return stack.isEmpty();
    }
}`,
  },
  {
    id: 'priority-queue-heap',
    name: 'Min-Heap com PriorityQueue',
    category: 'Estrutura de Dados',
    shortDescription: 'Árvore binária quase completa onde cada nó pai é menor ou igual aos seus filhos, garantindo topo em O(1).',
    spokenPrompt: 'Explique como a PriorityQueue funciona por debaixo dos panos em Java e quando usá-la.',
    complexityTime: 'O(log n) inserção/remoção, O(1) peek',
    complexitySpace: 'O(n)',
    spokenComplexity: 'O de log n para inserir ou remover e O de um para espiar',
    analogy: 'Uma triagem hospitalar: não importa a ordem de chegada, o paciente com maior gravidade sempre é atendido primeiro.',
    javaClass: 'java.util.PriorityQueue<E>',
    codeSnippet: `import java.util.PriorityQueue;

public class TopKElements {
    // Encontra os K maiores elementos usando um Min-Heap de tamanho K
    public static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();

        for (int num : nums) {
            minHeap.offer(num);
            if (minHeap.size() > k) {
                minHeap.poll(); // Remove o menor entre os maiores
            }
        }
        return minHeap.peek(); // O topo é o k-ésimo maior elemento
    }
}`,
  },
  {
    id: 'bfs-graph',
    name: 'Busca em Largura (BFS em Grafo)',
    category: 'Grafos',
    shortDescription: 'Percorre vértices camada por camada a partir de uma origem usando uma Fila (FIFO).',
    spokenPrompt: 'Como implementar BFS em Java usando Fila e qual a diferença de complexidade para o DFS?',
    complexityTime: 'O(V + E) onde V são vértices e E são arestas',
    complexitySpace: 'O(V) para armazenar fila e visitados',
    spokenComplexity: 'O de V mais E no tempo e O de V no espaço',
    analogy: 'Como ondas se propagando em um lago quando você joga uma pedra: você visita todos os vizinhos a 1 passo, depois a 2 passos, e assim por diante.',
    javaClass: 'java.util.Queue<Integer> com java.util.ArrayDeque<Integer>',
    codeSnippet: `import java.util.*;

public class GraphBFS {
    public static List<Integer> traverse(int start, Map<Integer, List<Integer>> adj) {
        List<Integer> result = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> queue = new ArrayDeque<>();

        visited.add(start);
        queue.offer(start);

        while (!queue.isEmpty()) {
            int current = queue.poll();
            result.add(current);

            for (int neighbor : adj.getOrDefault(current, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        return result;
    }
}`,
  },
];

export interface CollectionComparison {
  name: string;
  type: 'List' | 'Set' | 'Map' | 'Queue';
  backingStructure: string;
  timeInsert: string;
  timeLookup: string;
  timeDelete: string;
  ordered: string;
  bestFor: string;
  avoidWhen: string;
}

export const JAVA_COLLECTIONS_GUIDE: CollectionComparison[] = [
  {
    name: 'ArrayList',
    type: 'List',
    backingStructure: 'Array dinâmico contíguo redimensionável',
    timeInsert: 'O(1) amortizado no final; O(n) no meio',
    timeLookup: 'O(1) por índice; O(n) por valor',
    timeDelete: 'O(n) devido ao deslocamento de memória',
    ordered: 'Sim (ordem de inserção)',
    bestFor: 'Acesso aleatório frequente por índice e iteração rápida em cache de CPU.',
    avoidWhen: 'Muitas inserções ou remoções frequentes no início ou meio da lista.',
  },
  {
    name: 'LinkedList',
    type: 'List',
    backingStructure: 'Lista duplamente encadeada de nós',
    timeInsert: 'O(1) se já tiver o ponteiro do nó; O(n) para achar posição',
    timeLookup: 'O(n) percorrendo ponteiros',
    timeDelete: 'O(1) se já tiver o nó',
    ordered: 'Sim (ordem de inserção)',
    bestFor: 'Inserções/remoções puramente nas extremidades (mas ArrayDeque é quase sempre melhor).',
    avoidWhen: 'Quase sempre em Java moderno: alto custo de ponteiros e péssima localidade de cache.',
  },
  {
    name: 'ArrayDeque',
    type: 'Queue',
    backingStructure: 'Array circular redimensionável',
    timeInsert: 'O(1) amortizado em ambas as extremidades',
    timeLookup: 'O(n) se buscar por valor',
    timeDelete: 'O(1) amortizado em ambas as pontas',
    ordered: 'Sim (FIFO ou LIFO)',
    bestFor: 'Implementação de Pilha (Stack) e Fila (Queue); supera java.util.Stack e LinkedList.',
    avoidWhen: 'Necessidade de acessar elementos por índice arbitrário.',
  },
  {
    name: 'HashMap',
    type: 'Map',
    backingStructure: 'Tabela hash com buckets (listas ligadas viram Red-Black Trees se > 8)',
    timeInsert: 'O(1) médio; O(n) pior caso teórico',
    timeLookup: 'O(1) médio; O(log n) no pior caso de colisão',
    timeDelete: 'O(1) médio',
    ordered: 'Não (ordem arbitrária)',
    bestFor: 'Busca ultra rápida de chave e valor sem necessidade de ordenação.',
    avoidWhen: 'Você precisa manter as chaves ordenadas (use TreeMap) ou ordem de inserção (LinkedHashMap).',
  },
  {
    name: 'TreeMap',
    type: 'Map',
    backingStructure: 'Árvore Rubro-Negra (Red-Black Tree balanceada)',
    timeInsert: 'O(log n) garantido',
    timeLookup: 'O(log n) garantido',
    timeDelete: 'O(log n) garantido',
    ordered: 'Sim (ordem natural das chaves ou Comparator)',
    bestFor: 'Consultas de intervalo, menor/maior chave (ceilingKey, floorKey) e chaves sempre ordenadas.',
    avoidWhen: 'Apenas busca simples por chave (HashMap é O(1) e muito mais rápido).',
  },
  {
    name: 'PriorityQueue',
    type: 'Queue',
    backingStructure: 'Binary Heap em array',
    timeInsert: 'O(log n)',
    timeLookup: 'O(1) para o menor/maior elemento (peek)',
    timeDelete: 'O(log n) para remover o topo (poll)',
    ordered: 'Parcial (propriedade de heap)',
    bestFor: 'Algoritmo de Dijkstra, A*, Top-K elementos, agendamento de tarefas por prioridade.',
    avoidWhen: 'Buscar ou remover elementos arbitrários que não sejam a raiz.',
  },
];
