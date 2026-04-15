import React from "react";
import {
  X,
  MousePointer2,
  Circle,
  MoveUpRight,
  Eraser,
  ArrowRight,
  ArrowRightLeft,
  Play,
  Pause,
  Square,
  FileText,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-ponto-accent font-bold text-sm uppercase tracking-widest mb-3 border-b border-ponto-muted/40 pb-1">
      {title}
    </h3>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const Item = ({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="shrink-0 w-8 h-8 rounded-lg bg-ponto-dark border border-ponto-muted/50 flex items-center justify-center text-ponto-accent">
      {icon}
    </div>
    <div>
      <span className="text-white font-semibold text-sm">{label}</span>
      <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-ponto-darker border border-ponto-muted/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ponto-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h2 className="text-white font-bold text-lg">Como usar o Construir Livre</h2>
              <p className="text-slate-400 text-xs">Guia completo de ferramentas e funcionalidades</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-ponto-muted/40 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 flex-1">

          <Section title="🖊️ Ferramentas de Edição">
            <Item
              icon={<MousePointer2 size={16} />}
              label="Cursor (Mover)"
              description="Clique e arraste um nó para reposicioná-lo no canvas. Também ativa o modo de pan: clique e arraste em área vazia para mover toda a visualização."
            />
            <Item
              icon={<Circle size={16} />}
              label="Adicionar Nó"
              description="Clique em qualquer ponto vazio do canvas para criar um novo nó. Você pode definir um rótulo personalizado no campo 'ID do Nó' na barra lateral antes de clicar."
            />
            <Item
              icon={<MoveUpRight size={16} />}
              label="Adicionar Aresta"
              description="Clique em um nó de origem e depois em um nó de destino para criar uma aresta entre eles. Um prompt pedirá o peso da aresta (padrão: 1). Não é possível criar arestas duplicadas."
            />
            <Item
              icon={<Eraser size={16} />}
              label="Apagar"
              description="Clique em qualquer nó para removê-lo junto com todas as arestas conectadas a ele. No modo sandbox, clicar em uma aresta também a remove."
            />
          </Section>

          <Section title="🔀 Tipo de Grafo">
            <Item
              icon={<ArrowRight size={16} />}
              label="Direcionado"
              description="As arestas têm sentido (seta). O fluxo vai apenas do nó de origem para o destino. Necessário para algoritmos como Ford-Fulkerson."
            />
            <Item
              icon={<ArrowRightLeft size={16} />}
              label="Não Direcionado"
              description="As arestas não têm sentido, a conexão vale nos dois sentidos. Ao trocar o tipo, todas as arestas existentes são removidas para evitar inconsistências."
            />
          </Section>

          <Section title="🔍 Navegação no Canvas">
            <Item
              icon={<ZoomIn size={16} />}
              label="Zoom +"
              description="Aproxima a visualização do grafo. Também pode usar o scroll do mouse diretamente sobre o canvas."
            />
            <Item
              icon={<ZoomOut size={16} />}
              label="Zoom -"
              description="Afasta a visualização do grafo. Útil para ver grafos grandes por completo."
            />
            <Item
              icon={<RotateCcw size={16} />}
              label="Resetar Zoom"
              description="Volta a visualização para o zoom e posição originais (100%, centralizado)."
            />
          </Section>

          <Section title="▶️ Controles de Animação">
            <Item
              icon={<Play size={16} />}
              label="Play"
              description="Inicia a animação do algoritmo selecionado. Certifique-se de preencher o nó inicial (e destino, se necessário) na barra lateral antes de executar."
            />
            <Item
              icon={<Pause size={16} />}
              label="Pausar"
              description="Pausa a animação no passo atual. O estado visual é preservado e você pode retomar de onde parou clicando em Play novamente."
            />
            <Item
              icon={<Square size={16} />}
              label="Parar"
              description="Interrompe a animação e limpa todo o estado visual (cores, distâncias, tabelas). O grafo permanece intacto para uma nova execução."
            />
          </Section>

          <Section title="📂 Importar e Limpar">
            <Item
              icon={<FileText size={16} />}
              label="Importar DIMACS"
              description="Carrega um grafo a partir de um arquivo no formato DIMACS. A primeira linha deve conter o número de nós e arestas. As linhas seguintes definem cada aresta no formato: origem destino peso."
            />
            <Item
              icon={<Trash2 size={16} />}
              label="Limpar Tudo"
              description="Remove todos os nós e arestas do canvas e reseta o zoom. A animação em andamento também é interrompida."
            />
          </Section>

          <Section title="📊 Algoritmos Disponíveis">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { name: "BFS", desc: "Busca em Largura. Requer nó inicial." },
                { name: "DFS", desc: "Busca em Profundidade. Requer nó inicial." },
                { name: "Dijkstra", desc: "Menor caminho com pesos positivos. Requer nó inicial." },
                { name: "Bellman-Ford", desc: "Menor caminho, suporta pesos negativos. Detecta ciclos negativos." },
                { name: "Floyd-Warshall", desc: "Menor caminho entre todos os pares de nós." },
                { name: "Prim", desc: "Árvore Geradora Mínima a partir de um nó. Requer grafo não-direcionado." },
                { name: "Kruskal", desc: "Árvore Geradora Mínima por ordenação de arestas." },
                { name: "Ford-Fulkerson", desc: "Fluxo máximo em rede. Requer nó fonte e sumidouro." },
              ].map((algo) => (
                <div key={algo.name} className="bg-ponto-dark rounded-lg px-3 py-2 border border-ponto-muted/30">
                  <span className="text-ponto-accent font-bold text-xs font-mono">{algo.name}</span>
                  <p className="text-slate-400 text-xs mt-0.5">{algo.desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <div className="bg-ponto-dark border border-ponto-accent/20 rounded-xl p-4 mt-2">
            <p className="text-ponto-accent font-bold text-xs uppercase tracking-wider mb-1">💡 Dica rápida</p>
            <p className="text-slate-300 text-xs leading-relaxed">
              Comece criando alguns nós com a ferramenta <strong className="text-white">Adicionar Nó</strong>, conecte-os com <strong className="text-white">Adicionar Aresta</strong>, escolha um algoritmo na barra lateral direita, informe o nó inicial e clique em <strong className="text-white">Play</strong> para ver a mágica acontecer!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
