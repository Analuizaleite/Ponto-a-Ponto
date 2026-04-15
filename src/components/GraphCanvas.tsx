import React from "react";
import type { Node, Edge, AppMode, ActiveTool } from "../types";

interface GraphCanvasProps {
  appMode: AppMode;
  activeTool: ActiveTool;
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  visitedNodes: Set<number>;
  queueNodes: Set<number>;
  visitedEdges: Set<string>;
  evaluatingEdge?: Edge | null;
  connectionSourceId: number | null;
  dynamicLevel: any;
  themeId?: string | null;
  ffFlows?: Record<string, number>;
  bfNegativeCycleEdges?: Edge[];
  selectedAlgo?: string;
  currentAugmentingPath?: Edge[];
  dfsTreeEdges?: Set<string>;
  dfsBackEdges?: Set<string>;
  bfsParentEdges?: Set<string>;
  bfsUncleEdges?: Set<string>;
  bfsBrotherEdges?: Set<string>;
  bfsCousinEdges?: Set<string>;

  transform: { x: number; y: number; k: number };
  onCanvasMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onCanvasMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onCanvasMouseUp: () => void;
  onCanvasWheel: (e: React.WheelEvent) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  onCanvasClick: (e: React.MouseEvent<SVGSVGElement>) => void;
  onNodeMouseDown: (e: React.MouseEvent, nodeId: number) => void;
  onNodeClick: (e: React.MouseEvent, nodeId: number) => void;
  onEdgeClick: (index: number) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  appMode,
  activeTool,
  nodes,
  edges,
  isDirected,
  visitedNodes,
  queueNodes,
  visitedEdges,
  evaluatingEdge,
  connectionSourceId: _connectionSourceId,
  dynamicLevel,
  themeId,
  ffFlows,
  bfNegativeCycleEdges,
  selectedAlgo,
  currentAugmentingPath = [],
  dfsTreeEdges = new Set(),
  dfsBackEdges = new Set(),
  bfsParentEdges = new Set(),
  bfsUncleEdges = new Set(),
  bfsBrotherEdges = new Set(),
  bfsCousinEdges = new Set(),
  transform,
  onCanvasMouseDown,
  onCanvasMouseMove,
  onCanvasMouseUp,
  onCanvasWheel,
  zoomIn,
  zoomOut,
  resetZoom,
  onCanvasClick,
  onNodeMouseDown,
  onNodeClick,
  onEdgeClick,
}) => {
  const getLudicNodeVisuals = (nodeId: number) => {
    if (appMode !== "game" || !themeId) {
      return {
        icon: null,
        bgClass: "fill-slate-700",
        borderClass: "stroke-ponto-accent",
      };
    }

    const isStart = dynamicLevel?.startNodeId === nodeId;
    const isTarget = dynamicLevel?.targetNodeId === nodeId;

    if (themeId === "logistica")
      return {
        icon: isStart ? "🚑" : isTarget ? "🏥" : "🚦",
        bgClass: "fill-slate-800",
        borderClass: "stroke-slate-500",
      };
    if (themeId === "buscas")
      return {
        icon: isStart ? "💻" : isTarget ? "🕷️" : "🖥️",
        bgClass: "fill-[#0a192f]",
        borderClass: "stroke-green-400",
      };
    if (themeId === "infra")
      return {
        icon: isStart ? "⚡" : "🏭",
        bgClass: "fill-amber-950",
        borderClass: "stroke-amber-500",
      };
    if (themeId === "crises")
      return {
        icon: isStart ? "🚰" : isTarget ? "🏙️" : "💧",
        bgClass: "fill-cyan-950",
        borderClass: "stroke-cyan-500",
      };

    return {
      icon: null,
      bgClass: "fill-slate-700",
      borderClass: "stroke-ponto-accent",
    };
  };

  const getBaseEdgeStyle = () => {
    if (appMode !== "game" || !themeId) return { color: "#2c6455", width: "3" };
    if (themeId === "logistica") return { color: "#64748b", width: "6" };
    if (themeId === "buscas") return { color: "#0f766e", width: "3" };
    if (themeId === "infra") return { color: "#b45309", width: "4" };
    if (themeId === "crises") return { color: "#0369a1", width: "6" };
    if (themeId === "arvores") return { color: "#10b981", width: "3" };
    return { color: "#2c6455", width: "3" };
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50">
      <svg
        className={`w-full h-full ${activeTool === "add-node" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        onMouseDown={onCanvasMouseDown}
        onTouchStart={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onTouchMove={onCanvasMouseMove}
        onMouseUp={onCanvasMouseUp}
        onTouchEnd={onCanvasMouseUp}
        onMouseLeave={onCanvasMouseUp}
        onClick={onCanvasClick}
        onWheel={onCanvasWheel}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="5"
            refX="25"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0, 8 2.5, 0 5" fill="#3aebb9" opacity="0.8" />
          </marker>
          <marker
            id="arrowhead-highlight"
            markerWidth="8"
            markerHeight="5"
            refX="25"
            refY="2.5"
            orient="auto"
          >
            <polygon points="0 0, 8 2.5, 0 5" fill="#f59e0b" />
          </marker>
          <marker id="arrowhead-small">
            markerEnd={isDirected ? (themeId === "crises" ? "url(#arrowhead-small)" : "url(#arrowhead)") : undefined}
          </marker>
        </defs>

        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}
        >
          <g>
            {edges.map((edge, index) => {
              const s = nodes.find((n) => n.id === edge.sourceId);
              const t = nodes.find((n) => n.id === edge.targetId);
              if (!s || !t) return null;

              const edgeKey = `${Math.min(s.id, t.id)}-${Math.max(s.id, t.id)}`;
              const isVisitedEdge = visitedEdges.has(edgeKey);
              const isTreeEdge = selectedAlgo === "DFS" && dfsTreeEdges.has(edgeKey);
              const isBackEdge = selectedAlgo === "DFS" && dfsBackEdges.has(edgeKey);
              const isBfsParentEdge = selectedAlgo === "BFS" && bfsParentEdges.has(edgeKey);
              const isBfsUncleEdge = selectedAlgo === "BFS" && bfsUncleEdges.has(edgeKey);
              const isBfsBrotherEdge = selectedAlgo === "BFS" && bfsBrotherEdges.has(edgeKey);
              const isBfsCousinEdge = selectedAlgo === "BFS" && bfsCousinEdges.has(edgeKey);

              const isAugmenting = currentAugmentingPath.some(
                (ae) =>
                  ae.sourceId === edge.sourceId &&
                  ae.targetId === edge.targetId,
              );

              const isEvaluating =
                evaluatingEdge &&
                ((evaluatingEdge.sourceId === edge.sourceId &&
                  evaluatingEdge.targetId === edge.targetId) ||
                  (!isDirected &&
                    evaluatingEdge.sourceId === edge.targetId &&
                    evaluatingEdge.targetId === edge.sourceId));

              const isNegativeCycleEdge = bfNegativeCycleEdges?.some(
                (ce) =>
                  (ce.sourceId === edge.sourceId &&
                    ce.targetId === edge.targetId) ||
                  (!isDirected &&
                    ce.sourceId === edge.targetId &&
                    ce.targetId === edge.sourceId),
              );

              let edgeText = edge.weight.toString();
              if (selectedAlgo === "FORD_FULKERSON" && ffFlows) {
                const flow = ffFlows[`${edge.sourceId}-${edge.targetId}`] || 0;
                edgeText = `${flow}/${edge.weight}`;
              }

              const baseStyle = getBaseEdgeStyle();

              const lineColor = isBackEdge
                ? "#ef4444"
                : isTreeEdge
                  ? "#3aebb9"
                  : isBfsParentEdge
                    ? "#3aebb9"
                    : isBfsBrotherEdge
                      ? "#facc15"
                      : isBfsCousinEdge
                        ? "#a855f7"
                        : isBfsUncleEdge
                          ? "#f97316"
                          : isAugmenting
                            ? "#3B82F6"
                            : isEvaluating
                              ? "#f59e0b"
                              : isNegativeCycleEdge
                                ? "#ef4444"
                                : isVisitedEdge
                                  ? "#3aebb9"
                                  : baseStyle.color;

              const lineWidth = isAugmenting ? "4" : baseStyle.width;
              const lineDash = isBackEdge ? "8 4" : undefined;
              const midX = (s.x + t.x) / 2;
              const midY = (s.y + t.y) / 2;

              return (
                <g
                  key={index}
                  onClick={() => appMode === "sandbox" && onEdgeClick(index)}
                >
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={lineColor}
                    strokeWidth={lineWidth}
                    strokeDasharray={lineDash}
                    markerEnd={isDirected ? "url(#arrowhead)" : undefined}
                    className={`transition-all duration-300`}
                  />
                  {themeId !== "arvores" && (
                    <g>
                      <rect
                        x={midX - 15}
                        y={midY - 10}
                        width={30}
                        height={20}
                        rx={4}
                        className="fill-slate-800"
                      />
                      <text
                        x={midX}
                        y={midY}
                        dy=".35em"
                        textAnchor="middle"
                        className="fill-white text-[10px] font-bold"
                      >
                        {edgeText}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          <g>
            {nodes.map((node) => {
              const ludic = getLudicNodeVisuals(node.id);
              const isVisited = visitedNodes.has(node.id);
              const isQueue = queueNodes.has(node.id);

              let fillColor = ludic.bgClass;
              if ((selectedAlgo === "DFS" || selectedAlgo === "BFS") && appMode !== "game") {
                fillColor = "fill-slate-700";
                if (isVisited) fillColor = "fill-cyan-300";
                else if (isQueue) fillColor = "fill-emerald-800";
              } else if (isVisited) fillColor = "fill-ponto-accent";
              else if (isQueue) fillColor = "fill-ponto-muted";

              return (
                <g
                  key={node.id}
                  onMouseDown={(e) => onNodeMouseDown(e, node.id)}
                  onClick={(e) => onNodeClick(e, node.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={24}
                    className={`stroke-[3px] transition-colors duration-300 ${fillColor}`}
                  />
                  {ludic.icon && (
                    <text
                      x={node.x}
                      y={node.y}
                      dy=".35em"
                      textAnchor="middle"
                      className="text-2xl pointer-events-none select-none"
                    >
                      {ludic.icon}
                    </text>
                  )}
                  <g>
                    {themeId === "arvores" && appMode === "game" ? (
                      <g>
                        <rect
                          x={node.x - 20}
                          y={node.y + 28}
                          width={40}
                          height={18}
                          rx={4}
                          className="fill-slate-900/80"
                        />
                        <text
                          x={node.x}
                          y={node.y + 41}
                          textAnchor="middle"
                          className="fill-emerald-400 font-mono text-[11px] font-bold"
                        >
                          {node.vertexName || node.label}
                        </text>
                      </g>
                    ) : (
                      <text
                        x={node.x}
                        y={node.y}
                        dy=".35em"
                        textAnchor="middle"
                        className={`font-bold text-sm pointer-events-none select-none ${ludic.icon ? "hidden" : isVisited ? "fill-ponto-darker" : "fill-white"}`}
                      >
                        {node.vertexName || node.label}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      <div className="absolute bottom-6 md:bottom-6 top-4 md:top-auto left-4 md:left-6 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          className="p-3 bg-white rounded-full shadow-lg text-slate-800 hover:bg-slate-100 transition-colors"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="p-3 bg-white rounded-full shadow-lg text-slate-800 hover:bg-slate-100 transition-colors"
        >
          -
        </button>
        <button
          onClick={resetZoom}
          className="p-3 bg-white rounded-full shadow-lg text-slate-800 hover:bg-slate-100 transition-colors"
        >
          ⟲
        </button>
      </div>
    </div>
  );
};