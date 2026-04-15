export interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  vertexName?: string;
}

export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface DimacsGraph {
  nodeCount: number;
  edgeCount: number;
  nodes: Array<{ id: number; name: string }>;
  edges: Array<{ source: number; target: number; weight: number }>;
}

export type AppMode = 'sandbox' | 'game';
export type ActiveTool = 'cursor' | 'add-node' | 'add-edge' | 'delete';