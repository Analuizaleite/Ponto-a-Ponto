import React from "react";
import { X, Play } from "lucide-react";

interface AlgorithmExplainerModalProps {
  algo: string;
  onClose: () => void;
  onConfirm: () => void;
}

interface AlgoInfo {
  name: string;
  emoji: string;
  tagline: string;
  analogy: string;
  howItWorks: string[];
  complexity: {
    time: string;
    space: string;
    timeNote: string;
    spaceNote: string;
  };
  whatToWatch: { color: string; label: string }[];
  tip: string;
}

const ALGO_INFO: Record<string, AlgoInfo> = {
  BFS: {
    name: "Busca em Largura",
    emoji: "🌊",
    tagline: "Explora o grafo em ondas, camada por camada.",
    analogy:
      "Imagine jogar uma pedra num lago. As ondas se expandem em círculos perfeitos — primeiro os vizinhos mais próximos, depois os vizinhos dos vizinhos. A BFS funciona exatamente assim.",
    howItWorks: [
      "Coloca o nó inicial numa fila.",
      "Retira o primeiro da fila e visita todos os seus vizinhos diretos.",
      "Cada vizinho novo entra no final da fila.",
      "Repete até a fila esvaziar.",
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      timeNote: "V = vértices, E = arestas. Cada nó e aresta é visitado uma vez.",
      spaceNote: "A fila armazena no máximo todos os vértices.",
    },
    whatToWatch: [
      { color: "bg-emerald-800", label: "Nó marcado (na fila)" },
      { color: "bg-cyan-300", label: "Nó visitado (processado)" },
      { color: "bg-[#3aebb9]", label: "Aresta pai" },
      { color: "bg-yellow-300", label: "Aresta irmão (mesmo pai)" },
      { color: "bg-violet-500", label: "Aresta primo (pais diferentes)" },
      { color: "bg-orange-400", label: "Aresta tio (nível seguinte)" },
    ],
    tip: "Na sidebar: L = ordem de descoberta, Nível = distância em saltos da origem, Pai = quem descobriu o nó.",
  },
  DFS: {
    name: "Busca em Profundidade",
    emoji: "🕳️",
    tagline: "Mergulha fundo num caminho antes de explorar outros.",
    analogy:
      "Resolver um labirinto sempre virando à esquerda — você vai até o fundo de cada corredor antes de voltar e tentar o próximo. Só recua quando chega num beco sem saída.",
    howItWorks: [
      "Visita o nó inicial.",
      "Vai imediatamente para o primeiro vizinho não visitado.",
      "Continua mergulhando até não ter mais vizinhos novos.",
      "Recua (backtrack) e tenta o próximo vizinho disponível.",
    ],
    complexity: {
      time: "O(V + E)",
      space: "O(V)",
      timeNote: "V = vértices, E = arestas. Cada nó e aresta é visitado uma vez.",
      spaceNote: "A pilha de recursão armazena no máximo todos os vértices.",
    },
    whatToWatch: [
      { color: "bg-cyan-300", label: "Nó visitado" },
      { color: "bg-[#3aebb9]", label: "Aresta de árvore (caminho percorrido)" },
      { color: "bg-red-500", label: "Aresta de retorno (indica ciclo!)" },
    ],
    tip: "Na tabela: TD = tempo de descoberta, TT = tempo de término. Um nó 'contém' todos os nós descobertos entre seu TD e TT.",
  },
  DIJKSTRA: {
    name: "Algoritmo de Dijkstra",
    emoji: "🗺️",
    tagline: "Menor caminho a partir de um nó. Não aceita pesos negativos.",
    analogy:
      "Um GPS que sempre escolhe a rota com menor tempo total acumulado — não a com menos cruzamentos, mas a mais rápida considerando o trânsito de cada trecho.",
    howItWorks: [
      "Define distância 0 para o nó inicial e ∞ para todos os outros.",
      "Escolhe o nó não visitado com menor distância acumulada.",
      "Para cada vizinho: 'passar por aqui é mais barato?' Se sim, atualiza.",
      "Repete até visitar todos os nós.",
    ],
    complexity: {
      time: "O(V²)",
      space: "O(V)",
      timeNote: "Nesta implementação sem heap. Com heap de prioridade seria O((V+E) log V).",
      spaceNote: "Armazena distâncias e predecessores para cada vértice.",
    },
    whatToWatch: [
      { color: "bg-[#3aebb9]", label: "Nó/aresta do caminho mínimo" },
      { color: "bg-amber-400", label: "Aresta sendo avaliada" },
    ],
    tip: "Dijkstra não funciona com pesos negativos! Para isso, use Bellman-Ford.",
  },
  BELLMAN_FORD: {
    name: "Bellman-Ford",
    emoji: "🔁",
    tagline: "Menor caminho com pesos negativos e detecção de ciclos.",
    analogy:
      "Um contador que revisa todas as contas N-1 vezes para garantir que nenhum desconto foi perdido. Se na última revisão ainda encontrar desconto, há uma armadilha — um ciclo negativo infinito.",
    howItWorks: [
      "Define distância 0 para o nó inicial e ∞ para os demais.",
      "Repete N-1 vezes: percorre TODAS as arestas e relaxa as que puder.",
      "'Relaxar' = se passar por essa aresta for mais barato, atualiza.",
      "Passagem extra: se ainda relaxar, existe um ciclo negativo.",
    ],
    complexity: {
      time: "O(V · E)",
      space: "O(V)",
      timeNote: "Executa E relaxamentos por cada uma das V-1 iterações.",
      spaceNote: "Armazena distâncias e predecessores para cada vértice.",
    },
    whatToWatch: [
      { color: "bg-amber-400", label: "Aresta sendo testada" },
      { color: "bg-[#3aebb9]", label: "Aresta relaxada (distância melhorou)" },
      { color: "bg-red-500", label: "Ciclo negativo detectado!" },
    ],
    tip: "Se aparecer 'Estabilizado' na sidebar, o algoritmo convergiu antes das N-1 iterações — uma otimização automática.",
  },
  FLOYD_WARSHALL: {
    name: "Floyd-Warshall",
    emoji: "📊",
    tagline: "Menor caminho entre TODOS os pares de nós de uma vez.",
    analogy:
      "Uma tabela de preços de passagens aéreas entre todas as cidades — você quer saber o menor preço de qualquer cidade para qualquer outra, incluindo conexões.",
    howItWorks: [
      "Cria uma matriz N×N com as distâncias diretas entre os nós.",
      "Para cada nó intermediário K: 'passar por K melhora algum caminho?'",
      "Se dist[i][K] + dist[K][j] < dist[i][j], atualiza a matriz.",
      "Após testar todos os K, a matriz contém todos os menores caminhos.",
    ],
    complexity: {
      time: "O(V³)",
      space: "O(V²)",
      timeNote: "Três loops aninhados sobre todos os vértices.",
      spaceNote: "A matriz de distâncias N×N ocupa espaço quadrático.",
    },
    whatToWatch: [
      { color: "bg-purple-500", label: "Linha/coluna do nó intermediário K" },
      { color: "bg-amber-400", label: "Célula i→j sendo avaliada" },
    ],
    tip: "A célula amarela na matriz é o par (i,j) avaliado; a linha/coluna roxa é o nó K intermediário atual.",
  },
  PRIM: {
    name: "Algoritmo de Prim",
    emoji: "🌳",
    tagline: "Árvore Geradora Mínima crescendo a partir de um nó.",
    analogy:
      "Você precisa construir estradas para conectar todas as cidades com o menor custo. Prim começa de uma cidade e sempre constrói a estrada mais barata que alcança uma cidade nova.",
    howItWorks: [
      "Começa com um conjunto contendo só o nó inicial.",
      "Olha todas as arestas que saem do conjunto para fora.",
      "Escolhe a de menor peso e adiciona o nó destino ao conjunto.",
      "Repete até todos os nós estarem conectados.",
    ],
    complexity: {
      time: "O(V²)",
      space: "O(V + E)",
      timeNote: "Nesta implementação sem heap. Com heap seria O((V+E) log V).",
      spaceNote: "Armazena a lista de adjacência e o conjunto de vértices na árvore.",
    },
    whatToWatch: [
      { color: "bg-[#3aebb9]", label: "Nó/aresta já na árvore" },
      { color: "bg-amber-400", label: "Aresta candidata sendo avaliada" },
    ],
    tip: "Prim só funciona em grafos não-direcionados. O custo total da árvore aparece na sidebar.",
  },
  KRUSKAL: {
    name: "Algoritmo de Kruskal",
    emoji: "🔗",
    tagline: "Árvore Geradora Mínima ordenando todas as arestas.",
    analogy:
      "Você tem uma lista de todas as estradas possíveis ordenadas por custo. Vai construindo da mais barata para a mais cara, pulando qualquer uma que criaria um caminho circular.",
    howItWorks: [
      "Ordena todas as arestas por peso crescente.",
      "Para cada aresta (da mais barata para a mais cara):",
      "→ Conecta dois componentes diferentes: adiciona à árvore.",
      "→ Os dois nós já estão conectados: descarta (formaria ciclo).",
    ],
    complexity: {
      time: "O(E log E)",
      space: "O(V + E)",
      timeNote: "Dominado pela ordenação das arestas. O Union-Find é quase O(1) por operação.",
      spaceNote: "Armazena as arestas ordenadas e a estrutura Union-Find.",
    },
    whatToWatch: [
      { color: "bg-amber-400", label: "Aresta sendo avaliada" },
      { color: "bg-[#3aebb9]", label: "Aresta aceita na árvore" },
      { color: "bg-red-500", label: "Aresta rejeitada (formaria ciclo)" },
    ],
    tip: "Kruskal e Prim sempre produzem o mesmo custo total, mas podem escolher arestas diferentes.",
  },
  FORD_FULKERSON: {
    name: "Ford-Fulkerson",
    emoji: "💧",
    tagline: "Fluxo máximo de uma fonte a um destino numa rede.",
    analogy:
      "Uma rede de canos conectando um reservatório a uma cidade. Cada cano tem capacidade máxima. Você quer descobrir o máximo de água que consegue enviar por dia.",
    howItWorks: [
      "Começa com fluxo zero em todas as arestas.",
      "Encontra um caminho da fonte ao destino com espaço livre (BFS).",
      "Descobre o gargalo: a menor capacidade residual do caminho.",
      "Aumenta o fluxo pelo valor do gargalo em todo o caminho.",
      "Repete até não existir mais nenhum caminho com espaço livre.",
    ],
    complexity: {
      time: "O(V · E²)",
      space: "O(V + E)",
      timeNote: "Variante Edmonds-Karp (BFS). Cada BFS é O(E) e há no máximo O(VE) aumentos.",
      spaceNote: "Armazena o grafo residual e os fluxos em cada aresta.",
    },
    whatToWatch: [
      { color: "bg-blue-500", label: "Caminho aumentante atual (espaço livre)" },
      { color: "bg-red-500", label: "Aresta saturada (fluxo = capacidade)" },
    ],
    tip: "O rótulo em cada aresta mostra 'fluxo/capacidade'. Quando ficam iguais, a aresta está cheia.",
  },
};

export const AlgorithmExplainerModal: React.FC<AlgorithmExplainerModalProps> = ({
  algo,
  onClose,
  onConfirm,
}) => {
  const info = ALGO_INFO[algo];
  if (!info) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="
          bg-ponto-darker border-t sm:border border-ponto-muted/50
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          w-full sm:max-w-lg
          max-h-[92vh] sm:max-h-[88vh]
          flex flex-col
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile only */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-ponto-muted/60 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-3 sm:pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">{info.emoji}</span>
            <div>
              <p className="text-ponto-accent text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5">
                Você está prestes a executar
              </p>
              <h2 className="text-white font-bold text-lg sm:text-xl leading-tight">{info.name}</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 leading-snug">{info.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-ponto-muted/40 transition-colors shrink-0 ml-2 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-5 pb-2 flex-1 flex flex-col gap-4">

          {/* Analogia */}
          <div className="bg-ponto-dark border-l-4 border-ponto-accent rounded-r-xl p-3 sm:p-4">
            <p className="text-ponto-accent text-[10px] font-bold uppercase tracking-wider mb-1">💡 A ideia</p>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{info.analogy}</p>
          </div>

          {/* Como funciona + Complexidade lado a lado em mobile */}
          <div className="flex flex-col sm:flex-col gap-4">

            {/* Como funciona */}
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">⚙️ Como funciona</p>
              <ol className="flex flex-col gap-1.5">
                {info.howItWorks.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    {step.startsWith("→") ? (
                      <span className="text-slate-300 text-xs leading-relaxed pl-7">{step}</span>
                    ) : (
                      <>
                        <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-ponto-accent/20 border border-ponto-accent/50 text-ponto-accent text-[9px] sm:text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-slate-300 text-xs sm:text-sm leading-relaxed">{step}</span>
                      </>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {/* Complexidade */}
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">📈 Complexidade</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-ponto-dark rounded-xl p-3 border border-ponto-muted/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Tempo</p>
                  <p className="text-ponto-accent font-mono font-bold text-base sm:text-lg leading-none mb-1.5">
                    {info.complexity.time}
                  </p>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{info.complexity.timeNote}</p>
                </div>
                <div className="bg-ponto-dark rounded-xl p-3 border border-ponto-muted/30">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Espaço</p>
                  <p className="text-ponto-accent font-mono font-bold text-base sm:text-lg leading-none mb-1.5">
                    {info.complexity.space}
                  </p>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{info.complexity.spaceNote}</p>
                </div>
              </div>
            </div>
          </div>

          {/* O que observar */}
          <div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-2">🎨 O que observar</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {info.whatToWatch.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`shrink-0 w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${item.color}`} />
                  <span className="text-slate-300 text-[11px] sm:text-xs leading-snug">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dica */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">📌 Dica</p>
            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">{info.tip}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ponto-muted/30 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-ponto-muted/50 text-slate-400 hover:text-white hover:border-ponto-muted text-sm font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ponto-accent text-ponto-darker text-sm font-bold hover:brightness-110 transition-all shadow-md active:scale-95"
          >
            <Play size={15} />
            Entendido, Animar!
          </button>
        </div>
      </div>
    </div>
  );
};
