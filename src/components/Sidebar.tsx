import React from 'react';
import { 
  MessageSquareCode, 
  Bot, 
  Share2, 
  Wrench, 
  Clock, 
  BrainCircuit, 
  ScrollText, 
  Settings2, 
  Plus, 
  Trash2,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { TabType, Session } from '../types';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'chat', label: 'Agent Workspace', icon: <MessageSquareCode className="w-4 h-4" /> },
    { id: 'agents', label: 'Agent Fleet', icon: <Bot className="w-4 h-4" />, badge: '4' },
    { id: 'channels', label: 'Channel Gateway', icon: <Share2 className="w-4 h-4" />, badge: '5' },
    { id: 'tools', label: 'Tool Registry & LSP', icon: <Wrench className="w-4 h-4" /> },
    { id: 'automation', label: 'Cron & Clawflow', icon: <Clock className="w-4 h-4" /> },
    { id: 'memory', label: 'Memory & Dream Diary', icon: <BrainCircuit className="w-4 h-4" /> },
    { id: 'logs', label: 'Live Logs & Health', icon: <ScrollText className="w-4 h-4" /> },
    { id: 'config', label: 'KAIROS Config', icon: <Settings2 className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-zinc-900/95 border-r border-zinc-800/80 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-2 py-1">
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="h-px bg-zinc-800 mx-3 my-2" />

      {/* Session History (Available in Chat View) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Agent Sessions
          </span>
          <button
            onClick={onNewSession}
            title="Start New Agent Session"
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition flex items-center gap-1 text-[11px] px-2 font-medium"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        <div className="space-y-1 mt-2">
          {sessions.map((sess) => {
            const isSelected = sess.id === activeSessionId;
            const tokenPercent = Math.min(100, Math.round((sess.tokenUsage / sess.maxTokens) * 100));

            return (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess.id);
                  onSelectTab('chat');
                }}
                className={`group relative p-2.5 rounded-lg border text-left cursor-pointer transition ${
                  isSelected
                    ? 'bg-zinc-800/90 border-emerald-500/40 text-zinc-100 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-800/60 text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-300'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="font-medium text-xs truncate max-w-[170px] text-zinc-200">
                    {sess.title}
                  </div>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(sess.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <div className="flex items-center gap-1">
                    <span>Tokens:</span>
                    <span className={tokenPercent > 80 ? 'text-amber-400 font-semibold' : 'text-zinc-400'}>
                      {(sess.tokenUsage / 1000).toFixed(1)}k
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {tokenPercent}% ctx
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className={`h-full ${
                      tokenPercent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${tokenPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-zinc-950/60 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
        <div className="flex justify-between items-center">
          <span>Protocol</span>
          <span className="font-mono text-emerald-400">WebSocket / RPC</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Target Bind</span>
          <span className="font-mono text-zinc-400">0.0.0.0:18789</span>
        </div>
      </div>
    </aside>
  );
};
