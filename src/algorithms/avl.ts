export const performRightRotation = (nodes: any[]) => {
  return nodes.map(node => {
    if (node.id === 1) {
      return { ...node, x: 300, y: 150 };
    }
    if (node.id === 0) {
      return { ...node, x: 200, y: 300 };
    }
    if (node.id === 2) {
      return { ...node, x: 400, y: 300 };
    }
    return node;
  });
};

export const performLeftRotation = (nodes: any[]) => {
  return nodes.map(node => {
    if (node.id === 1) return { ...node, x: 300, y: 150 }; 
    if (node.id === 0) return { ...node, x: 200, y: 300 }; 
    if (node.id === 2) return { ...node, x: 400, y: 300 }; 
    return node;
  });
};

export const performLRRotation = (nodes: any[]) => {
  return nodes.map(node => {
    if (node.id === 0) return { ...node, x: 300, y: 150 };
    if (node.id === 2) return { ...node, x: 200, y: 300 };
    if (node.id === 1) return { ...node, x: 400, y: 300 }; 
    return node;
  });
};

export const performRLRotation = (nodes: any[]) => {
  return nodes.map(node => {
    if (node.id === 2) return { ...node, x: 300, y: 150 };
    if (node.id === 0) return { ...node, x: 200, y: 300 }; 
    if (node.id === 1) return { ...node, x: 400, y: 300 }; 
    return node;
  });
};