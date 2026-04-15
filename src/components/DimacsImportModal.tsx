import React, { useState } from "react";
import { parseDimacsFormat } from "../utils/dimacsParser";
import type { DimacsGraph } from "../types";

interface DimacsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (graph: DimacsGraph) => void;
}

export const DimacsImportModal: React.FC<DimacsImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "manual">("file");
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const graph = parseDimacsFormat(content);
      onImport(graph);
      resetModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar arquivo DIMACS",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualImport = () => {
    if (!manualInput.trim()) {
      setError("Campo de entrada está vazio");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const graph = parseDimacsFormat(manualInput);
      onImport(graph);
      resetModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar entrada DIMACS",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setManualInput("");
    setError(null);
    setActiveTab("file");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ponto-dark rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-ponto-darker px-6 py-4 border-b border-ponto-muted flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">
            Importar Grafo DIMACS
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-ponto-accent text-2xl leading-none transition"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6 border-b border-ponto-muted">
            <button
              onClick={() => {
                setActiveTab("file");
                setError(null);
              }}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "file"
                  ? "text-ponto-accent border-b-2 border-ponto-accent"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload de Arquivo
            </button>
            <button
              onClick={() => {
                setActiveTab("manual");
                setError(null);
              }}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "manual"
                  ? "text-ponto-accent border-b-2 border-ponto-accent"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Entrada Manual
            </button>
          </div>

          {activeTab === "file" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-ponto-muted rounded-lg p-8 text-center hover:border-ponto-accent/50 transition">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="dimacs-file-input"
                />
                <label
                  htmlFor="dimacs-file-input"
                  className="cursor-pointer block"
                >
                  <div className="text-ponto-muted text-5xl mb-2">📄</div>
                  <p className="text-slate-100 font-medium">
                    Clique para selecionar um arquivo .txt
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    ou arraste e solte aqui
                  </p>
                </label>
              </div>
              <p className="text-xs text-slate-400">
                Formato: Primeira linha com &lt;numNodes&gt; &lt;numEdges&gt;,
                seguida por arestas no formato &lt;origem&gt; &lt;destino&gt;
                &lt;peso&gt;
              </p>
            </div>
          )}

          {activeTab === "manual" && (
            <div className="space-y-4">
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                disabled={isLoading}
                placeholder={`                            5 6
                            a b 2
                            a d 2
                            b c 5
                            c d 1
                            d e 3
                            e a 4`}
                className="w-full h-48 px-3 py-2 bg-ponto-dark border border-ponto-muted rounded text-slate-100 placeholder-slate-500 focus:outline-none focus:border-ponto-accent focus:ring-1 focus:ring-ponto-accent font-mono text-sm resize-none"
              />
              <p className="text-xs text-slate-400">
                Cole o conteúdo DIMACS aqui. Primeira linha com &lt;numNodes&gt;
                &lt;numEdges&gt; seguido pelas arestas.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              <strong>Erro:</strong> {error}
            </div>
          )}

          <div className="mt-6 p-4 bg-ponto-dark/50 rounded border border-ponto-muted">
            <h3 className="text-slate-100 font-medium mb-2">Exemplo:</h3>
            <pre className="text-xs text-slate-200 font-mono overflow-x-auto">
              {`                5 6
                a b 2
                a d 2
                b c 5
                c d 1
                d e 3
                e a 4`}
            </pre>
            <p className="text-xs text-slate-400 mt-2">
              5 vértices (a, b, c, d, e) e 6 arestas direcionadas com pesos
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-slate-300 bg-ponto-dark hover:bg-ponto-muted/50 border border-ponto-muted rounded transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={
                activeTab === "file"
                  ? () => {
                      const input = document.getElementById(
                        "dimacs-file-input",
                      ) as HTMLInputElement;
                      input?.click();
                    }
                  : handleManualImport
              }
              disabled={
                isLoading || (activeTab === "manual" && !manualInput.trim())
              }
              className="px-4 py-2 bg-ponto-accent hover:bg-ponto-accent/90 text-ponto-darker font-medium rounded transition disabled:opacity-50"
            >
              {isLoading ? "Processando..." : "Importar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
