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
  nodesCount: number,
  edges: Edge[]
): MSTStep[] {
  const steps: MSTStep[] = [];
  const E_T: Edge[] = [];
  
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  
  const uf = new UnionFind(nodesCount);

  let j = 0; 
  
  while (E_T.length < nodesCount - 1 && j < sortedEdges.length) {
    const edge = sortedEdges[j];
    
    if (uf.union(edge.sourceId, edge.targetId)) {
      E_T.push(edge);
      
      steps.push({ type: 'edge', edge });
      steps.push({ type: 'visit', nodeId: edge.sourceId });
      steps.push({ type: 'visit', nodeId: edge.targetId });
    }
    
    j++;
  }

  steps.push({ type: 'done' });
  return steps;
}