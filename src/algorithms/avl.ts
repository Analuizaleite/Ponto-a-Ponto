export const performBalancedRotation = (nodes: any[]) => {
  const sortedNodes = [...nodes].sort((a, b) => parseInt(a.label) - parseInt(b.label));

  const leftNode = sortedNodes[0];   
  const rootNode = sortedNodes[1];   
  const rightNode = sortedNodes[2];

  const updatedNodes = nodes.map(node => {
    if (node.id === leftNode.id) return { ...node, x: 200, y: 300 };
    if (node.id === rootNode.id) return { ...node, x: 300, y: 150 };
    if (node.id === rightNode.id) return { ...node, x: 400, y: 300 };
    return node;
  });

  const updatedEdges = [
    { sourceId: rootNode.id, targetId: leftNode.id, weight: 1 },
    { sourceId: rootNode.id, targetId: rightNode.id, weight: 1 }
  ];

  return { updatedNodes, updatedEdges };
};