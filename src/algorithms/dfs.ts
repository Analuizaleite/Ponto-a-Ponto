export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DFSStep {
  type: 'visit' | 'queue' | 'edge';
  nodeId?: number;
  edge?: Edge;
}

export function generateDFSSteps(
  startNodeId: number, 
  nodesCount: number, 
  edges: Edge[],
  isDirected: boolean
): DFSStep[] {
  const steps: DFSStep[] = [];
  
  const visited = new Set<number>();

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

  function dfsRecursive(currentNode: number) {
    visited.add(currentNode);
    steps.push({ type: 'visit', nodeId: currentNode });

    for (const edge of adjacency[currentNode]) {
      const neighborId = edge.targetId;
      
      if (!visited.has(neighborId)) {
        
        steps.push({ type: 'edge', edge: edge });
        
        steps.push({ type: 'queue', nodeId: neighborId });
        
        dfsRecursive(neighborId);
      }
    }
  }

  steps.push({ type: 'queue', nodeId: startNodeId });
  dfsRecursive(startNodeId);

  return steps;
}