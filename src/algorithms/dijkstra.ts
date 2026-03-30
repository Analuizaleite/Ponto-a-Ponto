export interface DijkstraStep {
  type: 'visit' | 'queue' | 'path' | 'done';
  nodeId?: number;
  currentDistances: number[];
  previous: (number | null)[];
}

export const generateDijkstraSteps = (
  startId: number,
  numNodes: number,
  edges: { sourceId: number; targetId: number; weight: number }[]
): DijkstraStep[] => {
  const steps: DijkstraStep[] = [];
  
  const distances: number[] = Array(numNodes).fill(Infinity);
  const previous: (number | null)[] = Array(numNodes).fill(null);
  const visited: Set<number> = new Set();
  const queue: number[] = [];
  
  distances[startId] = 0;
  queue.push(startId);
  
  steps.push({
    type: 'queue',
    nodeId: startId,
    currentDistances: [...distances],
    previous: [...previous]
  });
  
  const adjacencyList: Map<number, { neighbor: number; weight: number }[]> = new Map();
  for (let i = 0; i < numNodes; i++) {
    adjacencyList.set(i, []);
  }
  for (const edge of edges) {
    adjacencyList.get(edge.sourceId)?.push({ neighbor: edge.targetId, weight: edge.weight });
    adjacencyList.get(edge.targetId)?.push({ neighbor: edge.sourceId, weight: edge.weight });
  }
  
  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const current = queue.shift()!;
    
    if (visited.has(current)) continue;
    visited.add(current);
    
    steps.push({
      type: 'visit',
      nodeId: current,
      currentDistances: [...distances],
      previous: [...previous]
    });
    
    const neighbors = adjacencyList.get(current) || [];
    for (const { neighbor, weight } of neighbors) {
      if (visited.has(neighbor)) continue;
      
      const newDistance = distances[current] + weight;
      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
        
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }
        
        steps.push({
          type: 'queue',
          nodeId: neighbor,
          currentDistances: [...distances],
          previous: [...previous]
        });
      }
    }
  }
  
  steps.push({
    type: 'done',
    currentDistances: [...distances],
    previous: [...previous]
  });
  
  return steps;
};

export const getShortestPath = (
  startId: number,
  targetId: number,
  previous: (number | null)[]
): number[] => {
  const path: number[] = [];
  let current: number | null = targetId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }
  
  if (path[0] !== startId) {
    return [];
  }
  
  return path;
};
