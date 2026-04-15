import React from "react";
import {
  Circle,
  MousePointer2,
  MoveUpRight,
  ArrowRightLeft,
  ArrowRight,
  Eraser,
  Gamepad2,
  Wrench,
  Trash2,
  FileText,
} from "lucide-react";
import type { AppMode, ActiveTool } from "../types";
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
  onImportGraph: () => void;
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
  setEdges,
  onImportGraph,
}) => {
  return (
    <header className="flex flex-col border-b border-ponto-muted bg-ponto-darker shadow-md z-10">
      <div className="flex items-center gap-4 px-6 py-3">
        <img
          src={logoImage}
          alt="Ponto a Ponto Logo"
          className="h-10 md:h-14 w-auto object-contain animate-pulse shrink-0"
        />

        <div className="flex bg-ponto-dark p-1 rounded-lg border border-ponto-muted">
          <button
            onClick={() => {
              setAppMode("sandbox");
              clearAll();
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${appMode === "sandbox" ? "bg-ponto-accent text-ponto-darker shadow-sm" : "text-slate-300 hover:text-ponto-accent"}`}
          >
            <Wrench size={16} />
            <span className="hidden sm:inline">Construir (Livre)</span>
            <span className="sm:hidden">Construir</span>
          </button>
          <button
            onClick={() => {
              setAppMode("game");
              loadLevel(0);
            }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${appMode === "game" ? "bg-ponto-accent text-ponto-darker shadow-sm" : "text-slate-300 hover:text-ponto-accent"}`}
          >
            <Gamepad2 size={16} />
            <span className="hidden sm:inline">Modo Desafio</span>
            <span className="sm:hidden">Desafio</span>
          </button>
        </div>

        {appMode === "sandbox" && (
          <div className="hidden md:flex items-center gap-3">
            <div className="w-px h-6 bg-ponto-muted" />
            <div className="flex items-center gap-1 rounded-lg bg-ponto-dark p-1 border border-ponto-muted">
              <button
                onClick={() => setActiveTool("cursor")}
                className={`p-1.5 rounded transition-colors ${activeTool === "cursor" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
                title="Mover"
              >
                <MousePointer2 size={18} />
              </button>
              <button
                onClick={() => setActiveTool("add-node")}
                className={`p-1.5 rounded transition-colors ${activeTool === "add-node" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
                title="Adicionar Nó"
              >
                <Circle size={18} />
              </button>
              <button
                onClick={() => setActiveTool("add-edge")}
                className={`p-1.5 rounded transition-colors ${activeTool === "add-edge" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
                title="Adicionar Aresta"
              >
                <MoveUpRight size={18} />
              </button>
              <button
                onClick={() => setActiveTool("delete")}
                className={`p-1.5 rounded transition-colors ${activeTool === "delete" ? "bg-red-500 text-white" : "text-slate-300 hover:bg-red-500/20 hover:text-red-400"}`}
                title="Apagar"
              >
                <Eraser size={18} />
              </button>
            </div>
            <button
              onClick={() => {
                setEdges([]);
                setIsDirected(!isDirected);
              }}
              className="flex items-center gap-2 rounded-full border border-ponto-muted px-3 py-1 text-xs font-semibold uppercase text-slate-300 hover:bg-ponto-dark"
            >
              {isDirected ? (
                <ArrowRight size={14} className="text-ponto-accent" />
              ) : (
                <ArrowRightLeft size={14} className="text-slate-400" />
              )}
              {isDirected ? "Direcionado" : "Não Direcionado"}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onImportGraph}
                className="flex items-center gap-2 text-slate-300 hover:bg-ponto-dark px-3 py-1.5 rounded text-sm font-medium transition-colors"
                title="Importar grafo em formato DIMACS"
              >
                <FileText size={16} /> Importar DIMACS
              </button>
            </div>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded text-sm font-medium transition-colors ml-auto"
            >
              <Trash2 size={16} /> Limpar Tudo
            </button>
          </div>
        )}
      </div>

      {appMode === "sandbox" && (
        <div className="flex md:hidden items-center gap-2 px-4 py-2 border-t border-ponto-muted/40 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg bg-ponto-dark p-1 border border-ponto-muted">
            <button
              onClick={() => setActiveTool("cursor")}
              className={`p-1.5 rounded transition-colors ${activeTool === "cursor" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
              title="Mover"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setActiveTool("add-node")}
              className={`p-1.5 rounded transition-colors ${activeTool === "add-node" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
              title="Adicionar Nó"
            >
              <Circle size={18} />
            </button>
            <button
              onClick={() => setActiveTool("add-edge")}
              className={`p-1.5 rounded transition-colors ${activeTool === "add-edge" ? "bg-ponto-accent text-ponto-darker" : "text-slate-300 hover:bg-ponto-muted/50"}`}
              title="Adicionar Aresta"
            >
              <MoveUpRight size={18} />
            </button>
            <button
              onClick={() => setActiveTool("delete")}
              className={`p-1.5 rounded transition-colors ${activeTool === "delete" ? "bg-red-500 text-white" : "text-slate-300 hover:bg-red-500/20 hover:text-red-400"}`}
              title="Apagar"
            >
              <Eraser size={18} />
            </button>
          </div>
          <button
            onClick={() => {
              setEdges([]);
              setIsDirected(!isDirected);
            }}
            className="flex items-center gap-1.5 rounded-full border border-ponto-muted px-3 py-1 text-xs font-semibold uppercase text-slate-300 hover:bg-ponto-dark"
          >
            {isDirected ? (
              <ArrowRight size={14} className="text-ponto-accent" />
            ) : (
              <ArrowRightLeft size={14} className="text-slate-400" />
            )}
            {isDirected ? "Dir." : "N. Dir."}
          </button>
          <button
            onClick={onImportGraph}
            className="flex items-center gap-1.5 text-slate-300 hover:bg-ponto-dark px-2 py-1.5 rounded text-xs font-medium transition-colors"
            title="Importar grafo em formato DIMACS"
          >
            <FileText size={14} /> Importar
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded text-xs font-medium transition-colors ml-auto"
          >
            <Trash2 size={16} /> Limpar
          </button>
        </div>
      )}
    </header>
  );
};
