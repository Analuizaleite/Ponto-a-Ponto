export interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export type AppMode = 'sandbox' | 'game';
export type ActiveTool = 'cursor' | 'add-node' | 'add-edge' | 'delete' | 'select-rotation';