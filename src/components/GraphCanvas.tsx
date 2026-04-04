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
  selectedNodesForRotation: number[];
  errorNodesForRotation: number[];
  isRotating?: boolean;
  connectionSourceId: number | null;
  dynamicLevel: any;
  ffFlows?: Record<string, number>;
  ffAugmentingEdges?: Set<string>;
  selectedAlgo?: string;
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
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
  selectedNodesForRotation,
  errorNodesForRotation,
  isRotating,
  connectionSourceId,
  dynamicLevel,
  ffFlows,
  ffAugmentingEdges,
  selectedAlgo,
  onMouseMove,
  onMouseUp,
  onCanvasClick,
  onNodeMouseDown,
  onNodeClick,
  onEdgeClick,
}) => {
  const getNode = (id: number) => nodes.find((n) => n.id === id);

  return (
    <main className="flex-1 bg-slate-50 relative">
      <svg
        className={`w-full h-full ${
          appMode === "game"
            ? "cursor-default"
            : activeTool === "add-node"
              ? "cursor-crosshair"
              : activeTool === "delete"
                ? "cursor-not-allowed"
                : activeTool === "select-rotation"
                  ? "pointer"
                  : "cursor-default"
        }`}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onClick={onCanvasClick}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="28"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#2c6455" />
          </marker>
        </defs>

        {edges.map((edge, i) => {
          const s = getNode(edge.sourceId);
          const t = getNode(edge.targetId);
          if (!s || !t) return null;

          const midX = (s.x + t.x) / 2;
          const midY = (s.y + t.y) / 2;
          const isDijkstraLevel =
            appMode === "game" && dynamicLevel?.algo === "DIJKSTRA";
          const showWeight = appMode === "sandbox" || isDijkstraLevel;

          const edgeKey = `${Math.min(s.id, t.id)}-${Math.max(s.id, t.id)}`;
          const isVisitedEdge = visitedEdges.has(edgeKey);

          const isEvaluating =
            evaluatingEdge &&
            ((evaluatingEdge.sourceId === edge.sourceId &&
              evaluatingEdge.targetId === edge.targetId) ||
              (!isDirected &&
                evaluatingEdge.sourceId === edge.targetId &&
                evaluatingEdge.targetId === edge.sourceId));

          const isAugmentingPath =
            ffAugmentingEdges?.has(edgeKey) &&
            selectedAlgo === "FORD_FULKERSON";

          let edgeText = edge.weight.toString();
          let isSaturated = false;
          if (selectedAlgo === "FORD_FULKERSON" && ffFlows) {
            const flow = ffFlows[`${edge.sourceId}-${edge.targetId}`] || 0;
            edgeText = `${flow}/${edge.weight}`;
            if (flow === edge.weight) isSaturated = true;
          }

          let lineColor = "#05262f";
          if (isEvaluating) lineColor = "#f59e0b";
          else if (isAugmentingPath) lineColor = "#0ea5e9";
          else if (isVisitedEdge) lineColor = "#3aebb9";
          else if (isSaturated) lineColor = "#ef4444";

          return (
            <g
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                if (appMode === "sandbox" && activeTool === "delete")
                  onEdgeClick(i);
              }}
              className={`group ${appMode === "sandbox" && activeTool === "delete" ? "cursor-pointer" : ""}`}
            >
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={lineColor}
                strokeWidth="3"
                markerEnd={isDirected ? "url(#arrowhead)" : undefined}
                className={`transition-all duration-300 ease-in-out ${isVisitedEdge || isEvaluating || isAugmentingPath ? "opacity-100" : "opacity-60"} ${isEvaluating ? "drop-shadow-[0_0_12px_rgba(245,158,11,1)] z-50" : isAugmentingPath ? "drop-shadow-[0_0_12px_rgba(14,165,233,1)] z-40" : isVisitedEdge ? "drop-shadow-[0_0_8px_rgba(58,235,185,0.8)]" : ""}`}
              />

              <rect
                x={selectedAlgo === "FORD_FULKERSON" ? midX - 20 : midX - 12}
                y={midY - 12}
                width={selectedAlgo === "FORD_FULKERSON" ? "40" : "24"}
                height="24"
                rx="4"
                fill={lineColor}
                className="transition-colors duration-300 stroke-[#05272d] stroke-1"
              />

              <text
                x={midX}
                y={midY}
                dy=".3em"
                textAnchor="middle"
                className={`text-[11px] font-bold select-none pointer-events-none transition-colors duration-300 fill-[#3aebb9]`}
              >
                {edgeText}
              </text>
            </g>
          );
        })}

        {nodes.map((node) => {
          let fillColor = "fill-ponto-darker";
          let strokeColor = "stroke-ponto-accent";
          let textColor = "fill-ponto-accent";

          if (visitedNodes.has(node.id)) {
            fillColor = "fill-ponto-accent";
            strokeColor = "stroke-ponto-muted";
            textColor = "fill-ponto-darker";
          } else if (queueNodes.has(node.id)) {
            fillColor = "fill-yellow-400";
            strokeColor = "stroke-yellow-600";
            textColor = "fill-slate-900";
          }

          const isSelectedForRotation =
            activeTool === "select-rotation" &&
            selectedNodesForRotation.includes(node.id);
          const isErrorNode = errorNodesForRotation.includes(node.id);

          if (isErrorNode) {
            fillColor = "fill-red-600";
            strokeColor = "stroke-red-300";
            textColor = "fill-white";
          } else if (isSelectedForRotation) {
            fillColor = "fill-purple-500";
            strokeColor = "stroke-purple-300";
            textColor = "fill-white";
          }

          return (
            <g
              key={node.id}
              onMouseDown={(e) => onNodeMouseDown(e, node.id)}
              onClick={(e) => onNodeClick(e, node.id)}
              className={`group cursor-pointer ${isRotating ? "node-rotating" : ""}`}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={22}
                className={`stroke-[3px] transition-colors duration-300 ${fillColor} ${strokeColor} shadow-md ${connectionSourceId === node.id ? "stroke-white stroke-[4px]" : ""} ${isSelectedForRotation ? "animate-pulse" : ""}`}
              />
              <text
                x={node.x}
                y={node.y}
                dy=".3em"
                textAnchor="middle"
                className={`font-bold text-sm pointer-events-none select-none ${textColor}`}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </main>
  );
};
