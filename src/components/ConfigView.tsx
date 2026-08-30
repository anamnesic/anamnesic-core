import React, { useState } from 'react';
import { 
  Settings2, 
  Code, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Lock, 
  FileJson,
  ShieldCheck
} from 'lucide-react';

interface ConfigViewProps {
  config: any;
  onSaveConfig: (newConfig: any) => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ config, onSaveConfig }) => {
  const [mode, setMode] = useState<'form' | 'raw'>('form');
  const [rawText, setRawText] = useState<string>(JSON.stringify(config, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState(false);

  // Form State
  const [gatewayBind, setGatewayBind] = useState(config.gateway?.bind || '0.0.0.0');
  const [gatewayPort, setGatewayPort] = useState(config.gateway?.port || 18789);
  const [authMode, setAuthMode] = useState(config.gateway?.auth?.mode || 'token');
  const [allowTailscale, setAllowTailscale] = useState(config.gateway?.auth?.allowTailscale ?? true);
  const [embedSandbox, setEmbedSandbox] = useState(config.gateway?.controlUi?.embedSandbox || 'scripts');
  const [memoryEngine, setMemoryEngine] = useState(config.memory?.engine || 'lancedb');
  const [dreamingEnabled, setDreamingEnabled] = useState(config.memory?.dreamingEnabled ?? true);
  const [compactionThreshold, setCompactionThreshold] = useState(config.agents?.defaults?.compactionThreshold ?? 0.95);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...config,
      gateway: {
        ...config.gateway,
        bind: gatewayBind,
        port: gatewayPort,
        auth: {
          ...config.gateway?.auth,
          mode: authMode,
          allowTailscale
        },
        controlUi: {
          ...config.gateway?.controlUi,
          embedSandbox
        }
      },
      agents: {
        ...config.agents,
        defaults: {
          ...config.agents?.defaults,
          compactionThreshold
        }
      },
      memory: {
        ...config.memory,
        engine: memoryEngine,
        dreamingEnabled
      }
    };

    onSaveConfig(updated);
    setRawText(JSON.stringify(updated, null, 2));
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSaveRaw = () => {
    try {
      const parsed = JSON.parse(rawText);
      setJsonError(null);
      onSaveConfig(parsed);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2000);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-zinc-950 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-emerald-400" />
            <span>KAIROS System Configuration (~/.kairos/kairos.json)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Schema-validated configuration with SecretRef resolution, base-hash guard, and dynamic hot-reload.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setMode('form')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                mode === 'form' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400'
              }`}
            >
              Schema Form
            </button>
            <button
              onClick={() => setMode('raw')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                mode === 'raw' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400'
              }`}
            >
              Raw JSON
            </button>
          </div>

          <button
            onClick={mode === 'form' ? handleSaveForm : handleSaveRaw}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            {saveToast ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saveToast ? 'Applied & Restarted' : 'Save & Hot-Apply'}</span>
          </button>
        </div>
      </div>

      {/* SecretRef Notice */}
      <div className="p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>SecretRef Guard:</strong> Sensitive API keys are never stored plain-text in JSON; active refs are dynamically resolved via container environment.
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400 font-semibold">Active</span>
      </div>

      {mode === 'form' ? (
        <form onSubmit={handleSaveForm} className="max-w-3xl space-y-6">
          {/* Gateway Section */}
          <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider text-xs">
              Gateway Daemon & Transports
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Host Ingress Bind</label>
                <input
                  type="text"
                  value={gatewayBind}
                  onChange={(e) => setGatewayBind(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono rounded-lg p-2.5 border border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Gateway Port</label>
                <input
                  type="number"
                  value={gatewayPort}
                  onChange={(e) => setGatewayPort(parseInt(e.target.value))}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono rounded-lg p-2.5 border border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Auth Mode</label>
                <select
                  value={authMode}
                  onChange={(e) => setAuthMode(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono rounded-lg p-2.5 border border-zinc-700"
                >
                  <option value="token">Token (Bearer SecretRef)</option>
                  <option value="trusted-proxy">Trusted Proxy (Tailscale)</option>
                  <option value="password">Password Authentication</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Embed Sandbox Policy</label>
                <select
                  value={embedSandbox}
                  onChange={(e) => setEmbedSandbox(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono rounded-lg p-2.5 border border-zinc-700"
                >
                  <option value="scripts">Scripts Allowed (Default)</option>
                  <option value="strict">Strict (No script execution)</option>
                  <option value="trusted">Trusted (Same-origin granted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Memory & Compaction Section */}
          <div className="p-5 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider text-xs">
              Memory Engine & Context Thresholds
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-400 font-semibold block mb-1">Vector Storage Backend</label>
                <select
                  value={memoryEngine}
                  onChange={(e) => setMemoryEngine(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 font-mono rounded-lg p-2.5 border border-zinc-700"
                >
                  <option value="lancedb">LanceDB (High performance vector index)</option>
                  <option value="sqlite">SQLite Vector</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 font-semibold block mb-1">
                  Auto-Compaction Threshold ({Math.round(compactionThreshold * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.99"
                  step="0.01"
                  value={compactionThreshold}
                  onChange={(e) => setCompactionThreshold(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 mt-2"
                />
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3 max-w-4xl">
          {jsonError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{jsonError}</span>
            </div>
          )}

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={22}
            className="w-full bg-zinc-950 text-emerald-300 font-mono text-xs p-4 rounded-xl border border-zinc-800 focus:border-emerald-500 leading-relaxed"
          />
        </div>
      )}
    </div>
  );
};
