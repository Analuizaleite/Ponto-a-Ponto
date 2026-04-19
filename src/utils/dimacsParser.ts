import type { DimacsGraph } from "../types";

export function parseDimacsFormat(content: string): DimacsGraph {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  const allLines = normalized
    .split("\n")
    .map((line) => line.trim());

  console.log("=== DIMACS Parser Debug ===");
  console.log("Total de linhas após split:", allLines.length);
  console.log("Linhas originais:", allLines.map((l, i) => `[${i}] "${l}"`));

  const lines = allLines.filter((line) => line.length > 0);

  console.log("Linhas após filtro:", lines.length);
  console.log("Linhas filtradas:", lines.map((l, i) => `[${i}] "${l}"`));

  if (lines.length === 0) {
    throw new Error("Arquivo DIMACS vazio");
  }

  const firstLineParts = lines[0].split(/\s+/);
  if (firstLineParts.length !== 2) {
    throw new Error(
      "Primeira linha deve conter: <numNodes> <numEdges>"
    );
  }

  const numNodes = parseInt(firstLineParts[0], 10);
  const numEdges = parseInt(firstLineParts[1], 10);

  console.log(`Esperado: ${numNodes} nós, ${numEdges} arestas`);

  if (isNaN(numNodes) || isNaN(numEdges) || numNodes < 0 || numEdges < 0) {
    throw new Error(
      "numNodes e numEdges devem ser inteiros não-negativos"
    );
  }

  const vertexNameMap = new Map<string, number>(); 
  const vertexIdToName = new Map<number, string>(); 

  const edges: Array<{ source: number; target: number; weight: number }> = [];
  const invalidLines: string[] = [];

  console.log("\n--- Processando arestas ---");
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(/\s+/).filter((p) => p.length > 0); 

    console.log(`Linha ${i}: "${line}" -> partes: [${parts.join(", ")}]`);

    if (parts.length === 0) {
      console.log(`  ⚠️  Ignorada: linha vazia após split`);
      continue;
    }

    if (parts.length !== 3) {
      const msg = `Linha ${i + 1}: "${line}" - esperado 3 valores (origem destino peso), encontrados ${parts.length}`;
      invalidLines.push(msg);
      console.log(`  ❌ ${msg}`);
      continue;
    }

    const [sourceStr, targetStr, weightStr] = parts;
    const weight = parseFloat(weightStr);

    if (isNaN(weight)) {
      const msg = `Linha ${i + 1}: peso inválido "${weightStr}"`;
      invalidLines.push(msg);
      console.log(`  ❌ ${msg}`);
      continue;
    }

    for (const name of [sourceStr, targetStr]) {
      if (!vertexNameMap.has(name)) {
        const newId = vertexNameMap.size + 1;
        vertexNameMap.set(name, newId);
        vertexIdToName.set(newId, name);
      }
    }

    const sourceId = vertexNameMap.get(sourceStr)!;
    const targetId = vertexNameMap.get(targetStr)!;

    edges.push({ source: sourceId, target: targetId, weight });
    console.log(`  ✅ Aresta adicionada: ${sourceStr}(${sourceId}) -> ${targetStr}(${targetId}) [peso: ${weight}]`);
  }

  console.log(`\n--- Resultado final ---`);
  console.log(`Vértices encontrados: ${vertexNameMap.size} (esperado: ${numNodes})`);
  console.log(`Arestas encontradas: ${edges.length} (esperado: ${numEdges})`);
  if (invalidLines.length > 0) {
    console.log("Linhas inválidas:", invalidLines);
  }
  console.log("========================\n");

  if (vertexNameMap.size !== numNodes) {
    const errorDetail = invalidLines.length > 0 
      ? `\nLinhas inválidas:\n${invalidLines.join('\n')}`
      : "";
    throw new Error(
      `Número de vértices não corresponde: esperado ${numNodes}, encontrados ${vertexNameMap.size}${errorDetail}`
    );
  }

  if (edges.length !== numEdges) {
    const errorDetail = invalidLines.length > 0 
      ? `\nLinhas inválidas:\n${invalidLines.join('\n')}`
      : "";
    throw new Error(
      `Número de arestas não corresponde: esperado ${numEdges}, encontradas ${edges.length}${errorDetail}`
    );
  }

  if (invalidLines.length > 0) {
    console.warn("Linhas ignoradas durante parse DIMACS:", invalidLines);
  }

  const identifierTypes = new Set<"number" | "letter">();
  for (const name of vertexNameMap.keys()) {
    if (/^\d+$/.test(name)) {
      identifierTypes.add("number");
    } else if (/^[a-zA-Z]+$/.test(name)) {
      identifierTypes.add("letter");
    } else {
      throw new Error(
        `Identificador inválido: "${name}". Use apenas números (ex: 1, 2) ou letras (ex: a, b)`
      );
    }
  }

  if (identifierTypes.size > 1) {
    throw new Error(
      "Não é permitido misturar números e letras. Use apenas números (1, 2, 3...) ou apenas letras (a, b, c...)"
    );
  }

  const nodes = Array.from({ length: numNodes }, (_, index) => ({
    id: index + 1,
    name: vertexIdToName.get(index + 1)!,
  }));

  return {
    nodeCount: numNodes,
    edgeCount: numEdges,
    nodes,
    edges,
  };
}
