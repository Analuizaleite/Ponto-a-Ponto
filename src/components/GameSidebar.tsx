import React, { useState, useEffect } from "react";
import {
  Heart,
  HeartCrack,
  ArrowLeft,
  Trophy,
  AlertTriangle,
  Target,
  Info,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

export interface GameSidebarProps {
  levelConfigs: any[];
  currentLevelIndex: number;
  dynamicLevel: any;
  lives: number;
  gameStatus: "playing" | "won" | "lost";
  playerPath: number[];
  loadLevel: (themeId: string, levelIdx: number) => void;
  resetGame: () => void;
  nextLevel: () => void;
  onReturnToHub: () => void;
}

export const GameSidebar: React.FC<GameSidebarProps> = ({
  dynamicLevel,
  lives,
  gameStatus,
  playerPath,
  resetGame,
  nextLevel,
  onReturnToHub
}) => {
  const [mobileCard, setMobileCard] = useState<"situacao" | "alvo" | "regra" | null>("situacao");

  useEffect(() => {
    setMobileCard("situacao");
  }, [dynamicLevel]);

  if (!dynamicLevel)
    return <div className="text-slate-400 p-4">Carregando missão...</div>;

  const renderLives = () => {
    const hearts = [];
    for (let i = 0; i < 3; i++) {
      if (i < lives)
        hearts.push(
          <Heart key={i} size={20} className="fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />,
        );
      else
        hearts.push(<HeartCrack key={i} size={20} className="text-slate-600" />);
    }
    return <div className="flex gap-1.5">{hearts}</div>;
  };

  const renderStars = () => (
    <div className="flex justify-center gap-2 my-4">
      <Trophy size={32} className="fill-yellow-400 text-yellow-500 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
      <Trophy size={32} className={lives >= 2 ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" : "text-slate-700"} />
      <Trophy size={32} className={lives === 3 ? "fill-yellow-400 text-yellow-500 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" : "text-slate-700"} />
    </div>
  );

  const cards = [
    {
      id: "situacao" as const,
      label: "Situação",
      icon: <Info size={14} className="text-blue-400" />,
      content: dynamicLevel.story?.context || dynamicLevel.description,
      borderColor: "border-blue-500/40",
      headerBg: "bg-blue-500/10",
      headerBorder: "border-blue-500/30",
    },
    {
      id: "alvo" as const,
      label: "O Alvo",
      icon: <Target size={14} className="text-emerald-400" />,
      content: dynamicLevel.story?.objective,
      borderColor: "border-emerald-500/40",
      headerBg: "bg-emerald-500/10",
      headerBorder: "border-emerald-500/30",
    },
    {
      id: "regra" as const,
      label: "Regra de Ouro",
      icon: <ShieldAlert size={14} className="text-amber-400" />,
      content: dynamicLevel.story?.rule,
      borderColor: "border-amber-500/40",
      headerBg: "bg-amber-500/10",
      headerBorder: "border-amber-500/30",
    },
  ];

  const activeCard = cards.find((c) => c.id === mobileCard);

  return (
    <>
      <div className="hidden md:flex flex-col h-full text-slate-200">
        <div className="flex flex-col gap-3 mb-5 border-b border-ponto-muted/30 pb-4">
          <div className="flex justify-between items-center">
            <button
              onClick={onReturnToHub}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-ponto-muted/10 px-2 py-1 rounded"
            >
              <ArrowLeft size={12} /> Sair
            </button>
            {gameStatus === "playing" && renderLives()}
          </div>
          <h1 className="text-lg font-bold text-ponto-accent leading-tight">
            {dynamicLevel.name || "Desafio"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          {gameStatus === "playing" && (
            <div className="flex flex-col gap-4">
              {cards.map((card) => (
                <div key={card.id} className={`bg-ponto-darker rounded-lg border ${card.borderColor} shadow-inner overflow-hidden`}>
                  <div className={`${card.headerBg} px-3 py-2 border-b ${card.headerBorder} flex items-center gap-2`}>
                    {card.icon}
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{card.label}</span>
                  </div>
                  <p className="p-3 text-sm text-slate-300 leading-relaxed">{card.content}</p>
                </div>
              ))}
            </div>
          )}

          {gameStatus === "won" && (
            <div className="flex flex-col items-center text-center bg-ponto-darker p-6 rounded-xl border border-ponto-accent/50 shadow-[0_0_30px_rgba(58,235,185,0.1)]">
              <h2 className="text-lg font-bold text-white mb-1">Missão Cumprida!</h2>
              <p className="text-ponto-accent text-[10px] font-bold uppercase tracking-wider mb-2">Relatório de Desempenho</p>
              {renderStars()}
              <p className="text-xs text-slate-300 mt-2 mb-6">
                {lives === 3 && "Perfeição absoluta! Você dominou completamente a lógica."}
                {lives === 2 && "Muito bom trabalho! Apenas um pequeno deslize, operação bem sucedida."}
                {lives === 1 && "Foi por um triz! Missão concluída, mas recomendamos revisar a teoria."}
              </p>
              <button onClick={nextLevel} className="w-full bg-ponto-accent text-ponto-darker font-bold py-2.5 rounded-lg hover:brightness-110 transition-all text-sm">Continuar Missão</button>
            </div>
          )}

          {gameStatus === "lost" && (
            <div className="flex flex-col items-center text-center bg-ponto-darker p-6 rounded-xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <AlertTriangle size={32} className="text-red-500 mb-3 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              <h2 className="text-lg font-bold text-white mb-1">Operação Falhou</h2>
              <p className="text-xs text-slate-300 mb-6 mt-2">Você cometeu erros críticos na execução. Revise a Regra de Ouro e tente novamente.</p>
              <button onClick={resetGame} className="w-full bg-red-500 text-white font-bold py-2.5 rounded-lg hover:bg-red-400 transition-all text-sm mb-2">Tentar Novamente</button>
              <button onClick={onReturnToHub} className="w-full bg-transparent border border-ponto-muted text-slate-300 font-bold py-2.5 rounded-lg hover:bg-ponto-muted/20 transition-all text-sm">Voltar à Central</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex md:hidden flex-col w-full text-slate-200">

        <div className="flex items-center justify-between px-4 py-2 bg-ponto-darker border-b border-ponto-muted/30">
          <button
            onClick={onReturnToHub}
            className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-ponto-muted/10 px-2 py-1 rounded"
          >
            <ArrowLeft size={12} /> Sair
          </button>
          <span className="text-sm font-bold text-ponto-accent truncate mx-3 flex-1 text-center">
            {dynamicLevel.name || "Desafio"}
          </span>
          {gameStatus === "playing" && renderLives()}
        </div>

        {gameStatus === "playing" && mobileCard && activeCard && (
          <div className="relative mx-3 mt-3">
            <div className={`bg-ponto-darker rounded-xl border ${activeCard.borderColor} shadow-xl overflow-hidden`}>
              <div className={`${activeCard.headerBg} px-3 py-2 border-b ${activeCard.headerBorder} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {activeCard.icon}
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{activeCard.label}</span>
                </div>
                <span className="text-[10px] text-slate-500">{cards.findIndex(c => c.id === mobileCard) + 1}/3</span>
              </div>
              <p className="p-3 text-sm text-slate-300 leading-relaxed">{activeCard.content}</p>
              <div className="flex gap-2 px-3 pb-3">
                {mobileCard !== "regra" ? (
                  <button
                    onClick={() => {
                      const idx = cards.findIndex(c => c.id === mobileCard);
                      setMobileCard(cards[idx + 1].id);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 bg-ponto-accent text-ponto-darker text-xs font-bold py-2 rounded-lg"
                  >
                    Próximo <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setMobileCard(null)}
                    className="flex-1 bg-ponto-accent text-ponto-darker text-xs font-bold py-2 rounded-lg"
                  >
                    Entendido, jogar!
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="flex items-center justify-center gap-2 py-2">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => setMobileCard(mobileCard === card.id ? null : card.id)}
                className={`w-2 h-2 rounded-full transition-all ${mobileCard === card.id ? "bg-ponto-accent w-4" : "bg-ponto-muted/50"}`}
              />
            ))}
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="mx-3 mb-2 flex items-center justify-between bg-[#05272d] border border-ponto-accent/20 px-3 py-2 rounded-lg text-xs font-mono">
            <span className="text-slate-400">Rota:</span>
            <span className="text-slate-300 truncate mx-2 flex-1">
              {playerPath.length > 0
                ? playerPath.map((id) => `${id}`).join(" ➔ ")
                : <span className="text-slate-500 italic">Clique no nó inicial...</span>}
            </span>
            <span className="text-ponto-accent font-bold shrink-0">{playerPath.length}/{dynamicLevel.expectedVisits?.length || 0}</span>
          </div>
        )}

        {gameStatus === "won" && (
          <div className="mx-3 my-2 flex flex-col items-center text-center bg-ponto-darker p-4 rounded-xl border border-ponto-accent/50">
            <h2 className="text-base font-bold text-white mb-1">Missão Cumprida!</h2>
            {renderStars()}
            <p className="text-xs text-slate-300 mb-4">
              {lives === 3 && "Perfeição absoluta!"}
              {lives === 2 && "Muito bom trabalho!"}
              {lives === 1 && "Foi por um triz!"}
            </p>
            <button onClick={nextLevel} className="w-full bg-ponto-accent text-ponto-darker font-bold py-2 rounded-lg text-sm">Continuar</button>
          </div>
        )}

        {/* Resultado: lost */}
        {gameStatus === "lost" && (
          <div className="mx-3 my-2 flex flex-col items-center text-center bg-ponto-darker p-4 rounded-xl border border-red-500/50">
            <AlertTriangle size={28} className="text-red-500 mb-2" />
            <h2 className="text-base font-bold text-white mb-1">Operação Falhou</h2>
            <p className="text-xs text-slate-300 mb-4">Revise a Regra de Ouro e tente novamente.</p>
            <button onClick={resetGame} className="w-full bg-red-500 text-white font-bold py-2 rounded-lg text-sm mb-2">Tentar Novamente</button>
            <button onClick={onReturnToHub} className="w-full border border-ponto-muted text-slate-300 font-bold py-2 rounded-lg text-sm">Voltar à Central</button>
          </div>
        )}
      </div>
    </>
  );
};
