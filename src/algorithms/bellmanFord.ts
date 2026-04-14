export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface BellmanFordStep {
  type: "visit" | "queue" | "test-edge" | "relax" | "done" | "iteration";
  nodeId?: number;
  edge?: Edge;
  treeEdges?: Edge[];
  iteration?: number | string;
  hasNegativeCycle?: boolean;
  negativeCycleEdges?: Edge[];
  distancesState?: Record<number, number>;
  previousState?: Record<number, number | null>;
}

export function generateBellmanFordSteps(
  startNodeId: number,
  nodesCount: number,
  edges: Edge[],
  isDirected: boolean,
): BellmanFordStep[] {
  const steps: BellmanFordStep[] = [];

  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const predEdges: Record<number, Edge | null> = {};

  const edgeList: Edge[] = [];
  edges.forEach((e) => {
    edgeList.push(e);
    if (!isDirected)
      edgeList.push({
        sourceId: e.targetId,
        targetId: e.sourceId,
        weight: e.weight,
      });
  });

  const pushStep = (baseData: any) => {
    steps.push({
      ...baseData,
      distancesState: { ...distances },
      previousState: { ...previous },
    });
  };

  for (let i = 0; i < nodesCount; i++) {
    distances[i] = Infinity;
    previous[i] = null;
    predEdges[i] = null;
  }
  distances[startNodeId] = 0;
  pushStep({ type: "visit", nodeId: startNodeId, iteration: 0 });

  for (let i = 1; i <= nodesCount - 1; i++) {
    pushStep({ type: "iteration", iteration: i });
    let relaxedInThisPhase = false;

    for (const edge of edgeList) {
      const u = edge.sourceId;
      const v = edge.targetId;
      const w = edge.weight;

      pushStep({ type: "test-edge", edge: edge, iteration: i });

      if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
        distances[v] = distances[u] + w;
        previous[v] = u;
        predEdges[v] = edge;
        relaxedInThisPhase = true;

        const currentTree = Object.values(predEdges).filter(
          (e) => e !== null,
        ) as Edge[];

        pushStep({
          type: "relax",
          nodeId: v,
          treeEdges: currentTree,
          iteration: i,
        });
      }
    }

    if (!relaxedInThisPhase) {
      pushStep({
        type: "iteration",
        iteration: "Estabilizado (Paragem Antecipada)",
      });
      break;
    }
  }

  let hasNegativeCycle = false;
  let negativeCycleEdges: Edge[] = [];
  pushStep({ type: "iteration", iteration: "Verificando Ciclos..." });

  for (const edge of edgeList) {
    pushStep({
      type: "test-edge",
      edge: edge,
      iteration: "Verificando Ciclos...",
    });
    const u = edge.sourceId;
    const v = edge.targetId;
    const w = edge.weight;

    if (distances[u] !== Infinity && distances[u] + w < distances[v]) {
      hasNegativeCycle = true;

      negativeCycleEdges = reconstructNegativeCycle(previous, v, edgeList);

      pushStep({
        type: "queue",
        nodeId: v,
        iteration: "CICLO NEGATIVO ENCONTRADO!",
        negativeCycleEdges,
      });
      break;
    }
  }

  steps.push({
    type: "done",
    hasNegativeCycle,
    negativeCycleEdges,
    distancesState: { ...distances },
    previousState: { ...previous },
  });
  return steps;
}

function reconstructNegativeCycle(
  previous: Record<number, number | null>,
  startNode: number,
  edgeList: Edge[],
): Edge[] {
  const cycleEdges: Edge[] = [];
  const visited = new Set<number>();
  let current = startNode;

  while (!visited.has(current) && previous[current] !== null) {
    visited.add(current);
    const prev = previous[current]!;

    const edge = edgeList.find(e => e.sourceId === prev && e.targetId === current);
    if (edge) {
      cycleEdges.push(edge);
    }

    current = prev;
  }

  if (previous[current] !== null) {
    const closingEdge = edgeList.find(e => e.sourceId === previous[current]! && e.targetId === startNode);
    if (closingEdge) {
      cycleEdges.push(closingEdge);
    }
  }

  return cycleEdges;
}
