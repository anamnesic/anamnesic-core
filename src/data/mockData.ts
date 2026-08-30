import { Agent, Session, Channel, DevicePairing, CronJob, ToolDefinition, DreamEntry, LogEntry, GatewayHealth } from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'coder',
    name: 'Forge Coder',
    role: 'Autonomous Software Engineer',
    avatar: '💻',
    color: 'emerald',
    model: 'anthropic/claude-3-7-sonnet',
    fallbackModel: 'google/gemini-2.0-flash',
    systemPrompt: 'You are Forge Coder, a precision autonomous software engineer inside KAIROS. You execute terminal commands, edit source files, perform AST refactoring, and test code changes iteratively before reporting results.',
    tools: ['bash', 'fs.read', 'fs.write', 'git.commit', 'lsp.diagnostics', 'diff.patch'],
    permissionMode: 'interactive',
    contextLimit: 200000,
    tokensUsed: 42150,
    temperature: 0.2,
    description: 'Expert coding assistant with access to bash sandbox, git operations, and LSP AST navigation.',
    status: 'idle'
  },
  {
    id: 'guardian',
    name: 'Security Sentinel',
    role: 'Vulnerability & Policy Triage',
    avatar: '🛡️',
    color: 'amber',
    model: 'google/gemini-2.0-flash',
    fallbackModel: 'openai/gpt-4o-mini',
    systemPrompt: 'You inspect incoming dependencies, audit AST code modifications, scan for secret leaks, and enforce permission boundaries across agent actions.',
    tools: ['secret.scan', 'semgrep.audit', 'fs.read', 'policy.check'],
    permissionMode: 'always-allow',
    contextLimit: 128000,
    tokensUsed: 18900,
    temperature: 0.1,
    description: 'Autonomous security sentinel scanning for CVEs, token leakage, and unauthorized elevated executions.',
    status: 'idle'
  },
  {
    id: 'summarizer',
    name: 'Memory Synthesizer',
    role: 'Context & Dream Worker',
    avatar: '🧠',
    color: 'purple',
    model: 'openai/gpt-4o',
    fallbackModel: 'deepseek/deepseek-r1',
    systemPrompt: 'You analyze session transcripts when context pressure exceeds 90%, synthesize key facts into LanceDB active memory, and write nightly Dream Diary logs.',
    tools: ['memory.store', 'memory.search', 'lancedb.index', 'fs.read'],
    permissionMode: 'always-allow',
    contextLimit: 128000,
    tokensUsed: 31200,
    temperature: 0.4,
    description: 'Compresses long transcripts, updates vector memory stores, and preserves long-term agent identity.',
    status: 'idle'
  },
  {
    id: 'triage',
    name: 'Gateway Orchestrator',
    role: 'Multi-Channel Dispatcher',
    avatar: '⚡',
    color: 'sky',
    model: 'google/gemini-2.0-flash',
    fallbackModel: 'anthropic/claude-3-5-haiku',
    systemPrompt: 'You normalize incoming messages across Discord, Slack, Matrix, and Telegram, resolve agent routing keys, and deliver responses back to the origin channel.',
    tools: ['channel.send', 'session.spawn', 'user.lookup'],
    permissionMode: 'owner-only',
    contextLimit: 128000,
    tokensUsed: 14500,
    temperature: 0.3,
    description: 'Routes inbound messages from all linked chat channels and supervises multi-agent delegation.',
    status: 'idle'
  }
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-bootstrap-892',
    agentId: 'coder',
    title: 'Migrate Gateway WebSocket Transports & Effect runtime',
    createdAt: '2026-08-30 09:15:00',
    updatedAt: '2026-08-30 11:42:10',
    tokenUsage: 42150,
    maxTokens: 200000,
    tags: ['refactor', 'gateway', 'effect-v4'],
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        content: 'Check the status of the KAIROS Gateway WebSocket layer and ensure all channel adapters handle reconnect backoffs gracefully.',
        timestamp: '11:38:12'
      },
      {
        id: 'msg-2',
        sender: 'assistant',
        agentId: 'coder',
        agentName: 'Forge Coder',
        content: 'I will analyze the channel reconnect loops and inspect the WebSocket heartbeat diagnostics across all registered adapters.',
        timestamp: '11:38:15',
        toolCalls: [
          {
            id: 'tc-1',
            name: 'bash',
            args: { command: 'kairos gateway doctor --check=channels,ws' },
            result: '✓ Gateway loopback bound to 0.0.0.0:18789\n✓ Discord socket: CONNECTED (ping: 28ms)\n✓ Telegram polling: ACTIVE\n✓ Slack RTM: CONNECTED\n✓ Memory engine (LanceDB): OK (6,420 vectors)',
            status: 'completed',
            durationMs: 310
          },
          {
            id: 'tc-2',
            name: 'fs.read',
            args: { path: '/gateway/protocol.ts', lines: '1-45' },
            result: '// KAIROS Gateway Protocol v2.4\nexport interface GatewayEnvelope<T> {\n  id: string;\n  topic: "chat" | "presence" | "cron" | "doctor";\n  payload: T;\n  timestamp: number;\n}',
            status: 'completed',
            durationMs: 45
          }
        ],
        tokenCount: { prompt: 1420, completion: 480, total: 1900 }
      },
      {
        id: 'msg-3',
        sender: 'user',
        content: 'Looks clean. Run a quick verification test on the exec approvals policy.',
        timestamp: '11:41:00'
      },
      {
        id: 'msg-4',
        sender: 'assistant',
        agentId: 'coder',
        agentName: 'Forge Coder',
        content: 'I evaluated the exec approvals subsystem. High-risk actions (`rm -rf`, `curl | bash`, token rotation) are strictly bound to Interactive confirmation mode. All safe primitives (read, compile, lint) operate seamlessly.',
        timestamp: '11:42:10',
        tokenCount: { prompt: 2100, completion: 310, total: 2410 }
      }
    ]
  },
  {
    id: 'sess-sec-triage-401',
    agentId: 'guardian',
    title: 'SecretRef Audit & Credential Boundary Validation',
    createdAt: '2026-08-30 08:00:00',
    updatedAt: '2026-08-30 10:15:30',
    tokenUsage: 18900,
    maxTokens: 128000,
    tags: ['security', 'audit', 'secretref'],
    messages: [
      {
        id: 'msg-s1',
        sender: 'user',
        content: 'Run an audit across all active plugin configs to ensure zero hardcoded API keys exist in plain JSON.',
        timestamp: '10:12:00'
      },
      {
        id: 'msg-s2',
        sender: 'assistant',
        agentId: 'guardian',
        agentName: 'Security Sentinel',
        content: 'Audit complete. All sensitive tokens are securely encapsulated within dynamic `SecretRef` objects mapped to container environment variables.',
        timestamp: '10:15:30',
        toolCalls: [
          {
            id: 'tc-sec-1',
            name: 'secret.scan',
            args: { target: '/config/plugins/' },
            result: 'Scanned 14 plugin manifests.\n✓ 0 plain secrets leaked.\n✓ 14 SecretRef mappings verified.',
            status: 'completed',
            durationMs: 180
          }
        ],
        tokenCount: { prompt: 950, completion: 210, total: 1160 }
      }
    ]
  }
];

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'ch-discord-core',
    name: 'Discord Dev Ops',
    type: 'discord',
    status: 'connected',
    targetAgent: 'coder',
    lastActive: '2 mins ago',
    messagesHandled: 1420,
    config: {
      botUsername: 'ForgeBot#4412',
      allowedRooms: ['#dev-agent', '#prs', '#ops'],
      allowMentionsOnly: true
    }
  },
  {
    id: 'ch-telegram-alerts',
    name: 'Telegram Emergency Ops',
    type: 'telegram',
    status: 'connected',
    targetAgent: 'guardian',
    lastActive: '12 mins ago',
    messagesHandled: 384,
    config: {
      botUsername: '@KairosGuardianBot',
      allowMentionsOnly: false
    }
  },
  {
    id: 'ch-slack-team',
    name: 'Slack Internal Core',
    type: 'slack',
    status: 'connected',
    targetAgent: 'triage',
    lastActive: ' Just now',
    messagesHandled: 2910,
    config: {
      botUsername: 'kairos-dispatch',
      allowedRooms: ['#general', '#eng-support']
    }
  },
  {
    id: 'ch-matrix-crypto',
    name: 'Matrix Encrypted Hub',
    type: 'matrix',
    status: 'connected',
    targetAgent: 'coder',
    lastActive: '45 mins ago',
    messagesHandled: 91,
    config: {
      botUsername: '@kairos:matrix.org'
    }
  },
  {
    id: 'ch-whatsapp-bridge',
    name: 'WhatsApp Business Relay',
    type: 'whatsapp',
    status: 'disconnected',
    targetAgent: 'triage',
    lastActive: '2 days ago',
    messagesHandled: 12,
    config: {
      botUsername: '+1 (555) 019-4829'
    }
  }
];

export const INITIAL_PAIRINGS: DevicePairing[] = [
  {
    requestId: 'req-pair-7819',
    deviceName: 'MacBook Pro (M3 Max - Local)',
    clientIp: '127.0.0.1',
    requestedRole: 'operator',
    requestedScopes: ['chat:write', 'config:write', 'exec:run'],
    createdAt: '2026-08-30 11:30:00',
    status: 'approved'
  },
  {
    requestId: 'req-pair-9042',
    deviceName: 'Mobile Safari (iOS 19.2 - Tailscale)',
    clientIp: '100.84.12.4',
    requestedRole: 'viewer',
    requestedScopes: ['chat:read', 'logs:tail'],
    createdAt: '2026-08-30 12:05:14',
    status: 'pending'
  }
];

export const INITIAL_CRON_JOBS: CronJob[] = [
  {
    id: 'cron-dream-nightly',
    name: 'Autonomous Dream & Knowledge Distillation',
    schedule: '0 3 * * *',
    agentId: 'summarizer',
    prompt: 'Review transcript sessions from the past 24 hours, extract key architectural decisions, update LanceDB active memory, and log a concise summary to the Dream Diary.',
    deliveryMode: 'none',
    enabled: true,
    lastRun: '2026-08-30 03:00:00',
    nextRun: '2026-08-31 03:00:00',
    lastStatus: 'success',
    runCount: 48
  },
  {
    id: 'cron-pr-recap',
    name: 'GitHub Daily PR & Issue Triage Recap',
    schedule: '0 9 * * 1-5',
    agentId: 'coder',
    prompt: 'Fetch open pull requests, detect potential regressions or merge conflicts, and publish a structured executive brief to Discord #dev-agent.',
    deliveryMode: 'announce',
    targetChannel: 'ch-discord-core',
    enabled: true,
    lastRun: '2026-08-30 09:00:00',
    nextRun: '2026-08-31 09:00:00',
    lastStatus: 'success',
    runCount: 112
  },
  {
    id: 'cron-health-sweep',
    name: 'Gateway Liveness & Memory Leak Sweep',
    schedule: '*/30 * * * *',
    agentId: 'guardian',
    prompt: 'Check heap allocations, active WebSocket heartbeat counts, and verify response latency on all plugin endpoints.',
    deliveryMode: 'none',
    enabled: true,
    lastRun: '2026-08-30 12:00:00',
    nextRun: '2026-08-30 12:30:00',
    lastStatus: 'success',
    runCount: 1420
  }
];

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'bash',
    name: 'Sandboxed Bash Execution',
    category: 'system',
    description: 'Execute shell commands inside the container sandbox with output truncation and timeouts.',
    riskLevel: 'high',
    enabled: true,
    parameters: [
      { name: 'command', type: 'string', required: true, description: 'The bash command to execute' },
      { name: 'timeoutMs', type: 'number', required: false, description: 'Execution timeout in ms (default 60000)' }
    ]
  },
  {
    id: 'fs.read',
    name: 'File System Reader',
    category: 'fs',
    description: 'Safely view file contents, slices, and directories within the workspace boundary.',
    riskLevel: 'low',
    enabled: true,
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Workspace relative path' },
      { name: 'lines', type: 'string', required: false, description: 'Slice range e.g. 1-100' }
    ]
  },
  {
    id: 'fs.write',
    name: 'File System Writer',
    category: 'fs',
    description: 'Create or update files with syntax validation and rollback protection.',
    riskLevel: 'medium',
    enabled: true,
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Destination file path' },
      { name: 'content', type: 'string', required: true, description: 'Complete file content to write' }
    ]
  },
  {
    id: 'diff.patch',
    name: 'Unified Diff Patch',
    category: 'fs',
    description: 'Apply targeted hunk edits to code files using unified diff format.',
    riskLevel: 'low',
    enabled: true,
    parameters: [
      { name: 'path', type: 'string', required: true, description: 'Target file path' },
      { name: 'patch', type: 'string', required: true, description: 'Unified diff hunk string' }
    ]
  },
  {
    id: 'lsp.diagnostics',
    name: 'Language Server Protocol Diagnostics',
    category: 'system',
    description: 'Retrieve real-time TypeScript/Go compiler diagnostics and type errors.',
    riskLevel: 'low',
    enabled: true,
    parameters: [
      { name: 'file', type: 'string', required: true, description: 'Source file to inspect' }
    ]
  },
  {
    id: 'gemini.search',
    name: 'Grounded Web Search',
    category: 'web',
    description: 'Retrieve live web results and official library documentation via grounded search.',
    riskLevel: 'low',
    enabled: true,
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'The search query string' }
    ]
  }
];

export const INITIAL_DREAMS: DreamEntry[] = [
  {
    id: 'dream-2026-08-30',
    timestamp: '2026-08-30 03:00:00',
    title: 'Cycle 48: Effect v4 Pipeline Consolidation & Stream Pruning',
    summary: 'Consolidated 12 transient debugging sessions. Abstracted channel websocket heartbeat reconnection intervals to use exponential jitter. Preserved user preference for high-contrast dark dashboard styling.',
    insights: [
      'Identified that non-blocking chat.send RPC minimizes UI lag by streaming tool events incrementally.',
      'Reduced memory footprint by pruning completed diff patch buffers older than 6 hours.',
      'Validated that SecretRef object values must remain immutable to prevent serialization corruption.'
    ],
    prunedSessionsCount: 12,
    distilledKnowledge: [
      'WebSocket reconnect backoff formula: min(30000, 1000 * 2^attempt + rand(500))',
      'Context compaction target: 95% context threshold triggers sliding window summary.'
    ]
  },
  {
    id: 'dream-2026-08-29',
    timestamp: '2026-08-29 03:00:00',
    title: 'Cycle 47: Device Pairing & Tailscale Auth Fortification',
    summary: 'Automated verification of Tailscale Serve reverse proxy identity headers. Operator role requests now demand explicit approval unless origin matches loopback subnet.',
    insights: [
      'Tailscale Whois lookup latency averages 1.4ms on loopback.',
      'Device pairing state persistence survived 4 daemon hot restarts without drift.'
    ],
    prunedSessionsCount: 8,
    distilledKnowledge: [
      'Trusted proxy tokens must be evaluated before socket handshake upgrade.'
    ]
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '12:10:04.102',
    level: 'INFO',
    source: 'gateway:ws',
    message: 'WebSocket connection accepted from 127.0.0.1 [operator role: session-892]'
  },
  {
    id: 'log-2',
    timestamp: '12:10:04.108',
    level: 'DEBUG',
    source: 'auth:token',
    message: 'Resolved active SecretRef for GEMINI_API_KEY from environment [cached]'
  },
  {
    id: 'log-3',
    timestamp: '12:11:18.420',
    level: 'INFO',
    source: 'agent:coder',
    message: 'Agent execution initiated (runId: run-9428, prompt_tokens: 1420)'
  },
  {
    id: 'log-4',
    timestamp: '12:11:18.730',
    level: 'INFO',
    source: 'tool:bash',
    message: 'Tool call [bash] executed in 310ms (status: exit 0)'
  },
  {
    id: 'log-5',
    timestamp: '12:12:00.002',
    level: 'DEBUG',
    source: 'cron:scheduler',
    message: 'Heartbeat tick: next scheduled sweep in 18 minutes'
  },
  {
    id: 'log-6',
    timestamp: '12:12:34.901',
    level: 'INFO',
    source: 'channels:discord',
    message: 'Channel ping acknowledged: Discord Dev Ops (RTT: 28ms)'
  }
];

export const INITIAL_HEALTH: GatewayHealth = {
  status: 'healthy',
  uptimeSeconds: 84920,
  memoryUsageMb: 148.6,
  activeSockets: 4,
  pairedDevicesCount: 2,
  rpcLatencyMs: 4.2,
  version: '2.4.0-kairos.build'
};

export const INITIAL_CONFIG = {
  gateway: {
    bind: "0.0.0.0",
    port: 18789,
    auth: {
      mode: "token",
      allowTailscale: true,
      allowInsecureAuth: true
    },
    controlUi: {
      basePath: "/",
      embedSandbox: "scripts",
      allowedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000"]
    }
  },
  agents: {
    defaults: {
      model: "anthropic/claude-3-7-sonnet",
      fallback: "google/gemini-2.0-flash",
      temperature: 0.2,
      maxTokens: 200000,
      compactionThreshold: 0.95
    }
  },
  channels: {
    discord: { enabled: true, announceSummary: true },
    telegram: { enabled: true },
    slack: { enabled: true },
    matrix: { enabled: true }
  },
  memory: {
    engine: "lancedb",
    dreamingEnabled: true,
    dreamSchedule: "0 3 * * *"
  }
};
