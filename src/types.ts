export type TabType = 
  | 'chat' 
  | 'agents' 
  | 'channels' 
  | 'tools' 
  | 'automation' 
  | 'memory' 
  | 'logs' 
  | 'config';

export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  model: string;
  fallbackModel: string;
  systemPrompt: string;
  tools: string[];
  permissionMode: 'interactive' | 'owner-only' | 'always-allow' | 'yolo';
  contextLimit: number;
  tokensUsed: number;
  temperature: number;
  description: string;
  status: 'idle' | 'running' | 'paused';
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'requires_approval';
  durationMs?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  tokenCount?: {
    prompt: number;
    completion: number;
    total: number;
  };
  isStreaming?: boolean;
}

export interface Session {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  tokenUsage: number;
  maxTokens: number;
  tags: string[];
}

export interface Channel {
  id: string;
  name: string;
  type: 'discord' | 'telegram' | 'slack' | 'matrix' | 'whatsapp' | 'signal' | 'webchat';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  targetAgent: string;
  lastActive: string;
  messagesHandled: number;
  config: {
    webhookUrl?: string;
    botUsername?: string;
    allowedRooms?: string[];
    allowMentionsOnly?: boolean;
  };
}

export interface DevicePairing {
  requestId: string;
  deviceName: string;
  clientIp: string;
  requestedRole: 'operator' | 'node' | 'viewer';
  requestedScopes: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'revoked';
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  agentId: string;
  prompt: string;
  deliveryMode: 'announce' | 'webhook' | 'none';
  targetChannel?: string;
  enabled: boolean;
  lastRun?: string;
  nextRun: string;
  lastStatus?: 'success' | 'failed';
  runCount: number;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: 'system' | 'fs' | 'git' | 'web' | 'ai' | 'automation';
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

export interface DreamEntry {
  id: string;
  timestamp: string;
  title: string;
  summary: string;
  insights: string[];
  prunedSessionsCount: number;
  distilledKnowledge: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';
  source: string;
  message: string;
  details?: Record<string, any>;
}

export interface GatewayHealth {
  status: 'healthy' | 'degraded' | 'offline';
  uptimeSeconds: number;
  memoryUsageMb: number;
  activeSockets: number;
  pairedDevicesCount: number;
  rpcLatencyMs: number;
  version: string;
}
