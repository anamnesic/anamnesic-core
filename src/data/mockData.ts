import { 
  Agent, 
  Session, 
  ModelCapability, 
  ToolDefinition, 
  PolicyRule, 
  ApprovalRequest, 
  AuditEvent, 
  SpecLock, 
  MutationTransaction, 
  VerificationPipeline, 
  ControlPlaneHealth 
} from '../types';

export const INITIAL_AGENTS: Agent[] = [
  {
    id: 'agt-core-architect',
    name: 'Kernel Orchestrator',
    role: 'Autonomous System Runtime Engineer',
    avatar: '⚙️',
    color: 'emerald',
    defaultModel: 'nvidia/nim-qwen-2.5-coder-32b',
    fallbackModel: 'ollama/llama-3.3-70b-instruct',
    systemPrompt: `You are the Kernel Orchestrator inside anamnesic-core v2.4.0. You execute autonomous engineering workflows strictly adhering to PLAN → ACT → VERIFY lifecycle. You enforce Spec Locks, respect Transactional Workspace boundaries, and resolve compiler diagnostics via bounded repair loops.`,
    assignedTools: ['fs.read', 'fs.write', 'shell.execute', 'git.diff', 'git.commit', 'spec.check', 'verification.run'],
    permissions: ['filesystem.read', 'filesystem.write', 'shell.execute', 'git.read', 'git.commit', 'verification.execute'],
    isolationBackend: 'local_sandbox'
  },
  {
    id: 'agt-security-sentinel',
    name: 'Policy & Sandbox Guardian',
    role: 'Permission Broker & AST Validator',
    avatar: '🛡️',
    color: 'amber',
    defaultModel: 'google/gemini-2.0-flash',
    fallbackModel: 'openai/gpt-4o-mini',
    systemPrompt: `You inspect agent actions against invariant policies (INV-01 to INV-10). You detect path escapes (../), secret leaks, unverified sudo executions, and unauthorized external mutations.`,
    assignedTools: ['policy.evaluate', 'secret.scan', 'spec.validate', 'fs.read'],
    permissions: ['policy.read', 'secret.scan', 'filesystem.read'],
    isolationBackend: 'host_restricted'
  },
  {
    id: 'agt-contract-verifier',
    name: 'Spec Lock Verifier',
    role: 'AST & Symbol Contract Auditor',
    avatar: '📐',
    color: 'purple',
    defaultModel: 'anthropic/claude-3-7-sonnet',
    fallbackModel: 'google/gemini-2.0-flash',
    systemPrompt: `You parse Rust and TypeScript ASTs to verify symbol names, argument types, return signatures, and public API stability before transactions are committed.`,
    assignedTools: ['spec.lock', 'spec.check', 'ast.parse', 'diff.verify'],
    permissions: ['spec.manage', 'filesystem.read'],
    isolationBackend: 'local_sandbox'
  },
  {
    id: 'agt-mcp-orchestrator',
    name: 'MCP Integration Worker',
    role: 'Multi-Server MCP Gateway Adapter',
    avatar: '🔌',
    color: 'sky',
    defaultModel: 'openai/gpt-4o',
    fallbackModel: 'deepseek/deepseek-r1',
    systemPrompt: `You bridge native tools with external Model Context Protocol (MCP) servers across GitHub, SQLite, Filesystem, and Docker daemons.`,
    assignedTools: ['mcp.invoke', 'mcp.discover', 'network.http.read'],
    permissions: ['mcp.invoke', 'network.http.read'],
    isolationBackend: 'docker_isolated'
  }
];

export const INITIAL_MODELS: ModelCapability[] = [
  {
    id: 'nvidia/nim-qwen-2.5-coder-32b',
    name: 'NVIDIA NIM Qwen 2.5 Coder 32B',
    provider: 'nvidia_nim',
    contextLength: 131072,
    maxOutputTokens: 8192,
    tools: true,
    vision: false,
    reasoning: true,
    structuredOutput: true,
    latencyMs: 120,
    costPer1kTokens: 0.0008,
    reliabilityScore: 0.99,
    status: 'online',
    localAvailable: true
  },
  {
    id: 'ollama/llama-3.3-70b-instruct',
    name: 'Ollama LLaMA 3.3 70B Local',
    provider: 'ollama',
    contextLength: 131072,
    maxOutputTokens: 4096,
    tools: true,
    vision: false,
    reasoning: true,
    structuredOutput: true,
    latencyMs: 380,
    costPer1kTokens: 0.0,
    reliabilityScore: 0.98,
    status: 'online',
    localAvailable: true
  },
  {
    id: 'google/gemini-2.0-flash',
    name: 'Google Gemini 2.0 Flash',
    provider: 'openrouter',
    contextLength: 1048576,
    maxOutputTokens: 8192,
    tools: true,
    vision: true,
    reasoning: true,
    structuredOutput: true,
    latencyMs: 95,
    costPer1kTokens: 0.0001,
    reliabilityScore: 0.995,
    status: 'online',
    localAvailable: false
  },
  {
    id: 'anthropic/claude-3-7-sonnet',
    name: 'Anthropic Claude 3.7 Sonnet',
    provider: 'anthropic',
    contextLength: 200000,
    maxOutputTokens: 8192,
    tools: true,
    vision: true,
    reasoning: true,
    structuredOutput: true,
    latencyMs: 410,
    costPer1kTokens: 0.003,
    reliabilityScore: 0.992,
    status: 'online',
    localAvailable: false
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 Reasoning',
    provider: 'openrouter',
    contextLength: 64000,
    maxOutputTokens: 8192,
    tools: true,
    vision: false,
    reasoning: true,
    structuredOutput: true,
    latencyMs: 540,
    costPer1kTokens: 0.00055,
    reliabilityScore: 0.97,
    status: 'online',
    localAvailable: false
  }
];

export const INITIAL_TOOLS: ToolDefinition[] = [
  {
    id: 'fs.read',
    name: 'Filesystem Canonical Reader',
    category: 'fs',
    description: 'Reads canonicalized files within authorized workspace boundaries with strict ../ escape prevention.',
    risk: 'L0',
    permissions: ['filesystem.read'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'path', type: 'string', required: true, description: 'Relative path to workspace root' },
      { name: 'encoding', type: 'string', required: false, description: 'File encoding (utf-8 default)' }
    ]
  },
  {
    id: 'fs.write',
    name: 'Transactional File Mutation',
    category: 'fs',
    description: 'Modifies or creates workspace files staged inside a MutationTransaction with rollback snapshot.',
    risk: 'L1',
    permissions: ['filesystem.write'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'path', type: 'string', required: true, description: 'Target file path' },
      { name: 'content', type: 'string', required: true, description: 'Content payload' },
      { name: 'transaction_id', type: 'string', required: true, description: 'Active transaction ID' }
    ]
  },
  {
    id: 'shell.execute',
    name: 'Structured Subprocess Runner',
    category: 'shell',
    description: 'Executes structured executable + args (e.g. cargo test) inside restricted sandbox container.',
    risk: 'L1',
    permissions: ['shell.execute'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'executable', type: 'string', required: true, description: 'Binary name (e.g. cargo, npm, pytest)' },
      { name: 'args', type: 'array', required: true, description: 'Arguments list' },
      { name: 'timeout_secs', type: 'number', required: false, description: 'Execution timeout cap' }
    ]
  },
  {
    id: 'git.commit',
    name: 'Local Git Commit',
    category: 'git',
    description: 'Commits staged transactional diffs with deterministic author metadata.',
    risk: 'L1',
    permissions: ['git.commit'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'message', type: 'string', required: true, description: 'Conventional commit message' },
      { name: 'transaction_id', type: 'string', required: true, description: 'Validated transaction ID' }
    ]
  },
  {
    id: 'git.push',
    name: 'Remote Repository Push',
    category: 'git',
    description: 'Pushes commits to upstream remote. Strictly requires human operator approval (L2).',
    risk: 'L2',
    permissions: ['git.push'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'remote', type: 'string', required: true, description: 'Target remote name (e.g. origin)' },
      { name: 'branch', type: 'string', required: true, description: 'Target branch name (e.g. main)' }
    ]
  },
  {
    id: 'mcp.github.pr_create',
    name: 'GitHub Pull Request Creator',
    category: 'mcp',
    description: 'Invokes GitHub MCP server to open pull request on remote repository (L2 external mutation).',
    risk: 'L2',
    permissions: ['mcp.invoke', 'network.http.write'],
    source: 'mcp_server',
    mcpServerName: 'mcp-github-prod',
    enabled: true,
    inputSchema: [
      { name: 'title', type: 'string', required: true, description: 'PR Title' },
      { name: 'body', type: 'string', required: true, description: 'PR Description' },
      { name: 'head', type: 'string', required: true, description: 'Feature branch' }
    ]
  },
  {
    id: 'system.pkg_install',
    name: 'System Package Installer',
    category: 'system',
    description: 'Installs OS packages or system binaries. Privileged operation requiring operator elevation (L3).',
    risk: 'L3',
    permissions: ['system.package.install'],
    source: 'native',
    enabled: true,
    inputSchema: [
      { name: 'package', type: 'string', required: true, description: 'Package name' },
      { name: 'manager', type: 'string', required: true, description: 'Package manager (apt, pacman, brew)' }
    ]
  }
];

export const INITIAL_POLICIES: PolicyRule[] = [
  {
    id: 'pol-01',
    name: 'INV-04: Workspace Boundary Enforcer',
    description: 'Denies any filesystem access containing ../ traversal or pointing outside workspace root.',
    matchIdentity: '*',
    matchTool: 'fs.*',
    matchRisk: ['L0', 'L1', 'L2', 'L3', 'L4'],
    action: 'ALLOW',
    enabled: true,
    order: 1
  },
  {
    id: 'pol-02',
    name: 'INV-05: Secret Context Leak Guard',
    description: 'Rejects queries or tool args embedding raw API tokens instead of secret:// URI references.',
    matchIdentity: '*',
    matchTool: '*',
    matchRisk: ['L0', 'L1', 'L2', 'L3', 'L4'],
    action: 'ALLOW',
    enabled: true,
    order: 2
  },
  {
    id: 'pol-03',
    name: 'L2 External Mutation Approval Rule',
    description: 'Suspends all git.push, cloud API provisioning, or remote webhook calls until operator approval.',
    matchIdentity: '*',
    matchTool: 'git.push,mcp.github.*,cloud.*',
    matchRisk: ['L2'],
    action: 'REQUIRE_APPROVAL',
    enabled: true,
    order: 3
  },
  {
    id: 'pol-04',
    name: 'L3/L4 Privileged & Destructive Guard',
    description: 'Strictly blocks unapproved root subprocess execution, sudo, or filesystem truncation.',
    matchIdentity: '*',
    matchTool: 'system.*,db.drop.*',
    matchRisk: ['L3', 'L4'],
    action: 'REQUIRE_APPROVAL',
    enabled: true,
    order: 4
  }
];

export const INITIAL_APPROVALS: ApprovalRequest[] = [
  {
    id: 'apr-01-gitpush',
    runId: 'run-9942',
    agentName: 'Kernel Orchestrator',
    toolId: 'git.push',
    risk: 'L2',
    arguments: {
      remote: 'origin',
      branch: 'main',
      commits_count: 2
    },
    justification: 'Automated refactoring of Model Router and Spec Lock verifier passed all 14 integration tests.',
    timestamp: '2026-08-30 12:40:15',
    status: 'pending',
    targetResource: 'github.com/anamnesic/anamnesic-core:main'
  },
  {
    id: 'apr-02-mcppr',
    runId: 'run-9938',
    agentName: 'MCP Integration Worker',
    toolId: 'mcp.github.pr_create',
    risk: 'L2',
    arguments: {
      title: 'feat: implement transactional rollback for failed spec locks',
      head: 'feature/spec-lock-rollback',
      base: 'main'
    },
    justification: 'Feature implementation verified via cargo test; requesting PR creation.',
    timestamp: '2026-08-30 11:15:20',
    status: 'approved',
    targetResource: 'github.com/anamnesic/anamnesic-core'
  }
];

export const INITIAL_SPEC_LOCKS: SpecLock[] = [
  {
    id: 'spec-model-router-v2',
    name: 'ModelRouter & Provider Traits Contract',
    workspaceId: 'ws-core-main',
    targetFiles: ['crates/anamnesic-models/src/router.rs', 'crates/anamnesic-models/src/provider.rs'],
    enforced: true,
    createdAt: '2026-08-30 08:00:00',
    symbols: [
      {
        name: 'route_request',
        kind: 'function',
        parameters: { request: 'ModelRequest', capabilities: 'ModelCapabilities' },
        returns: 'Result<ModelRoute, ModelError>',
        status: 'matched',
        file: 'crates/anamnesic-models/src/router.rs'
      },
      {
        name: 'ModelProvider',
        kind: 'trait',
        parameters: { complete: 'ModelRequest -> Result<ModelResponse, ModelError>' },
        returns: 'Self',
        status: 'matched',
        file: 'crates/anamnesic-models/src/provider.rs'
      },
      {
        name: 'ModelCapabilities',
        kind: 'struct',
        parameters: { tools: 'bool', reasoning: 'bool', max_context: 'usize' },
        returns: 'Self',
        status: 'matched',
        file: 'crates/anamnesic-models/src/provider.rs'
      }
    ]
  },
  {
    id: 'spec-policy-engine-v2',
    name: 'PolicyEngine Decision Contract',
    workspaceId: 'ws-core-main',
    targetFiles: ['crates/anamnesic-policy/src/engine.rs'],
    enforced: true,
    createdAt: '2026-08-30 09:30:00',
    symbols: [
      {
        name: 'evaluate_action',
        kind: 'function',
        parameters: { identity: 'IdentityId', tool: 'ToolId', args: '&JsonValue', risk: 'RiskLevel' },
        returns: 'PolicyDecision',
        status: 'matched',
        file: 'crates/anamnesic-policy/src/engine.rs'
      }
    ]
  }
];

export const INITIAL_TRANSACTIONS: MutationTransaction[] = [
  {
    id: 'tx-20260830-01',
    workspaceId: 'ws-core-main',
    snapshotId: 'snap-88419a',
    runId: 'run-9942',
    status: 'committed',
    timestamp: '2026-08-30 12:20:00',
    operations: [
      {
        id: 'op-01',
        path: 'crates/anamnesic-models/src/router.rs',
        type: 'modify',
        diff: '+ pub async fn route_with_fallback(req: &ModelRequest) -> Result<ModelRoute, ModelError> { ... }',
        specLockCompliant: true,
        status: 'committed'
      },
      {
        id: 'op-02',
        path: 'crates/anamnesic-verification/src/pipeline.rs',
        type: 'modify',
        diff: '+ pub struct VerificationPipeline { stages: Vec<Stage>, repair_cycles: u32 }',
        specLockCompliant: true,
        status: 'committed'
      }
    ]
  }
];

export const INITIAL_VERIFICATION_PIPELINE: VerificationPipeline = {
  id: 'pipe-run-9942',
  runId: 'run-9942',
  status: 'passed',
  repairAttempt: 0,
  maxRepairCycles: 5,
  stages: [
    {
      id: 'stg-1',
      name: 'Specification Contract Check',
      type: 'spec_check',
      command: 'anamnesic-spec-lock --check crates/anamnesic-models',
      exitCode: 0,
      status: 'passed',
      durationMs: 45,
      diagnostics: '✓ 3 of 3 symbol contracts verified. Zero AST signature drift.'
    },
    {
      id: 'stg-2',
      name: 'Format & Style Analysis',
      type: 'format',
      command: 'cargo fmt --check',
      exitCode: 0,
      status: 'passed',
      durationMs: 90,
      diagnostics: '✓ All files cleanly formatted according to standard rustfmt.'
    },
    {
      id: 'stg-3',
      name: 'Compiler Type Check & Cargo Build',
      type: 'compile',
      command: 'cargo check --workspace --all-targets',
      exitCode: 0,
      status: 'passed',
      durationMs: 640,
      diagnostics: '✓ Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.64s'
    },
    {
      id: 'stg-4',
      name: 'Linter & Clippy Verification',
      type: 'lint',
      command: 'cargo clippy -- -D warnings',
      exitCode: 0,
      status: 'passed',
      durationMs: 410,
      diagnostics: '✓ 0 errors, 0 warnings across 14 crates.'
    },
    {
      id: 'stg-5',
      name: 'Integration & Hidden Adversarial Test Suite',
      type: 'test',
      command: 'cargo test --workspace',
      exitCode: 0,
      status: 'passed',
      durationMs: 1250,
      diagnostics: 'test result: ok. 48 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out'
    },
    {
      id: 'stg-6',
      name: 'Workspace Diff & Policy Bounds Analysis',
      type: 'diff_analysis',
      command: 'git diff --check',
      exitCode: 0,
      status: 'passed',
      durationMs: 25,
      diagnostics: '✓ 2 files modified (+48, -4). No unauthorized root modifications detected.'
    }
  ]
};

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-1094',
    timestamp: '2026-08-30 12:40:15',
    type: 'approval.required',
    identity: 'usr_operator_admin',
    sessionId: 'ses-autonomous-01',
    agentId: 'agt-core-architect',
    tool: 'git.push',
    resource: 'origin/main',
    result: 'ALLOWED',
    details: { justification: 'All 6 verification stages passed.', approval_id: 'apr-01-gitpush' }
  },
  {
    id: 'aud-1093',
    timestamp: '2026-08-30 12:39:50',
    type: 'verification.completed',
    identity: 'runtime_kernel',
    sessionId: 'ses-autonomous-01',
    agentId: 'agt-core-architect',
    tool: 'cargo.test',
    resource: 'crates/anamnesic-models',
    result: 'SUCCESS',
    details: { stages_passed: 6, repair_cycles: 0, duration_ms: 2460 }
  },
  {
    id: 'aud-1092',
    timestamp: '2026-08-30 12:39:10',
    type: 'spec_lock.validated',
    identity: 'runtime_kernel',
    sessionId: 'ses-autonomous-01',
    agentId: 'agt-contract-verifier',
    tool: 'spec.check',
    resource: 'spec-model-router-v2',
    result: 'SUCCESS',
    details: { symbols_matched: 3, drift_detected: false }
  },
  {
    id: 'aud-1091',
    timestamp: '2026-08-30 12:38:00',
    type: 'transaction.staged',
    identity: 'usr_operator_admin',
    sessionId: 'ses-autonomous-01',
    agentId: 'agt-core-architect',
    tool: 'fs.write',
    resource: 'crates/anamnesic-models/src/router.rs',
    result: 'ALLOWED',
    details: { tx_id: 'tx-20260830-01', snapshot_id: 'snap-88419a' }
  },
  {
    id: 'aud-1090',
    timestamp: '2026-08-30 12:37:12',
    type: 'policy.evaluated',
    identity: 'usr_operator_admin',
    sessionId: 'ses-autonomous-01',
    agentId: 'agt-core-architect',
    tool: 'fs.read',
    resource: 'crates/anamnesic-models/src/provider.rs',
    result: 'ALLOWED',
    details: { policy_rule: 'INV-04: Workspace Boundary Enforcer' }
  }
];

export const INITIAL_HEALTH: ControlPlaneHealth = {
  gatewayStatus: 'HEALTHY',
  activeSessions: 3,
  activeAgentRuns: 1,
  pendingApprovals: 1,
  activeTransactions: 1,
  connectedMcpServers: 4,
  memoryUsageMb: 246,
  uptimeSeconds: 84920,
  invariantStatus: 'ALL_PASS'
};

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'ses-autonomous-01',
    title: 'Autonomous v2.4.0 Engine Architecture & Model Gateway',
    workspacePath: '/workspaces/anamnesic-core',
    identity: 'usr_operator_admin',
    createdAt: '2026-08-30 10:00:00',
    activeRunId: 'run-9942',
    runs: [
      {
        id: 'run-9942',
        sessionId: 'ses-autonomous-01',
        agentId: 'agt-core-architect',
        task: 'Implement Plan-Act-Verify lifecycle with strict Spec-Lock AST validation and transactional rollback.',
        state: 'COMPLETE',
        modelId: 'nvidia/nim-qwen-2.5-coder-32b',
        currentStepIndex: 3,
        createdAt: '2026-08-30 12:35:00',
        completedAt: '2026-08-30 12:40:15',
        budget: {
          maxModelCalls: 40,
          modelCallsUsed: 6,
          maxToolCalls: 150,
          toolCallsUsed: 14,
          maxRepairCycles: 5,
          repairCyclesUsed: 0,
          maxChangedFiles: 20,
          changedFilesCount: 2,
          maxRuntimeSeconds: 1800,
          runtimeSecondsUsed: 315,
          tokenBudget: 200000,
          tokensUsed: 28450
        },
        plan: [
          {
            id: 'step-1',
            order: 1,
            objective: 'Build lightweight repository model and extract Spec Lock for ModelRouter & Provider traits.',
            intendedMutations: ['crates/anamnesic-models/src/router.rs'],
            validationStrategy: 'Check AST symbol signatures and verify invariants INV-01 to INV-05.',
            expectedOutcome: 'Spec Lock JSON created with 3 locked symbols.',
            status: 'passed'
          },
          {
            id: 'step-2',
            order: 2,
            objective: 'Initialize MutationTransaction snapshot and stage code enhancements for capability-based routing.',
            intendedMutations: ['crates/anamnesic-models/src/router.rs', 'crates/anamnesic-verification/src/pipeline.rs'],
            validationStrategy: 'Run Spec Lock validation pre-commit hook.',
            expectedOutcome: 'Mutation staged cleanly without symbol drift.',
            status: 'passed'
          },
          {
            id: 'step-3',
            order: 3,
            objective: 'Execute full 6-stage Verification Pipeline (Spec, Format, Compile, Lint, Test, Diff).',
            intendedMutations: [],
            validationStrategy: 'cargo check && cargo clippy && cargo test',
            expectedOutcome: 'All 48 tests pass; zero warnings.',
            status: 'passed'
          },
          {
            id: 'step-4',
            order: 4,
            objective: 'Submit commit and request L2 approval for upstream Git push.',
            intendedMutations: [],
            validationStrategy: 'Operator approval event via Policy Engine.',
            expectedOutcome: 'Approval request apr-01-gitpush dispatched.',
            status: 'passed'
          }
        ],
        verification: INITIAL_VERIFICATION_PIPELINE,
        transactionId: 'tx-20260830-01',
        approvals: [INITIAL_APPROVALS[0]]
      }
    ]
  }
];

export const INITIAL_CONFIG = {
  server: {
    bind: "127.0.0.1:4317",
    rpc_socket: "/tmp/anamnesic-core.sock",
    ws_enabled: true,
    tls: {
      enabled: false,
      cert_ref: "secret://tls/cert",
      key_ref: "secret://tls/key"
    }
  },
  agent: {
    max_iterations: 50,
    max_repair_cycles: 5,
    default_isolation: "local_sandbox",
    spec_lock_enforcement: "strict",
    transactional_mutation: true
  },
  models: {
    default_provider: "nvidia_nim",
    default_model: "nvidia/nim-qwen-2.5-coder-32b",
    fallback_chain: [
      "ollama/llama-3.3-70b-instruct",
      "google/gemini-2.0-flash",
      "anthropic/claude-3-7-sonnet"
    ],
    temperature_default: 0.2
  },
  policy: {
    default_network: "deny",
    require_approval_for_external_mutations: true,
    sandbox_path_escape_prevention: true,
    strict_secret_ref_resolution: true
  },
  mcp: {
    auto_discovery: true,
    servers: [
      { name: "mcp-github-prod", command: "npx", args: ["-y", "@modelcontextprotocol/server-github"], risk_ceiling: "L2" },
      { name: "mcp-filesystem-sandbox", command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "/workspaces"], risk_ceiling: "L1" },
      { name: "mcp-sqlite-core", command: "uvx", args: ["mcp-server-sqlite", "--db-path", "state/anamnesic.db"], risk_ceiling: "L1" }
    ]
  },
  verification: {
    stages: ["spec_check", "format", "compile", "lint", "test", "diff_analysis"],
    fail_fast: true,
    capture_diagnostics: true
  },
  audit: {
    enabled: true,
    storage: "sqlite",
    retention_days: 90,
    redact_sensitive_fields: true
  }
};
