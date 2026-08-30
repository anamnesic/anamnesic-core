import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { RuntimeView } from './components/RuntimeView';
import { GatewayView } from './components/GatewayView';
import { ModelsView } from './components/ModelsView';
import { ToolsView } from './components/ToolsView';
import { PolicyView } from './components/PolicyView';
import { ApprovalsView } from './components/ApprovalsView';
import { SpecLockView } from './components/SpecLockView';
import { AuditView } from './components/AuditView';
import { ConfigView } from './components/ConfigView';

import { 
  TabType, 
  Agent, 
  Session, 
  AgentRun, 
  ModelCapability, 
  ToolDefinition, 
  PolicyRule, 
  ApprovalRequest, 
  AuditEvent, 
  SpecLock, 
  MutationTransaction, 
  ControlPlaneHealth 
} from './types';

import { 
  INITIAL_AGENTS, 
  INITIAL_SESSIONS, 
  INITIAL_MODELS, 
  INITIAL_TOOLS, 
  INITIAL_POLICIES, 
  INITIAL_APPROVALS, 
  INITIAL_SPEC_LOCKS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_HEALTH 
} from './data/mockData';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('runtime');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(INITIAL_SESSIONS[0].id);
  const [models, setModels] = useState<ModelCapability[]>(INITIAL_MODELS);
  const [defaultModelId, setDefaultModelId] = useState<string>(INITIAL_MODELS[0].id);
  const [tools, setTools] = useState<ToolDefinition[]>(INITIAL_TOOLS);
  const [policies, setPolicies] = useState<PolicyRule[]>(INITIAL_POLICIES);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(INITIAL_APPROVALS);
  const [specLocks, setSpecLocks] = useState<SpecLock[]>(INITIAL_SPEC_LOCKS);
  const [transactions, setTransactions] = useState<MutationTransaction[]>(INITIAL_TRANSACTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS);
  const [health, setHealth] = useState<ControlPlaneHealth>(INITIAL_HEALTH);

  const activeSession = sessions.find(s => s.id === selectedSessionId) || sessions[0];
  const activeRun = activeSession.runs[0];

  // Handlers for interactive actions
  const handleExecuteNewTask = (task: string, agentId: string, modelId: string) => {
    const newRunId = `run-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRun: AgentRun = {
      id: newRunId,
      sessionId: activeSession.id,
      agentId,
      task,
      state: 'COMPLETE',
      modelId,
      currentStepIndex: 3,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      budget: {
        maxModelCalls: 40,
        modelCallsUsed: 4,
        maxToolCalls: 150,
        toolCallsUsed: 8,
        maxRepairCycles: 5,
        repairCyclesUsed: 0,
        maxChangedFiles: 20,
        changedFilesCount: 1,
        maxRuntimeSeconds: 1800,
        runtimeSecondsUsed: 140,
        tokenBudget: 200000,
        tokensUsed: 16200
      },
      plan: [
        {
          id: `step-${Date.now()}-1`,
          order: 1,
          objective: 'Inspect AST structures and construct Spec Lock for target modules.',
          intendedMutations: [],
          validationStrategy: 'Spec lock validator check against invariant rules.',
          expectedOutcome: 'Zero symbol drift verified.',
          status: 'passed'
        },
        {
          id: `step-${Date.now()}-2`,
          order: 2,
          objective: `Execute mutation: ${task.slice(0, 60)}...`,
          intendedMutations: ['src/core/router.rs'],
          validationStrategy: 'Spec lock pre-commit validator.',
          expectedOutcome: 'Mutation staged inside transaction.',
          status: 'passed'
        },
        {
          id: `step-${Date.now()}-3`,
          order: 3,
          objective: 'Run 6-stage Verification Pipeline.',
          intendedMutations: [],
          validationStrategy: 'cargo check && cargo test',
          expectedOutcome: 'All tests green.',
          status: 'passed'
        }
      ],
      verification: {
        id: `pipe-${newRunId}`,
        runId: newRunId,
        status: 'passed',
        repairAttempt: 0,
        maxRepairCycles: 5,
        stages: activeRun.verification.stages
      }
    };

    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          activeRunId: newRunId,
          runs: [newRun, ...s.runs]
        };
      }
      return s;
    }));

    // Add audit log
    const newAudit: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'agent.run_completed',
      identity: activeSession.identity,
      sessionId: activeSession.id,
      agentId,
      result: 'SUCCESS',
      details: { task, run_id: newRunId, model: modelId }
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    const target = approvals.find(a => a.id === id);
    if (target) {
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'approval.approved',
          identity: 'usr_operator_admin',
          sessionId: activeSession.id,
          agentId: target.agentName,
          tool: target.toolId,
          resource: target.targetResource,
          result: 'APPROVED',
          details: { approval_id: id }
        },
        ...prev
      ]);
    }
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    const target = approvals.find(a => a.id === id);
    if (target) {
      setAuditLogs(prev => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'approval.rejected',
          identity: 'usr_operator_admin',
          sessionId: activeSession.id,
          agentId: target.agentName,
          tool: target.toolId,
          resource: target.targetResource,
          result: 'DENIED',
          details: { approval_id: id }
        },
        ...prev
      ]);
    }
  };

  const handleToggleModelStatus = (id: string) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'online' ? 'offline' : 'online' } : m));
  };

  const handleToggleTool = (id: string) => {
    setTools(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const handleRollbackTransaction = (txId: string) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'rolled_back' } : tx));
    setAuditLogs(prev => [
      {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: 'transaction.rolled_back',
        identity: 'usr_operator_admin',
        sessionId: activeSession.id,
        agentId: 'agt-core-architect',
        result: 'SUCCESS',
        details: { tx_id: txId, reason: 'Manual operator snapshot rollback' }
      },
      ...prev
    ]);
  };

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        pendingApprovalsCount={pendingApprovalsCount}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header health={health} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {currentTab === 'runtime' && (
            <RuntimeView
              agents={agents}
              activeRun={activeRun}
              onExecuteNewTask={handleExecuteNewTask}
              specLocks={specLocks}
            />
          )}

          {currentTab === 'gateway' && (
            <GatewayView
              sessions={sessions}
              agents={agents}
              onSelectSession={setSelectedSessionId}
              selectedSessionId={selectedSessionId}
            />
          )}

          {currentTab === 'models' && (
            <ModelsView
              models={models}
              onToggleModelStatus={handleToggleModelStatus}
              defaultModelId={defaultModelId}
              onSetDefaultModel={setDefaultModelId}
            />
          )}

          {currentTab === 'tools' && (
            <ToolsView
              tools={tools}
              onToggleTool={handleToggleTool}
            />
          )}

          {currentTab === 'policy' && (
            <PolicyView
              policies={policies}
              onTogglePolicy={handleTogglePolicy}
              onAddPolicy={(newPol) => {
                setPolicies(prev => [...prev, { ...newPol, id: `pol-${Date.now()}`, order: prev.length + 1 }]);
              }}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalsView
              approvals={approvals}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}

          {currentTab === 'speclock' && (
            <SpecLockView
              specLocks={specLocks}
              transactions={transactions}
              onRollbackTransaction={handleRollbackTransaction}
              onAddNewSpecLock={(lock) => setSpecLocks(prev => [...prev, lock])}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView logs={auditLogs} />
          )}

          {currentTab === 'config' && (
            <ConfigView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
