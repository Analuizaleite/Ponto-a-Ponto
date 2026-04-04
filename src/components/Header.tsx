import React from 'react';
import { Circle, MousePointer2, MoveUpRight, RotateCcw, ArrowRightLeft, ArrowRight, Eraser, Gamepad2, Wrench, Trash2 } from 'lucide-react';
import type { AppMode, ActiveTool } from '../types';
import logoImage from "../assets/logo_transparente.png";

interface HeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  isDirected: boolean;
  setIsDirected: (isDirected: boolean) => void;
  clearAll: () => void;
  loadLevel: (index: number) => void;
  setEdges: (edges: any[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  appMode,
  setAppMode,
  activeTool,
  setActiveTool,
  isDirected,
  setIsDirected,
  clearAll,
  loadLevel,
  setEdges
}) => {
  return (
    <header className="flex items-center justify-between border-b border-ponto-muted bg-ponto-darker px-6 py-3 shadow-md z-10">
      <div className="flex items-center gap-6 w-full">
        <img src={logoImage} alt="Ponto a Ponto Logo" className="h-12 md:h-14 w-auto object-contain animate-pulse" />
        
        <div className="flex bg-ponto-dark p-1 rounded-lg border border-ponto-muted">
          <button 
            onClick={() => { setAppMode('sandbox'); clearAll(); }} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${appMode === 'sandbox' ? 'bg-ponto-accent text-ponto-darker shadow-sm' : 'text-slate-300 hover:text-ponto-accent'}`}
          >
            <Wrench size={16} /> Construir (Livre)
          </button>
          <button 
            onClick={() => { setAppMode('game'); loadLevel(0); }} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${appMode === 'game' ? 'bg-ponto-accent text-ponto-darker shadow-sm' : 'text-slate-300 hover:text-ponto-accent'}`}
          >
            <Gamepad2 size={16} /> Modo Desafio
          </button>
        </div>
        
        {appMode === 'sandbox' && (
          <>
            <div className="w-px h-6 bg-ponto-muted mx-2"></div>
            <div className="flex items-center gap-1 rounded-lg bg-ponto-dark p-1 border border-ponto-muted">
              <button onClick={() => setActiveTool('cursor')} className={`p-1.5 rounded transition-colors ${activeTool === 'cursor' ? 'bg-ponto-accent text-ponto-darker' : 'text-slate-300 hover:bg-ponto-muted/50'}`} title="Mover"><MousePointer2 size={18} /></button>
              <button onClick={() => setActiveTool('add-node')} className={`p-1.5 rounded transition-colors ${activeTool === 'add-node' ? 'bg-ponto-accent text-ponto-darker' : 'text-slate-300 hover:bg-ponto-muted/50'}`} title="Adicionar Nó"><Circle size={18} /></button>
              <button onClick={() => setActiveTool('add-edge')} className={`p-1.5 rounded transition-colors ${activeTool === 'add-edge' ? 'bg-ponto-accent text-ponto-darker' : 'text-slate-300 hover:bg-ponto-muted/50'}`} title="Adicionar Aresta"><MoveUpRight size={18} /></button>
              <button onClick={() => setActiveTool('delete')} className={`p-1.5 rounded transition-colors ${activeTool === 'delete' ? 'bg-red-500 text-white' : 'text-slate-300 hover:bg-red-500/20 hover:text-red-400'}`} title="Apagar"><Eraser size={18} /></button>
              <button onClick={() => setActiveTool('select-rotation')} className={`p-1.5 rounded transition-colors ${activeTool === 'select-rotation' ? 'bg-ponto-accent text-ponto-darker' : 'text-slate-300 hover:bg-ponto-muted/50'}`} title="Selecionar nós para rotação"><RotateCcw size={18} /></button>
            </div>
            <button 
              onClick={() => { setEdges([]); setIsDirected(!isDirected); }} 
              className="flex items-center gap-2 rounded-full border border-ponto-muted px-3 py-1 text-xs font-semibold uppercase text-slate-300 hover:bg-ponto-dark"
            >
              {isDirected ? <ArrowRight size={14} className="text-ponto-accent"/> : <ArrowRightLeft size={14} className="text-slate-400"/>}
              {isDirected ? 'Direcionado' : 'Não Direcionado'}
            </button>
            <button 
              onClick={clearAll} 
              className="flex items-center gap-2 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded text-sm font-medium transition-colors ml-auto"
            >
              <Trash2 size={16} /> Limpar Tudo
            </button>
          </>
        )}
      </div>
    </header>
  );
};