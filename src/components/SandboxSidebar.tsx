import React, { useState, useEffect } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { Node, Edge } from '../types';

export const ALGORITHM_MODULES: Record<string, { title: string, algos: { id: string, name: string }[] }> = {
  busca: {
    title: 'Buscas',
    algos: [
      { id: 'BFS', name: 'Busca em Largura (BFS)' },
      { id: 'DFS', name: 'Busca em Profundidade (DFS)' }
    ]
  },
  arvore: {
    title: 'Árvores Geradoras',
    algos: [
      { id: 'PRIM', name: 'Algoritmo de Prim' },
      { id: 'KRUSKAL', name: 'Algoritmo de Kruskal' }
    ]
  },
  caminho: {
    title: 'Caminhos Mínimos',
    algos: [
      { id: 'DIJKSTRA', name: 'Dijkstra' },
      { id: 'BELLMAN_FORD', name: 'Bellman-Ford' },
      { id: 'FLOYD_WARSHALL', name: 'Floyd-Warshall' }
    ]
  },
  fluxo: {
    title: 'Fluxo em Redes',
    algos: [
      { id: 'FORD_FULKERSON', name: 'Ford-Fulkerson' },
      { id: 'EDMONDS_KARP', name: 'Edmonds-Karp' },
      { id: 'DINIC', name: 'Dinic' }
    ]
  }
};

interface SandboxSidebarProps {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  
  customNodeId: string;
  setCustomNodeId: (id: string) => void;
  
  selectedAlgo: string;
  setSelectedAlgo: (algo: string) => void;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  
  targetNodeId?: string;
  setTargetNodeId?: (id: string) => void;
  flowSourceId?: string;
  setFlowSourceId?: (id: string) => void;
  flowSinkId?: string;
  setFlowSinkId?: (id: string) => void;
  
  isAnimating: boolean;
  runAlgorithmSandbox: () => void;
  
  selectedNodesForRotation: number[];
  setSelectedNodesForRotation: (nodes: number[]) => void;
  setErrorNodesForRotation: (nodes: number[]) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  handleManualRotation: (type: 'LL' | 'RR' | 'LR' | 'RL') => void;
  mstTotalWeight: number;
}

export const SandboxSidebar: React.FC<SandboxSidebarProps> = ({
  nodes, edges, isDirected,
  customNodeId, setCustomNodeId, 
  selectedAlgo, setSelectedAlgo, startNodeId, setStartNodeId,
  targetNodeId = '', setTargetNodeId = () => {},
  flowSourceId = '', setFlowSourceId = () => {},
  flowSinkId = '', setFlowSinkId = () => {},
  isAnimating, runAlgorithmSandbox, 
  selectedNodesForRotation, setSelectedNodesForRotation,
  setErrorNodesForRotation, errorMessage, setErrorMessage, handleManualRotation, mstTotalWeight
}) => {

  const [selectedModule, setSelectedModule] = useState<string>('busca');

  useEffect(() => {
    const firstAlgoOfModule = ALGORITHM_MODULES[selectedModule].algos[0].id;
    setSelectedAlgo(firstAlgoOfModule);
  }, [selectedModule, setSelectedAlgo]);

const renderAdjacencyList = () => {
    const getNodeLabel = (id: number) => nodes.find(n => n.id === id)?.label || id;

    return nodes.map(node => {
      const neighbors = edges.filter(e => e.sourceId === node.id).map(e => `${getNodeLabel(e.targetId)}(w:${e.weight})`);
      if (!isDirected) {
        const reverseNeighbors = edges.filter(e => e.targetId === node.id).map(e => `${getNodeLabel(e.sourceId)}(w:${e.weight})`);
        neighbors.push(...reverseNeighbors);
      }
      return (
        <div key={node.id} className="text-xs font-mono text-slate-300 border-b border-ponto-muted/30 py-1">
          <span className="font-bold text-ponto-accent">{node.label}</span>: [{neighbors.join(', ')}]
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">Criar Nó</h2>
        <div className="space-y-3">
          <div className="flex gap-2">
              <input 
                type="text" placeholder="ID do nó (vazio para auto)" value={customNodeId} onChange={(e) => setCustomNodeId(e.target.value)} 
                className="w-full rounded-md border border-ponto-muted bg-ponto-darker text-white px-3 py-2 text-sm focus:border-ponto-accent focus:outline-none placeholder-slate-500"
              />
          </div>
          {customNodeId !== '' && <p className="text-xs text-slate-400">O próximo nó terá ID = {customNodeId}</p>}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">Executar Algoritmo</h2>
        <div className="space-y-3">
          
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Área de Estudo:</label>
            <select 
              value={selectedModule} 
              onChange={(e) => setSelectedModule(e.target.value)} 
              className="w-full rounded-md border border-ponto-muted bg-ponto-darker text-white px-3 py-2 text-sm focus:border-ponto-accent focus:outline-none"
            >
              {Object.entries(ALGORITHM_MODULES).map(([key, module]) => (
                <option key={key} value={key}>{module.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Algoritmo:</label>
            <select 
              value={selectedAlgo} 
              onChange={(e) => setSelectedAlgo(e.target.value)} 
              className="w-full rounded-md border border-ponto-muted bg-ponto-dark text-white px-3 py-2 text-sm focus:border-ponto-accent focus:outline-none"
            >
              {ALGORITHM_MODULES[selectedModule].algos.map((algo) => (
                <option key={algo.id} value={algo.id}>{algo.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-ponto-dark p-3 rounded-lg border border-ponto-muted/50 space-y-2 mt-2 shadow-inner">
            
            {(selectedModule === 'busca' || (selectedModule === 'caminho' && selectedAlgo !== 'FLOYD_WARSHALL') || selectedAlgo === 'PRIM') && (
              <div className="flex gap-2 items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Nó Inicial:</span>
                <input type="text" placeholder="Ex: 0" value={startNodeId} onChange={(e) => setStartNodeId(e.target.value)} className="w-24 rounded border border-ponto-muted bg-ponto-darker text-white px-2 py-1 text-sm text-center focus:border-ponto-accent focus:outline-none"/>
              </div>
            )}

            {(selectedModule === 'caminho' && selectedAlgo !== 'FLOYD_WARSHALL') && (
              <div className="flex gap-2 items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Nó Destino:</span>
                <input type="text" placeholder="(Opcional)" value={targetNodeId} onChange={(e) => setTargetNodeId(e.target.value)} className="w-24 rounded border border-ponto-muted bg-ponto-darker text-white px-2 py-1 text-sm text-center focus:border-ponto-accent focus:outline-none"/>
              </div>
            )}

            {selectedModule === 'fluxo' && (
              <>
                <div className="flex gap-2 items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Fonte (S):</span>
                  <input type="text" placeholder="Ex: 0" value={flowSourceId} onChange={(e) => setFlowSourceId(e.target.value)} className="w-24 rounded border border-ponto-muted bg-ponto-darker text-white px-2 py-1 text-sm text-center focus:border-ponto-accent focus:outline-none"/>
                </div>
                <div className="flex gap-2 items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Sorvedouro (T):</span>
                  <input type="text" placeholder="Ex: 5" value={flowSinkId} onChange={(e) => setFlowSinkId(e.target.value)} className="w-24 rounded border border-ponto-muted bg-ponto-darker text-white px-2 py-1 text-sm text-center focus:border-ponto-accent focus:outline-none"/>
                </div>
              </>
            )}

            {(selectedAlgo === 'KRUSKAL' || selectedAlgo === 'FLOYD_WARSHALL') && (
              <p className="text-xs text-slate-500 text-center italic py-1">Este algoritmo processa todo o grafo automaticamente.</p>
            )}
          </div>

          <button onClick={runAlgorithmSandbox} disabled={isAnimating} className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all shadow-md mt-4 ${isAnimating ? 'bg-ponto-muted cursor-not-allowed text-slate-300' : 'bg-ponto-accent text-ponto-darker hover:brightness-110'}`}>
            {isAnimating ? <RotateCcw size={18} className="animate-spin"/> : <Play size={18} />}
            {isAnimating ? 'Rodando...' : `Animar Algoritmo`}
          </button>

          {(selectedAlgo === 'PRIM' || selectedAlgo === 'KRUSKAL') && (
            <div className="border-t border-ponto-muted/30 pt-4">
              <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-3">Resultados da AGM</h2>
              <div className="bg-ponto-darker rounded-lg border border-ponto-accent/40 p-4 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-ponto-accent"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-300 font-medium">Custo:</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-ponto-accent">{mstTotalWeight}</span>
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
        </div>
      </div>

      <div className="border-t border-ponto-muted/30 pt-4">
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">Rotações AVL</h2>
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            {selectedNodesForRotation.length === 0 
              ? "Selecione a ferramenta de rotação (ícone) e clique em 3 nós" 
              : selectedNodesForRotation.length < 3 
                ? `Nós selecionados: ${selectedNodesForRotation.length}/3`
                : "3 nós selecionados! Escolha a rotação:"}
          </p>
          
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-xs p-3 rounded-lg mb-3 animate-pulse">
              <span className="font-bold">❌ Erro:</span> {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleManualRotation('LL')} disabled={selectedNodesForRotation.length !== 3} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-b-4 transition-all active:border-b-0 active:translate-y-1 ${selectedNodesForRotation.length !== 3 ? 'bg-ponto-muted/30 border-slate-900 text-slate-500 cursor-not-allowed' : 'bg-ponto-dark hover:bg-ponto-muted border-slate-900 text-white'}`}>
              <RotateCcw size={20} /><span className="text-[10px] font-bold">LL (Dir.)</span>
            </button>
            <button onClick={() => handleManualRotation('RR')} disabled={selectedNodesForRotation.length !== 3} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-b-4 transition-all active:border-b-0 active:translate-y-1 ${selectedNodesForRotation.length !== 3 ? 'bg-ponto-muted/30 border-slate-900 text-slate-500 cursor-not-allowed' : 'bg-ponto-dark hover:bg-ponto-muted border-slate-900 text-white'}`}>
              <RotateCcw size={20} className="scale-x-[-1]" /><span className="text-[10px] font-bold">RR (Esq.)</span>
            </button>
            <button onClick={() => handleManualRotation('LR')} disabled={selectedNodesForRotation.length !== 3} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-b-4 transition-all active:border-b-0 active:translate-y-1 ${selectedNodesForRotation.length !== 3 ? 'bg-ponto-muted/30 border-slate-900 text-slate-500 cursor-not-allowed' : 'bg-ponto-dark hover:bg-ponto-muted border-slate-900 text-white'}`}>
              <RotateCcw size={20} /><span className="text-[10px] font-bold">LR (Esq.-Dir.)</span>
            </button>
            <button onClick={() => handleManualRotation('RL')} disabled={selectedNodesForRotation.length !== 3} className={`flex flex-col items-center gap-1 p-3 rounded-lg border-b-4 transition-all active:border-b-0 active:translate-y-1 ${selectedNodesForRotation.length !== 3 ? 'bg-ponto-muted/30 border-slate-900 text-slate-500 cursor-not-allowed' : 'bg-ponto-dark hover:bg-ponto-muted border-slate-900 text-white'}`}>
              <RotateCcw size={20} className="scale-x-[-1]" /><span className="text-[10px] font-bold">RL (Dir.-Esq.)</span>
            </button>
          </div>
          {selectedNodesForRotation.length > 0 && (
            <button onClick={() => { setSelectedNodesForRotation([]); setErrorNodesForRotation([]); setErrorMessage(''); }} className="w-full text-xs text-slate-400 hover:text-white py-1">
              Limpar seleção ({selectedNodesForRotation.join(', ')})
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-ponto-muted/30 pt-4">
          <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-2">Lista de Adjacência</h2>
          <div className="bg-ponto-darker rounded-lg border border-ponto-muted p-3 h-48 overflow-y-auto font-mono text-xs shadow-inner">
            {nodes.length === 0 ? <span className="text-slate-500 italic">Grafo vazio</span> : renderAdjacencyList()}
          </div>
      </div>
    </div>
  );
};