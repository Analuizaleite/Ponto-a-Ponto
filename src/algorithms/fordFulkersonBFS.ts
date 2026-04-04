export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}
export interface FordFulkersonStep {
  type: "find-path" | "augment" | "done";
  pathEdges?: Edge[];
  bottleneck?: number;
  flowState?: Record<string, number>;
  maxFlow?: number;
}

export function generateFordFulkersonSteps(
  sourceId: number,
  sinkId: number,
  edges: Edge[],
  isDirected: boolean,
): FordFulkersonStep[] {
  const steps: FordFulkersonStep[] = [];

  const flows: Record<string, number> = {};

  edges.forEach((e) => {
    flows[`${e.sourceId}-${e.targetId}`] = 0;
    if (!isDirected) {
      flows[`${e.targetId}-${e.sourceId}`] = 0;
    }
  });

  const getFlowState = () => ({ ...flows });

  let maxFlow = 0;

  const findAugmentingPath = (): {
    pathNodes: number[];
    pathEdges: Edge[];
    bottleneck: number;
  } | null => {
    const parentNode: Record<number, number | null> = {};
    const parentEdge: Record<number, Edge | null> = {};
    const queue: number[] = [sourceId];
    const visited = new Set<number>([sourceId]);

    while (queue.length > 0) {
      const u = queue.shift()!;

      if (u === sinkId) break;

      for (const edge of edges) {
        if (edge.sourceId === u) {
          const v = edge.targetId;
          const residualCapacity = edge.weight - flows[`${u}-${v}`];
          if (!visited.has(v) && residualCapacity > 0) {
            visited.add(v);
            parentNode[v] = u;
            parentEdge[v] = edge;
            queue.push(v);
          }
        } else if (edge.targetId === u && isDirected) {
          const v = edge.sourceId;
          const residualCapacity = flows[`${v}-${u}`];
          if (!visited.has(v) && residualCapacity > 0) {
            visited.add(v);
            parentNode[v] = u;
            parentEdge[v] = edge;
            queue.push(v);
          }
        } else if (!isDirected && edge.targetId === u) {
          const v = edge.sourceId;
          const residualCapacity = edge.weight - flows[`${u}-${v}`];
          if (!visited.has(v) && residualCapacity > 0) {
            visited.add(v);
            parentNode[v] = u;
            parentEdge[v] = { sourceId: u, targetId: v, weight: edge.weight };
            queue.push(v);
          }
        }
      }
    }

    if (!visited.has(sinkId)) return null;

    let curr = sinkId;
    let bottleneck = Infinity;
    const pathNodes: number[] = [sinkId];
    const pathEdges: Edge[] = [];

    while (curr !== sourceId) {
      const p = parentNode[curr]!;
      const e = parentEdge[curr]!;
      pathNodes.unshift(p);
      pathEdges.unshift(e);

      let residual = 0;
      if (e.sourceId === p && e.targetId === curr) {
        residual = e.weight - flows[`${p}-${curr}`];
      } else {
        residual = flows[`${curr}-${p}`];
      }
      bottleneck = Math.min(bottleneck, residual);

      curr = p;
    }

    return { pathNodes, pathEdges, bottleneck };
  };

  while (true) {
    const augmentResult = findAugmentingPath();
    if (!augmentResult) break;

    const { pathNodes, pathEdges, bottleneck } = augmentResult;

    steps.push({
      type: "find-path",
      pathEdges,
      bottleneck,
      flowState: getFlowState(),
      maxFlow,
    });

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const u = pathNodes[i];
      const v = pathNodes[i + 1];
      const edge = pathEdges[i];

      if (edge.sourceId === u && edge.targetId === v) {
        flows[`${u}-${v}`] += bottleneck;
      } else {
        flows[`${v}-${u}`] -= bottleneck;
      }
    }

    maxFlow += bottleneck;

    steps.push({
      type: "augment",
      pathEdges,
      bottleneck,
      flowState: getFlowState(),
      maxFlow,
    });
  }

  steps.push({ type: "done", flowState: getFlowState(), maxFlow });

  return steps;
}
