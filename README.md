# Ponto a Ponto

Plataforma React + TypeScript + Vite para visualização de grafos e algoritmos.

A versão disponível na web está hospedada em:
https://ponto-a-ponto.tech/

## Sobre o projeto

O Ponto a Ponto é uma plataforma web educacional e interativa projetada para mitigar as dificuldades de abstração no ensino e na aprendizagem da Teoria dos Grafos. O sistema atua como um visualizador de algoritmos integrado a mecânicas lúdicas de gamificação, transformando conceitos lógico-matemáticos abstratos em fluxos visuais concretos e reativos.

 projeto foi desenvolvido como Trabalho de Conclusão de Curso TCC do curso de *Sistemas de Informação da Pontifícia Universidade Católica de Minas Gerais (PUC Minas).

### Funcionalidades principais

* **Módulo de Construção Livre:** Um ambiente de experimentação sem restrições onde o usuário pode desenhar vértices, conectar arestas (direcionadas e ponderadas), importar instâncias no formato DIMACS e simular o comportamento dos algoritmos passo a passo ou de forma automática.
* **Central de Missões (Modo Desafio):** Cenários gamificados baseados em aplicações do mundo real. O motor de grafos valida as ações do estudante em tempo real, fornecendo feedbacks imediatos e gerenciando um sistema de tentativas (vidas).
* **Algoritmos Suportados:** Busca em Largura, Busca em Profundidade, Dijkstra, Bellmand-Ford,Floyd-Warshall, Prim, Kruskal e Ford-Fulkerson.
---

## Instruções para executar localmente

### Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior (ou `pnpm`/`yarn`, se preferir)

### Instalação

No diretório do projeto, execute:

```bash
npm install
```

### Executar em modo de desenvolvimento

```bash
npm run dev
```

Depois de iniciar, abra o endereço exibido no terminal. Normalmente será:

```text
http://localhost:5173
```

### Build de produção


```bash
npm run build
```


Os arquivos finais ficarão na pasta `dist`.


### Visualizar a build de produção localmente


```bash
npm run preview
```

### Scripts úteis



- `npm run dev` — inicia o servidor de desenvolvimento com hot reload

- `npm run build` — compila a aplicação para produção

- `npm run preview` — roda um servidor local para testar a build de produção



## Estrutura do projeto



- `src/` — código fonte da aplicação

- `public/` — ativos estáticos públicos

- `vite.config.ts` — configuração do Vite

- `tsconfig.json` — configuração do TypeScript

- `tailwind.config.js` — configuração do Tailwind CSS



## Observações



- Certifique-se de usar a mesma versão do Node.js especificada acima para evitar problemas com dependências.

- Caso use `yarn` ou `pnpm`, substitua os comandos `npm` pelos equivalentes. 
