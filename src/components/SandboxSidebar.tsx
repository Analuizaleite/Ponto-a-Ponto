import React, { useState } from "react";
import { Play, Pause, Square } from "lucide-react";
import type { Node, Edge } from "../types";

export const ALGORITHM_MODULES: Record<
  string,
  { title: string; algos: { id: string; name: string }[] }
> = {
  buscas: {
    title: "Buscas em Grafos",
    algos: [
      { id: "BFS", name: "Busca em Largura (BFS)" },
      { id: "DFS", name: "Busca em Profundidade (DFS)" },
    ],
  },
  caminhos: {
    title: "Caminhos Mínimos",
    algos: [
      { id: "DIJKSTRA", name: "Algoritmo de Dijkstra" },
      { id: "BELLMAN_FORD", name: "Algoritmo de Bellman-Ford" },
      { id: "FLOYD_WARSHALL", name: "Floyd-Warshall" },
    ],
  },
  arvores: {
    title: "Árvores Geradoras",
    algos: [
      { id: "PRIM", name: "Algoritmo de Prim" },
      { id: "KRUSKAL", name: "Algoritmo de Kruskal" },
    ],
  },
  fluxos: {
    title: "Fluxo em Redes",
    algos: [{ id: "FORD_FULKERSON", name: "Ford-Fulkerson (Max Flow)" }],
  },
};

export interface SandboxSidebarProps {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  customNodeId: string;
  setCustomNodeId: (id: string) => void;
  selectedAlgo: string;
  setSelectedAlgo: (algo: string) => void;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  targetNodeId: string;
  setTargetNodeId: (id: string) => void;
  flowSourceId: string;
  setFlowSourceId: (id: string) => void;
  flowSinkId: string;
  setFlowSinkId: (id: string) => void;
  animationStatus: "idle" | "playing" | "paused";
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  mstTotalWeight: number;
  dijkstraDistances: Record<number, number>;
  dijkstraPrevious: Record<number, number | null>;
  dfsTD: Record<number, number>;
  dfsTT: Record<number, number>;
  bfsL: Record<number, number>;
  bfsNivel: Record<number, number>;
  bfsPai: Record<number, number | null>;
  bfDistances: Record<number, number>;
  bfPrevious: Record<number, number | null>;
  bfIteration: number | string;
  bfHasNegativeCycle: boolean;
  fwDistances: Record<number, Record<number, number>>;
  fwPrevious: Record<number, Record<number, number | null>>;
  fwK: number | null;
  fwI: number | null;
  fwJ: number | null;
  ffMaxFlow: number;
}

export const SandboxSidebar: React.FC<SandboxSidebarProps> = ({
  nodes,
  edges,
  isDirected,
  customNodeId,
  setCustomNodeId,
  selectedAlgo,
  setSelectedAlgo,
  startNodeId,
  setStartNodeId,
  targetNodeId,
  setTargetNodeId,
  animationStatus,
  onPlay,
  onPause,
  onStop,
  mstTotalWeight,
  dijkstraDistances,
  dijkstraPrevious,
  dfsTD,
  dfsTT,
  bfsL,
  bfsNivel,
  bfsPai,
  bfDistances,
  bfPrevious,
  bfIteration,
  bfHasNegativeCycle,
  fwDistances,
  fwK,
  fwI,
  fwJ,
  ffMaxFlow,
}) => {
  const [selectedModule, setSelectedModule] = useState<string>("buscas");
  const isRunning = animationStatus === "playing";
  const isPaused = animationStatus === "paused";
  const isIdle = animationStatus === "idle";

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModule = e.target.value;
    setSelectedModule(newModule);

    const firstAlgoOfNewModule = ALGORITHM_MODULES[newModule].algos[0].id;
    setSelectedAlgo(firstAlgoOfNewModule);
    onStop();
  };

  const handleAlgoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAlgo(e.target.value);
    onStop();
  };

  const getNodeLabel = (id: number) =>
    nodes.find((n) => n.id === id)?.label || id.toString();

  const renderAdjacencyList = () => {
    return nodes.map((node) => {
      const neighbors = edges
        .filter((e) => e.sourceId === node.id)
        .map((e) => `${getNodeLabel(e.targetId)}(w:${e.weight})`);
      if (!isDirected) {
        const reverseNeighbors = edges
          .filter((e) => e.targetId === node.id)
          .map((e) => `${getNodeLabel(e.sourceId)}(w:${e.weight})`);
        neighbors.push(...reverseNeighbors);
      }
      return (
        <div
          key={node.id}
          className="text-xs font-mono text-slate-300 border-b border-ponto-muted/30 py-1"
        >
          <span className="font-bold text-ponto-accent">{node.label}</span>: [
          {neighbors.join(", ")}]
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <div>
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-2">
          Criar Nó (Opcional)
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-slate-400">
            Nome/Letra do próximo nó:
          </label>
          <input
            type="text"
            value={customNodeId}
            onChange={(e) => setCustomNodeId(e.target.value)}
            placeholder="Ex: A, Paris, R1"
            className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors"
          />
          <p className="text-[10px] text-slate-500 italic">
            Deixe em branco para usar números automáticos.
          </p>
        </div>
      </div>

      <div className="border-t border-ponto-muted/30 pt-4">
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">
          Executar Algoritmo
        </h2>
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              1. Escolha o Módulo:
            </label>
            <select
              value={selectedModule}
              onChange={handleModuleChange}
              disabled={!isIdle}
              className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors disabled:opacity-50"
            >
              {Object.entries(ALGORITHM_MODULES).map(([key, module]) => (
                <option key={key} value={key}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              2. Escolha o Algoritmo:
            </label>
            <select
              value={selectedAlgo}
              onChange={handleAlgoChange}
              disabled={!isIdle}
              className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors disabled:opacity-50"
            >
              {ALGORITHM_MODULES[selectedModule].algos.map((algo) => (
                <option key={algo.id} value={algo.id}>
                  {algo.name}
                </option>
              ))}
            </select>
          </div>

          {selectedAlgo !== "KRUSKAL" && selectedAlgo !== "FLOYD_WARSHALL" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">
                  {selectedAlgo === "FORD_FULKERSON"
                    ? "Nó Fonte (Origem):"
                    : "Nó Inicial (Nome/ID):"}
                </label>
                <input
                  type="text"
                  value={startNodeId}
                  onChange={(e) => setStartNodeId(e.target.value)}
                  placeholder="Ex: A"
                  disabled={!isIdle}
                  className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors disabled:opacity-50"
                />
              </div>

              {selectedAlgo === "FORD_FULKERSON" && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-400">
                    Nó Sumidouro (Destino):
                  </label>
                  <input
                    type="text"
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    placeholder="Ex: F"
                    disabled={!isIdle}
                    className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors disabled:opacity-50"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={onPlay}
              disabled={isRunning}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all shadow-md ${
                isRunning
                  ? "bg-ponto-muted cursor-not-allowed text-slate-300"
                  : "bg-ponto-accent text-ponto-darker hover:brightness-110"
              }`}
            >
              <Play size={18} />
              {isPaused ? "Continuar" : "Animar"}
            </button>

            <button
              onClick={onPause}
              disabled={!isRunning}
              className={`flex-1 flex items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all shadow-md ${
                !isRunning
                  ? "bg-ponto-muted cursor-not-allowed text-slate-300"
                  : "bg-amber-500 text-amber-950 hover:brightness-110"
              }`}
            >
              <Pause size={18} /> Pausar
            </button>

            <button
              onClick={onStop}
              disabled={isIdle}
              className={`flex items-center justify-center px-4 py-2.5 rounded-md transition-all shadow-md ${
                isIdle
                  ? "bg-ponto-muted/50 text-slate-500 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              <Square size={18} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {selectedAlgo === "FORD_FULKERSON" && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
            Resultado do Fluxo
          </h2>
          <div className="bg-ponto-darker rounded-lg border border-blue-500/40 p-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300 font-medium">
                Fluxo Máximo:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-blue-400">
                  {ffMaxFlow}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  unidades
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(selectedAlgo === "PRIM" || selectedAlgo === "KRUSKAL") && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
            Resultados da AGM
          </h2>
          <div className="bg-ponto-darker rounded-lg border border-ponto-accent/40 p-4 shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-ponto-accent"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300 font-medium">
                Custo:
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-ponto-accent">
                  {mstTotalWeight}
                </span>
                <span className="text-xs text-slate-500 font-mono">no total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedAlgo === "DIJKSTRA" &&
        Object.keys(dijkstraDistances).length > 0 && (
          <div className="border-t border-ponto-muted/30 pt-4">
            <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
              Distâncias (Dijkstra)
            </h2>
            <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner overflow-hidden">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                  <tr>
                    <th className="p-2 font-bold">Vértice</th>
                    <th className="p-2 font-bold text-cyan-300">d[v]</th>
                    <th className="p-2 font-bold text-yellow-300">pred[v]</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => {
                    const d = dijkstraDistances[node.id];
                    const p = dijkstraPrevious[node.id];
                    return (
                      <tr
                        key={node.id}
                        className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10"
                      >
                        <td className="p-2 font-bold text-white">
                          {node.label}
                        </td>
                        <td className="p-2 font-mono text-cyan-300">
                          {d === Infinity || d === undefined ? "∞" : d}
                        </td>
                        <td className="p-2 font-mono text-yellow-300">
                          {p === null || p === undefined
                            ? "-"
                            : getNodeLabel(p)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {selectedAlgo === "BELLMAN_FORD" &&
        Object.keys(bfDistances).length > 0 && (
          <div className="border-t border-ponto-muted/30 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider">
                Matriz Bellman-Ford
              </h2>
              <div
                className={`px-2 py-1 rounded text-[10px] font-bold ${bfHasNegativeCycle ? "bg-red-500 text-white" : "bg-ponto-accent text-ponto-darker"}`}
              >
                {bfHasNegativeCycle
                  ? "CICLO NEGATIVO!"
                  : `Fase: ${bfIteration}`}
              </div>
            </div>
            <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner overflow-hidden">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                  <tr>
                    <th className="p-2 font-bold">Vértice</th>
                    <th className="p-2 font-bold text-cyan-300">d[v]</th>
                    <th className="p-2 font-bold text-yellow-300">pred[v]</th>
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((node) => {
                    const d = bfDistances[node.id];
                    const p = bfPrevious[node.id];
                    return (
                      <tr
                        key={node.id}
                        className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10"
                      >
                        <td className="p-2 font-bold text-white">
                          {node.label}
                        </td>
                        <td className="p-2 font-mono text-cyan-300">
                          {d === Infinity || d === undefined ? "∞" : d}
                        </td>
                        <td className="p-2 font-mono text-yellow-300">
                          {p === null || p === undefined
                            ? "-"
                            : getNodeLabel(p)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {selectedAlgo === "FLOYD_WARSHALL" &&
        Object.keys(fwDistances).length > 0 && (
          <div className="border-t border-ponto-muted/30 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider">
                Matriz de Distâncias D
              </h2>
              <div className="px-2 py-1 bg-ponto-accent text-ponto-darker rounded text-[10px] font-bold">
                {fwK !== null
                  ? `Iteração k = ${getNodeLabel(fwK)}`
                  : "Matriz Final"}
              </div>
            </div>
            <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner overflow-x-auto">
              <table className="w-full text-xs text-center text-slate-300">
                <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                  <tr>
                    <th className="p-2 border-r border-ponto-muted/30"></th>
                    {nodes.map((n) => (
                      <th
                        key={n.id}
                        className={`p-2 font-bold ${fwK === n.id ? "bg-purple-500/20 text-purple-300" : ""}`}
                      >
                        {n.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nodes.map((rowNode) => (
                    <tr
                      key={rowNode.id}
                      className="border-b border-ponto-muted/20 last:border-0"
                    >
                      <th
                        className={`p-2 font-bold border-r border-ponto-muted/30 text-ponto-accent bg-ponto-dark ${fwK === rowNode.id ? "bg-purple-500/20 text-purple-300" : ""}`}
                      >
                        {rowNode.label}
                      </th>
                      {nodes.map((colNode) => {
                        const val = fwDistances[rowNode.id]?.[colNode.id];
                        const isCurrent =
                          fwI === rowNode.id && fwJ === colNode.id;
                        const isCross =
                          fwK === rowNode.id || fwK === colNode.id;
                        return (
                          <td
                            key={colNode.id}
                            className={`p-2 font-mono transition-colors ${isCurrent ? "bg-[#f59e0b] text-[#05272d] font-bold scale-110" : isCross ? "bg-purple-500/10 text-purple-300" : "text-cyan-300"}`}
                          >
                            {val === Infinity || val === undefined ? "∞" : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {selectedAlgo === "DFS" && Object.keys(dfsTD).length > 0 && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
            Tempos da Busca (DFS)
          </h2>
          <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                <tr>
                  <th className="p-2">Vértice</th>
                  <th className="p-2 text-[#3aebb9]">TD</th>
                  <th className="p-2 text-purple-400">TT</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-ponto-muted/20 hover:bg-ponto-muted/10"
                  >
                    <td className="p-2 font-bold text-white">{n.label}</td>
                    <td className="p-2 font-mono text-[#3aebb9]">
                      {dfsTD[n.id] ?? "-"}
                    </td>
                    <td className="p-2 font-mono text-purple-400">
                      {dfsTT[n.id] ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAlgo === "BFS" && Object.keys(bfsL).length > 0 && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
            Busca em Largura (BFS)
          </h2>
          <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                <tr>
                  <th className="p-2">Vértice</th>
                  <th className="p-2 text-blue-400">L</th>
                  <th className="p-2 text-emerald-400">Nível</th>
                  <th className="p-2 text-yellow-300">Pai</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-ponto-muted/20 hover:bg-ponto-muted/10"
                  >
                    <td className="p-2 font-bold text-white">{n.label}</td>
                    <td className="p-2 font-mono text-blue-400">
                      {bfsL[n.id] ?? "-"}
                    </td>
                    <td className="p-2 font-mono text-emerald-400">
                      {bfsNivel[n.id] ?? "-"}
                    </td>
                    <td className="p-2 font-mono text-yellow-300">
                      {bfsPai[n.id] === null || bfsPai[n.id] === undefined
                        ? "Ø"
                        : getNodeLabel(bfsPai[n.id]!)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-ponto-muted/30 pt-4">
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
          Lista de Adjacência
        </h2>
        <div className="bg-ponto-darker rounded-lg p-3 max-h-48 overflow-y-auto border border-ponto-muted/30">
          {nodes.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-2">
              O grafo está vazio.
            </p>
          ) : (
            <div className="space-y-1">{renderAdjacencyList()}</div>
          )}
        </div>
      </div>
    </div>
  );
};