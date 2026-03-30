export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DFSStep {
  type: 'visit' | 'queue' | 'edge' | 'done';
  nodeId?: number;
  edge?: Edge;
  tdState?: Record<number, number>;
  ttState?: Record<number, number>;
}

export function generateDFSSteps(
  startNodeId: number, 
  nodesCount: number, 
  edges: Edge[],
  isDirected: boolean
): DFSStep[] {
  const steps: DFSStep[] = [];
  const visited = new Set<number>();

  let time = 0;
  const td: Record<number, number> = {};
  const tt: Record<number, number> = {};

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
      tdState: { ...td },
      ttState: { ...tt }
    });
  };

  function dfsRecursive(currentNode: number) {
    time++;
    td[currentNode] = time;
    visited.add(currentNode);
    
    pushStep({ type: 'visit', nodeId: currentNode });

    for (const edge of adjacency[currentNode]) {
      const neighborId = edge.targetId;
      
      if (!visited.has(neighborId)) {
        pushStep({ type: 'edge', edge: edge });
        pushStep({ type: 'queue', nodeId: neighborId });
        
        dfsRecursive(neighborId);
      }
    }
    
    time++;
    tt[currentNode] = time;
    
    pushStep({ type: 'visit', nodeId: currentNode });
  }

  pushStep({ type: 'queue', nodeId: startNodeId });
  dfsRecursive(startNodeId);
  
  steps.push({ type: 'done', tdState: { ...td }, ttState: { ...tt } });

  return steps;
}