export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DijkstraStep {
  type: 'visit' | 'queue' | 'edge' | 'done';
  nodeId?: number;
  edge?: Edge;
  previous?: Record<number, number | null>;
  distancesState?: Record<number, number>;
  previousState?: Record<number, number | null>;
}

export function generateDijkstraSteps(
  startNodeId: number,
  nodesCount: number,
  edges: Edge[]
): DijkstraStep[] {
  const steps: DijkstraStep[] = [];
  
  const distances: Record<number, number> = {};
  const previous: Record<number, number | null> = {};
  const predEdge: Record<number, Edge | null> = {};
  const mature = new Set<number>();

  const pushStep = (baseData: any) => {
    steps.push({
      ...baseData,
      distancesState: { ...distances },
      previousState: { ...previous }
    });
  };

  for (let i = 0; i < nodesCount; i++) {
    distances[i] = Infinity;
    previous[i] = null;
    predEdge[i] = null;
  }
  distances[startNodeId] = 0;

  pushStep({ type: 'queue', nodeId: startNodeId });

  const adjacency: Record<number, Edge[]> = {};
  for (let i = 0; i < nodesCount; i++) adjacency[i] = [];
  edges.forEach(e => {
    adjacency[e.sourceId].push(e);
    adjacency[e.targetId].push({ sourceId: e.targetId, targetId: e.sourceId, weight: e.weight });
  });

  while (mature.size < nodesCount) {
    let u = -1;
    let minDistance = Infinity;
    
    for (let i = 0; i < nodesCount; i++) {
      if (!mature.has(i) && distances[i] < minDistance) {
        minDistance = distances[i];
        u = i;
      }
    }

    if (u === -1) break;

    mature.add(u);
    pushStep({ type: 'visit', nodeId: u });

    if (predEdge[u]) {
      pushStep({ type: 'edge', edge: predEdge[u]! });
    }

    for (const edge of adjacency[u]) {
      const v = edge.targetId;
      
      if (!mature.has(v)) {
        const newDist = distances[u] + edge.weight;
        
        if (newDist < distances[v]) {
          distances[v] = newDist;
          previous[v] = u;
          predEdge[v] = edge; 
          
          pushStep({ type: 'queue', nodeId: v });
        }
      }
    }
  }

  steps.push({ type: 'done', previous });
  return steps;
}

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