export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface BFSStep {
  type:
    | 'visit'
    | 'queue'
    | 'edge'
    | 'parent-edge'
    | 'uncle-edge'
    | 'brother-edge'
    | 'cousin-edge'
    | 'done';
  nodeId?: number;
  edge?: Edge;
  lState?: Record<number, number>;
  nivelState?: Record<number, number>;
  paiState?: Record<number, number | null>;
}

export function generateBFSSteps(
  startNodeId: number,
  nodeIds: number[],
  edges: Edge[],
  isDirected: boolean,
  sortStrategy: 'ascending' | 'custom' = 'ascending',
  customAdjacencyOrder?: Record<number, number[]>
): BFSStep[] {
  const steps: BFSStep[] = [];
  const visited = new Set<number>();
  const queue: number[] = [];
  const orderedNodeIds = [...nodeIds].sort((a, b) => a - b);

  let lCounter = 0;
  const L: Record<number, number> = {};
  const nivel: Record<number, number> = {};
  const pai: Record<number, number | null> = {};

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

        pushStep({ type: 'parent-edge', edge });
        pushStep({ type: 'queue', nodeId: neighborId });
        queue.push(neighborId);
      } else if (!isDirected && neighborId === pai[currentId]) {
        continue;
      } else if (nivel[neighborId] === nivel[currentId] + 1) {
        pushStep({ type: 'uncle-edge', edge });
      } else if (
        nivel[neighborId] === nivel[currentId] &&
        pai[currentId] !== null &&
        pai[neighborId] !== null &&
        pai[currentId] === pai[neighborId] &&
        L[neighborId] > L[currentId]
      ) {
        pushStep({ type: 'brother-edge', edge });
      } else if (
        nivel[neighborId] === nivel[currentId] &&
        pai[currentId] !== null &&
        pai[neighborId] !== null &&
        pai[currentId] !== pai[neighborId] &&
        L[neighborId] > L[currentId]
      ) {
        pushStep({ type: 'cousin-edge', edge });
      }
    }
  }

  for (const nodeId of orderedNodeIds) {
    if (!visited.has(nodeId)) {
      lCounter++;
      L[nodeId] = lCounter;
      nivel[nodeId] = 0;
      pai[nodeId] = null;
      queue.push(nodeId);
      visited.add(nodeId);
      pushStep({ type: 'queue', nodeId });

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
            pushStep({ type: 'parent-edge', edge });
            pushStep({ type: 'queue', nodeId: neighborId });
            queue.push(neighborId);
          } else if (!isDirected && neighborId === pai[currentId]) {
            continue;
          } else if (nivel[neighborId] === nivel[currentId] + 1) {
            pushStep({ type: 'uncle-edge', edge });
          } else if (
            nivel[neighborId] === nivel[currentId] &&
            pai[currentId] !== null &&
            pai[neighborId] !== null &&
            pai[currentId] === pai[neighborId] &&
            L[neighborId] > L[currentId]
          ) {
            pushStep({ type: 'brother-edge', edge });
          } else if (
            nivel[neighborId] === nivel[currentId] &&
            pai[currentId] !== null &&
            pai[neighborId] !== null &&
            pai[currentId] !== pai[neighborId] &&
            L[neighborId] > L[currentId]
          ) {
            pushStep({ type: 'cousin-edge', edge });
          }
        }
      }
    }
  }

  pushStep({ type: 'done' });
  return steps;
}