import React, { useState, useEffect, useRef } from "react";

// --- IMPORTAÇÃO DE TIPOS E COMPONENTES ---
import type { Node, Edge, AppMode, ActiveTool } from "./types";
import { Header } from "./components/Header";
import { GraphCanvas } from "./components/GraphCanvas";
import { SandboxSidebar } from "./components/SandboxSidebar";
import { GameSidebar } from "./components/GameSidebar";

// --- DADOS E ASSETS ---
import logoImage from "./assets/logo_transparente.png";
import { GAME_THEMES } from "./data/gameThemes";

// --- IMPORTAÇÃO DE ALGORITMOS ---
import { generateBFSSteps } from "./algorithms/bfs";
import { generateDFSSteps } from "./algorithms/dfs";
import { generateDijkstraSteps, getShortestPath } from "./algorithms/dijkstra";
import { generatePrimSteps } from "./algorithms/prim";
import { generateKruskalSteps } from "./algorithms/kruskal";
import { generateBellmanFordSteps } from "./algorithms/bellmanFord";
import { generateFloydWarshallSteps } from "./algorithms/floydWarshall";
import { generateFordFulkersonSteps } from "./algorithms/fordFulkersonBFS";

// --- FUNÇÃO AUXILIAR PARA O FORD-FULKERSON ---
const checkResidualPathExists = (
  edges: Edge[],
  flows: Record<string, number>,
  source: number,
  sink: number,
) => {
  const visited = new Set<number>();
  const queue = [source];
  visited.add(source);

  while (queue.length > 0) {
    const u = queue.shift()!;
    if (u === sink) return true;

    for (const edge of edges) {
      if (edge.sourceId === u) {
        const currentFlow = flows[`${edge.sourceId}-${edge.targetId}`] || 0;
        if (currentFlow < edge.weight && !visited.has(edge.targetId)) {
          visited.add(edge.targetId);
          queue.push(edge.targetId);
        }
      }
    }
  }
  return false;
};

// --- FUNÇÃO PARA CONSTRUIR LISTA DE ADJACÊNCIA ---
const buildAdjacencyList = (edges: Edge[], isDirected: boolean): Record<string, Edge[]> => {
  const adjacency: Record<string, Edge[]> = {};
  for (const edge of edges) {
    if (!adjacency[edge.sourceId.toString()]) {
      adjacency[edge.sourceId.toString()] = [];
    }
    adjacency[edge.sourceId.toString()].push(edge);
    if (!isDirected) {
      if (!adjacency[edge.targetId.toString()]) {
        adjacency[edge.targetId.toString()] = [];
      }
      adjacency[edge.targetId.toString()].push({
        ...edge,
        sourceId: edge.targetId,
        targetId: edge.sourceId,
      });
    }
  }
  return adjacency;
};

// --- MOTOR DE GERAÇÃO DINÂMICA ---
const generateRandomGraph = (
  numNodes: number,
  isWeighted: boolean,
  algo: string,
) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const centerX = 350;
  const centerY = 250;
  const radiusX = 220;
  const radiusY = 160;

  for (let i = 0; i < numNodes; i++) {
    const angle = (i / numNodes) * 2 * Math.PI - Math.PI / 2;
    nodes.push({
      id: i,
      label: i.toString(),
      x: centerX + radiusX * Math.cos(angle) + (Math.random() - 0.5) * 60,
      y: centerY + radiusY * Math.sin(angle) + (Math.random() - 0.5) * 60,
    });
  }

  const addEdge = (
    source: number,
    target: number,
    minW: number,
    maxW: number,
  ) => {
    if (source === 0 && target === numNodes - 1 && algo !== "DIJKSTRA") return;
    if (target === 0 || source === numNodes - 1) return;
    if (
      edges.some(
        (e) =>
          (e.sourceId === source && e.targetId === target) ||
          (!["FORD_FULKERSON"].includes(algo) &&
            e.sourceId === target &&
            e.targetId === source),
      )
    )
      return;
    const weight = isWeighted
      ? (Math.floor(Math.random() * (maxW - minW + 1)) + minW) *
        (algo === "FORD_FULKERSON" ? 5 : 1)
      : 1;
    edges.push({ sourceId: source, targetId: target, weight: weight });
  };

  for (let i = 0; i < numNodes - 1; i++) addEdge(i, i + 1, 2, 6);
  const numExtraEdges = Math.floor(numNodes * 1.5);
  for (let i = 0; i < numExtraEdges; i++) {
    const s = Math.floor(Math.random() * numNodes);
    const t = Math.floor(Math.random() * numNodes);
    if (s !== t && Math.abs(s - t) > 1)
      addEdge(Math.min(s, t), Math.max(s, t), 1, 9);
  }
  if (algo === "DIJKSTRA") addEdge(0, numNodes - 1, 15, 25);
  return { nodes, edges };
};

const generateDynamicLevel = (algo: string) => {
  const numNodes =
    algo === "DIJKSTRA" || algo === "FORD_FULKERSON" || algo === "PRIM" ? 6 : 5;
  const isWeighted = ["DIJKSTRA", "PRIM", "FORD_FULKERSON"].includes(algo);
  const isDirected = algo === "FORD_FULKERSON";

  const { nodes, edges } = generateRandomGraph(numNodes, isWeighted, algo);
  const startNodeId = 0;
  const targetNodeId = numNodes - 1;
  let expectedVisits: number[] = [];

  if (algo === "BFS") {
    const steps = generateBFSSteps(startNodeId, numNodes, edges, isDirected);
    expectedVisits = Array.from(
      new Set(
        steps.filter((s: any) => s.type === "visit").map((s: any) => s.nodeId),
      ),
    );
  } else if (algo === "DFS") {
    const steps = generateDFSSteps(startNodeId, numNodes, edges, isDirected);
    expectedVisits = Array.from(
      new Set(
        steps.filter((s: any) => s.type === "visit").map((s: any) => s.nodeId),
      ),
    );
  } else if (algo === "DIJKSTRA") {
    const steps = generateDijkstraSteps(startNodeId, numNodes, edges);
    const lastStep = steps[steps.length - 1];
    if (lastStep && lastStep.previous)
      expectedVisits = getShortestPath(
        startNodeId,
        targetNodeId,
        lastStep.previous,
      );
  } else if (algo === "PRIM") {
    const steps = generatePrimSteps(startNodeId, numNodes, edges);
    expectedVisits = [startNodeId];
    steps.forEach((s: any) => {
      if (
        s.type === "visit" &&
        s.nodeId !== undefined &&
        !expectedVisits.includes(s.nodeId)
      )
        expectedVisits.push(s.nodeId);
    });
  } else if (algo === "FORD_FULKERSON") {
    const steps = generateFordFulkersonSteps(
      startNodeId,
      targetNodeId,
      edges,
      isDirected,
    );
    const pathStep = steps.find((s: any) => s.type === "find-path");
    if (pathStep && pathStep.pathEdges && pathStep.pathEdges.length > 0) {
      expectedVisits = [startNodeId];
      let curr = startNodeId;
      pathStep.pathEdges.forEach((e: Edge) => {
        const next = e.sourceId === curr ? e.targetId : e.sourceId;
        expectedVisits.push(next);
        curr = next;
      });
    } else {
      expectedVisits = [startNodeId, targetNodeId];
    }
  }

  if (expectedVisits.length === 0 && algo !== "FORD_FULKERSON")
    expectedVisits = [startNodeId];
  return {
    nodes,
    edges,
    expectedVisits,
    startNodeId,
    targetNodeId,
    isDirected,
  };
};

function MobileBottomSheet({
  children,
  appMode,
}: {
  children: React.ReactNode;
  appMode: string;
}) {
  const SNAP_DEFAULT = 35;
  const SNAP_MID = 55;
  const SNAP_MIN = 10;

  const [heightPct, setHeightPct] = useState(SNAP_DEFAULT);
  const dragStartY = useRef<number | null>(null);
  const dragStartH = useRef<number>(SNAP_DEFAULT);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeightPct(SNAP_DEFAULT);
  }, [appMode]);

  const getClientY = (e: React.TouchEvent | React.MouseEvent) =>
    "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

  const onDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    dragStartY.current = getClientY(e);
    dragStartH.current = heightPct;
  };

  const onDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartY.current === null || !containerRef.current) return;
    const containerH = containerRef.current.parentElement!.clientHeight;
    const dy = dragStartY.current - getClientY(e);
    const deltaPct = (dy / containerH) * 100;
    const next = Math.min(
      85,
      Math.max(SNAP_MIN, dragStartH.current + deltaPct),
    );
    setHeightPct(next);
  };

  const onDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    const snaps = [SNAP_MIN, SNAP_DEFAULT, SNAP_MID];
    const closest = snaps.reduce((a, b) =>
      Math.abs(a - heightPct) < Math.abs(b - heightPct) ? a : b,
    );
    setHeightPct(closest);
  };

  return (
    <div
      ref={containerRef}
      className="md:hidden absolute bottom-0 left-0 right-0 bg-ponto-dark rounded-t-2xl shadow-2xl z-20 flex flex-col"
      style={{
        height: `${heightPct}%`,
        transition: dragStartY.current === null ? "height 0.25s ease" : "none",
      }}
    >
      <div
        className="flex justify-center items-center py-3 cursor-grab active:cursor-grabbing shrink-0"
        onMouseDown={onDragStart}
        onMouseMove={onDragMove}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
        onTouchStart={onDragStart}
        onTouchMove={onDragMove}
        onTouchEnd={onDragEnd}
      >
        <div className="w-10 h-1 bg-ponto-muted/60 rounded-full" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">{children}</div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const [appMode, setAppMode] = useState<AppMode>("sandbox");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirected, setIsDirected] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>("add-node");
  const [connectionSourceId, setConnectionSourceId] = useState<number | null>(
    null,
  );
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);

  const [gamePhase, setGamePhase] = useState<"HUB" | "PLAYING" | "REPORT">(
    "HUB",
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [dynamicLevel, setDynamicLevel] = useState<any>(null);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [playerPath, setPlayerPath] = useState<number[]>([]);

  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const [selectedAlgo, setSelectedAlgo] = useState<string>("BFS");
  const [startNodeId, setStartNodeId] = useState<string>("");
  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [flowSourceId, setFlowSourceId] = useState<string>("");
  const [flowSinkId, setFlowSinkId] = useState<string>("");
  const [dfsSortStrategy, setDfsSortStrategy] = useState<'ascending' | 'custom'>('ascending');
  const [customAdjacencyOrder, setCustomAdjacencyOrder] = useState<Record<number, number[]>>({});
  const [bfsSortStrategy, setBfsSortStrategy] = useState<'ascending' | 'custom'>('ascending');
  const [bfsCustomAdjacencyOrder, setBfsCustomAdjacencyOrder] = useState<Record<number, number[]>>({});
  const [bfsParentEdges, setBfsParentEdges] = useState<Set<string>>(new Set());
  const [bfsUncleEdges, setBfsUncleEdges] = useState<Set<string>>(new Set());
  const [bfsBrotherEdges, setBfsBrotherEdges] = useState<Set<string>>(new Set());
  const [bfsCousinEdges, setBfsCousinEdges] = useState<Set<string>>(new Set());

  const [animationStatus, setAnimationStatus] = useState<
    "idle" | "playing" | "paused"
  >("idle");
  const [customNodeId, setCustomNodeId] = useState<string>("");
  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [currentAugmentingPath, setCurrentAugmentingPath] = useState<Edge[]>(
    [],
  );
  const stepsRef = useRef<any[]>([]);
  const currentStepRef = useRef<number>(0);

  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [queueNodes, setQueueNodes] = useState<Set<number>>(new Set());
  const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set());
  const [dfsTreeEdges, setDfsTreeEdges] = useState<Set<string>>(new Set());
  const [dfsBackEdges, setDfsBackEdges] = useState<Set<string>>(new Set());
  const [evaluatingEdge, setEvaluatingEdge] = useState<Edge | null>(null);
  const [mstTotalWeight, setMstTotalWeight] = useState<number>(0);
  const [dijkstraDistances, setDijkstraDistances] = useState<
    Record<number, number>
  >({});
  const [dijkstraPrevious, setDijkstraPrevious] = useState<
    Record<number, number | null>
  >({});
  const [bfDistances, setBfDistances] = useState<Record<number, number>>({});
  const [bfPrevious, setBfPrevious] = useState<Record<number, number | null>>(
    {},
  );
  const [bfIteration, setBfIteration] = useState<number | string>(0);
  const [bfHasNegativeCycle, setBfHasNegativeCycle] = useState<boolean>(false);
  const [bfNegativeCycleEdges, setBfNegativeCycleEdges] = useState<Edge[]>([]);
  const [dfsTD, setDfsTD] = useState<Record<number, number>>({});
  const [dfsTT, setDfsTT] = useState<Record<number, number>>({});
  const [dfsPai, setDfsPai] = useState<Record<number, number | null>>({});
  const [bfsL, setBfsL] = useState<Record<number, number>>({});
  const [bfsNivel, setBfsNivel] = useState<Record<number, number>>({});
  const [bfsPai, setBfsPai] = useState<Record<number, number | null>>({});
  const [fwDistances, setFwDistances] = useState<
    Record<number, Record<number, number>>
  >({});
  const [fwPrevious, setFwPrevious] = useState<
    Record<number, Record<number, number | null>>
  >({});
  const [fwK, setFwK] = useState<number | null>(null);
  const [fwI, setFwI] = useState<number | null>(null);
  const [fwJ, setFwJ] = useState<number | null>(null);
  const [ffFlows, setFfFlows] = useState<Record<string, number>>({});
  const [ffMaxFlow, setFfMaxFlow] = useState<number>(0);
  /*const [setFfAugmentingEdges] = useState<Set<string>>(
    new Set(),
  );*/

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (appMode === "game") {
      setGamePhase("HUB");
      setNodes([]);
      setEdges([]);
    }
    stopAnimation();
  }, [appMode]);

  const resetVisualState = () => {
    setVisitedNodes(new Set());
    setQueueNodes(new Set());
    setVisitedEdges(new Set());
    setDfsTreeEdges(new Set());
    setDfsBackEdges(new Set());
    setBfsParentEdges(new Set());
    setBfsUncleEdges(new Set());
    setBfsBrotherEdges(new Set());
    setBfsCousinEdges(new Set());
    setEvaluatingEdge(null);
    setMstTotalWeight(0);
    setDijkstraDistances({});
    setDijkstraPrevious({});
    setDfsTD({});
    setDfsTT({});
    setBfsL({});
    setBfsNivel({});
    setBfsPai({});
    setBfDistances({});
    setBfPrevious({});
    setBfIteration(0);
    setBfHasNegativeCycle(false);
    setBfNegativeCycleEdges([]);
    setFwDistances({});
    setFwPrevious({});
    setFwK(null);
    setFwI(null);
    setFwJ(null);
    setFfFlows({});
    setFfMaxFlow(0);
    setCurrentAugmentingPath([]);
    //setFfAugmentingEdges(new Set());
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current)
      clearInterval(animationIntervalRef.current);
    setAnimationStatus("idle");
    currentStepRef.current = 0;
    stepsRef.current = [];
    resetVisualState();
  };

  const playAnimation = () => {
    if (animationStatus === "playing") return;
    if (animationStatus === "idle") {
      let startNode, targetNode;
      if (
        selectedAlgo !== "KRUSKAL" &&
        selectedAlgo !== "FLOYD_WARSHALL"
      ) {
        const isFF = selectedAlgo === "FORD_FULKERSON";
        const searchStart = startNodeId.trim();
        startNode = nodes.find(
          (n) => n.label === searchStart || n.id.toString() === searchStart,
        );
        if (!startNode)
          return alert(`Nó inicial ${isFF ? "(Fonte)" : ""} não encontrado.`);

        if (isFF) {
          const searchTarget = targetNodeId.trim();
          targetNode = nodes.find(
            (n) => n.label === searchTarget || n.id.toString() === searchTarget,
          );
          if (!targetNode)
            return alert(`Nó sumidouro (destino) não encontrado.`);
          if (startNode.id === targetNode.id)
            return alert("A Fonte e o Sumidouro não podem ser o mesmo nó!");
        }
      }

      const startId = startNode ? startNode.id : 0;
      const targetId = targetNode ? targetNode.id : 0;
      const nodesCount =
        nodes.length > 0 ? Math.max(...nodes.map((n) => n.id)) + 1 : 0;

      let steps: any[] = [];
      if (selectedAlgo === "BFS")
        steps = generateBFSSteps(startId, nodesCount, edges, isDirected, bfsSortStrategy, bfsCustomAdjacencyOrder);
      else if (selectedAlgo === "DFS")
        steps = generateDFSSteps(startId, nodesCount, edges, isDirected, dfsSortStrategy, customAdjacencyOrder);
      else if (selectedAlgo === "DIJKSTRA")
        steps = generateDijkstraSteps(startId, nodesCount, edges);
      else if (selectedAlgo === "PRIM")
        steps = generatePrimSteps(startId, nodesCount, edges);
      else if (selectedAlgo === "KRUSKAL")
        steps = generateKruskalSteps(nodesCount, edges);
      else if (selectedAlgo === "BELLMAN_FORD")
        steps = generateBellmanFordSteps(
          startId,
          nodesCount,
          edges,
          isDirected,
        );
      else if (selectedAlgo === "FLOYD_WARSHALL")
        steps = generateFloydWarshallSteps(nodesCount, edges, isDirected);
      else if (selectedAlgo === "FORD_FULKERSON")
        steps = generateFordFulkersonSteps(
          startId,
          targetId,
          edges,
          isDirected,
        );

      if (animationIntervalRef.current)
        clearInterval(animationIntervalRef.current);
      resetVisualState();
      stepsRef.current = steps;
      currentStepRef.current = 0;
    }

    setAnimationStatus("playing");
    animationIntervalRef.current = setInterval(() => {
      if (currentStepRef.current >= stepsRef.current.length) {
        clearInterval(animationIntervalRef.current!);
        setAnimationStatus("idle");
        return;
      }
      const step = stepsRef.current[currentStepRef.current];

      if (step.distancesState && selectedAlgo === "DIJKSTRA")
        setDijkstraDistances(step.distancesState);
      if (step.previousState && selectedAlgo === "DIJKSTRA")
        setDijkstraPrevious(step.previousState);
      if (step.tdState) setDfsTD(step.tdState);
      if (step.ttState) setDfsTT(step.ttState);
      if (step.parentState) setDfsPai(step.parentState);
      if (step.lState) setBfsL(step.lState);
      if (step.nivelState) setBfsNivel(step.nivelState);
      if (step.paiState) setBfsPai(step.paiState);
      if (step.type === "parent-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setBfsParentEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const next = new Set(prev);
          next.add(edgeKey);
          return next;
        });
      } else if (step.type === "uncle-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setBfsUncleEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const next = new Set(prev);
          next.add(edgeKey);
          return next;
        });
      } else if (step.type === "brother-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setBfsBrotherEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const next = new Set(prev);
          next.add(edgeKey);
          return next;
        });
      } else if (step.type === "cousin-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setBfsCousinEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const next = new Set(prev);
          next.add(edgeKey);
          return next;
        });
      }
      if (step.distancesState && selectedAlgo === "BELLMAN_FORD")
        setBfDistances(step.distancesState);
      if (step.previousState && selectedAlgo === "BELLMAN_FORD")
        setBfPrevious(step.previousState);
      if (step.iteration !== undefined) setBfIteration(step.iteration);
      if (step.hasNegativeCycle !== undefined)
        setBfHasNegativeCycle(step.hasNegativeCycle);
      if (step.negativeCycleEdges !== undefined)
        setBfNegativeCycleEdges(step.negativeCycleEdges);
      if (step.type === "done" && selectedAlgo === "BELLMAN_FORD") {
        setBfIteration(bfHasNegativeCycle ? "CICLO NEGATIVO!" : "Concluído");
      }
      if (step.distancesState && selectedAlgo === "FLOYD_WARSHALL")
        setFwDistances(step.distancesState);
      if (step.previousState && selectedAlgo === "FLOYD_WARSHALL")
        setFwPrevious(step.previousState);
      if (step.k !== undefined) setFwK(step.k);
      else if (step.type === "done" || step.type === "init") setFwK(null);
      if (step.i !== undefined) setFwI(step.i);
      else if (step.type === "done" || step.type === "init") setFwI(null);
      if (step.j !== undefined) setFwJ(step.j);
      else if (step.type === "done" || step.type === "init") setFwJ(null);
      if (step.flowState && selectedAlgo === "FORD_FULKERSON")
        setFfFlows(step.flowState);
      if (step.maxFlow !== undefined && selectedAlgo === "FORD_FULKERSON")
        setFfMaxFlow(step.maxFlow);
      if (step.type === "find-path" && step.pathEdges) {
        setCurrentAugmentingPath(step.pathEdges);
      } else if (step.type === "augment" || step.type === "done") {
        setCurrentAugmentingPath([]);
      }

      /*if (step.type === "augment" && step.pathEdges) {
        setFfAugmentingEdges((prev) => {
          const next = new Set(prev);
          step.pathEdges.forEach((e: Edge) =>
            next.add(
              `${Math.min(e.sourceId, e.targetId)}-${Math.max(e.sourceId, e.targetId)}`,
            ),
          );
          return next;
        });
      }*/

      if (step.type === "test-edge" && step.edge) setEvaluatingEdge(step.edge);
      else if (step.type === "relax" || step.type === "done")
        setEvaluatingEdge(null);

      if (step.treeEdges) {
        const newTree = new Set<string>();
        step.treeEdges.forEach((e: any) =>
          newTree.add(
            `${Math.min(e.sourceId, e.targetId)}-${Math.max(e.sourceId, e.targetId)}`,
          ),
        );
        setVisitedEdges(newTree);
      }

      if (step.type === "mark" && step.nodeId !== undefined) {
        setQueueNodes((prev) => new Set(prev).add(step.nodeId));
      } else if (step.type === "visit" && step.nodeId !== undefined) {
        setQueueNodes((prev) => {
          const n = new Set(prev);
          n.delete(step.nodeId);
          return n;
        });
        setVisitedNodes((prev) => new Set(prev).add(step.nodeId));
      } else if (step.type === "tree-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setDfsTreeEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const n = new Set(prev);
          n.add(edgeKey);
          return n;
        });
      } else if (step.type === "back-edge" && step.edge !== undefined) {
        const edgeKey = `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`;
        setDfsBackEdges((prev) => new Set(prev).add(edgeKey));
        setVisitedEdges((prev) => {
          const n = new Set(prev);
          n.add(edgeKey);
          return n;
        });
      } else if (step.type === "edge" && step.edge !== undefined) {
        setVisitedEdges((prev) => {
          const n = new Set(prev);
          n.add(
            `${Math.min(step.edge.sourceId, step.edge.targetId)}-${Math.max(step.edge.sourceId, step.edge.targetId)}`,
          );
          return n;
        });
        if (selectedAlgo === "PRIM" || selectedAlgo === "KRUSKAL")
          setMstTotalWeight((prev) => prev + step.edge!.weight);
      }
      currentStepRef.current++;
    }, 700);
  };

  const pauseAnimation = () => {
    if (animationIntervalRef.current)
      clearInterval(animationIntervalRef.current);
    setAnimationStatus("paused");
  };

  const clearAll = () => {
    stopAnimation();
    setNodes([]);
    setEdges([]);
    setTransform({ x: 0, y: 0, k: 1 });
  };

  const loadLevel = (themeId: string, levelIdx: number) => {
    const theme = GAME_THEMES.find((t) => t.id === themeId);
    if (!theme) return;

    stopAnimation();

    setSelectedThemeId(themeId);
    setCurrentLevelIndex(levelIdx);
    const config = theme.levels[levelIdx];
    const data = generateDynamicLevel(config.algo);

    setDynamicLevel({ ...config, ...data });
    setNodes(data.nodes);
    setEdges(data.edges);
    setIsDirected(data.isDirected);

    setGamePhase("PLAYING");
    setLives(3);
    setGameStatus("playing");
    setFfFlows({});
    setFfMaxFlow(0);
    setPlayerPath([]);
    setVisitedNodes(new Set());
    setTransform({ x: 0, y: 0, k: 1 });
  };

  const resetGame = () =>
    selectedThemeId && loadLevel(selectedThemeId, currentLevelIndex);

  const nextLevel = () => {
    if (!selectedThemeId) return;
    const theme = GAME_THEMES.find((t) => t.id === selectedThemeId);
    if (theme && currentLevelIndex < theme.levels.length - 1)
      loadLevel(selectedThemeId, currentLevelIndex + 1);
    else setGamePhase("HUB");
  };

  const getEventCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e)
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return {
      x: (e as React.MouseEvent).clientX,
      y: (e as React.MouseEvent).clientY,
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (appMode === "game" || activeTool === "cursor") {
      setIsPanning(true);
      lastMousePos.current = getEventCoords(e);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getEventCoords(e);
    if (isPanning) {
      const dx = coords.x - lastMousePos.current.x;
      const dy = coords.y - lastMousePos.current.y;
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = coords;
    } else if (
      draggingNodeId !== null &&
      activeTool === "cursor" &&
      appMode !== "game"
    ) {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? {
                ...n,
                x: (coords.x - rect.left - transform.x) / transform.k,
                y: (coords.y - rect.top - transform.y) / transform.k,
              }
            : n,
        ),
      );
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    if (draggingNodeId !== null) setDraggingNodeId(null);
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    const scaleAdjust = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      k: Math.max(0.2, Math.min(prev.k * scaleAdjust, 3)),
    }));
  };

  const zoomIn = () =>
    setTransform((prev) => ({ ...prev, k: Math.min(prev.k * 1.2, 3) }));
  const zoomOut = () =>
    setTransform((prev) => ({ ...prev, k: Math.max(prev.k * 0.8, 0.2) }));
  const resetZoom = () => setTransform({ x: 0, y: 0, k: 1 });

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    if (appMode === "game") return;
    if (activeTool === "cursor") {
      e.stopPropagation();
      setDraggingNodeId(nodeId);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (appMode === "game" || isPanning) return;
    if (activeTool === "add-node") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left - transform.x) / transform.k;
      const y = (e.clientY - rect.top - transform.y) / transform.k;

      const customLabel = customNodeId.trim();
      const usedIds = new Set(nodes.map((n) => n.id));
      let newInternalId = 0;
      while (usedIds.has(newInternalId)) newInternalId++;
      let newLabel =
        customLabel !== "" ? customLabel : newInternalId.toString();
      if (customLabel !== "" && nodes.some((n) => n.label === customLabel))
        return alert("Nó já existe.");
      setNodes([...nodes, { id: newInternalId, label: newLabel, x, y }]);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    if (appMode === "game") {
      if (
        gameStatus !== "playing" ||
        !dynamicLevel
      )
        return;

      if (dynamicLevel.algo === "FORD_FULKERSON") {
        const { startNodeId, targetNodeId } = dynamicLevel;
        if (playerPath.length === 0) {
          if (nodeId === startNodeId) {
            setPlayerPath([nodeId]);
            setVisitedNodes(new Set([nodeId]));
          } else {
            setLives((l) => l - 1);
            if (lives - 1 <= 0) setGameStatus("lost");
          }
          return;
        }

        const lastNode = playerPath[playerPath.length - 1];
        if (playerPath.includes(nodeId)) return;

        const edge = edges.find(
          (ed) => ed.sourceId === lastNode && ed.targetId === nodeId,
        );
        if (!edge) {
          setLives((l) => l - 1);
          if (lives - 1 <= 0) setGameStatus("lost");
          return;
        }

        const currentFlow = ffFlows[`${lastNode}-${nodeId}`] || 0;
        const residualCapacity = edge.weight - currentFlow;

        if (residualCapacity <= 0) {
          alert(
            "Atenção: Este caminho (cano) já está totalmente saturado! Procure outra via.",
          );
          setLives((l) => l - 1);
          if (lives - 1 <= 0) setGameStatus("lost");
          return;
        }

        const newPath = [...playerPath, nodeId];
        setPlayerPath(newPath);
        setVisitedNodes((prev) => new Set(prev).add(nodeId));

        if (nodeId === targetNodeId) {
          let bottleneck = Infinity;
          for (let i = 0; i < newPath.length - 1; i++) {
            const u = newPath[i];
            const v = newPath[i + 1];
            const e = edges.find(
              (ed) => ed.sourceId === u && ed.targetId === v,
            )!;
            const flow = ffFlows[`${u}-${v}`] || 0;
            const res = e.weight - flow;
            if (res < bottleneck) bottleneck = res;
          }

          const updatedFlows = { ...ffFlows };
          for (let i = 0; i < newPath.length - 1; i++) {
            const u = newPath[i];
            const v = newPath[i + 1];
            updatedFlows[`${u}-${v}`] =
              (updatedFlows[`${u}-${v}`] || 0) + bottleneck;
          }

          setFfFlows(updatedFlows);
          setFfMaxFlow((prev) => prev + bottleneck);
          setPlayerPath([]);
          setVisitedNodes(new Set());

          const stillHasPath = checkResidualPathExists(
            edges,
            updatedFlows,
            startNodeId,
            targetNodeId,
          );
          if (!stillHasPath) {
            setGameStatus("won");
          } else {
            alert(
              `Ação concluída! Você enviou +${bottleneck}L pela rede. Encontre o próximo caminho livre!`,
            );
          }
        }
        return;
      }

      const { expectedVisits } = dynamicLevel;
      if (!expectedVisits || expectedVisits.length === 0) {
        setGameStatus("won");
        return;
      }
      if (playerPath.includes(nodeId)) return;
      const nextExpectedIndex = playerPath.length;
      if (nodeId === expectedVisits[nextExpectedIndex]) {
        const newPath = [...playerPath, nodeId];
        setPlayerPath(newPath);
        setVisitedNodes((prev) => new Set(prev).add(nodeId));
        if (newPath.length === expectedVisits.length) setGameStatus("won");
      } else {
        setLives((l) => l - 1);
        if (lives - 1 <= 0) setGameStatus("lost");
      }
      return;
    }

    if (activeTool === "delete") {
      setNodes(nodes.filter((n) => n.id !== nodeId));
      setEdges(
        edges.filter((e) => e.sourceId !== nodeId && e.targetId !== nodeId),
      );
      return;
    }
    if (activeTool === "add-edge") {
      if (connectionSourceId === null) setConnectionSourceId(nodeId);
      else {
        if (connectionSourceId !== nodeId) {
          const exists = edges.some(
            (edge) =>
              (edge.sourceId === connectionSourceId &&
                edge.targetId === nodeId) ||
              (!isDirected &&
                edge.sourceId === nodeId &&
                edge.targetId === connectionSourceId),
          );
          if (!exists) {
            const w = parseInt(prompt("Peso da aresta:", "1") || "1") || 1;
            setEdges([
              ...edges,
              { sourceId: connectionSourceId, targetId: nodeId, weight: w },
            ]);
          }
        }
        setConnectionSourceId(null);
      }
    }
  };

  if (showSplash)
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-ponto-darker">
        <img
          src={logoImage}
          alt="Logo"
          className="w-64 md:w-80 animate-pulse mb-8"
        />
        <p className="text-ponto-accent mt-4 font-mono text-sm tracking-widest uppercase">
          Carregando Visualizador...
        </p>
      </div>
    );

  return (
    <div className="flex h-screen flex-col bg-[#f8fafc] text-slate-900 font-sans">
      <Header
        appMode={appMode}
        setAppMode={setAppMode}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isDirected={isDirected}
        setIsDirected={setIsDirected}
        clearAll={clearAll}
        loadLevel={() => {}}
        setEdges={setEdges}
      />

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative">
        {appMode === "game" && gamePhase === "HUB" ? (
          <div className="flex-1 w-full h-full bg-ponto-darker p-4 md:p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Central de Missões
              </h1>
              <p className="text-slate-400 mb-8">
                Selecione um tema para testar os seus conhecimentos de Grafos em
                cenários reais.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GAME_THEMES.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => loadLevel(theme.id, 0)}
                    className="bg-ponto-dark border border-ponto-muted/30 rounded-xl p-6 cursor-pointer hover:border-ponto-accent hover:shadow-[0_0_20px_rgba(58,235,185,0.15)] transition-all group flex flex-col"
                  >
                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-4 ${theme.color}`}
                    >
                      {theme.icon}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1 group-hover:text-ponto-accent transition-colors">
                      {theme.title}
                    </h2>
                    <p className="text-xs font-mono font-bold text-ponto-accent/80 mb-3 uppercase tracking-wider">
                      [{theme.algorithms}]
                    </p>
                    <p className="text-sm text-slate-400 mb-4 flex-1">
                      {theme.description}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider mt-auto pt-4 border-t border-ponto-muted/20">
                      <span>
                        {theme.levels.length}{" "}
                        {theme.levels.length === 1 ? "Missão" : "Missões"}
                      </span>
                      <span className="text-ponto-accent group-hover:translate-x-1 transition-transform">
                        Iniciar ➔
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative flex-1 overflow-hidden">
            <GraphCanvas
              appMode={appMode}
              activeTool={activeTool}
              nodes={nodes}
              edges={edges}
              isDirected={isDirected}
              visitedNodes={visitedNodes}
              queueNodes={queueNodes}
              visitedEdges={visitedEdges}
              connectionSourceId={connectionSourceId}
              dynamicLevel={dynamicLevel}
              themeId={selectedThemeId}
              selectedAlgo={
                appMode === "game" ? dynamicLevel?.algo : selectedAlgo
              }
              onCanvasMouseDown={handleCanvasMouseDown}
              onCanvasMouseMove={handleCanvasMouseMove}
              onCanvasMouseUp={handleCanvasMouseUp}
              onCanvasWheel={handleCanvasWheel}
              transform={transform}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetZoom={resetZoom}
              onCanvasClick={handleCanvasClick}
              onNodeMouseDown={handleNodeMouseDown}
              onNodeClick={handleNodeClick}
              onEdgeClick={(index) =>
                setEdges(edges.filter((_, i) => i !== index))
              }
              evaluatingEdge={evaluatingEdge}
              ffFlows={ffFlows}
              bfNegativeCycleEdges={bfNegativeCycleEdges}
              currentAugmentingPath={currentAugmentingPath}
              dfsTreeEdges={dfsTreeEdges}
              dfsBackEdges={dfsBackEdges}
              bfsParentEdges={bfsParentEdges}
              bfsUncleEdges={bfsUncleEdges}
              bfsBrotherEdges={bfsBrotherEdges}
              bfsCousinEdges={bfsCousinEdges}
            />

            <aside className="hidden md:flex flex-col w-80 h-full absolute right-0 top-0 bg-ponto-dark border-l border-ponto-muted/50 p-6 shadow-xl z-10 gap-6 overflow-y-auto">
              {appMode === "sandbox" ? (
                <SandboxSidebar
                  nodes={nodes}
                  edges={edges}
                  isDirected={isDirected}
                  adjacency={buildAdjacencyList(edges, isDirected)}
                  customNodeId={customNodeId}
                  setCustomNodeId={setCustomNodeId}
                  selectedAlgo={selectedAlgo}
                  setSelectedAlgo={setSelectedAlgo}
                  startNodeId={startNodeId}
                  setStartNodeId={setStartNodeId}
                  targetNodeId={targetNodeId}
                  setTargetNodeId={setTargetNodeId}
                  flowSourceId={flowSourceId}
                  setFlowSourceId={setFlowSourceId}
                  flowSinkId={flowSinkId}
                  setFlowSinkId={setFlowSinkId}
                  animationStatus={animationStatus}
                  onPlay={playAnimation}
                  onPause={pauseAnimation}
                  onStop={stopAnimation}
                  mstTotalWeight={mstTotalWeight}
                  dijkstraDistances={dijkstraDistances}
                  dijkstraPrevious={dijkstraPrevious}
                  dfsTD={dfsTD}
                  dfsTT={dfsTT}
                  dfsPai={dfsPai}
                  bfsL={bfsL}
                  bfsNivel={bfsNivel}
                  bfsPai={bfsPai}
                  bfDistances={bfDistances}
                  bfPrevious={bfPrevious}
                  bfIteration={bfIteration}
                  bfHasNegativeCycle={bfHasNegativeCycle}
                  fwDistances={fwDistances}
                  fwPrevious={fwPrevious}
                  fwK={fwK}
                  fwI={fwI}
                  fwJ={fwJ}
                  ffMaxFlow={ffMaxFlow}
                  dfsSortStrategy={dfsSortStrategy}
                  setDfsSortStrategy={setDfsSortStrategy}
                  customAdjacencyOrder={customAdjacencyOrder}
                  setCustomAdjacencyOrder={setCustomAdjacencyOrder}
                  bfsSortStrategy={bfsSortStrategy}
                  setBfsSortStrategy={setBfsSortStrategy}
                  bfsCustomAdjacencyOrder={bfsCustomAdjacencyOrder}
                  setBfsCustomAdjacencyOrder={setBfsCustomAdjacencyOrder}
                />
              ) : (
                <GameSidebar
                  levelConfigs={
                    selectedThemeId
                      ? GAME_THEMES.find((t) => t.id === selectedThemeId)!
                          .levels
                      : []
                  }
                  currentLevelIndex={currentLevelIndex}
                  dynamicLevel={dynamicLevel}
                  lives={lives}
                  gameStatus={gameStatus}
                  playerPath={playerPath}
                  loadLevel={() => {}}
                  resetGame={resetGame}
                  nextLevel={nextLevel}
                  onReturnToHub={() => setGamePhase("HUB")}
                />
              )}
            </aside>

            <MobileBottomSheet appMode={appMode}>
              {appMode === "sandbox" ? (
                <SandboxSidebar
                  nodes={nodes}
                  edges={edges}
                  isDirected={isDirected}
                  adjacency={buildAdjacencyList(edges, isDirected)}
                  customNodeId={customNodeId}
                  setCustomNodeId={setCustomNodeId}
                  selectedAlgo={selectedAlgo}
                  setSelectedAlgo={setSelectedAlgo}
                  startNodeId={startNodeId}
                  setStartNodeId={setStartNodeId}
                  targetNodeId={targetNodeId}
                  setTargetNodeId={setTargetNodeId}
                  flowSourceId={flowSourceId}
                  setFlowSourceId={setFlowSourceId}
                  flowSinkId={flowSinkId}
                  setFlowSinkId={setFlowSinkId}
                  animationStatus={animationStatus}
                  onPlay={playAnimation}
                  onPause={pauseAnimation}
                  onStop={stopAnimation}
                  mstTotalWeight={mstTotalWeight}
                  dijkstraDistances={dijkstraDistances}
                  dijkstraPrevious={dijkstraPrevious}
                  dfsTD={dfsTD}
                  dfsTT={dfsTT}
                  dfsPai={dfsPai}
                  bfsL={bfsL}
                  bfsNivel={bfsNivel}
                  bfsPai={bfsPai}
                  bfDistances={bfDistances}
                  bfPrevious={bfPrevious}
                  bfIteration={bfIteration}
                  bfHasNegativeCycle={bfHasNegativeCycle}
                  fwDistances={fwDistances}
                  fwPrevious={fwPrevious}
                  fwK={fwK}
                  fwI={fwI}
                  fwJ={fwJ}
                  ffMaxFlow={ffMaxFlow}
                  dfsSortStrategy={dfsSortStrategy}
                  setDfsSortStrategy={setDfsSortStrategy}
                  customAdjacencyOrder={customAdjacencyOrder}
                  setCustomAdjacencyOrder={setCustomAdjacencyOrder}
                  bfsSortStrategy={bfsSortStrategy}
                  setBfsSortStrategy={setBfsSortStrategy}
                  bfsCustomAdjacencyOrder={bfsCustomAdjacencyOrder}
                  setBfsCustomAdjacencyOrder={setBfsCustomAdjacencyOrder}
                />
              ) : (
                <GameSidebar
                  levelConfigs={
                    selectedThemeId
                      ? GAME_THEMES.find((t) => t.id === selectedThemeId)!
                          .levels
                      : []
                  }
                  currentLevelIndex={currentLevelIndex}
                  dynamicLevel={dynamicLevel}
                  lives={lives}
                  gameStatus={gameStatus}
                  playerPath={playerPath}
                  loadLevel={() => {}}
                  resetGame={resetGame}
                  nextLevel={nextLevel}
                  onReturnToHub={() => setGamePhase("HUB")}
                />
              )}
            </MobileBottomSheet>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
