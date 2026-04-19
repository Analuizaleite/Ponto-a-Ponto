export interface Edge {
  sourceId: number;
  targetId: number;
  weight: number;
}

export interface FloydWarshallStep {
  type: 'init' | 'evaluating' | 'relax' | 'done';
  k?: number;
  i?: number;
  j?: number;
  distancesState?: Record<number, Record<number, number>>;
  previousState?: Record<number, Record<number, number | null>>;
}

export function generateFloydWarshallSteps(
  nodeIds: number[],
  edges: Edge[],
  isDirected: boolean
): FloydWarshallStep[] {
  const steps: FloydWarshallStep[] = [];
  const orderedNodeIds = [...nodeIds].sort((a, b) => a - b);
  
  const dist: Record<number, Record<number, number>> = {};
  const pred: Record<number, Record<number, number | null>> = {};

  const cloneState = (obj: any) => JSON.parse(JSON.stringify(obj));

  const pushStep = (baseData: any) => {
    steps.push({
      ...baseData,
      distancesState: cloneState(dist),
      previousState: cloneState(pred)
    });
  };

  for (const sourceId of orderedNodeIds) {
    dist[sourceId] = {};
    pred[sourceId] = {};
    for (const targetId of orderedNodeIds) {
      if (sourceId === targetId) {
        dist[sourceId][targetId] = 0;
        pred[sourceId][targetId] = null;
      } else {
        dist[sourceId][targetId] = Infinity;
        pred[sourceId][targetId] = null;
      }
    }
  }

  edges.forEach(e => {
    dist[e.sourceId][e.targetId] = e.weight;
    pred[e.sourceId][e.targetId] = e.sourceId;
    if (!isDirected) {
      dist[e.targetId][e.sourceId] = e.weight;
      pred[e.targetId][e.sourceId] = e.targetId;
    }
  });

  pushStep({ type: 'init' });

  for (const k of orderedNodeIds) {
    for (const i of orderedNodeIds) {
      for (const j of orderedNodeIds) {
        
        pushStep({ type: 'evaluating', k, i, j });

        if (dist[i][k] !== Infinity && dist[k][j] !== Infinity) {
          if (dist[i][k] + dist[k][j] < dist[i][j]) {
            dist[i][j] = dist[i][k] + dist[k][j];
            pred[i][j] = pred[k][j];
            
            pushStep({ type: 'relax', k, i, j });
          }
        }
      }
    }
  }

  pushStep({ type: 'done' });
  return steps;
}