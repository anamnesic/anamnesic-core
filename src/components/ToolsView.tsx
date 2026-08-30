import React, { useState } from 'react';
import { 
  Wrench, 
  Terminal, 
  Play, 
  Check, 
  AlertTriangle, 
  FileCode, 
  GitBranch, 
  Search, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { ToolDefinition } from '../types';

interface ToolsViewProps {
  tools: ToolDefinition[];
  onToggleTool: (toolId: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ tools, onToggleTool }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0].id);
  const [testArgInput, setTestArgInput] = useState<string>('kairos doctor --check=ws,lancedb');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedTool = tools.find(t => t.id === selectedToolId) || tools[0];

  const handleRunTool = () => {
    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      setIsRunning(false);
      if (selectedTool.id === 'bash') {
        setTestResult(`$ ${testArgInput}\n\n[KAIROS Sandbox Exec]\n✓ Node: v22.14.0\n✓ Host architecture: x86_64-linux\n✓ Sandbox memory limit: 512MB\n✓ Gateway RPC endpoint: http://localhost:18789 (healthy)\n✓ Active permissions: safe-mode (network allowed, root blocked)`);
      } else if (selectedTool.id === 'fs.read') {
        setTestResult(`// Contents of ${testArgInput}\n{\n  "name": "@kairos/workspace",\n  "status": "synchronized",\n  "engines": { "node": ">=22" }\n}`);
      } else if (selectedTool.id === 'lsp.diagnostics') {
        setTestResult(`✓ 0 errors, 0 warnings in ${testArgInput}\n✓ AST symbols resolved: 142\n✓ Type-check passed.`);
      } else {
        setTestResult(`✓ Tool [${selectedTool.id}] completed successfully.\nArguments: ${testArgInput}\nTimestamp: ${new Date().toISOString()}`);
      }
    }, 600);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] bg-zinc-950 overflow-hidden">
      {/* Left: Tool Registry Catalog */}
      <div className="w-full md:w-80 border-r border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>Sandbox Tools ({tools.length})</span>
          </h2>
        </div>

        <div className="space-y-2">
          {tools.map((t) => {
            const isSelected = t.id === selectedToolId;

            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedToolId(t.id);
                  if (t.id === 'bash') setTestArgInput('kairos doctor --check=ws,lancedb');
                  else if (t.id === 'fs.read') setTestArgInput('/package.json');
                  else if (t.id === 'lsp.diagnostics') setTestArgInput('/src/types.ts');
                  else setTestArgInput('{"query": "Effect v4 migration"}');
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? 'bg-zinc-800 border-emerald-500/50 text-white shadow-md'
                    : 'bg-zinc-950/60 border-zinc-800/70 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-emerald-400">{t.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                    t.riskLevel === 'high' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                    t.riskLevel === 'medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {t.riskLevel}
                  </span>
                </div>
                <div className="font-semibold text-xs text-zinc-200 mt-1">{t.name}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{t.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Tool Inspector & Live Sandbox Executor */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-lg text-emerald-400">{selectedTool.id}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                Category: {selectedTool.category}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{selectedTool.description}</p>
          </div>

          <button
            onClick={() => onToggleTool(selectedTool.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition ${
              selectedTool.enabled
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {selectedTool.enabled ? 'Enabled in Policy' : 'Disabled'}
          </button>
        </div>

        {/* Schema Parameters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
            Parameter Contract
          </h3>
          <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="p-3">Param Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Required</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {selectedTool.parameters.map((p) => (
                  <tr key={p.name} className="hover:bg-zinc-900/40">
                    <td className="p-3 font-semibold text-emerald-400">{p.name}</td>
                    <td className="p-3 text-zinc-400">{p.type}</td>
                    <td className="p-3">
                      {p.required ? (
                        <span className="text-amber-400 font-semibold">true</span>
                      ) : (
                        <span className="text-zinc-400">false</span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-300 font-sans">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interactive Sandbox Test Runner */}
        <div className="p-5 bg-zinc-900/40 rounded-xl border border-zinc-800 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Interactive Sandbox Execution</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">Simulate Tool Call</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400 block font-mono">Command / Payload Input:</label>
            <input
              type="text"
              value={testArgInput}
              onChange={(e) => setTestArgInput(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-100 text-xs rounded-lg p-2.5 border border-zinc-700 font-mono focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunTool}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'Executing Sandbox...' : 'Run Tool Test'}</span>
            </button>
          </div>

          {/* Test Output */}
          {testResult && (
            <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
              <div className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                Execution Output (stdout / stderr):
              </div>
              <pre className="p-3 bg-zinc-950 rounded-lg text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap border border-zinc-800">
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
