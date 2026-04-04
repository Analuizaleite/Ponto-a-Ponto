import React, { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import type { Node, Edge } from "../types";

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
  isAnimating: boolean;
  runAlgorithmSandbox: () => void;
  selectedNodesForRotation: number[];
  setSelectedNodesForRotation: (nodes: number[]) => void;
  setErrorNodesForRotation: (nodes: number[]) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  handleManualRotation: (type: "LL" | "RR" | "LR" | "RL") => void;
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
  flowSourceId,
  setFlowSourceId,
  flowSinkId,
  setFlowSinkId,
  isAnimating,
  runAlgorithmSandbox,
  selectedNodesForRotation,
  setSelectedNodesForRotation,
  setErrorNodesForRotation,
  errorMessage,
  setErrorMessage,
  handleManualRotation,
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
}) => {
  const [selectedModule, setSelectedModule] = useState<string>("buscas");

  const handleModuleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModule = e.target.value;
    setSelectedModule(newModule);

    if (newModule === "buscas") setSelectedAlgo("BFS");
    else if (newModule === "caminhos") setSelectedAlgo("DIJKSTRA");
    else if (newModule === "arvores") setSelectedAlgo("PRIM");
    else if (newModule === "fluxos") setSelectedAlgo("FORD_FULKERSON");
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
              className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors"
            >
              <option value="buscas">Buscas em Grafos</option>
              <option value="caminhos">Caminhos Mínimos</option>
              <option value="arvores">Árvores Geradoras Mínimas</option>
              <option value="fluxos" disabled>
                Fluxo em Redes (Em breve)
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">
              2. Escolha o Algoritmo:
            </label>
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value)}
              className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors"
            >
              {selectedModule === "buscas" && (
                <>
                  <option value="BFS">Busca em Largura (BFS)</option>
                  <option value="DFS">Busca em Profundidade (DFS)</option>
                </>
              )}
              {selectedModule === "caminhos" && (
                <>
                  <option value="DIJKSTRA">Algoritmo de Dijkstra</option>
                  <option value="BELLMAN_FORD">
                    Algoritmo de Bellman-Ford
                  </option>
                  <option value="FLOYD_WARSHALL" disabled>
                    Floyd-Warshall (Em breve)
                  </option>
                </>
              )}
              {selectedModule === "arvores" && (
                <>
                  <option value="PRIM">Algoritmo de Prim</option>
                  <option value="KRUSKAL">Algoritmo de Kruskal</option>
                </>
              )}
            </select>
          </div>

          {selectedAlgo !== "KRUSKAL" && selectedAlgo !== "FLOYD_WARSHALL" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">
                Nó Inicial (Nome/ID):
              </label>
              <input
                type="text"
                value={startNodeId}
                onChange={(e) => setStartNodeId(e.target.value)}
                placeholder="Ex: A"
                className="w-full bg-ponto-darker text-sm text-slate-200 border border-ponto-muted/50 rounded-md p-2 focus:outline-none focus:border-ponto-accent transition-colors"
              />
            </div>
          )}

          <button
            onClick={runAlgorithmSandbox}
            disabled={isAnimating}
            className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all shadow-md mt-4 ${isAnimating ? "bg-ponto-muted cursor-not-allowed text-slate-300" : "bg-ponto-accent text-ponto-darker hover:brightness-110"}`}
          >
            {isAnimating ? (
              <RotateCcw size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            {isAnimating ? "Rodando..." : `Animar Algoritmo`}
          </button>
        </div>
      </div>

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
            {mstTotalWeight > 0 && isAnimating && (
              <p className="text-[10px] text-slate-400 mt-2 italic text-right animate-pulse">
                Somando aresta...
              </p>
            )}
          </div>
        </div>
      )}

      {selectedAlgo === "DIJKSTRA" &&
        Object.keys(dijkstraDistances).length > 0 && (
          <div className="border-t border-ponto-muted/30 pt-4">
            <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
              Tabela de Distâncias (Dijkstra)
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
                    const dDisplay =
                      d === Infinity || d === undefined ? "∞" : d;
                    const pDisplay =
                      p === null || p === undefined ? "-" : getNodeLabel(p);

                    return (
                      <tr
                        key={node.id}
                        className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10 transition-colors"
                      >
                        <td className="p-2 font-bold text-white">
                          {node.label}
                        </td>
                        <td className="p-2 font-mono text-cyan-300">
                          {dDisplay}
                        </td>
                        <td className="p-2 font-mono text-yellow-300">
                          {pDisplay}
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
                    const dDisplay =
                      d === Infinity || d === undefined ? "∞" : d;
                    const pDisplay =
                      p === null || p === undefined ? "-" : getNodeLabel(p);

                    return (
                      <tr
                        key={node.id}
                        className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10 transition-colors"
                      >
                        <td className="p-2 font-bold text-white">
                          {node.label}
                        </td>
                        <td className="p-2 font-mono text-cyan-300">
                          {dDisplay}
                        </td>
                        <td className="p-2 font-mono text-yellow-300">
                          {pDisplay}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 text-center">
              Relaxando todas as arestas |V|-1 vezes.
            </p>
          </div>
        )}

      {selectedAlgo === "DFS" && Object.keys(dfsTD).length > 0 && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
            Tempos da Busca (DFS)
          </h2>
          <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                <tr>
                  <th className="p-2 font-bold">Vértice</th>
                  <th className="p-2 font-bold text-[#3aebb9]">
                    Descoberta (TD)
                  </th>
                  <th className="p-2 font-bold text-purple-400">
                    Término (TT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => {
                  const td = dfsTD[node.id];
                  const tt = dfsTT[node.id];
                  const tdDisplay = td === undefined ? "-" : td;
                  const ttDisplay = tt === undefined ? "-" : tt;

                  return (
                    <tr
                      key={node.id}
                      className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10 transition-colors"
                    >
                      <td className="p-2 font-bold text-white">{node.label}</td>
                      <td className="p-2 font-mono text-[#3aebb9]">
                        {tdDisplay}
                      </td>
                      <td className="p-2 font-mono text-purple-400">
                        {ttDisplay}
                      </td>
                    </tr>
                  );
                })}
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
          <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-2 shadow-inner overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-ponto-dark text-ponto-accent border-b border-ponto-muted/50">
                <tr>
                  <th className="p-2 font-bold">Vértice</th>
                  <th className="p-2 font-bold text-blue-400">L</th>
                  <th className="p-2 font-bold text-emerald-400">Nível</th>
                  <th className="p-2 font-bold text-yellow-300">Pai</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((node) => {
                  const l = bfsL[node.id];
                  const n = bfsNivel[node.id];
                  const p = bfsPai[node.id];
                  const lDisplay = l === undefined ? "-" : l;
                  const nDisplay = n === undefined ? "-" : n;
                  const pDisplay =
                    p === undefined || p === null ? "Ø" : getNodeLabel(p);

                  return (
                    <tr
                      key={node.id}
                      className="border-b border-ponto-muted/20 last:border-0 hover:bg-ponto-muted/10 transition-colors"
                    >
                      <td className="p-2 font-bold text-white">{node.label}</td>
                      <td className="p-2 font-mono text-blue-400">
                        {lDisplay}
                      </td>
                      <td className="p-2 font-mono text-emerald-400">
                        {nDisplay}
                      </td>
                      <td className="p-2 font-mono text-yellow-300">
                        {pDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="border-t border-ponto-muted/30 pt-4">
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">
          Rotações AVL
        </h2>
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Use a ferramenta de seleção para escolher{" "}
            <span className="text-ponto-accent font-bold">3 nós</span> e aplique
            a rotação:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleManualRotation("LL")}
              className="bg-ponto-darker hover:bg-ponto-muted text-white border border-ponto-muted/50 rounded p-2 text-xs font-bold transition-colors"
            >
              LL (Dir)
            </button>
            <button
              onClick={() => handleManualRotation("RR")}
              className="bg-ponto-darker hover:bg-ponto-muted text-white border border-ponto-muted/50 rounded p-2 text-xs font-bold transition-colors"
            >
              RR (Esq)
            </button>
            <button
              onClick={() => handleManualRotation("LR")}
              className="bg-ponto-darker hover:bg-ponto-muted text-white border border-ponto-muted/50 rounded p-2 text-xs font-bold transition-colors"
            >
              LR (Esq-Dir)
            </button>
            <button
              onClick={() => handleManualRotation("RL")}
              className="bg-ponto-darker hover:bg-ponto-muted text-white border border-ponto-muted/50 rounded p-2 text-xs font-bold transition-colors"
            >
              RL (Dir-Esq)
            </button>
          </div>
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-2 rounded mt-2">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-ponto-muted/30 pt-4">
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">
          Lista de Adjacência
        </h2>
        <div className="bg-ponto-darker rounded-lg p-3 max-h-48 overflow-y-auto border border-ponto-muted/30 custom-scrollbar">
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