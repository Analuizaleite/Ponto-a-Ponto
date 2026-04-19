import type { Edge, MSTStep } from './prim';

class UnionFind {
  parent: number[];
  
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i);
  }
  
  find(i: number): number {
    if (this.parent[i] === i) return i;
    return this.parent[i] = this.find(this.parent[i]);
  }
  
  union(i: number, j: number): boolean {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ; 
      return true; 
    }
    return false;
  }
}

export function generateKruskalSteps(
  nodeIds: number[],
  edges: Edge[]
): MSTStep[] {
  const steps: MSTStep[] = [];
  const E_T: Edge[] = [];
  const orderedNodeIds = [...nodeIds].sort((a, b) => a - b);
  const nodeIndexMap = new Map<number, number>(
    orderedNodeIds.map((nodeId, index) => [nodeId, index]),
  );

  for (const nodeId of orderedNodeIds) {
    steps.push({ type: 'visit', nodeId });
  }
  
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  const uf = new UnionFind(orderedNodeIds.length);

  let j = 0; 
  
  while (E_T.length < orderedNodeIds.length - 1 && j < sortedEdges.length) {
    const edge = sortedEdges[j];
    steps.push({ type: 'test-edge', edge });
    
    if (uf.union(nodeIndexMap.get(edge.sourceId)!, nodeIndexMap.get(edge.targetId)!)) {
      E_T.push(edge);
      
      steps.push({ type: 'edge', edge });
    } else {
      steps.push({ type: 'cycle-edge', edge });
    }
    
    j++;
  }

  steps.push({ type: 'done' });
  return steps;
}