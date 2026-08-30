import React, { useState } from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Terminal, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2,
  AlertTriangle,
  Server
} from 'lucide-react';
import { GatewayHealth, Agent } from '../types';

interface HeaderProps {
  health: GatewayHealth;
  activeAgent: Agent;
  onResetSession?: () => void;
  onTriggerDream?: () => void;
  onEmergencyStop?: () => void;
  isStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  health,
  activeAgent,
  onResetSession,
  onTriggerDream,
  onEmergencyStop,
  isStreaming = false
}) => {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <header className="h-16 bg-zinc-900/90 border-b border-zinc-800/80 px-4 md:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
      {/* Brand & Project */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-white font-bold text-lg tracking-wider border border-emerald-400/30">
          K
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
              KAIROS
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Core v{health.version.split('-')[0]}
              </span>
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-medium hidden sm:block">
            Autonomous Agent Gateway & Control Plane
          </p>
        </div>
      </div>

      {/* Center Status / Live Stats */}
      <div className="hidden lg:flex items-center gap-4 bg-zinc-950/60 px-3 py-1.5 rounded-full border border-zinc-800/70 text-xs">
        <button 
          onClick={() => setShowStatusModal(true)}
          className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400">Gateway Live</span>
          <span className="text-zinc-500 font-mono">({health.rpcLatencyMs}ms)</span>
        </button>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Server className="w-3.5 h-3.5 text-zinc-500" />
          <span>Heap:</span>
          <span className="font-mono text-zinc-200">{health.memoryUsageMb} MB</span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Activity className="w-3.5 h-3.5 text-zinc-500" />
          <span>Uptime:</span>
          <span className="font-mono text-zinc-200">{formatUptime(health.uptimeSeconds)}</span>
        </div>

        <div className="h-3 w-px bg-zinc-800" />

        <div className="flex items-center gap-1.5 text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-zinc-500" />
          <span>Sockets:</span>
          <span className="font-mono text-emerald-400 font-semibold">{health.activeSockets} active</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Active Agent Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs">
          <span className="text-base">{activeAgent.avatar}</span>
          <div className="text-left">
            <div className="font-semibold text-zinc-200">{activeAgent.name}</div>
            <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[110px]">
              {activeAgent.model.split('/')[1] || activeAgent.model}
            </div>
          </div>
        </div>

        {/* Emergency Stop / Stream Indicator */}
        {isStreaming ? (
          <button
            onClick={onEmergencyStop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Stop Agent</span>
          </button>
        ) : (
          <button
            onClick={onTriggerDream}
            title="Trigger background memory distillation"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dream Cycle</span>
          </button>
        )}
      </div>

      {/* Gateway Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-zinc-100">Gateway Topology & Health</h3>
              </div>
              <button 
                onClick={() => setShowStatusModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm px-2 py-1 rounded bg-zinc-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">WebSocket Transport:</span>
                  <span className="text-emerald-400 font-mono font-semibold">ws://127.0.0.1:18789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Auth Handshake:</span>
                  <span className="text-zinc-200 font-mono">Token (SecretRef Enforced)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tailscale Serve:</span>
                  <span className="text-emerald-400 font-mono">Active (magicdns identity verified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Memory Engine:</span>
                  <span className="text-zinc-200 font-mono">LanceDB (Vector Embedding Index)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800 text-center">
                  <div className="text-zinc-400 text-[11px]">Heartbeat Latency</div>
                  <div className="text-base font-bold text-emerald-400 font-mono">{health.rpcLatencyMs} ms</div>
                </div>
                <div className="p-2.5 bg-zinc-950/60 rounded-lg border border-zinc-800 text-center">
                  <div className="text-zinc-400 text-[11px]">Paired Operators</div>
                  <div className="text-base font-bold text-zinc-100 font-mono">{health.pairedDevicesCount} Devices</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs transition"
              >
                Dismiss Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
