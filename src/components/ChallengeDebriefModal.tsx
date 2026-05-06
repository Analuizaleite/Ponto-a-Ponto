import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, GraduationCap } from "lucide-react";

interface DebriefInfo {
  title: string;
  summary: string;
  pseudocode: string;
}

interface ChallengeDebriefModalProps {
  title: string;
  algorithms: string[];
  onClose: () => void;
}

const DEBRIEF_INFO: Record<string, DebriefInfo> = {
  BFS: {
    title: "Busca em Largura (BFS)",
    summary:
      "Explora o grafo por camadas. Primeiro visita os vizinhos imediatos, depois os vizinhos dos vizinhos. Ideal para menor número de arestas em grafo sem pesos.",
    pseudocode: `BFS(G, s)
  para cada vertice v em G:
    visitado[v] <- falso
  fila <- vazia
  visitado[s] <- verdadeiro
  enfileirar(fila, s)

  enquanto fila nao vazia:
    u <- desenfileirar(fila)
    para cada vizinho v de u:
      se visitado[v] = falso:
        visitado[v] <- verdadeiro
        enfileirar(fila, v)`,
  },
  DFS: {
    title: "Busca em Profundidade (DFS)",
    summary:
      "Segue um caminho até o fundo antes de voltar. Muito útil para detectar componentes, ciclos e realizar ordenações topológicas.",
    pseudocode: `DFS(G, s)
  para cada vertice v em G:
    visitado[v] <- falso
  DFS_VISIT(s)

DFS_VISIT(u)
  visitado[u] <- verdadeiro
  para cada vizinho v de u:
    se visitado[v] = falso:
      DFS_VISIT(v)`,
  },
  DIJKSTRA: {
    title: "Dijkstra",
    summary:
      "Calcula menores caminhos a partir de uma origem em grafos com pesos não negativos, sempre escolhendo o vértice com menor distância temporária.",
    pseudocode: `DIJKSTRA(G, s)
  para cada vertice v em G:
    dist[v] <- infinito
    prev[v] <- nulo
  dist[s] <- 0
  Q <- todos os vertices

  enquanto Q nao vazia:
    u <- vertice em Q com menor dist
    remover u de Q
    para cada aresta (u, v, w):
      alt <- dist[u] + w
      se alt < dist[v]:
        dist[v] <- alt
        prev[v] <- u`,
  },
  PRIM: {
    title: "Prim",
    summary:
      "Constrói uma árvore geradora mínima crescendo a partir de um nó inicial. A cada passo escolhe a menor aresta que conecta um nó novo.",
    pseudocode: `PRIM(G, s)
  T <- {s}
  MST <- vazio

  enquanto |T| < numero de vertices:
    escolha aresta (u, v) de menor peso
    com u em T e v fora de T
    adicionar (u, v) em MST
    adicionar v em T

  retornar MST`,
  },
  KRUSKAL: {
    title: "Kruskal",
    summary:
      "Ordena as arestas por peso e adiciona as menores sem formar ciclo. Muito eficiente com estrutura Union-Find.",
    pseudocode: `KRUSKAL(G)
  ordenar arestas por peso crescente
  criar UnionFind para vertices
  MST <- vazio

  para cada aresta (u, v) ordenada:
    se FIND(u) != FIND(v):
      adicionar (u, v) em MST
      UNION(u, v)

  retornar MST`,
  },
  BELLMAN_FORD: {
    title: "Bellman-Ford",
    summary:
      "Encontra menores caminhos mesmo com pesos negativos e ainda detecta ciclo negativo alcançável da origem.",
    pseudocode: `BELLMAN_FORD(G, s)
  para cada vertice v em G:
    dist[v] <- infinito
  dist[s] <- 0

  repetir |V|-1 vezes:
    para cada aresta (u, v, w):
      se dist[u] + w < dist[v]:
        dist[v] <- dist[u] + w

  para cada aresta (u, v, w):
    se dist[u] + w < dist[v]:
      reportar ciclo negativo`,
  },
  FLOYD_WARSHALL: {
    title: "Floyd-Warshall",
    summary:
      "Resolve menor caminho entre todos os pares de vértices usando programação dinâmica sobre uma matriz de distâncias.",
    pseudocode: `FLOYD_WARSHALL(G)
  inicializar matriz dist com pesos de G
  para k de 1 ate n:
    para i de 1 ate n:
      para j de 1 ate n:
        dist[i][j] <- min(dist[i][j], dist[i][k] + dist[k][j])

  retornar dist`,
  },
  FORD_FULKERSON: {
    title: "Ford-Fulkerson (Edmonds-Karp)",
    summary:
      "Maximiza fluxo da fonte ao sorvedouro enviando fluxo por caminhos aumentantes no grafo residual até não existir caminho válido.",
    pseudocode: `FORD_FULKERSON(G, s, t)
  fluxo <- 0
  enquanto existe caminho aumentante P de s para t:
    gargalo <- minimo residual nas arestas de P
    para cada aresta (u, v) em P:
      f[u][v] <- f[u][v] + gargalo
      f[v][u] <- f[v][u] - gargalo
    fluxo <- fluxo + gargalo

  retornar fluxo`,
  },
};

const UNKNOWN_INFO: DebriefInfo = {
  title: "Algoritmo",
  summary:
    "Este tema foi concluído com sucesso. Revise os passos e valide os invariantes principais para fixar o raciocínio.",
  pseudocode: `ALGORITMO(G)
  definir estado inicial
  repetir passos principais
  validar condicao de parada
  retornar resultado`,
};

export const ChallengeDebriefModal: React.FC<ChallengeDebriefModalProps> = ({
  title,
  algorithms,
  onClose,
}) => {
  const MOBILE_SNAP_INITIAL = 84;
  const MOBILE_SNAP_MID = 70;
  const MOBILE_SNAP_MIN = 52;
  const MOBILE_SNAP_PEEK = 10;
  const MOBILE_SNAP_MAX = 92;
  const MOBILE_PEEK_THRESHOLD = 30;

  const visibleAlgorithms = useMemo(
    () => Array.from(new Set(algorithms)).filter(Boolean),
    [algorithms],
  );

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false,
  );
  const [mobileHeightPct, setMobileHeightPct] = useState(MOBILE_SNAP_INITIAL);
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef<number>(MOBILE_SNAP_INITIAL);

  const [activeAlgorithm, setActiveAlgorithm] = useState<string>(
    visibleAlgorithms[0] ?? "",
  );

  const info = DEBRIEF_INFO[activeAlgorithm] ?? UNKNOWN_INFO;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobile) setMobileHeightPct(MOBILE_SNAP_INITIAL);
  }, [isMobile]);

  const getClientY = (e: React.TouchEvent | React.MouseEvent) =>
    "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isMobile) return;
    dragStartY.current = getClientY(e);
    dragStartH.current = mobileHeightPct;
  };

  const isMinimized = isMobile && mobileHeightPct <= MOBILE_SNAP_PEEK + 4;

  const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isMobile || dragStartY.current === null) return;
    const viewportH = window.innerHeight;
    const dy = dragStartY.current - getClientY(e);
    const deltaPct = (dy / viewportH) * 100;
    const next = Math.min(
      MOBILE_SNAP_MAX,
      Math.max(MOBILE_SNAP_PEEK - 2, dragStartH.current + deltaPct),
    );
    setMobileHeightPct(next);
  };

  const onDragEnd = () => {
    if (!isMobile || dragStartY.current === null) return;
    dragStartY.current = null;

    let snaps: number[];
    if (mobileHeightPct < MOBILE_PEEK_THRESHOLD) {
      snaps = [MOBILE_SNAP_PEEK];
    } else {
      snaps = [MOBILE_SNAP_MIN, MOBILE_SNAP_MID, MOBILE_SNAP_INITIAL];
    }
    const closest = snaps.reduce((a, b) =>
      Math.abs(a - mobileHeightPct) < Math.abs(b - mobileHeightPct) ? a : b,
    );
    setMobileHeightPct(closest);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center backdrop-blur-sm transition-colors duration-300"
      style={{
        backgroundColor: isMobile
          ? isMinimized
            ? "rgba(0,0,0,0)"
            : "rgba(0,0,0,0.7)"
          : "rgba(0,0,0,0.7)",
        pointerEvents: isMinimized ? "none" : "auto",
      }}
      onClick={!isMinimized ? onClose : undefined}
    >
      <div
        className="
          bg-ponto-darker border-t sm:border border-ponto-muted/50
          rounded-t-2xl sm:rounded-2xl shadow-2xl
          w-full sm:max-w-3xl
          h-[84vh] sm:h-auto sm:max-h-[88vh]
          flex flex-col overflow-hidden
        "
        style={
          isMobile
            ? {
                height: `${mobileHeightPct}vh`,
                transition:
                  dragStartY.current === null ? "height 0.25s ease" : "none",
                pointerEvents: "auto",
              }
            : undefined
        }
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sm:hidden flex flex-col items-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none"
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        >
          <div className="w-10 h-1 bg-ponto-muted/60 rounded-full mb-1" />
          {isMinimized && (
            <p className="text-ponto-accent text-[10px] font-bold uppercase tracking-wider mt-0.5">
              ↑ Ver Resumo
            </p>
          )}
        </div>

        <div className="flex items-start justify-between px-5 pt-3 sm:pt-5 pb-3 shrink-0 border-b border-ponto-muted/30">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-ponto-accent/15 text-ponto-accent flex items-center justify-center">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-ponto-accent text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-0.5">
                Mais sobre este tema
              </p>
              <h2 className="text-white font-bold text-lg sm:text-xl leading-tight">
                {title || "Tema concluído"}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 leading-snug">
                Missão concluída. Aqui vai um resumo rápido dos algoritmos deste
                tipo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-ponto-muted/40 transition-colors shrink-0 ml-2 mt-0.5"
            aria-label="Fechar debrief"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1 flex flex-col gap-4">
          {visibleAlgorithms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {visibleAlgorithms.map((algo) => (
                <button
                  key={algo}
                  onClick={() => setActiveAlgorithm(algo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    activeAlgorithm === algo
                      ? "bg-ponto-accent text-ponto-darker border-ponto-accent"
                      : "bg-ponto-dark text-slate-300 border-ponto-muted/40 hover:border-ponto-muted"
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          )}

          <div className="bg-ponto-dark border border-ponto-muted/30 rounded-xl p-4">
            <h3 className="text-white text-base font-bold mb-2">
              {info.title}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {info.summary}
            </p>
          </div>

          <div className="bg-[#061a1f] border border-ponto-accent/30 rounded-xl p-4">
            <p className="text-ponto-accent text-[10px] font-bold uppercase tracking-wider mb-2">
              Pseudocódigo
            </p>
            <pre className="text-slate-200 text-xs sm:text-sm overflow-x-auto whitespace-pre">
              {info.pseudocode}
            </pre>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-ponto-muted/30 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-ponto-accent text-ponto-darker text-sm font-bold hover:brightness-110 transition-all"
          >
            Voltar para a Central
          </button>
        </div>
      </div>
    </div>
  );
};
