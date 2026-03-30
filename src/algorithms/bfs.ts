export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface BFSStep {
  type: 'visit' | 'queue' | 'edge'; 
  edge?: Edge;
  nodeId?: number;
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

  const adjacency: Record<number, Edge[]> = {};
  for (let i = 0; i < nodesCount; i++) adjacency[i] = [];

  edges.forEach(edge => {
    adjacency[edge.sourceId].push(edge);

    if (!isDirected) {
      adjacency[edge.targetId].push({ 
        sourceId: edge.targetId, 
        targetId: edge.sourceId, 
        weight: edge.weight 
      });
    }
  });

  for (let i = 0; i < nodesCount; i++) {
    adjacency[i].sort((a, b) => a.targetId - b.targetId);
  }

  queue.push(startNodeId);
  visited.add(startNodeId);
  steps.push({ type: 'queue', nodeId: startNodeId });

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    steps.push({ type: 'visit', nodeId: currentId });

    for (const edge of adjacency[currentId]) {
      const neighborId = edge.targetId;
      
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        
        steps.push({ type: 'edge', edge: edge });
        
        steps.push({ type: 'queue', nodeId: neighborId });
        queue.push(neighborId);
      }
    }
  }

  return steps;
}