export interface GameLevel {
  id: string;
  algo: string;
  name: string;
  description: string;
  story: {
    context: string;
    objective: string;
    rule: string;
  };
}

export interface GameTheme {
  id: string;
  title: string;
  algorithms: string;
  icon: string;
  color: string;
  description: string;
  levels: GameLevel[];
}

export const GAME_THEMES: GameTheme[] = [
  {
    id: "buscas",
    title: "O Labirinto das Redes",
    algorithms: "BFS e DFS",
    icon: "🌐",
    color: "bg-blue-900",
    description:
      "Assuma o controle da Cibersegurança. Rastreie a propagação de malwares e isole invasores.",
    levels: [
      {
        id: "bfs_1",
        algo: "BFS",
        name: "Missão 1: Contenção de Ransomware",
        description:
          "Isole a propagação de um vírus simulando o seu comportamento em camadas.",
        story: {
          context:
            "O Servidor Central acaba de relatar uma violação crítica. Sabemos que este Ransomware se propaga como uma onda, atingindo os computadores mais próximos primeiro.",
          objective:
            "Mapeie a linha temporal da infeção, camada por camada, para criarmos um isolamento perfeito.",
          rule: "Busca em Largura (BFS): Nunca avance para máquinas distantes sem antes verificar TODOS os servidores colados à camada atual!",
        },
      },
      {
        id: "dfs_1",
        algo: "DFS",
        name: "Missão 2: Em Busca do Hacker",
        description:
          "Siga o rastro digital de um IP fantasma através de túneis encriptados.",
        story: {
          context:
            "Detetámos um IP fantasma a extrair dados sensíveis. Ele criou uma 'Backdoor' mergulhando o mais fundo possível num único túnel antes de recuar.",
          objective:
            "Persiga o invasor até ao último servidor possível do túnel.",
          rule: "Busca em Profundidade (DFS): Mergulhe na primeira rota disponível até encontrar um beco sem saída. Só então recue para verificar as outras portas!",
        },
      },
    ],
  },
  {
    id: "infra",
    title: "Infraestrutura Crítica",
    algorithms: "Prim e Kruskal",
    icon: "⚡",
    color: "bg-amber-900",
    description:
      "Restaure a malha elétrica da região conectando subestações com o menor custo possível.",
    levels: [
      {
        id: "prim_1",
        algo: "PRIM",
        name: "Missão 1: Apagão Pós-Tempestade",
        description:
          "Puxe novos cabos de alta tensão gerindo um orçamento estatal minúsculo.",
        story: {
          context:
            "Uma tempestade massiva devastou a região. A partir da única subestação que ainda tem energia, você precisa puxar cabos para o resto do mapa.",
          objective:
            "Reconecte todas as subestações geradoras ao menor custo possível.",
          rule: "Algoritmo de Prim: Olhe para a sua rede de energia atual e compre APENAS o cabo mais barato que consiga alcançar uma subestação nova.",
        },
      },
    ],
  },
  {
    id: "logistica",
    title: "Logística de Emergência",
    algorithms: "Dijkstra e Bellman-Ford",
    icon: "🚑",
    color: "bg-red-900",
    description:
      "Calcule rotas de resgate médico através de uma metrópole com trânsito caótico.",
    levels: [
      {
        id: "dijk_1",
        algo: "DIJKSTRA",
        name: "Missão 1: Transplante Urgente",
        description:
          "Guie a ambulância cruzamento a cruzamento garantindo o menor tempo de viagem.",
        story: {
          context:
            "A Ambulância leva um órgão vital para transplante. O relógio não para e os números nas ruas representam o tempo de trânsito em minutos.",
          objective:
            "Guie o motorista pelo caminho absoluto mais rápido até o Hospital.",
          rule: "Algoritmo de Dijkstra: Escolha SEMPRE o cruzamento que tenha a menor soma total de tempo a partir do ponto de partida.",
        },
      },
    ],
  },
  {
    id: "crises",
    title: "Gestão de Crises",
    algorithms: "Ford-Fulkerson",
    icon: "💧",
    color: "bg-cyan-900",
    description:
      "Bombeie água para uma metrópole assolada pela seca encontrando os gargalos.",
    levels: [
      {
        id: "ff_1",
        algo: "FORD_FULKERSON",
        name: "Missão 1: Seca Histórica",
        description:
          "Identifique caminhos com capacidade residual e sature a rede de abastecimento.",
        story: {
          context:
            "A cidade está sob seca extrema. O reservatório tem água, mas as condutas antigas têm limites severos de capacidade.",
          objective:
            "Encontre os gargalos e empurre o fluxo até que a rede de tubagens fique completamente saturada.",
          rule: "Método de Ford-Fulkerson: Identifique caminhos que ainda têm 'espaço livre' e sature-os. Se o cano encher, fica vermelho!",
        },
      },
    ],
  },
];
