export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DijkstraStep {
  type: 'visit' | 'cut' | 'select-edge' | 'done';
  nodeId?: number;
  edge?: Edge;
  cutEdges?: Edge[];
  pathEdges?: Edge[];
  previous?: Record<number, number | null>;
  distancesState?: Record<number, number>;
  previousState?: Record<number, number | null>;
}

const edgeMatches = (edge: Edge, sourceId: number, targetId: number, isDirected: boolean) =>
  isDirected
    ? edge.sourceId === sourceId && edge.targetId === targetId
    : (edge.sourceId === sourceId && edge.targetId === targetId) ||
      (edge.sourceId === targetId && edge.targetId === sourceId);

export function getShortestPath(
  startId: number,
  targetId: number,
  previous: Record<number, number | null>
): number[] {
  const path: number[] = [];
  let current: number | null = targetId;

  while (current !== null) {
    path.unshift(current);
    if (current === startId) break;
    current = previous[current];
  }

  return path[0] === startId ? path : [];
}

export function getShortestPathEdges(
  startId: number,
  targetId: number,
  previous: Record<number, number | null>,
  edges: Edge[],
  isDirected: boolean,
): Edge[] {
  const path = getShortestPath(startId, targetId, previous);
  const pathEdges: Edge[] = [];

  for (let i = 0; i < path.length - 1; i++) {
    const sourceId = path[i];
    const targetIdInPath = path[i + 1];
    const edge = edges.find((candidate) =>
      edgeMatches(candidate, sourceId, targetIdInPath, isDirected),
    );

    if (!edge) {
      return [];
    }

    pathEdges.push(edge);
  }

  return pathEdges;
}

export function getShortestPathTreeEdges(
  previous: Record<number, number | null>,
  edges: Edge[],
  isDirected: boolean,
): Edge[] {
  const treeEdges: Edge[] = [];

  for (const [nodeIdText, predecessorId] of Object.entries(previous)) {
    if (predecessorId === null) {
      continue;
    }

    const nodeId = Number(nodeIdText);
    const edge = edges.find((candidate) =>
      edgeMatches(candidate, predecessorId, nodeId, isDirected),
    );

    if (edge) {
      treeEdges.push(edge);
    }
  }

  return treeEdges;
}

export function generateDijkstraSteps(
  startNodeId: number,
  nodeIds: number[],
  edges: Edge[],
  isDirected: boolean,
  targetNodeId?: number,
): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  const orderedNodeIds = [...nodeIds].sort((a, b) => a - b);

  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const explored = new Set<number>();

  const pushStep = (baseData: Omit<DijkstraStep, 'distancesState' | 'previousState'>) => {
    steps.push({
      ...baseData,
      distancesState: { ...distances },
      previousState: { ...previous },
    });
  };

  for (const nodeId of orderedNodeIds) {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  }

  const adjacency: Record<number, Edge[]> = {};
  for (const nodeId of orderedNodeIds) adjacency[nodeId] = [];
  edges.forEach(e => {
    adjacency[e.sourceId].push(e);
    if (!isDirected) {
      adjacency[e.targetId].push({ sourceId: e.targetId, targetId: e.sourceId, weight: e.weight });
    }
  });

  distances[startNodeId] = 0;
  explored.add(startNodeId);
  pushStep({ type: 'visit', nodeId: startNodeId });

  while (explored.size < orderedNodeIds.length) {
    const cutEdges: Edge[] = [];

    explored.forEach((sourceId) => {
      for (const edge of adjacency[sourceId]) {
        if (!explored.has(edge.targetId) && distances[sourceId] !== Infinity) {
          cutEdges.push(edge);
        }
      }
    });

    if (cutEdges.length === 0) break;

    let selectedEdge = cutEdges[0];
    let selectedDistance = distances[selectedEdge.sourceId] + selectedEdge.weight;

    for (const edge of cutEdges.slice(1)) {
      const candidateDistance = distances[edge.sourceId] + edge.weight;
      if (candidateDistance < selectedDistance) {
        selectedEdge = edge;
        selectedDistance = candidateDistance;
      }
    }

    pushStep({ type: 'cut', cutEdges });
    pushStep({ type: 'select-edge', edge: selectedEdge });

    distances[selectedEdge.targetId] = selectedDistance;
    previous[selectedEdge.targetId] = selectedEdge.sourceId;
    explored.add(selectedEdge.targetId);

    pushStep({ type: 'visit', nodeId: selectedEdge.targetId, edge: selectedEdge });

    if (targetNodeId !== undefined && selectedEdge.targetId === targetNodeId) {
      break;
    }
  }

  const pathEdges =
    targetNodeId !== undefined
      ? getShortestPathEdges(startNodeId, targetNodeId, previous, edges, isDirected)
      : getShortestPathTreeEdges(previous, edges, isDirected);

  steps.push({ type: 'done', previous, pathEdges });
  return steps;
}