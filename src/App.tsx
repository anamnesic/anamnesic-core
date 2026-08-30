import React, { useState } from 'react';
import { 
  TabType, 
  Agent, 
  Session, 
  Channel, 
  DevicePairing, 
  CronJob, 
  ToolDefinition, 
  DreamEntry, 
  LogEntry, 
  GatewayHealth,
  ChatMessage,
  ToolCall
} from './types';
import { 
  INITIAL_AGENTS, 
  INITIAL_SESSIONS, 
  INITIAL_CHANNELS, 
  INITIAL_PAIRINGS, 
  INITIAL_CRON_JOBS, 
  INITIAL_TOOLS, 
  INITIAL_DREAMS, 
  INITIAL_LOGS, 
  INITIAL_HEALTH, 
  INITIAL_CONFIG 
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { AgentsView } from './components/AgentsView';
import { ChannelsView } from './components/ChannelsView';
import { ToolsView } from './components/ToolsView';
import { CronView } from './components/CronView';
import { MemoryView } from './components/MemoryView';
import { LogsView } from './components/LogsView';
import { ConfigView } from './components/ConfigView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>(INITIAL_SESSIONS[0].id);
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [pairings, setPairings] = useState<DevicePairing[]>(INITIAL_PAIRINGS);
  const [cronJobs, setCronJobs] = useState<CronJob[]>(INITIAL_CRON_JOBS);
  const [tools, setTools] = useState<ToolDefinition[]>(INITIAL_TOOLS);
  const [dreams, setDreams] = useState<DreamEntry[]>(INITIAL_DREAMS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [health, setHealth] = useState<GatewayHealth>(INITIAL_HEALTH);
  const [config, setConfig] = useState<any>(INITIAL_CONFIG);
  const [isStreaming, setIsStreaming] = useState(false);

  // Active Session and Agent
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const currentAgent = agents.find(a => a.id === currentSession.agentId) || agents[0];

  // Helper to add system log
  const addLog = (level: LogEntry['level'], source: string, message: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      source,
      message
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Switch agent in active session
  const handleSelectAgent = (agentId: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return { ...s, agentId };
      }
      return s;
    }));
    addLog('INFO', 'session:patch', `Active agent for session [${activeSessionId}] switched to ${agentId}`);
  };

  // Send Message & trigger realistic autonomous agent tool execution loop
  const handleSendMessage = (content: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content,
      timestamp: new Date().toLocaleTimeString()
    };

    // Append user message immediately
    const updatedMessages = [...currentSession.messages, userMsg];
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: updatedMessages,
          updatedAt: new Date().toLocaleTimeString(),
          tokenUsage: s.tokenUsage + 180
        };
      }
      return s;
    }));

    setIsStreaming(true);
    addLog('INFO', `agent:${currentAgent.id}`, `Run dispatched (prompt: "${content.slice(0, 40)}...")`);

    // Simulate multi-step tool execution based on the user request
    setTimeout(() => {
      let toolCalls: ToolCall[] = [];
      let replyContent = '';

      if (content.toLowerCase().includes('gateway') || content.toLowerCase().includes('health')) {
        toolCalls = [
          {
            id: `tc-${Date.now()}-1`,
            name: 'bash',
            args: { command: 'kairos gateway doctor --status' },
            result: '✓ Ingress 0.0.0.0:18789 listening\n✓ Sockets active: 4 (Discord, Telegram, Slack, Matrix)\n✓ Ping RTT: 4.2ms\n✓ SecretRef resolution: 100% valid',
            status: 'completed',
            durationMs: 240
          }
        ];
        replyContent = `I inspected the KAIROS Gateway Daemon. All 4 messaging adapters are connected and exchanging WebSocket heartbeats. RPC latency is nominal at 4.2ms with zero token degradation.`;
      } else if (content.toLowerCase().includes('audit') || content.toLowerCase().includes('secret')) {
        toolCalls = [
          {
            id: `tc-${Date.now()}-1`,
            name: 'secret.scan',
            args: { target: '/config/plugins/', depth: 3 },
            result: 'Audited 14 manifest configurations.\n✓ No plain text API keys detected.\n✓ 100% SecretRef encapsulation confirmed.',
            status: 'completed',
            durationMs: 190
          }
        ];
        replyContent = `Security audit verified: All active plugin credentials are encapsulated within dynamic \`SecretRef\` constructs and guarded against transcript leaks.`;
      } else if (content.toLowerCase().includes('ast') || content.toLowerCase().includes('diagnostic')) {
        toolCalls = [
          {
            id: `tc-${Date.now()}-1`,
            name: 'lsp.diagnostics',
            args: { file: '/terminal/extensions/acpx/src/service.ts' },
            result: '✓ 0 errors, 0 warnings\n✓ Type-check passed against Effect v4 beta specification.',
            status: 'completed',
            durationMs: 310
          }
        ];
        replyContent = `LSP AST compilation check finished. Zero type errors found across the ACPX extension module boundary.`;
      } else if (content.toLowerCase().includes('synthesize') || content.toLowerCase().includes('memory')) {
        toolCalls = [
          {
            id: `tc-${Date.now()}-1`,
            name: 'memory.store',
            args: { vectors: 3, store: 'lancedb' },
            result: '✓ 3 new semantic nodes indexed into LanceDB active memory graph.',
            status: 'completed',
            durationMs: 140
          }
        ];
        replyContent = `Session key insights have been distilled into LanceDB vector memory for cross-agent recall.`;
      } else {
        toolCalls = [
          {
            id: `tc-${Date.now()}-1`,
            name: 'bash',
            args: { command: `echo "Processing agent turn with ${currentAgent.model}"` },
            result: `✓ Command executed in sandbox environment.`,
            status: 'completed',
            durationMs: 110
          }
        ];
        replyContent = `I have processed your request using ${currentAgent.name} (${currentAgent.model}). All constraints are maintained according to the KAIROS runtime policy.`;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-resp`,
        sender: 'assistant',
        agentId: currentAgent.id,
        agentName: currentAgent.name,
        content: replyContent,
        timestamp: new Date().toLocaleTimeString(),
        toolCalls,
        tokenCount: { prompt: 1200, completion: 340, total: 1540 }
      };

      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMsg],
            tokenUsage: s.tokenUsage + 1540
          };
        }
        return s;
      }));

      setIsStreaming(false);
      addLog('INFO', `tool:${toolCalls[0].name}`, `Tool call finished in ${toolCalls[0].durationMs}ms`);
    }, 1200);
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    setIsStreaming(false);
    addLog('WARN', 'agent:abort', `User triggered /stop — active run aborted`);
  };

  // Compact session transcript
  const handleCompactSession = () => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        const preserved = s.messages.slice(-2);
        const summaryMsg: ChatMessage = {
          id: `compact-${Date.now()}`,
          sender: 'system',
          content: `[KAIROS Auto-Compaction]: Pruned earlier ${s.messages.length - 2} messages. Key architectural context was vectorized and saved to LanceDB. Context utilization restored to safe threshold.`,
          timestamp: new Date().toLocaleTimeString()
        };
        return {
          ...s,
          messages: [summaryMsg, ...preserved],
          tokenUsage: 4500
        };
      }
      return s;
    }));
    addLog('INFO', 'session:compact', `Session [${activeSessionId}] successfully compacted`);
  };

  // Create new session
  const handleNewSession = () => {
    const newSess: Session = {
      id: `sess-${Date.now().toString(36)}`,
      agentId: 'coder',
      title: `Agent Task #${sessions.length + 1}`,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleTimeString(),
      tokenUsage: 0,
      maxTokens: 200000,
      tags: ['workspace'],
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          agentId: 'coder',
          agentName: 'Forge Coder',
          content: 'KAIROS Agent runtime initialized. I am ready to inspect files, execute sandbox commands, and coordinate gateway channels.',
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    setActiveTab('chat');
    addLog('INFO', 'session:create', `Created new session ${newSess.id}`);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    const remaining = sessions.filter(s => s.id !== id);
    setSessions(remaining);
    if (activeSessionId === id) {
      setActiveSessionId(remaining[0].id);
    }
  };

  // Update Agent
  const handleUpdateAgent = (updated: Agent) => {
    setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
    addLog('INFO', 'agents:update', `Updated config for agent [${updated.name}]`);
  };

  // Trigger Dream Cycle
  const handleTriggerDreamCycle = () => {
    const newDream: DreamEntry = {
      id: `dream-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      title: `Manual Dream Cycle: Autonomous Knowledge Distillation`,
      summary: `Analyzed active session transcripts. Indexed 24 new semantic relations into LanceDB and optimized token compaction boundaries.`,
      insights: [
        'Confirmed that WebSocket token streaming maintains high responsiveness under heavy agent concurrency.',
        'Validated that SecretRef resolution safeguards container secrets.'
      ],
      prunedSessionsCount: 4,
      distilledKnowledge: [
        'LanceDB indexing latency: < 12ms per batch',
        'Heartbeat timeout floor: 15s'
      ]
    };

    setDreams([newDream, ...dreams]);
    addLog('INFO', 'dream:cycle', `Autonomous dream cycle synthesized and saved to diary`);
  };

  // Approve Pairing
  const handleApprovePairing = (requestId: string) => {
    setPairings(prev => prev.map(p => p.requestId === requestId ? { ...p, status: 'approved' } : p));
    setHealth(prev => ({ ...prev, pairedDevicesCount: prev.pairedDevicesCount + 1 }));
    addLog('INFO', 'devices:approve', `Approved device pairing request [${requestId}]`);
  };

  // Revoke Pairing
  const handleRevokePairing = (requestId: string) => {
    setPairings(prev => prev.map(p => p.requestId === requestId ? { ...p, status: 'revoked' } : p));
    setHealth(prev => ({ ...prev, pairedDevicesCount: Math.max(0, prev.pairedDevicesCount - 1) }));
    addLog('WARN', 'devices:revoke', `Revoked device pairing [${requestId}]`);
  };

  // Toggle Channel
  const handleToggleChannel = (channelId: string) => {
    setChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        const nextStatus = ch.status === 'connected' ? 'disconnected' : 'connected';
        return { ...ch, status: nextStatus };
      }
      return ch;
    }));
  };

  // Toggle Tool
  const handleToggleTool = (toolId: string) => {
    setTools(prev => prev.map(t => t.id === toolId ? { ...t, enabled: !t.enabled } : t));
  };

  // Toggle Cron
  const handleToggleCron = (jobId: string) => {
    setCronJobs(prev => prev.map(j => j.id === jobId ? { ...j, enabled: !j.enabled } : j));
  };

  // Run Cron Now
  const handleRunCronNow = (jobId: string) => {
    setCronJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          lastRun: new Date().toLocaleTimeString(),
          runCount: j.runCount + 1,
          lastStatus: 'success'
        };
      }
      return j;
    }));
    addLog('INFO', 'cron:run', `Triggered scheduled job [${jobId}]`);
  };

  // Add Cron
  const handleAddCron = (job: CronJob) => {
    setCronJobs([job, ...cronJobs]);
    addLog('INFO', 'cron:add', `Added new scheduled task [${job.name}]`);
  };

  // Delete Cron
  const handleDeleteCron = (jobId: string) => {
    setCronJobs(prev => prev.filter(j => j.id !== jobId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased">
      <Header
        health={health}
        activeAgent={currentAgent}
        onResetSession={() => handleCompactSession()}
        onTriggerDream={handleTriggerDreamCycle}
        onEmergencyStop={handleStopStreaming}
        isStreaming={isStreaming}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' && (
            <ChatView
              session={currentSession}
              agents={agents}
              activeAgent={currentAgent}
              onSelectAgent={handleSelectAgent}
              onSendMessage={handleSendMessage}
              onCompactSession={handleCompactSession}
              isStreaming={isStreaming}
              onStopStreaming={handleStopStreaming}
            />
          )}

          {activeTab === 'agents' && (
            <AgentsView
              agents={agents}
              tools={tools}
              onUpdateAgent={handleUpdateAgent}
              onSelectAgentForChat={(agentId) => {
                handleSelectAgent(agentId);
                setActiveTab('chat');
              }}
            />
          )}

          {activeTab === 'channels' && (
            <ChannelsView
              channels={channels}
              pairings={pairings}
              agents={agents}
              onApprovePairing={handleApprovePairing}
              onRevokePairing={handleRevokePairing}
              onToggleChannel={handleToggleChannel}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsView
              tools={tools}
              onToggleTool={handleToggleTool}
            />
          )}

          {activeTab === 'automation' && (
            <CronView
              cronJobs={cronJobs}
              agents={agents}
              onToggleJob={handleToggleCron}
              onRunNow={handleRunCronNow}
              onAddJob={handleAddCron}
              onDeleteJob={handleDeleteCron}
            />
          )}

          {activeTab === 'memory' && (
            <MemoryView
              dreams={dreams}
              onTriggerDreamCycle={handleTriggerDreamCycle}
            />
          )}

          {activeTab === 'logs' && (
            <LogsView
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          )}

          {activeTab === 'config' && (
            <ConfigView
              config={config}
              onSaveConfig={(newCfg) => {
                setConfig(newCfg);
                addLog('INFO', 'config:apply', 'Hot-applied new configuration payload with base-hash guard');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
