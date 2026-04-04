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
  nodesCount: number,
  edges: Edge[],
  isDirected: boolean
): FloydWarshallStep[] {
  const steps: FloydWarshallStep[] = [];
  
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

  for (let i = 0; i < nodesCount; i++) {
    dist[i] = {};
    pred[i] = {};
    for (let j = 0; j < nodesCount; j++) {
      if (i === j) {
        dist[i][j] = 0;
        pred[i][j] = null;
      } else {
        dist[i][j] = Infinity;
        pred[i][j] = null;
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

  for (let k = 0; k < nodesCount; k++) {
    for (let i = 0; i < nodesCount; i++) {
      for (let j = 0; j < nodesCount; j++) {
        
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