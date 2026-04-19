export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DFSStep {
  type: 'visit' | 'mark' | 'queue' | 'tree-edge' | 'back-edge' | 'done';
  nodeId?: number;
  edge?: Edge;
  tdState?: Record<number, number>;
  ttState?: Record<number, number>;
  parentState?: Record<number, number | null>;
}

export function generateDFSSteps(
  startNodeId: number,
  nodeIds: number[],
  edges: Edge[],
  isDirected: boolean,
  sortStrategy: 'ascending' | 'custom' = 'ascending',
  customAdjacencyOrder?: Record<number, number[]>
): DFSStep[] {
  const steps: DFSStep[] = [];
  const visited = new Set<number>();
  const stack = new Set<number>();
  const orderedNodeIds = [...nodeIds].sort((a, b) => a - b);

  let time = 0;
  const td: Record<number, number> = {};
  const tt: Record<number, number> = {};
  const parent: Record<number, number | null> = {};

  const adjacency: Record<number, Edge[]> = {};
  for (const nodeId of orderedNodeIds) adjacency[nodeId] = [];

  edges.forEach(edge => {
    adjacency[edge.sourceId].push(edge);
    if (!isDirected) {
      adjacency[edge.targetId].push({ sourceId: edge.targetId, targetId: edge.sourceId, weight: edge.weight });
    }
  });

  if (sortStrategy === 'ascending') {
    for (const nodeId of orderedNodeIds) {
      adjacency[nodeId].sort((a, b) => a.targetId - b.targetId);
    }
  } else if (sortStrategy === 'custom' && customAdjacencyOrder) {

    for (const nodeId of orderedNodeIds) {
      const desiredOrder = customAdjacencyOrder[nodeId];
      if (desiredOrder && desiredOrder.length > 0) {
        adjacency[nodeId].sort((a, b) => {
          const indexA = desiredOrder.indexOf(a.targetId);
          const indexB = desiredOrder.indexOf(b.targetId);

          return (indexA === -1 ? orderedNodeIds.length : indexA) - (indexB === -1 ? orderedNodeIds.length : indexB);
        });
      }
    }
  }

  const pushStep = (baseData: any) => {
    steps.push({
      ...baseData,
      tdState: { ...td },
      ttState: { ...tt },
      parentState: { ...parent }
    });
  };

  function dfsRecursive(currentNode: number, parentNode: number | null = null) {
    time++;
    td[currentNode] = time;
    visited.add(currentNode);
    stack.add(currentNode);

    pushStep({ type: 'visit', nodeId: currentNode });

    const neighbors = adjacency[currentNode];

    for (const edge of neighbors) {
      const neighborId = edge.targetId;
      
      if (!isDirected && neighborId === parentNode) {
        continue;
      }

      if (!visited.has(neighborId)) {
        pushStep({ type: 'tree-edge', edge });
        parent[neighborId] = currentNode;
        pushStep({ type: 'mark', nodeId: neighborId });
        dfsRecursive(neighborId, currentNode);
      } else if (stack.has(neighborId)) {
        pushStep({ type: 'back-edge', edge });
      }
    }

    stack.delete(currentNode);
    time++;
    tt[currentNode] = time;

    pushStep({ type: 'visit', nodeId: currentNode });
  }

  pushStep({ type: 'mark', nodeId: startNodeId });
  parent[startNodeId] = null;
  dfsRecursive(startNodeId);

  for (const nodeId of orderedNodeIds) {
    if (!visited.has(nodeId)) {
      pushStep({ type: 'mark', nodeId });
      parent[nodeId] = null;
      dfsRecursive(nodeId);
    }
  }
  
  steps.push({ type: 'done', tdState: { ...td }, ttState: { ...tt }, parentState: { ...parent } });

  return steps;
}