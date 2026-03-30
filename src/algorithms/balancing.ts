export const getBalancedEdges = (rootId: number, leftChildId: number, rightChildId: number) => {
  return [
    {
      sourceId: rootId,
      targetId: leftChildId,
      weight: 1
    },
    {
      sourceId: rootId,
      targetId: rightChildId,
      weight: 1
    }
  ];
};

export const detectAVLCase = (_nodes: any[], edges: any[]): 'LL' | 'RR' | 'LR' | 'RL' | null => {
  const hasEdge = (s: number, t: number) => edges.some(e => e.sourceId === s && e.targetId === t);

  if (hasEdge(2, 1) && hasEdge(1, 0)) return 'LL';
  if (hasEdge(0, 1) && hasEdge(1, 2)) return 'RR'; 
  if (hasEdge(2, 0) && hasEdge(0, 1)) return 'RL'; 
  if (hasEdge(0, 2) && hasEdge(2, 1)) return 'LR'; 

  return null;
};