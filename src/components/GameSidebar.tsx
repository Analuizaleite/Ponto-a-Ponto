import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GameSidebarProps {
  levelConfigs: any[];
  currentLevelIndex: number;
  dynamicLevel: any;
  lives: number;
  gameStatus: 'playing' | 'won' | 'lost';
  playerPath: number[];
  loadLevel: (index: number) => void;
  resetGame: () => void;
  nextLevel: () => void;
  handleRotationGameChallenge: (type: 'LL' | 'RR' | 'LR' | 'RL') => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  levelConfigs, currentLevelIndex, dynamicLevel, lives, gameStatus, playerPath,
  loadLevel, resetGame, nextLevel, handleRotationGameChallenge
}) => {

  if (!dynamicLevel) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-ponto-accent uppercase tracking-widest">Escolher Nível</h3>
        <div className="flex gap-2">
          {levelConfigs.map((_, idx) => (
            <button
              key={idx}
              onClick={() => loadLevel(idx)}
              className={`w-10 h-10 rounded-lg font-bold transition-all border-2 ${
                currentLevelIndex === idx
                ? 'bg-ponto-accent text-ponto-darker border-ponto-accent shadow-md scale-110'
                : 'bg-ponto-darker text-slate-400 border-ponto-muted hover:border-ponto-accent hover:text-ponto-accent'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-ponto-darker text-white rounded-xl p-5 shadow-lg border-2 border-ponto-muted relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-ponto-muted text-ponto-accent text-xs font-bold px-3 py-1 rounded-bl-lg">
          {dynamicLevel.algo}
        </div>
        <h2 className="text-lg font-bold mb-2 mt-2 text-ponto-accent">🎯 {dynamicLevel.title}</h2>
        <p className="text-sm text-slate-300 mb-4">{dynamicLevel.description}</p>

        <div className="bg-ponto-dark rounded p-3 mb-4 flex justify-between items-center">
          <span className="font-semibold text-slate-400 text-sm">Vidas:</span>
          <span className="text-xl tracking-widest">
            {Array.from({length: 3}).map((_, i) => i < lives ? '❤️' : '🖤').join('')}
          </span>
        </div>

        {dynamicLevel.algo === 'AVL' && gameStatus === 'playing' && (
          <div className="space-y-3 mt-4">
            <p className="text-xs font-bold text-ponto-accent uppercase text-center">Qual rotação resolve este caso?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleRotationGameChallenge('RR')} className="flex flex-col items-center gap-2 bg-ponto-dark hover:bg-ponto-muted text-white p-3 rounded-lg border-b-4 border-slate-900 transition-all active:border-b-0 active:translate-y-1">
                <RotateCcw size={20} className="scale-x-[-1]" />
                <span className="text-[10px] font-bold">ESQUERDA (RR)</span>
              </button>
              <button onClick={() => handleRotationGameChallenge('LL')} className="flex flex-col items-center gap-2 bg-ponto-dark hover:bg-ponto-muted text-white p-3 rounded-lg border-b-4 border-slate-900 transition-all active:border-b-0 active:translate-y-1">
                <RotateCcw size={20} />
                <span className="text-[10px] font-bold">DIREITA (LL)</span>
              </button>
              <button onClick={() => handleRotationGameChallenge('LR')} className="flex flex-col items-center gap-2 bg-ponto-dark hover:bg-ponto-muted text-white p-3 rounded-lg border-b-4 border-slate-900 transition-all active:border-b-0 active:translate-y-1">
                <RotateCcw size={20} />
                <span className="text-[10px] font-bold">ESQ-DIR (LR)</span>
              </button>
              <button onClick={() => handleRotationGameChallenge('RL')} className="flex flex-col items-center gap-2 bg-ponto-dark hover:bg-ponto-muted text-white p-3 rounded-lg border-b-4 border-slate-900 transition-all active:border-b-0 active:translate-y-1">
                <RotateCcw size={20} className="scale-x-[-1]" />
                <span className="text-[10px] font-bold">DIR-ESQ (RL)</span>
              </button>
            </div>
          </div>
        )}

        {dynamicLevel.algo === 'DIJKSTRA' && gameStatus === 'playing' && (
          <div className="space-y-3 mt-4">
            <div className="bg-ponto-dark rounded p-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">Origem:</span>
              <span className="font-bold text-green-400">Nó {dynamicLevel.startNodeId}</span>
            </div>
            <div className="bg-ponto-dark rounded p-3 flex justify-between items-center">
              <span className="text-xs text-slate-400">Destino:</span>
              <span className="font-bold text-red-400">Nó {dynamicLevel.targetNodeId}</span>
            </div>
          </div>
        )}

        {gameStatus === 'won' && <div className="bg-ponto-accent text-ponto-darker font-bold p-3 rounded text-center animate-bounce mb-3 mt-3">🏆 Concluído!</div>}
        {gameStatus === 'lost' && <div className="bg-red-500 text-white font-bold p-3 rounded text-center mb-3 mt-3">💀 Tente Novamente!</div>}

        {gameStatus !== 'playing' && (
           <button onClick={gameStatus === 'won' ? nextLevel : resetGame} className="w-full bg-slate-200 text-ponto-darker font-bold py-2 rounded shadow-sm hover:bg-white transition-colors">
             {gameStatus === 'won' ? 'Próxima Fase' : '🔄 Recomeçar (Novo Grafo)'}
           </button>
        )}
      </div>
      
      {dynamicLevel.algo !== 'AVL' && (
        <div className="border-t border-ponto-muted/30 pt-4">
          <h3 className="text-sm font-bold text-ponto-accent uppercase tracking-wider mb-2">Seu Caminho</h3>
          <div className="flex gap-2 flex-wrap">
            {playerPath.map((id, index) => (
              <div key={index} className="w-8 h-8 rounded-full bg-ponto-accent/20 border-2 border-ponto-accent flex items-center justify-center font-bold text-ponto-accent shadow-sm">{id}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};