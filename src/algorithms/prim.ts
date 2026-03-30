export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface MSTStep {
  type: 'visit' | 'edge' | 'done';
  nodeId?: number;
  edge?: Edge;
}

export function generatePrimSteps(
  startNodeId: number,
  nodesCount: number,
  edges: Edge[]
): MSTStep[] {
  const steps: MSTStep[] = [];
  const V_T = new Set<number>();
  const E_T: Edge[] = [];

  V_T.add(startNodeId);
  steps.push({ type: 'visit', nodeId: startNodeId });
  
  const adj: Record<number, Edge[]> = {};
  for (let i = 0; i < nodesCount; i++) adj[i] = [];
  for (const edge of edges) {
    adj[edge.sourceId].push(edge);
    adj[edge.targetId].push(edge);
  }

  while (V_T.size < nodesCount) {
    let minEdge: Edge | null = null;
    let minCost = Infinity;
    let newNode = -1;

    for (const v of Array.from(V_T)) {
      for (const edge of adj[v]) {
        const w = edge.sourceId === v ? edge.targetId : edge.sourceId;
        if (!V_T.has(w)) {
          if (edge.weight < minCost) {
            minCost = edge.weight;
            minEdge = edge;
            newNode = w;
          }
        }
      }
    }

    if (!minEdge) break; 

    V_T.add(newNode);
    E_T.push(minEdge);

    steps.push({ type: 'edge', edge: minEdge });
    steps.push({ type: 'visit', nodeId: newNode });
  }

  steps.push({ type: 'done' });
  return steps;
}