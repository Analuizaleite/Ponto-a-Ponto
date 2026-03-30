export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface BFSStep {
  type: 'visit' | 'queue' | 'edge' | 'done';
  nodeId?: number;
  edge?: Edge;
  lState?: Record<number, number>;
  nivelState?: Record<number, number>;
  paiState?: Record<number, number | null>;
}

export function generateBFSSteps(
  startNodeId: number, 
  nodesCount: number, 
  edges: Edge[],
  isDirected: boolean
): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited = new Set<number>();
  const queue: number[] = [];

  let lCounter = 0;
  const L: Record<number, number> = {};
  const nivel: Record<number, number> = {};
  const pai: Record<number, number | null> = {};

  const adjacency: Record<number, Edge[]> = {};
  for (let i = 0; i < nodesCount; i++) adjacency[i] = [];

  edges.forEach(edge => {
    adjacency[edge.sourceId].push(edge);
    if (!isDirected) {
      adjacency[edge.targetId].push({ sourceId: edge.targetId, targetId: edge.sourceId, weight: edge.weight });
    }
  });

  for (let i = 0; i < nodesCount; i++) {
    adjacency[i].sort((a, b) => a.targetId - b.targetId);
  }

  const pushStep = (baseData: any) => {
    steps.push({
      ...baseData,
      lState: { ...L },
      nivelState: { ...nivel },
      paiState: { ...pai }
    });
  };

  lCounter++;
  L[startNodeId] = lCounter;
  nivel[startNodeId] = 0;
  pai[startNodeId] = null;

  queue.push(startNodeId);
  visited.add(startNodeId);
  pushStep({ type: 'queue', nodeId: startNodeId });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    pushStep({ type: 'visit', nodeId: currentId });

    for (const edge of adjacency[currentId]) {
      const neighborId = edge.targetId;
      
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        
        lCounter++;
        L[neighborId] = lCounter;
        nivel[neighborId] = nivel[currentId] + 1; 
        pai[neighborId] = currentId;

        pushStep({ type: 'edge', edge: edge });
        pushStep({ type: 'queue', nodeId: neighborId });
        queue.push(neighborId);
      }
    }
  }

  pushStep({ type: 'done' });
  return steps;
}