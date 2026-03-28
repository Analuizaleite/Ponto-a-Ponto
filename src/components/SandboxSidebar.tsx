import React from 'react';
import { Play, RotateCcw } from 'lucide-react';
import type { Node, Edge } from '../types';

interface SandboxSidebarProps {
  nodes: Node[];
  edges: Edge[];
  isDirected: boolean;
  customNodeId: string;
  setCustomNodeId: (id: string) => void;
  selectedAlgo: 'BFS' | 'DFS' | 'DIJKSTRA';
  setSelectedAlgo: (algo: 'BFS' | 'DFS' | 'DIJKSTRA') => void;
  startNodeId: string;
  setStartNodeId: (id: string) => void;
  isAnimating: boolean;
  runAlgorithmSandbox: () => void;
  selectedNodesForRotation: number[];
  setSelectedNodesForRotation: (nodes: number[]) => void;
  setErrorNodesForRotation: (nodes: number[]) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
  handleManualRotation: (type: 'LL' | 'RR' | 'LR' | 'RL') => void;
}

export const SandboxSidebar: React.FC<SandboxSidebarProps> = ({
  nodes, edges, isDirected,
  customNodeId, setCustomNodeId, selectedAlgo, setSelectedAlgo, startNodeId, setStartNodeId,
  isAnimating, runAlgorithmSandbox, selectedNodesForRotation, setSelectedNodesForRotation,
  setErrorNodesForRotation, errorMessage, setErrorMessage, handleManualRotation
}) => {

  const renderAdjacencyList = () => {
    return nodes.map(node => {
      const neighbors = edges.filter(e => e.sourceId === node.id).map(e => `${e.targetId}(w:${e.weight})`);
      if (!isDirected) {
        const reverseNeighbors = edges.filter(e => e.targetId === node.id).map(e => `${e.sourceId}(w:${e.weight})`);
        neighbors.push(...reverseNeighbors);
      }
      return (
        <div key={node.id} className="text-xs font-mono text-slate-300 border-b border-ponto-muted/30 py-1">
          <span className="font-bold text-ponto-accent">{node.id}</span>: [{neighbors.join(', ')}]
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
        <h2 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-4">Executar (Sandbox)</h2>
        <div className="space-y-3">
          <select value={selectedAlgo} onChange={(e) => setSelectedAlgo(e.target.value as any)} className="w-full rounded-md border border-ponto-muted bg-ponto-darker text-white px-3 py-2 text-sm focus:border-ponto-accent focus:outline-none">
            <option value="BFS">Breadth-First Search (BFS)</option>
            <option value="DFS">Depth-First Search (DFS)</option>
            <option value="DIJKSTRA">Dijkstra (Caminho Mínimo)</option>
          </select>
          <div className="flex gap-2">
              <input type="text" placeholder="Início (ID)" value={startNodeId} onChange={(e) => setStartNodeId(e.target.value)} className="w-full rounded-md border border-ponto-muted bg-ponto-darker text-white px-3 py-2 text-sm focus:border-ponto-accent focus:outline-none placeholder-slate-500"/>
          </div>
          <button onClick={runAlgorithmSandbox} disabled={isAnimating} className={`flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-sm font-bold transition-all shadow-md ${isAnimating ? 'bg-ponto-muted cursor-not-allowed text-slate-300' : 'bg-ponto-accent text-ponto-darker hover:brightness-110'}`}>
            {isAnimating ? <RotateCcw size={18} className="animate-spin"/> : <Play size={18} />}
            {isAnimating ? 'Rodando...' : `Animar ${selectedAlgo}`}
          </button>
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