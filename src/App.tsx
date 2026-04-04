import React, { useState, useEffect, useRef } from "react";

// --- IMPORTAÇÃO DE TIPOS E COMPONENTES ---
import type { Node, Edge, AppMode, ActiveTool } from "./types";
import { Header } from "./components/Header";
import { GraphCanvas } from "./components/GraphCanvas";
import { SandboxSidebar } from "./components/SandboxSidebar";
import { GameSidebar } from "./components/GameSidebar";

// --- IMPORTAÇÃO DE ALGORITMOS ---
import { generateBFSSteps } from "./algorithms/bfs";
import { generateDFSSteps } from "./algorithms/dfs";
import { generateDijkstraSteps, getShortestPath } from "./algorithms/dijkstra";
import {
  performRightRotation,
  performLeftRotation,
  performLRRotation,
  performRLRotation,
} from "./algorithms/avl";
import { getBalancedEdges } from "./algorithms/balancing";
import { generatePrimSteps } from "./algorithms/prim";
import { generateKruskalSteps } from "./algorithms/kruskal";
import { generateBellmanFordSteps } from "./algorithms/bellmanFord";

// --- CONFIGURAÇÃO DAS FASES (MODO DESAFIO) ---
const LEVEL_CONFIGS = [
  {
    algo: "BFS",
    title: "Iniciação ao BFS (Largura)",
    description:
      "O BFS visita os vizinhos por camadas. Comece pelo nó de origem e clique na ordem exata (menores IDs primeiro)!",
  },
  {
    algo: "DFS",
    title: "Mergulho Profundo (DFS)",
    description:
      "O DFS vai o mais fundo possível antes de voltar. Mergulhe pelo nó de origem priorizando sempre os menores IDs!",
  },
  {
    algo: "AVL",
    title: "Equilíbrio de Fluxo (Rotações)",
    description:
      "Analise a estrutura gerada aleatoriamente e escolha a rotação exata para balancear a árvore!",
  },
  {
    algo: "DIJKSTRA",
    title: "Caminho Mínimo (Dijkstra)",
    description:
      "Encontre o caminho mais curto até o destino. Escolha o próximo passo avaliando a menor distância acumulada!",
  },
];

// --- MOTOR DE GERAÇÃO DINÂMICA ---
const generateRandomGraph = (numNodes: number, isWeighted: boolean) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const centerX = 350;
  const centerY = 250;
  const radiusX = 220;
  const radiusY = 160;

  for (let i = 0; i < numNodes; i++) {
    const angle = ((i + Math.random() * 0.5) / numNodes) * 2 * Math.PI;
    const jitterX = (Math.random() - 0.5) * 50;
    const jitterY = (Math.random() - 0.5) * 50;
    nodes.push({
      id: i,
      label: i.toString(),
      x: centerX + radiusX * Math.cos(angle) + jitterX,
      y: centerY + radiusY * Math.sin(angle) + jitterY,
    });
  }

  for (let i = 1; i < numNodes; i++) {
    const target = Math.max(0, i - (Math.floor(Math.random() * 3) + 1));
    edges.push({
      sourceId: target,
      targetId: i,
      weight: isWeighted ? Math.floor(Math.random() * 9) + 1 : 1,
    });
  }

  const extra = Math.floor(numNodes / 2.5);
  for (let i = 0; i < extra; i++) {
    const u = Math.floor(Math.random() * numNodes);
    const v = Math.floor(Math.random() * numNodes);
    if (u !== v) {
      const exists = edges.some(
        (e) =>
          (e.sourceId === u && e.targetId === v) ||
          (e.sourceId === v && e.targetId === u),
      );
      if (!exists)
        edges.push({
          sourceId: u,
          targetId: v,
          weight: isWeighted ? Math.floor(Math.random() * 9) + 1 : 1,
        });
    }
  }
  return { nodes, edges };
};

const generateDynamicLevel = (algo: string) => {
  if (algo === "BFS" || algo === "DFS") {
    const numNodes = Math.floor(Math.random() * 3) + 5;
    const { nodes, edges } = generateRandomGraph(numNodes, false);
    const startNodeId = 0;
    let steps =
      algo === "BFS"
        ? generateBFSSteps(startNodeId, numNodes, edges, false)
        : generateDFSSteps(startNodeId, numNodes, edges, false);
    const expectedVisits = Array.from(
      new Set(steps.filter((s) => s.type === "visit").map((s) => s.nodeId)),
    );
    return { nodes, edges, expectedVisits, startNodeId };
  }

  if (algo === "DIJKSTRA") {
    const numNodes = 6;
    const { nodes, edges } = generateRandomGraph(numNodes, true);
    const startNodeId = 0;
    const targetNodeId = numNodes - 1;
    const steps = generateDijkstraSteps(startNodeId, numNodes, edges);
    const lastStep = steps[steps.length - 1];
    const path = getShortestPath(startNodeId, targetNodeId, lastStep.previous!);
    return { nodes, edges, expectedVisits: path, startNodeId, targetNodeId };
  }

  if (algo === "AVL") {
    const cases = ["LL", "RR", "LR", "RL"];
    const correctRotation = cases[Math.floor(Math.random() * cases.length)] as
      | "LL"
      | "RR"
      | "LR"
      | "RL";
    const centerX = 250;
    const centerY = 150;
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    if (correctRotation === "LL") {
      nodes = [
        { id: 2, label: "2", x: centerX, y: centerY },
        { id: 1, label: "1", x: centerX - 80, y: centerY + 80 },
        { id: 0, label: "0", x: centerX - 160, y: centerY + 160 },
      ];
      edges = [
        { sourceId: 2, targetId: 1, weight: 1 },
        { sourceId: 1, targetId: 0, weight: 1 },
      ];
    } else if (correctRotation === "RR") {
      nodes = [
        { id: 0, label: "0", x: centerX, y: centerY },
        { id: 1, label: "1", x: centerX + 80, y: centerY + 80 },
        { id: 2, label: "2", x: centerX + 160, y: centerY + 160 },
      ];
      edges = [
        { sourceId: 0, targetId: 1, weight: 1 },
        { sourceId: 1, targetId: 2, weight: 1 },
      ];
    } else if (correctRotation === "LR") {
      nodes = [
        { id: 2, label: "2", x: centerX, y: centerY },
        { id: 0, label: "0", x: centerX - 100, y: centerY + 80 },
        { id: 1, label: "1", x: centerX - 20, y: centerY + 160 },
      ];
      edges = [
        { sourceId: 2, targetId: 0, weight: 1 },
        { sourceId: 0, targetId: 1, weight: 1 },
      ];
    } else if (correctRotation === "RL") {
      nodes = [
        { id: 0, label: "0", x: centerX, y: centerY },
        { id: 2, label: "2", x: centerX + 100, y: centerY + 80 },
        { id: 1, label: "1", x: centerX + 20, y: centerY + 160 },
      ];
      edges = [
        { sourceId: 0, targetId: 2, weight: 1 },
        { sourceId: 2, targetId: 1, weight: 1 },
      ];
    }
    return { nodes, edges, expectedVisits: [], correctRotation };
  }
  return { nodes: [], edges: [], expectedVisits: [] };
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  // === ESTADOS DO MODO SANDBOX ===
  const [appMode, setAppMode] = useState<AppMode>("sandbox");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isDirected, setIsDirected] = useState(false);
  const [activeTool, setActiveTool] = useState<ActiveTool>("add-node");
  const [connectionSourceId, setConnectionSourceId] = useState<number | null>(
    null,
  );
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);

  // === ESTADOS DO JOGO ===
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [dynamicLevel, setDynamicLevel] = useState<any>(null);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  const [playerPath, setPlayerPath] = useState<number[]>([]);

  // === ESTADOS DE ANIMAÇÃO E INTERAÇÃO ===
  const [selectedAlgo, setSelectedAlgo] = useState<string>("BFS");
  const [customNodeId, setCustomNodeId] = useState<string>("");
  const [startNodeId, setStartNodeId] = useState<string>("");
  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [flowSourceId, setFlowSourceId] = useState<string>("");
  const [flowSinkId, setFlowSinkId] = useState<string>("");

  const [isAnimating, setIsAnimating] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set());
  const [queueNodes, setQueueNodes] = useState<Set<number>>(new Set());
  const [visitedEdges, setVisitedEdges] = useState<Set<string>>(new Set());
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
  const [dfsTD, setDfsTD] = useState<Record<number, number>>({});
  const [dfsTT, setDfsTT] = useState<Record<number, number>>({});
  const [bfsL, setBfsL] = useState<Record<number, number>>({});
  const [bfsNivel, setBfsNivel] = useState<Record<number, number>>({});
  const [bfsPai, setBfsPai] = useState<Record<number, number | null>>({});

  const animationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const [isRotating, setIsRotating] = useState(false);
  const rotationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedNodesForRotation, setSelectedNodesForRotation] = useState<
    number[]
  >([]);
  const [errorNodesForRotation, setErrorNodesForRotation] = useState<number[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current);
      if (animationIntervalRef.current)
        clearInterval(animationIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (appMode === "game") loadLevel(currentLevelIndex);
  }, [appMode]);

  const resetGameStates = () => {
    setLives(3);
    setGameStatus("playing");
    setPlayerPath([]);
    setVisitedNodes(new Set());
    setQueueNodes(new Set());
    setVisitedEdges(new Set());
    setMstTotalWeight(0);
    setDijkstraDistances({});
    setDijkstraPrevious({});
    setDfsTD({});
    setDfsTT({});
    setBfDistances({});
    setBfPrevious({});
    setBfIteration(0);
    setBfHasNegativeCycle(false);
    setEvaluatingEdge(null);
  };

  const loadLevel = (index: number) => {
    setCurrentLevelIndex(index);
    const config = LEVEL_CONFIGS[index];
    const data = generateDynamicLevel(config.algo);
    setDynamicLevel({ ...config, ...data });
    setNodes(data.nodes);
    setEdges(data.edges);
    setIsDirected(false);
    resetGameStates();
  };

  const resetGame = () => loadLevel(currentLevelIndex);
  const nextLevel = () =>
    loadLevel(
      currentLevelIndex < LEVEL_CONFIGS.length - 1 ? currentLevelIndex + 1 : 0,
    );

  const handleGameNodeClick = (nodeId: number) => {
    if (gameStatus !== "playing" || !dynamicLevel) return;
    if (dynamicLevel.algo === "AVL") return;

    if (dynamicLevel.algo === "DIJKSTRA") {
      const { startNodeId, targetNodeId, expectedVisits } = dynamicLevel;
      if (!expectedVisits || expectedVisits.length === 0) {
        setGameStatus("won");
        return;
      }
      if (playerPath.length === 0) {
        if (nodeId === startNodeId) {
          setPlayerPath([nodeId]);
          setVisitedNodes((prev) => new Set(prev).add(nodeId));
        } else {
          setLives((l) => l - 1);
          if (lives - 1 <= 0) setGameStatus("lost");
        }
        return;
      }
      const lastNode = playerPath[playerPath.length - 1];
      const isConnected = edges.some(
        (e) =>
          (e.sourceId === lastNode && e.targetId === nodeId) ||
          (e.targetId === lastNode && e.sourceId === nodeId),
      );
      if (!isConnected) {
        setLives((l) => l - 1);
        if (lives - 1 <= 0) setGameStatus("lost");
        return;
      }

      const nextExpectedIndex = playerPath.length;
      if (nodeId === expectedVisits[nextExpectedIndex]) {
        const newPath = [...playerPath, nodeId];
        setPlayerPath(newPath);
        setVisitedNodes((prev) => new Set(prev).add(nodeId));
        if (nodeId === targetNodeId) setGameStatus("won");
      } else {
        setLives((l) => l - 1);
        if (lives - 1 <= 0) setGameStatus("lost");
      }
      return;
    }

    if (playerPath.includes(nodeId)) return;
    const nextExpectedIndex = playerPath.length;
    if (nodeId === dynamicLevel.expectedVisits[nextExpectedIndex]) {
      const newPath = [...playerPath, nodeId];
      setPlayerPath(newPath);
      setVisitedNodes((prev) => new Set(prev).add(nodeId));
      if (newPath.length === dynamicLevel.expectedVisits.length)
        setGameStatus("won");
    } else {
      setLives((l) => l - 1);
      if (lives - 1 <= 0) setGameStatus("lost");
    }
  };

  const handleRotationGameChallenge = (
    rotationType: "LL" | "RR" | "LR" | "RL",
  ) => {
    if (!dynamicLevel || gameStatus !== "playing") return;
    if (rotationType === dynamicLevel.correctRotation) {
      let balancedNodes = nodes;
      let balancedEdges = edges;
      if (rotationType === "LL") {
        balancedNodes = performRightRotation(nodes);
        balancedEdges = getBalancedEdges(1, 0, 2);
      } else if (rotationType === "RR") {
        balancedNodes = performLeftRotation(nodes);
        balancedEdges = getBalancedEdges(1, 0, 2);
      } else if (rotationType === "LR") {
        balancedNodes = performLRRotation(nodes);
        balancedEdges = getBalancedEdges(0, 2, 1);
      } else if (rotationType === "RL") {
        balancedNodes = performRLRotation(nodes);
        balancedEdges = getBalancedEdges(2, 0, 1);
      }
      setNodes(balancedNodes);
      setEdges(balancedEdges);
      setGameStatus("won");
      setVisitedNodes(new Set(nodes.map((n) => n.id)));
    } else {
      setLives((l) => l - 1);
      if (lives - 1 <= 0) setGameStatus("lost");
    }
  };

  const validateRotationCorrectness = (
    selectedIds: number[],
    currentEdges: Edge[],
    rotationType: "LL" | "RR" | "LR" | "RL",
  ) => {
    if (selectedIds.length !== 3)
      return {
        isValid: false,
        errorIds: selectedIds,
        message: "Selecione exatamente 3 nós.",
      };
    const findParentWithTwoChildren = () => {
      for (const parent of selectedIds) {
        const children = currentEdges
          .filter(
            (e) => e.sourceId === parent && selectedIds.includes(e.targetId),
          )
          .map((e) => e.targetId);
        if (children.length === 2)
          return { parent, child1: children[0], child2: children[1] };
      }
      return null;
    };
    const findChain = () => {
      for (const root of selectedIds) {
        const childrenOfRoot = currentEdges
          .filter(
            (e) => e.sourceId === root && selectedIds.includes(e.targetId),
          )
          .map((e) => e.targetId);
        for (const child of childrenOfRoot) {
          const grandchildren = currentEdges
            .filter(
              (e) => e.sourceId === child && selectedIds.includes(e.targetId),
            )
            .map((e) => e.targetId);
          if (grandchildren.length > 0)
            return { root, child, grandchild: grandchildren[0] };
        }
      }
      return null;
    };

    const twoChildren = findParentWithTwoChildren();
    const chain = findChain();

    if (!twoChildren && !chain)
      return {
        isValid: false,
        errorIds: selectedIds,
        message:
          "Selecione: (1) um nó pai com 2 filhos, ou (2) uma cadeia: avô -> pai -> filho.",
      };

    let root: number, child: number, grandchild: number;
    let currentCase: "LL" | "RR" | "LR" | "RL" | null = null;

    if (twoChildren) {
      root = twoChildren.parent;
      const { child1, child2 } = twoChildren;
      const smaller = child1 < child2 ? child1 : child2;
      const larger = child1 < child2 ? child2 : child1;
      if (smaller < root && larger < root) {
        currentCase = "LL";
        child = smaller;
        grandchild = larger;
      } else if (smaller > root && larger > root) {
        currentCase = "RR";
        child = larger;
        grandchild = smaller;
      } else if (smaller < root && larger > root) {
        currentCase = "LR";
        child = smaller;
        grandchild = larger;
      } else if (smaller > root && larger < root) {
        currentCase = "RL";
        child = larger;
        grandchild = smaller;
      }
    } else if (chain) {
      root = chain.root;
      child = chain.child;
      grandchild = chain.grandchild;
      if (child < root) {
        if (grandchild < child) currentCase = "LL";
        else if (grandchild > child) currentCase = "LR";
      } else if (child > root) {
        if (grandchild > child) currentCase = "RR";
        else if (grandchild < child) currentCase = "RL";
      }
    }

    if (currentCase === null)
      return {
        isValid: false,
        errorIds: selectedIds,
        message: "Não foi possível detectar o caso AVL.",
      };
    if (rotationType !== currentCase) {
      const rotationNames: Record<string, string> = {
        LL: "Rotação Simples à Direita (LL)",
        RR: "Rotação Simples à Esquerda (RR)",
        LR: "Rotação Dupla Esquerda-Direita (LR)",
        RL: "Rotação Dupla Direita-Esquerda (RL)",
      };
      return {
        isValid: false,
        errorIds: selectedIds,
        message: `Rotação incorreta! Este caso requer: ${rotationNames[currentCase]}`,
      };
    }
    return { isValid: true, errorIds: [], message: "" };
  };

  const handleManualRotation = (rotationType: "LL" | "RR" | "LR" | "RL") => {
    if (selectedNodesForRotation.length !== 3) {
      alert("Selecione exatamente 3 nós para aplicar a rotação.");
      return;
    }
    const validation = validateRotationCorrectness(
      selectedNodesForRotation,
      edges,
      rotationType,
    );
    if (!validation.isValid) {
      setErrorNodesForRotation(validation.errorIds);
      setErrorMessage(validation.message);
      if (rotationTimeoutRef.current) clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = setTimeout(() => {
        setErrorNodesForRotation([]);
        setErrorMessage("");
        setSelectedNodesForRotation([]);
      }, 3000);
      return;
    }

    setErrorNodesForRotation([]);
    setErrorMessage("");
    const [rootId, leftId, rightId] = selectedNodesForRotation;
    const selectedNodes = nodes.filter((n) =>
      selectedNodesForRotation.includes(n.id),
    );
    const centerX = selectedNodes.reduce((sum, n) => sum + n.x, 0) / 3;
    const centerY = selectedNodes.reduce((sum, n) => sum + n.y, 0) / 3;

    let newParentId: number;
    let oldParentId: number;
    switch (rotationType) {
      case "LL":
      case "RR":
        newParentId = rootId;
        oldParentId = rootId;
        break;
      case "LR":
        newParentId = leftId;
        oldParentId = rootId;
        break;
      case "RL":
        newParentId = rightId;
        oldParentId = rootId;
        break;
      default:
        return;
    }

    const redirectedEdges: Edge[] = [];
    edges.forEach((edge) => {
      if (
        selectedNodesForRotation.includes(edge.sourceId) &&
        selectedNodesForRotation.includes(edge.targetId)
      )
        return;
      if (edge.sourceId === oldParentId)
        redirectedEdges.push({ ...edge, sourceId: newParentId });
      else if (edge.targetId === oldParentId)
        redirectedEdges.push({ ...edge, targetId: newParentId });
    });

    const externalEdges = edges.filter(
      (e) =>
        !selectedNodesForRotation.includes(e.sourceId) &&
        !selectedNodesForRotation.includes(e.targetId),
    );
    let newNodes: Node[];
    let newEdges: Edge[];

    switch (rotationType) {
      case "LL":
        newNodes = nodes.map((node) => {
          if (node.id === rootId)
            return { ...node, x: centerX, y: centerY - 80 };
          if (node.id === leftId)
            return { ...node, x: centerX - 80, y: centerY + 40 };
          if (node.id === rightId)
            return { ...node, x: centerX + 80, y: centerY + 40 };
          return node;
        });
        newEdges = [
          ...externalEdges,
          ...redirectedEdges,
          { sourceId: rootId, targetId: leftId, weight: 1 },
          { sourceId: rootId, targetId: rightId, weight: 1 },
        ];
        break;
      case "RR":
        newNodes = nodes.map((node) => {
          if (node.id === rootId)
            return { ...node, x: centerX, y: centerY - 80 };
          if (node.id === leftId)
            return { ...node, x: centerX - 80, y: centerY + 40 };
          if (node.id === rightId)
            return { ...node, x: centerX + 80, y: centerY + 40 };
          return node;
        });
        newEdges = [
          ...externalEdges,
          ...redirectedEdges,
          { sourceId: rootId, targetId: leftId, weight: 1 },
          { sourceId: rootId, targetId: rightId, weight: 1 },
        ];
        break;
      case "LR":
        newNodes = nodes.map((node) => {
          if (node.id === leftId)
            return { ...node, x: centerX, y: centerY - 80 };
          if (node.id === rootId)
            return { ...node, x: centerX + 80, y: centerY + 40 };
          if (node.id === rightId)
            return { ...node, x: centerX - 80, y: centerY + 40 };
          return node;
        });
        newEdges = [
          ...externalEdges,
          ...redirectedEdges,
          { sourceId: leftId, targetId: rightId, weight: 1 },
          { sourceId: leftId, targetId: rootId, weight: 1 },
        ];
        break;
      case "RL":
        newNodes = nodes.map((node) => {
          if (node.id === rightId)
            return { ...node, x: centerX, y: centerY - 80 };
          if (node.id === rootId)
            return { ...node, x: centerX - 80, y: centerY + 40 };
          if (node.id === leftId)
            return { ...node, x: centerX + 80, y: centerY + 40 };
          return node;
        });
        newEdges = [
          ...externalEdges,
          ...redirectedEdges,
          { sourceId: rightId, targetId: leftId, weight: 1 },
          { sourceId: rightId, targetId: rootId, weight: 1 },
        ];
        break;
      default:
        return;
    }
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodesForRotation([]);
    setErrorNodesForRotation([]);
    setErrorMessage("");
  };

  const runAlgorithmSandbox = () => {
    if (animationIntervalRef.current)
      clearInterval(animationIntervalRef.current);

    let startNode;
    if (selectedAlgo !== "KRUSKAL" && selectedAlgo !== "FLOYD_WARSHALL") {
      startNode = nodes.find((n) => n.label === startNodeId.trim());
      if (!startNode) {
        alert("Nó inicial não encontrado. Verifique o nome digitado.");
        return;
      }
    }

    const startId = startNode ? startNode.id : 0;
    const nodesCount =
      nodes.length > 0 ? Math.max(...nodes.map((n) => n.id)) + 1 : 0;

    let steps: any[] = [];
    if (selectedAlgo === "BFS")
      steps = generateBFSSteps(startId, nodesCount, edges, isDirected);
    else if (selectedAlgo === "DFS")
      steps = generateDFSSteps(startId, nodesCount, edges, isDirected);
    else if (selectedAlgo === "DIJKSTRA")
      steps = generateDijkstraSteps(startId, nodesCount, edges);
    else if (selectedAlgo === "PRIM")
      steps = generatePrimSteps(startId, nodesCount, edges);
    else if (selectedAlgo === "KRUSKAL")
      steps = generateKruskalSteps(nodesCount, edges);
    else if (selectedAlgo === "BELLMAN_FORD")
      steps = generateBellmanFordSteps(startId, nodesCount, edges, isDirected);

    setIsAnimating(true);
    setVisitedNodes(new Set());
    setQueueNodes(new Set());
    setVisitedEdges(new Set());
    setEvaluatingEdge(null);
    setMstTotalWeight(0);
    setDijkstraDistances({});
    setDijkstraPrevious({});
    setBfsL({});
    setBfsNivel({});
    setBfsPai({});
    setBfDistances({});
    setBfPrevious({});
    setBfIteration(0);
    setBfHasNegativeCycle(false);

    let currentStep = 0;

    animationIntervalRef.current = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(animationIntervalRef.current!);
        setIsAnimating(false);
        return;
      }
      const step = steps[currentStep];

      if (step.distancesState && selectedAlgo === "DIJKSTRA")
        setDijkstraDistances(step.distancesState);
      if (step.previousState && selectedAlgo === "DIJKSTRA")
        setDijkstraPrevious(step.previousState);

      if (step.tdState) setDfsTD(step.tdState);
      if (step.ttState) setDfsTT(step.ttState);

      if (step.lState) setBfsL(step.lState);
      if (step.nivelState) setBfsNivel(step.nivelState);
      if (step.paiState) setBfsPai(step.paiState);

      if (step.distancesState && selectedAlgo === "BELLMAN_FORD")
        setBfDistances(step.distancesState);
      if (step.previousState && selectedAlgo === "BELLMAN_FORD")
        setBfPrevious(step.previousState);
      if (step.iteration !== undefined) setBfIteration(step.iteration);
      if (step.hasNegativeCycle !== undefined) {
        setBfHasNegativeCycle(step.hasNegativeCycle);
        if (step.hasNegativeCycle)
          alert("Aviso: O grafo contém um ciclo de peso negativo!");
      }

      if (step.type === "test-edge" && step.edge) {
        setEvaluatingEdge(step.edge);
      } else if (step.type === "relax" || step.type === "done") {
        setEvaluatingEdge(null);
      }

      if (step.treeEdges) {
        const newTree = new Set<string>();
        step.treeEdges.forEach((e: any) => {
          newTree.add(
            `${Math.min(e.sourceId, e.targetId)}-${Math.max(e.sourceId, e.targetId)}`,
          );
        });
        setVisitedEdges(newTree);
      }

      if (step.type === "queue" && step.nodeId !== undefined) {
        setQueueNodes((prev) => new Set(prev).add(step.nodeId));
      } else if (
        (step.type === "visit" || step.type === "relax") &&
        step.nodeId !== undefined
      ) {
        setQueueNodes((prev) => {
          const n = new Set(prev);
          n.delete(step.nodeId);
          return n;
        });
        setVisitedNodes((prev) => new Set(prev).add(step.nodeId));
      } else if (step.type === "edge" && step.edge !== undefined) {
        setVisitedEdges((prev) => {
          const n = new Set(prev);
          const min = Math.min(step.edge.sourceId, step.edge.targetId);
          const max = Math.max(step.edge.sourceId, step.edge.targetId);
          n.add(`${min}-${max}`);
          return n;
        });
        if (selectedAlgo === "PRIM" || selectedAlgo === "KRUSKAL") {
          setMstTotalWeight((prev) => prev + step.edge!.weight);
        }
      }
      currentStep++;
    }, 700);
  };

  const deleteNode = (id: number) => {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.sourceId !== id && e.targetId !== id));
  };
  const deleteEdge = (index: number) =>
    setEdges(edges.filter((_, i) => i !== index));

  const clearAll = () => {
    if (animationIntervalRef.current)
      clearInterval(animationIntervalRef.current);

    setNodes([]);
    setEdges([]);
    setVisitedNodes(new Set());
    setQueueNodes(new Set());
    setVisitedEdges(new Set());
    setMstTotalWeight(0);
    setIsAnimating(false);
    setSelectedNodesForRotation([]);
    setErrorNodesForRotation([]);
    setErrorMessage("");
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
    setEvaluatingEdge(null);
  };

  // --- HANDLERS DO CANVAS ---
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: number) => {
    if (appMode === "game") return;
    if (activeTool === "cursor") {
      e.stopPropagation();
      setDraggingNodeId(nodeId);
    }
  };
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (appMode === "game") return;
    if (draggingNodeId !== null && activeTool === "cursor") {
      const rect = e.currentTarget.getBoundingClientRect();
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? { ...n, x: e.clientX - rect.left, y: e.clientY - rect.top }
            : n,
        ),
      );
    }
  };
  const handleMouseUp = () => {
    if (draggingNodeId !== null) setDraggingNodeId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (appMode === "game") return;
    if (activeTool === "add-node") {
      const rect = e.currentTarget.getBoundingClientRect();
      const customLabel = customNodeId.trim();

      const usedIds = new Set(nodes.map((n) => n.id));
      let newInternalId = 0;
      while (usedIds.has(newInternalId)) newInternalId++;

      let newLabel =
        customLabel !== "" ? customLabel : newInternalId.toString();

      if (customLabel !== "" && nodes.some((n) => n.label === customLabel)) {
        alert("Este nó já existe no grafo. Escolha outro nome.");
        return;
      }

      setNodes([
        ...nodes,
        {
          id: newInternalId,
          label: newLabel,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        },
      ]);
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: number) => {
    e.stopPropagation();
    if (appMode === "game") {
      handleGameNodeClick(nodeId);
      return;
    }
    if (activeTool === "delete") {
      deleteNode(nodeId);
      return;
    }
    if (activeTool === "select-rotation") {
      if (errorNodesForRotation.length > 0) {
        setErrorNodesForRotation([]);
        setErrorMessage("");
      }
      if (selectedNodesForRotation.includes(nodeId))
        setSelectedNodesForRotation(
          selectedNodesForRotation.filter((id) => id !== nodeId),
        );
      else if (selectedNodesForRotation.length < 3)
        setSelectedNodesForRotation([...selectedNodesForRotation, nodeId]);
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

  // --- RENDERIZAÇÃO DA TELA DE CARREGAMENTO ---
  if (showSplash) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-ponto-darker">
        <img
          src="src/assets/logo_transparente.png"
          alt="Ponto a Ponto Logo"
          className="w-64 md:w-80 animate-pulse mb-8"
        />
        <div className="flex gap-3">
          <div
            className="w-3 h-3 bg-ponto-accent rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-ponto-accent rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-ponto-accent rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
        <p className="text-ponto-accent mt-4 font-mono text-sm tracking-widest uppercase">
          Carregando Visualizador...
        </p>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL ---
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
        loadLevel={loadLevel}
        setEdges={setEdges}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <GraphCanvas
          appMode={appMode}
          activeTool={activeTool}
          nodes={nodes}
          edges={edges}
          isDirected={isDirected}
          visitedNodes={visitedNodes}
          queueNodes={queueNodes}
          visitedEdges={visitedEdges}
          selectedNodesForRotation={selectedNodesForRotation}
          errorNodesForRotation={errorNodesForRotation}
          isRotating={isRotating}
          connectionSourceId={connectionSourceId}
          dynamicLevel={dynamicLevel}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onCanvasClick={handleCanvasClick}
          onNodeMouseDown={handleNodeMouseDown}
          onNodeClick={handleNodeClick}
          onEdgeClick={deleteEdge}
          evaluatingEdge={evaluatingEdge}
        />

        <aside className="w-80 bg-ponto-dark border-l border-ponto-muted/50 p-6 shadow-xl z-10 flex flex-col gap-6 overflow-y-auto">
          {appMode === "sandbox" ? (
            <SandboxSidebar
              nodes={nodes}
              edges={edges}
              isDirected={isDirected}
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
              isAnimating={isAnimating}
              runAlgorithmSandbox={runAlgorithmSandbox}
              selectedNodesForRotation={selectedNodesForRotation}
              setSelectedNodesForRotation={setSelectedNodesForRotation}
              setErrorNodesForRotation={setErrorNodesForRotation}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              handleManualRotation={handleManualRotation}
              mstTotalWeight={mstTotalWeight}
              dijkstraDistances={dijkstraDistances}
              dijkstraPrevious={dijkstraPrevious}
              dfsTD={dfsTD}
              dfsTT={dfsTT}
              bfsL={bfsL}
              bfsNivel={bfsNivel}
              bfsPai={bfsPai}
              bfDistances={bfDistances}
              bfPrevious={bfPrevious}
              bfIteration={bfIteration}
              bfHasNegativeCycle={bfHasNegativeCycle}
            />
          ) : (
            <GameSidebar
              levelConfigs={LEVEL_CONFIGS}
              currentLevelIndex={currentLevelIndex}
              dynamicLevel={dynamicLevel}
              lives={lives}
              gameStatus={gameStatus}
              playerPath={playerPath}
              loadLevel={loadLevel}
              resetGame={resetGame}
              nextLevel={nextLevel}
              handleRotationGameChallenge={handleRotationGameChallenge}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

export default App;
