'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Play, Plus, X, Eye, AlertTriangle, Bug, Trash2, Globe, Lock, Zap, Shield, Cloud, Server, Key, Sword, Target, Activity, CheckCircle, FileText, Scale, Radar, Ghost, Link2, ArrowRight, AlertOctagon, FileSearch, Package, ShieldAlert, Brain, TestTube, Cpu, Database, HardDrive, Calendar, Bell, Download, Clock } from 'lucide-react';
import { useApi, apiFetch } from '@/src/lib/api';
import { useToast } from '@/src/components/Toast';
import { SkeletonCard } from '@/src/components/Skeleton';
import { cn } from '@/src/lib/utils';
import { useWorkspace } from '@/src/context/WorkspaceContext';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ScanType = 'code' | 'system' | 'api' | 'dependency' | 'infrastructure' | 'comprehensive';

interface Vulnerability {
    id: string;
    type: string;
    severity: Severity;
    title: string;
    description: string;
    location?: { file: string; line: number; column: number };
    evidence?: string;
    remediationSteps: string[];
    references: string[];
    cvss?: number;
}

interface Recommendation {
    priority: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    steps: string[];
    timeEstimateHours: number;
}

interface APIAnalysisData {
    targetUrl: string;
    endpoints: any[];
    auth: {
        type: string;
        strength: string;
        details: string[];
    };
    rateLimit: {
        enabled: boolean;
        strategy: string;
        details?: string[];
    };
    securityHeaders: {
        present: string[];
        missing: string[];
    };
    tlsConfig: {
        enabled: boolean;
        version?: string;
        issues: string[];
    };
    summary: {
        totalEndpoints: number;
        secureEndpoints: number;
        vulnerableEndpoints: number;
        authScore: number;
        rateLimitScore: number;
        overallScore: number;
    };
    analyzedAt: string;
}

interface InfrastructureAnalysisData {
    provider: string;
    region: string;
    securityGroups: any[];
    iamPolicies: any[];
    resources: any[];
    summary: {
        totalSecurityGroups: number;
        vulnerableSecurityGroups: number;
        totalPolicies: number;
        vulnerablePolicies: number;
        totalResources: number;
        resourcesWithIssues: number;
        overallScore: number;
    };
    recommendations: string[];
    analyzedAt: string;
}

interface ComplianceData {
    owasp: {
        score: number;
        checks: any[];
        summary: {
            compliant: number;
            nonCompliant: number;
            partial: number;
            total: number;
        };
    };
    cis: {
        score: number;
        checks: any[];
        summary: {
            compliant: number;
            nonCompliant: number;
            partial: number;
            total: number;
        };
    };
    nist: {
        score: number;
        checks: any[];
        summary: {
            compliant: number;
            nonCompliant: number;
            partial: number;
            total: number;
        };
    };
    overallScore: number;
    recommendations: string[];
    assessedAt: string;
}

interface ZeroDayData {
    patternsAnalyzed: number;
    anomaliesDetected: number;
    vulnerabilities: any[];
    riskScore: number;
    highRiskPatterns: string[];
    recommendations: string[];
    analyzedAt: string;
    analysisDuration: number;
}

interface AttackChainData {
    chains: any[];
    summary: {
        totalChains: number;
        criticalChains: number;
        highRiskChains: number;
        mediumRiskChains: number;
        lowRiskChains: number;
        longestChain: number;
        averageChainLength: number;
    };
    commonPatterns: string[];
    recommendations: string[];
    analyzedAt: string;
}

interface DangerousPatternData {
    patternsAnalyzed: number;
    matches: any[];
    summary: {
        totalMatches: number;
        criticalMatches: number;
        highMatches: number;
        mediumMatches: number;
        lowMatches: number;
        filesScanned: number;
        filesWithMatches: number;
    };
    categoryBreakdown: Record<string, number>;
    topRiskyFiles: { file: string; matchCount: number }[];
    recommendations: string[];
    analyzedAt: string;
    analysisDuration: number;
}

interface PackageVulnerabilityData {
    packagesScanned: number;
    vulnerabilitiesFound: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    packageVulnerabilities: any[];
    summary: {
        totalPackages: number;
        vulnerablePackages: number;
        safePackages: number;
        overallRiskScore: number;
    };
    recommendations: string[];
    scannedAt: string;
    analysisDuration: number;
}

interface MLZeroDayData {
    modelsUsed: string[];
    patternsAnalyzed: number;
    anomaliesDetected: number;
    vulnerabilities: any[];
    summary: {
        totalVulnerabilities: number;
        criticalVulnerabilities: number;
        highVulnerabilities: number;
        mediumVulnerabilities: number;
        lowVulnerabilities: number;
        averageConfidence: number;
        anomalyThreshold: number;
    };
    modelPerformance: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
    };
    recommendations: string[];
    analyzedAt: string;
    analysisDuration: number;
}

interface ExploitationTestData {
    testsExecuted: number;
    testsSuccessful: number;
    testsFailed: number;
    testsBlocked: number;
    vulnerabilitiesConfirmed: number;
    results: any[];
    summary: {
        criticalVulnerabilities: number;
        highVulnerabilities: number;
        mediumVulnerabilities: number;
        lowVulnerabilities: number;
        averageResponseTime: number;
        successRate: number;
    };
    recommendations: string[];
    testedAt: string;
    testDuration: number;
}

interface ComprehensiveComplianceData {
    overallScore: number;
    overallStatus: 'compliant' | 'non-compliant' | 'partial';
    frameworks: {
        owasp: any;
        cis: any;
        nist: any;
    };
    summary: {
        totalControls: number;
        compliantControls: number;
        partialControls: number;
        nonCompliantControls: number;
        criticalIssues: number;
        highIssues: number;
        mediumIssues: number;
        lowIssues: number;
    };
    recommendations: string[];
    roadmap: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    assessedAt: string;
    assessmentDuration: number;
}

interface DetailedInfrastructureData {
    resourcesAnalyzed: number;
    resources: any[];
    configurations: any[];
    vulnerabilities: any[];
    metrics: any[];
    summary: {
        totalResources: number;
        secureResources: number;
        vulnerableResources: number;
        criticalIssues: number;
        highIssues: number;
        mediumIssues: number;
        lowIssues: number;
        complianceScore: number;
        healthScore: number;
    };
    resourceBreakdown: Record<string, number>;
    providerBreakdown: Record<string, number>;
    topVulnerableResources: { resource: string; vulnerabilityCount: number }[];
    recommendations: string[];
    analyzedAt: string;
    analysisDuration: number;
}

interface SecurityScan {
    id: string;
    workspaceId: string;
    targetId: string;
    targetName: string;
    type: ScanType;
    severity: Severity;
    vulnerabilityCount: number;
    vulnerabilities: Vulnerability[];
    recommendations: Recommendation[];
    scanMethod: string | null;
    durationMs: number | null;
    scannerVersion: string | null;
    metadata: Record<string, any> | null;
    analyzedAt: string;
}

const SEVERITY_BADGE: Record<Severity, string> = {
    critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
    high: 'bg-stone-50/10 text-stone-200 border border-stone-100/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
    low: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
};

const SCAN_TYPES: ScanType[] = ['code', 'system', 'api', 'dependency', 'infrastructure', 'comprehensive'];
const SCHEDULE_FREQUENCIES = ['hourly', 'daily', 'weekly', 'monthly'] as const;
type ScheduleFrequency = typeof SCHEDULE_FREQUENCIES[number];
const WEBHOOK_EVENT_TYPES = ['scan.completed', 'scan.failed', 'vulnerability.found', 'schedule.triggered'] as const;
const REPORT_FORMATS = ['json', 'pdf'] as const;
type ReportFormat = typeof REPORT_FORMATS[number];

function relativeTime(iso: string): string {
    try {
        const diff = Date.now() - new Date(iso).getTime();
        if (diff < 60_000) return 'just now';
        if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
        if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
        return `${Math.floor(diff / 86_400_000)}d ago`;
    } catch { return '—'; }
}

function SeverityBadge({ severity }: { severity: Severity }) {
    return (
        <span className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
            SEVERITY_BADGE[severity]
        )}>
            {severity}
        </span>
    );
}

function DetailModal({ scanId, onClose }: { scanId: string; onClose: () => void }) {
    const { data, loading } = useApi<{ data: SecurityScan } | SecurityScan>(`/api/v1/security/scans/${scanId}`);
    const scan: SecurityScan | null = (data as any)?.data ?? (data as any) ?? null;
    const { toast } = useToast();
    const [simulatingId, setSimulatingId] = useState<string | null>(null);

    async function handleSimulateAttack(v: Vulnerability) {
        setSimulatingId(v.id);
        try {
            const res: any = await apiFetch('/api/v1/security/simulations', {
                method: 'POST',
                body: JSON.stringify({
                    vulnerabilityId: v.id,
                    attackType: v.type,
                    targetUrl: scan?.targetName,
                    pattern: 'sequential',
                }),
            });
            const sim = res?.data ?? res;
            const blocked = sim?.metrics?.payloadsBlocked ?? 0;
            const tried = sim?.metrics?.payloadsAttempted ?? 0;
            toast(`Simulation complete — ${blocked}/${tried} payloads blocked`, 'success');
        } catch (e: any) {
            toast(e?.message ?? 'Simulation failed', 'error');
        } finally {
            setSimulatingId(null);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.15 }}
                className="bento-card w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="label-caps text-text-dim">Scan Detail</p>
                        <h3 className="font-bold text-base truncate">{scan?.targetName ?? 'Loading…'}</h3>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-text-dim hover:text-accent transition-colors">
                        <X className="size-4" />
                    </button>
                </div>

                {loading || !scan ? (
                    <SkeletonCard />
                ) : (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-text-dim">
                            <SeverityBadge severity={scan.severity} />
                            <span className="rounded-md bg-white/5 border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                {scan.type}
                            </span>
                            <span><span className="text-accent font-semibold">{scan.vulnerabilityCount}</span> findings</span>
                            <span className="ml-auto label-caps">{relativeTime(scan.analyzedAt)}</span>
                        </div>

                        <div>
                            <h4 className="label-caps text-text-dim mb-2">Vulnerabilities</h4>
                            {scan.vulnerabilities.length === 0 ? (
                                <p className="text-sm text-text-dim">Nenhuma vulnerabilidade encontrada.</p>
                            ) : (
                                <div className="space-y-3">
                                    {scan.vulnerabilities.map(v => (
                                        <div key={v.id} className="bento-card p-3! space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <SeverityBadge severity={v.severity} />
                                                    <span className="font-bold text-sm text-accent">{v.title}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleSimulateAttack(v)}
                                                    disabled={simulatingId === v.id}
                                                    className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                                                >
                                                    <Bug className="size-2.5" />
                                                    {simulatingId === v.id ? 'Simulating…' : 'Simulate Attack'}
                                                </button>
                                            </div>
                                            <p className="text-xs text-text-dim leading-relaxed">{v.description}</p>
                                            {v.location && (
                                                <p className="text-[11px] font-mono text-text-dim">
                                                    {v.location.file}:{v.location.line}
                                                </p>
                                            )}
                                            {v.evidence && (
                                                <pre className="text-[11px] font-mono bg-white/5 rounded p-2 whitespace-pre-wrap break-words">
                                                    {v.evidence}
                                                </pre>
                                            )}
                                            {v.remediationSteps?.length > 0 && (
                                                <ul className="list-disc list-inside text-xs text-text-dim space-y-0.5">
                                                    {v.remediationSteps.map((s, i) => <li key={i}>{s}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="label-caps text-text-dim mb-2">Recommendations</h4>
                            {scan.recommendations.length === 0 ? (
                                <p className="text-sm text-text-dim">Sem recomendações.</p>
                            ) : (
                                <div className="space-y-3">
                                    {scan.recommendations.map((r, i) => (
                                        <div key={i} className="bento-card p-3! space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-white/5 text-accent">
                                                    {r.priority}
                                                </span>
                                                <span className="font-bold text-sm text-accent">{r.title}</span>
                                            </div>
                                            <p className="text-xs text-text-dim leading-relaxed">{r.description}</p>
                                            {r.steps?.length > 0 && (
                                                <ul className="list-disc list-inside text-xs text-text-dim space-y-0.5">
                                                    {r.steps.map((s, j) => <li key={j}>{s}</li>)}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export function Security() {
    const { workspace } = useWorkspace();
    const { data, loading, refetch } = useApi('/api/v1/security/scans');
    const { data: projectsData } = useApi('/api/v1/projects');
    const [apiUrl, setApiUrl] = useState('');
    const [analyzingApi, setAnalyzingApi] = useState(false);
    const [analyzingInfra, setAnalyzingInfra] = useState(false);
    const [apiAnalysisKey, setApiAnalysisKey] = useState(0);
    const apiAnalysisPath = apiAnalysisKey ? `/api/v1/security/api-analysis?targetUrl=${encodeURIComponent(apiUrl)}` : null;
    const { data: apiAnalysis, loading: apiAnalysisLoading } = useApi<APIAnalysisData | null>(apiAnalysisPath);
    const [infraKey, setInfraKey] = useState(0);
    const infraPath = infraKey ? '/api/v1/security/infrastructure-analysis' : null;
    const { data: infraAnalysis, loading: infraAnalysisLoading } = useApi<InfrastructureAnalysisData | null>(infraPath);
    const { toast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [targetName, setTargetName] = useState('');
    const [type, setType] = useState<ScanType>('code');
    const [targetPath, setTargetPath] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [deepScan, setDeepScan] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [attackType, setAttackType] = useState('sql-injection');
    const [simulatingAttack, setSimulatingAttack] = useState(false);
    const { data: simulations, loading: simulationsLoading, refetch: refetchSimulations } = useApi('/api/v1/security/simulations');
    const [complianceKey, setComplianceKey] = useState(0);
    const compliancePath = complianceKey ? '/api/v1/security/compliance' : null;
    const { data: compliance, loading: complianceLoading } = useApi<ComplianceData | null>(compliancePath);
    const [zeroDayKey, setZeroDayKey] = useState(0);
    const zeroDayPath = zeroDayKey ? '/api/v1/security/zero-day' : null;
    const { data: zeroDay, loading: zeroDayLoading } = useApi<ZeroDayData | null>(zeroDayPath);
    const [attackChainsKey, setAttackChainsKey] = useState(0);
    const attackChainsPath = attackChainsKey ? '/api/v1/security/attack-chains' : null;
    const { data: attackChains, loading: attackChainsLoading } = useApi<AttackChainData | null>(attackChainsPath);
    const [dangerousPatternsKey, setDangerousPatternsKey] = useState(0);
    const dangerousPatternsPath = dangerousPatternsKey ? '/api/v1/security/dangerous-patterns' : null;
    const { data: dangerousPatterns, loading: dangerousPatternsLoading } = useApi<DangerousPatternData | null>(dangerousPatternsPath);
    const [packageVulnerabilitiesKey, setPackageVulnerabilitiesKey] = useState(0);
    const packageVulnerabilitiesPath = packageVulnerabilitiesKey ? '/api/v1/security/package-vulnerabilities' : null;
    const { data: packageVulnerabilities, loading: packageVulnerabilitiesLoading } = useApi<PackageVulnerabilityData | null>(packageVulnerabilitiesPath);
    const [mlZeroDayKey, setMLZeroDayKey] = useState(0);
    const mlZeroDayPath = mlZeroDayKey ? '/api/v1/security/ml-zero-day' : null;
    const { data: mlZeroDay, loading: mlZeroDayLoading } = useApi<MLZeroDayData | null>(mlZeroDayPath);
    const [exploitationTestsKey, setExploitationTestsKey] = useState(0);
    const exploitationTestsPath = exploitationTestsKey ? '/api/v1/security/exploitation-tests' : null;
    const { data: exploitationTests, loading: exploitationTestsLoading } = useApi<ExploitationTestData | null>(exploitationTestsPath);
    const [comprehensiveComplianceKey, setComprehensiveComplianceKey] = useState(0);
    const comprehensiveCompliancePath = comprehensiveComplianceKey ? '/api/v1/security/comprehensive-compliance' : null;
    const { data: comprehensiveCompliance, loading: comprehensiveComplianceLoading } = useApi<ComprehensiveComplianceData | null>(comprehensiveCompliancePath);
    const [detailedInfrastructureKey, setDetailedInfrastructureKey] = useState(0);
    const detailedInfrastructurePath = detailedInfrastructureKey ? '/api/v1/security/detailed-infrastructure' : null;
    const { data: detailedInfrastructure, loading: detailedInfrastructureLoading } = useApi<DetailedInfrastructureData | null>(detailedInfrastructurePath);
    const schedulesPath = workspace?.id ? `/api/v1/security/schedules?workspaceId=${workspace.id}` : null;
    const webhooksPath = workspace?.id ? `/api/v1/security/webhooks?workspaceId=${workspace.id}` : null;
    const { data: schedules, loading: schedulesLoading, refetch: refetchSchedules } = useApi(schedulesPath);
    const { data: webhooks, loading: webhooksLoading, refetch: refetchWebhooks } = useApi(webhooksPath);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [scheduleScanType, setScheduleScanType] = useState<ScanType>('code');
    const [scheduleFrequency, setScheduleFrequency] = useState('daily');
    const [scheduleTargetName, setScheduleTargetName] = useState('');
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookEvents, setWebhookEvents] = useState<string[]>(['scan.completed']);
    const [webhookSecret, setWebhookSecret] = useState('');
    const [creatingSchedule, setCreatingSchedule] = useState(false);
    const [creatingWebhook, setCreatingWebhook] = useState(false);
    const [togglingScheduleId, setTogglingScheduleId] = useState<string | null>(null);
    const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);
    const [togglingWebhookId, setTogglingWebhookId] = useState<string | null>(null);
    const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);
    const [assessingCompliance, setAssessingCompliance] = useState(false);
    const [discoveringZeroDay, setDiscoveringZeroDay] = useState(false);
    const [analyzingChains, setAnalyzingChains] = useState(false);
    const [detectingPatterns, setDetectingPatterns] = useState(false);
    const [scanningPackages, setScanningPackages] = useState(false);
    const [runningMLAnalysis, setRunningMLAnalysis] = useState(false);
    const [runningExploitationTests, setRunningExploitationTests] = useState(false);
    const [runningComprehensiveCompliance, setRunningComprehensiveCompliance] = useState(false);
    const [runningDetailedInfrastructure, setRunningDetailedInfrastructure] = useState(false);

    const projects = useMemo(() => {
        const raw = (projectsData as any)?.data ?? projectsData ?? [];
        return Array.isArray(raw) ? raw : [];
    }, [projectsData]);

    const list: SecurityScan[] = useMemo(() => {
        const raw = (data as any)?.data ?? data ?? [];
        return Array.isArray(raw) ? raw : [];
    }, [data]);

    const packageVulnerabilitiesData = useMemo(() => {
        const raw = (packageVulnerabilities as any)?.data ?? packageVulnerabilities;
        return raw;
    }, [packageVulnerabilities]);

    const apiAnalysisData = useMemo(() => {
        const raw = (apiAnalysis as any)?.data ?? apiAnalysis;
        return raw;
    }, [apiAnalysis]);

    const infraAnalysisData = useMemo(() => {
        const raw = (infraAnalysis as any)?.data ?? infraAnalysis;
        return raw;
    }, [infraAnalysis]);

    const complianceData = useMemo(() => {
        const raw = (compliance as any)?.data ?? compliance;
        return raw;
    }, [compliance]);

    const zeroDayData = useMemo(() => {
        const raw = (zeroDay as any)?.data ?? zeroDay;
        return raw;
    }, [zeroDay]);

    const attackChainsData = useMemo(() => {
        const raw = (attackChains as any)?.data ?? attackChains;
        return raw;
    }, [attackChains]);

    const dangerousPatternsData = useMemo(() => {
        const raw = (dangerousPatterns as any)?.data ?? dangerousPatterns;
        return raw;
    }, [dangerousPatterns]);

    const mlZeroDayData = useMemo(() => {
        const raw = (mlZeroDay as any)?.data ?? mlZeroDay;
        return raw;
    }, [mlZeroDay]);

    const exploitationTestsData = useMemo(() => {
        const raw = (exploitationTests as any)?.data ?? exploitationTests;
        return raw;
    }, [exploitationTests]);

    const comprehensiveComplianceData = useMemo(() => {
        const raw = (comprehensiveCompliance as any)?.data ?? comprehensiveCompliance;
        return raw;
    }, [comprehensiveCompliance]);

    const detailedInfrastructureData = useMemo(() => {
        const raw = (detailedInfrastructure as any)?.data ?? detailedInfrastructure;
        return raw;
    }, [detailedInfrastructure]);

    const pageLoading = loading || schedulesLoading || webhooksLoading;
    const stats = useMemo(() => {
        let critical = 0, high = 0;
        for (const s of list) {
            for (const v of s.vulnerabilities ?? []) {
                if (v.severity === 'critical') critical++;
                else if (v.severity === 'high') high++;
            }
        }
        return { total: list.length, critical, high };
    }, [list]);

    function closeModal() {
        setShowModal(false);
        setTargetName('');
        setType('code');
        setTargetPath('');
        setSelectedProjectId('');
        setDeepScan(false);
    }

    async function handleSubmit() {
        if (!targetName.trim()) { toast('Target name is required', 'error'); return; }
        if ((type === 'code' || type === 'comprehensive') && !selectedProjectId && !targetPath.trim()) {
            toast('A project or target path is required for code/comprehensive scans', 'error');
            return;
        }
        setSubmitting(true);
        try {
            await apiFetch('/api/v1/security/scans', {
                method: 'POST',
                body: JSON.stringify({
                    targetName: targetName.trim(),
                    type,
                    targetPath: targetPath.trim() || undefined,
                    workspaceId: workspace?.id,
                    targetId: selectedProjectId || undefined,
                    deepScan: type === 'code' ? deepScan : undefined,
                }),
            });
            toast('Scan created', 'success');
            refetch();
            closeModal();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao criar varredura', 'error');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(scanId: string) {
        if (!confirm('Excluir esta varredura?')) return;
        setDeletingId(scanId);
        try {
            await apiFetch(`/api/v1/security/scans/${scanId}`, { method: 'DELETE' });
            toast('Scan removed', 'success');
            refetch();
        } catch (e: any) {
            toast(e?.message ?? 'Falha ao excluir', 'error');
        } finally {
            setDeletingId(null);
        }
    }

    async function handleAnalyzeAPI() {
        if (!apiUrl.trim()) {
            toast('URL da API é obrigatória', 'error');
            return;
        }
        setAnalyzingApi(true);
        try {
            setApiAnalysisKey(k => k + 1);
            toast('Análise de API concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao analisar API', 'error');
        } finally {
            setAnalyzingApi(false);
        }
    }

    async function handleAnalyzeInfrastructure() {
        setAnalyzingInfra(true);
        try {
            setInfraKey(k => k + 1);
            toast('Análise de infraestrutura concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao analisar infraestrutura', 'error');
        } finally {
            setAnalyzingInfra(false);
        }
    }

    async function handleSimulateAttack() {
        if (!selectedProjectId) {
            toast('Selecione um projeto para simular ataque', 'error');
            return;
        }
        setSimulatingAttack(true);
        try {
            await apiFetch('/api/v1/security/simulations', {
                method: 'POST',
                body: JSON.stringify({
                    vulnerabilityId: 'demo-vuln-' + Date.now(),
                    attackType,
                    targetUrl: apiUrl,
                    pattern: 'sequential',
                }),
            });
            toast('Simulação de ataque iniciada', 'success');
            refetchSimulations();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao simular ataque', 'error');
        } finally {
            setSimulatingAttack(false);
        }
    }

    async function handleAssessCompliance() {
        setAssessingCompliance(true);
        try {
            setComplianceKey(k => k + 1);
            toast('Avaliação de compliance concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao avaliar compliance', 'error');
        } finally {
            setAssessingCompliance(false);
        }
    }

    async function handleDiscoverZeroDay() {
        setDiscoveringZeroDay(true);
        try {
            setZeroDayKey(k => k + 1);
            toast('Descoberta de zero-day concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao descobrir zero-day', 'error');
        } finally {
            setDiscoveringZeroDay(false);
        }
    }

    async function handleAnalyzeAttackChains() {
        setAnalyzingChains(true);
        try {
            const vulnerabilities = list.flatMap((scan: any) => scan.vulnerabilities || []);
            await apiFetch('/api/v1/security/attack-chains', {
                method: 'POST',
                body: JSON.stringify({ vulnerabilities }),
            });
            setAttackChainsKey(k => k + 1);
            toast('Análise de cadeia de ataques concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao analisar cadeia de ataques', 'error');
        } finally {
            setAnalyzingChains(false);
        }
    }

    async function handleDetectDangerousPatterns() {
        setDetectingPatterns(true);
        try {
            setDangerousPatternsKey(k => k + 1);
            toast('Detecção de padrões perigosos concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao detectar padrões perigosos', 'error');
        } finally {
            setDetectingPatterns(false);
        }
    }

    async function handleScanPackageVulnerabilities() {
        setScanningPackages(true);
        try {
            setPackageVulnerabilitiesKey(k => k + 1);
            toast('Verificação de pacotes concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao verificar pacotes', 'error');
        } finally {
            setScanningPackages(false);
        }
    }

    async function handleRunMLAnalysis() {
        setRunningMLAnalysis(true);
        try {
            setMLZeroDayKey(k => k + 1);
            toast('Análise ML/AI concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha na análise ML/AI', 'error');
        } finally {
            setRunningMLAnalysis(false);
        }
    }

    async function handleRunExploitationTests() {
        setRunningExploitationTests(true);
        try {
            setExploitationTestsKey(k => k + 1);
            toast('Testes de exploração concluídos', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha nos testes de exploração', 'error');
        } finally {
            setRunningExploitationTests(false);
        }
    }

    async function handleComprehensiveCompliance() {
        setRunningComprehensiveCompliance(true);
        try {
            setComprehensiveComplianceKey(k => k + 1);
            toast('Verificação completa de compliance concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha na verificação de compliance', 'error');
        } finally {
            setRunningComprehensiveCompliance(false);
        }
    }

    async function handleDetailedInfrastructure() {
        setRunningDetailedInfrastructure(true);
        try {
            setDetailedInfrastructureKey(k => k + 1);
            toast('Análise detalhada de infraestrutura concluída', 'success');
        } catch (e: any) {
            toast(e.message ?? 'Falha na análise de infraestrutura', 'error');
        } finally {
            setRunningDetailedInfrastructure(false);
        }
    }

    async function handleCreateSchedule() {
        if (!scheduleTargetName.trim() || !workspace?.id) {
            toast('Target name e workspace são obrigatórios', 'error');
            return;
        }
        setCreatingSchedule(true);
        try {
            await apiFetch('/api/v1/security/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    scanType: scheduleScanType,
                    targetName: scheduleTargetName.trim(),
                    frequency: scheduleFrequency,
                }),
            });
            toast('Schedule criado', 'success');
            refetchSchedules();
            setShowScheduleModal(false);
            setScheduleTargetName('');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao criar schedule', 'error');
        } finally {
            setCreatingSchedule(false);
        }
    }

    async function handleCreateWebhook() {
        if (!webhookUrl.trim() || !workspace?.id || webhookEvents.length === 0) {
            toast('URL, workspace e eventos são obrigatórios', 'error');
            return;
        }
        setCreatingWebhook(true);
        try {
            await apiFetch('/api/v1/security/webhooks', {
                method: 'POST',
                body: JSON.stringify({
                    workspaceId: workspace.id,
                    url: webhookUrl.trim(),
                    events: webhookEvents,
                    secret: webhookSecret.trim() || undefined,
                }),
            });
            toast('Webhook criado', 'success');
            refetchWebhooks();
            setShowWebhookModal(false);
            setWebhookUrl('');
            setWebhookEvents(['scan.completed']);
            setWebhookSecret('');
        } catch (e: any) {
            toast(e.message ?? 'Falha ao criar webhook', 'error');
        } finally {
            setCreatingWebhook(false);
        }
    }

    async function handleToggleSchedule(scheduleId: string, enabled: boolean) {
        setTogglingScheduleId(scheduleId);
        try {
            await apiFetch(`/api/v1/security/schedules/${scheduleId}`, {
                method: 'PATCH',
                body: JSON.stringify({ enabled }),
            });
            refetchSchedules();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao atualizar schedule', 'error');
        } finally {
            setTogglingScheduleId(null);
        }
    }

    async function handleDeleteSchedule(scheduleId: string) {
        if (!confirm('Excluir este agendamento?')) return;
        setDeletingScheduleId(scheduleId);
        try {
            await apiFetch(`/api/v1/security/schedules/${scheduleId}`, { method: 'DELETE' });
            toast('Schedule removido', 'success');
            refetchSchedules();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao excluir schedule', 'error');
        } finally {
            setDeletingScheduleId(null);
        }
    }

    async function handleToggleWebhook(webhookId: string, enabled: boolean) {
        setTogglingWebhookId(webhookId);
        try {
            await apiFetch(`/api/v1/security/webhooks/${webhookId}`, {
                method: 'PATCH',
                body: JSON.stringify({ enabled }),
            });
            refetchWebhooks();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao atualizar webhook', 'error');
        } finally {
            setTogglingWebhookId(null);
        }
    }

    async function handleDeleteWebhook(webhookId: string) {
        if (!confirm('Excluir este webhook?')) return;
        setDeletingWebhookId(webhookId);
        try {
            await apiFetch(`/api/v1/security/webhooks/${webhookId}`, { method: 'DELETE' });
            toast('Webhook removido', 'success');
            refetchWebhooks();
        } catch (e: any) {
            toast(e.message ?? 'Falha ao excluir webhook', 'error');
        } finally {
            setDeletingWebhookId(null);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 p-6 pb-32 max-w-3xl mx-auto w-full"
        >
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="size-5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Security Análise</h2>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 text-xs font-bold text-accent hover:border-primary/60 transition-colors"
                >
                    <Play className="size-3.5" />
                    New Scan
                </button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                    { label: 'Total Scans', value: stats.total },
                    { label: 'Crítica', value: stats.critical },
                    { label: 'Alta', value: stats.high },
                ].map(stat => (
                    <div key={stat.label} className="bento-card text-center">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="label-caps text-text-dim mt-0.5">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* API Analysis Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center gap-2">
                    <Globe className="size-5 text-primary" />
                    <span className="label-caps">Análise de API</span>
                </div>
                <div className="flex gap-3">
                    <input
                        type="url"
                        value={apiUrl}
                        onChange={e => setApiUrl(e.target.value)}
                        placeholder="https://api.example.com"
                        className="flex-1 px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary/60 transition-all"
                    />
                    <button
                        onClick={handleAnalyzeAPI}
                        disabled={analyzingApi}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/15 border border-primary/40 rounded-xl text-xs font-bold text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
                    >
                        <Shield className="size-3.5" />
                        {analyzingApi ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                {apiAnalysisLoading ? (
                    <SkeletonCard />
                ) : apiAnalysisData ? (
                    <div className="space-y-4">
                        {/* Summary Scores */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Pontuação Geral', value: apiAnalysisData?.summary?.overallScore ?? 0, color: (apiAnalysisData?.summary?.overallScore ?? 0) >= 70 ? 'text-green-400' : (apiAnalysisData?.summary?.overallScore ?? 0) >= 40 ? 'text-yellow-400' : 'text-red-400' },
                                { label: 'Autenticação', value: apiAnalysisData?.summary?.authScore ?? 0, color: (apiAnalysisData?.summary?.authScore ?? 0) >= 70 ? 'text-green-400' : (apiAnalysisData?.summary?.authScore ?? 0) >= 40 ? 'text-yellow-400' : 'text-red-400' },
                                { label: 'Rate Limit', value: apiAnalysisData?.summary?.rateLimitScore ?? 0, color: (apiAnalysisData?.summary?.rateLimitScore ?? 0) >= 70 ? 'text-green-400' : (apiAnalysisData?.summary?.rateLimitScore ?? 0) >= 40 ? 'text-yellow-400' : 'text-red-400' },
                                { label: 'Endpoints', value: `${apiAnalysisData?.summary?.secureEndpoints ?? 0}/${apiAnalysisData?.summary?.totalEndpoints ?? 0}`, color: 'text-accent' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Auth Status */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                            <div className="flex items-center gap-3">
                                <Lock className={cn("size-4", apiAnalysisData?.auth?.strength === 'strong' ? "text-green-500" : apiAnalysisData?.auth?.strength === 'weak' ? "text-yellow-500" : "text-red-500")} />
                                <div>
                                    <p className="text-xs font-bold text-accent">Autenticação</p>
                                    <p className="text-[10px] text-text-dim">{apiAnalysisData?.auth?.type ?? 'N/A'} - {apiAnalysisData?.auth?.strength ?? 'unknown'}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                                {apiAnalysisData?.auth?.details?.slice(0, 2).map((detail: string, i: number) => (
                                    <span key={i} className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                                        {detail}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Rate Limit Status */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                            <div className="flex items-center gap-3">
                                <Zap className={cn("size-4", apiAnalysisData?.rateLimit?.enabled ? "text-green-500" : "text-red-500")} />
                                <div>
                                    <p className="text-xs font-bold text-accent">Rate Limiting</p>
                                    <p className="text-[10px] text-text-dim">{apiAnalysisData?.rateLimit?.enabled ? apiAnalysisData.rateLimit.strategy : 'Desabilitado'}</p>
                                </div>
                            </div>
                            {apiAnalysisData?.rateLimit?.details && apiAnalysisData.rateLimit.details.length > 0 && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-green-500/10 text-green-400">
                                    Ativo
                                </span>
                            )}
                        </div>

                        {/* Security Headers */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Headers de Segurança</p>
                            <div className="flex flex-wrap gap-2">
                                {apiAnalysisData?.securityHeaders?.present?.map((header: string, i: number) => (
                                    <span key={i} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                                        ✓ {header}
                                    </span>
                                ))}
                                {apiAnalysisData?.securityHeaders?.missing?.slice(0, 3).map((header: string, i: number) => (
                                    <span key={i} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                        ✗ {header}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* TLS Config */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                            <div className="flex items-center gap-3">
                                <Shield className={cn("size-4", apiAnalysisData?.tlsConfig?.enabled ? "text-green-500" : "text-red-500")} />
                                <div>
                                    <p className="text-xs font-bold text-accent">TLS/SSL</p>
                                    <p className="text-[10px] text-text-dim">{apiAnalysisData?.tlsConfig?.enabled ? apiAnalysisData.tlsConfig.version : 'Não habilitado'}</p>
                                </div>
                            </div>
                            {(apiAnalysisData?.tlsConfig?.issues?.length ?? 0) > 0 && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                                    {apiAnalysisData?.tlsConfig?.issues?.length ?? 0} problemas
                                </span>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Infrastructure Analysis Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Cloud className="size-5 text-primary" />
                        <span className="label-caps">Análise de Infraestrutura</span>
                    </div>
                    <button
                        onClick={handleAnalyzeInfrastructure}
                        disabled={analyzingInfra}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/40 rounded-xl text-[10px] font-bold text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
                    >
                        <Shield className="size-3" />
                        {analyzingInfra ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                {infraAnalysisLoading ? (
                    <SkeletonCard />
                ) : infraAnalysisData ? (
                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Pontuação', value: infraAnalysisData?.summary?.overallScore ?? 0, color: (infraAnalysisData?.summary?.overallScore ?? 0) >= 70 ? 'text-green-400' : (infraAnalysisData?.summary?.overallScore ?? 0) >= 40 ? 'text-yellow-400' : 'text-red-400' },
                                { label: 'Security Groups', value: `${infraAnalysisData?.summary?.vulnerableSecurityGroups ?? 0}/${infraAnalysisData?.summary?.totalSecurityGroups ?? 0}`, color: 'text-accent' },
                                { label: 'Políticas IAM', value: `${infraAnalysisData?.summary?.vulnerablePolicies ?? 0}/${infraAnalysisData?.summary?.totalPolicies ?? 0}`, color: 'text-accent' },
                                { label: 'Recursos', value: `${infraAnalysisData?.summary?.resourcesWithIssues ?? 0}/${infraAnalysisData?.summary?.totalResources ?? 0}`, color: 'text-accent' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Provider Info */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                            <div className="flex items-center gap-3">
                                <Server className="size-4 text-primary" />
                                <div>
                                    <p className="text-xs font-bold text-accent">Provider</p>
                                    <p className="text-[10px] text-text-dim">{infraAnalysisData?.provider?.toUpperCase() ?? 'N/A'} - {infraAnalysisData?.region ?? 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Security Groups */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Security Groups</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {infraAnalysisData?.securityGroups?.slice(0, 5).map((sg: any, index: number) => (
                                    <div key={`sg-${sg.id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border">
                                        <div className="flex items-center gap-2">
                                            <div className={cn("size-2 rounded-full", sg.status === 'secure' ? "bg-green-500" : "bg-red-500")} />
                                            <span className="text-xs font-bold text-accent">{sg.name}</span>
                                        </div>
                                        {sg.vulnerabilities.length > 0 && (
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                                                {sg.vulnerabilities.length} vulns
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* IAM Policies */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Políticas IAM</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {infraAnalysisData?.iamPolicies?.slice(0, 5).map((policy: any, index: number) => (
                                    <div key={`policy-${policy.id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border">
                                        <div className="flex items-center gap-2">
                                            <Key className={cn("size-3", policy.status === 'secure' ? "text-green-500" : "text-red-500")} />
                                            <span className="text-xs font-bold text-accent">{policy.name}</span>
                                        </div>
                                        <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", policy.type === 'role' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400")}>
                                            {policy.type}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Resources */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recursos Cloud</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {infraAnalysisData?.resources?.slice(0, 5).map((resource: any, index: number) => (
                                    <div key={`resource-${resource.id}-${index}`} className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border">
                                        <div className="flex items-center gap-2">
                                            <Cloud className="size-3 text-text-dim" />
                                            <span className="text-xs font-bold text-accent">{resource.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-card text-text-dim">
                                                {resource.type}
                                            </span>
                                            {resource.securityIssues.length > 0 && (
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-400">
                                                    {resource.securityIssues.length}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {(infraAnalysisData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {infraAnalysisData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                            <AlertTriangle className="size-3 text-yellow-500 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Attack Simulation Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center gap-2">
                    <Sword className="size-5 text-primary" />
                    <span className="label-caps">Simulação de Ataques</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select
                        value={attackType}
                        onChange={e => setAttackType(e.target.value)}
                        className="px-4 py-2 bg-bg border border-border rounded-xl text-sm focus:outline-none focus:border-primary/60 transition-all"
                    >
                        <option value="sql-injection">SQL Injection</option>
                        <option value="xss">XSS (Cross-Site Scripting)</option>
                        <option value="csrf">CSRF (Cross-Site Request Forgery)</option>
                        <option value="auth-bypass">Authentication Bypass</option>
                        <option value="dos">DoS (Denial of Service)</option>
                        <option value="rce">RCE (Remote Code Execution)</option>
                        <option value="privilege-escalation">Privilege Escalation</option>
                        <option value="data-exfiltration">Data Exfiltration</option>
                    </select>
                    <button
                        onClick={handleSimulateAttack}
                        disabled={simulatingAttack}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/15 border border-red-500/40 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
                    >
                        <Target className="size-3.5" />
                        {simulatingAttack ? 'Simulando...' : 'Simular Ataque'}
                    </button>
                </div>

                {simulationsLoading ? (
                    <SkeletonCard />
                ) : simulations && Array.isArray(simulations) && simulations.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {simulations.slice(0, 5).map((sim: any) => (
                            <div key={sim.simulationId} className="p-3 rounded-xl bg-bg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className={cn("size-3", sim.status === 'succeeded' ? "text-green-500" : sim.status === 'blocked' ? "text-yellow-500" : sim.status === 'failed' ? "text-red-500" : "text-blue-500")} />
                                        <span className="text-xs font-bold text-accent">{sim.attackType}</span>
                                    </div>
                                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", sim.status === 'succeeded' ? "bg-red-500/10 text-red-400" : sim.status === 'blocked' ? "bg-yellow-500/10 text-yellow-400" : sim.status === 'failed' ? "bg-gray-500/10 text-gray-400" : "bg-blue-500/10 text-blue-400")}>
                                        {sim.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-[10px] text-text-dim">
                                    <div>
                                        <span className="font-bold">Payloads:</span> {sim.metrics?.payloadsAttempted || 0}
                                    </div>
                                    <div>
                                        <span className="font-bold">Bloqueados:</span> {sim.metrics?.payloadsBlocked || 0}
                                    </div>
                                    <div>
                                        <span className="font-bold">Sucesso:</span> {sim.metrics?.payloadsSuccessful || 0}
                                    </div>
                                </div>
                                {sim.results?.confidenceScore > 0 && (
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between text-[10px] mb-1">
                                            <span className="text-text-dim">Confiança</span>
                                            <span className="font-bold">{Math.round(sim.results.confidenceScore)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                            <div 
                                                className={cn("h-full transition-all", sim.results.confidenceScore > 70 ? "bg-red-500" : sim.results.confidenceScore > 40 ? "bg-yellow-500" : "bg-green-500")}
                                                style={{ width: `${sim.results.confidenceScore}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-text-dim">Nenhuma simulação realizada ainda</p>
                )}
            </div>

            {/* Compliance Assessment Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="size-5 text-primary" />
                        <span className="label-caps">Avaliação de Compliance</span>
                    </div>
                    <button
                        onClick={handleAssessCompliance}
                        disabled={assessingCompliance}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/15 border border-primary/40 rounded-xl text-[10px] font-bold text-primary hover:bg-primary/25 transition-all disabled:opacity-50"
                    >
                        <FileText className="size-3" />
                        {assessingCompliance ? 'Avaliando...' : 'Avaliar'}
                    </button>
                </div>

                {complianceLoading ? (
                    <SkeletonCard />
                ) : compliance ? (
                    <div className="space-y-4">
                        {/* Overall Score */}
                        <div className="text-center p-4 rounded-xl bg-bg border border-border">
                            <p className="text-[8px] font-black text-text-dim uppercase mb-1">Pontuação Geral</p>
                            <p className={cn("text-4xl font-black", (compliance?.overallScore || 0) >= 70 ? "text-green-400" : (compliance?.overallScore || 0) >= 40 ? "text-yellow-400" : "text-red-400")}>
                                {compliance?.overallScore || 0}%
                            </p>
                        </div>

                        {/* Standard Scores */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { name: 'OWASP', score: compliance?.owasp?.score || 0, summary: compliance?.owasp?.summary || { compliant: 0, partial: 0, nonCompliant: 0 } },
                                { name: 'CIS', score: compliance?.cis?.score || 0, summary: compliance?.cis?.summary || { compliant: 0, partial: 0, nonCompliant: 0 } },
                                { name: 'NIST', score: compliance?.nist?.score || 0, summary: compliance?.nist?.summary || { compliant: 0, partial: 0, nonCompliant: 0 } },
                            ].map(std => (
                                <div key={std.name} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className="text-xs font-bold text-accent mb-1">{std.name}</p>
                                    <p className={cn("text-2xl font-black", std.score >= 70 ? "text-green-400" : std.score >= 40 ? "text-yellow-400" : "text-red-400")}>
                                        {std.score}%
                                    </p>
                                    <div className="flex justify-center gap-2 mt-2 text-[9px] text-text-dim">
                                        <span className="text-green-400">✓ {std.summary.compliant}</span>
                                        <span className="text-yellow-400">~ {std.summary.partial}</span>
                                        <span className="text-red-400">✗ {std.summary.nonCompliant}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* OWASP Checks */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">OWASP Top 10</p>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {complianceData?.owasp?.checks?.slice(0, 5).map((check: any) => (
                                    <div key={check.id} className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className={cn("size-3", check.status === 'compliant' ? "text-green-500" : check.status === 'partial' ? "text-yellow-500" : "text-red-500")} />
                                            <span className="text-xs font-bold text-accent truncate max-w-[150px]">{check.category}</span>
                                        </div>
                                        <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", check.status === 'compliant' ? "bg-green-500/10 text-green-400" : check.status === 'partial' ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400")}>
                                            {check.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {(complianceData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {complianceData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                            <AlertTriangle className="size-3 text-blue-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Zero-Day Discovery Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Radar className="size-5 text-primary" />
                        <span className="label-caps">Descoberta de Zero-Day</span>
                    </div>
                    <button
                        onClick={handleDiscoverZeroDay}
                        disabled={discoveringZeroDay}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 border border-purple-500/40 rounded-xl text-[10px] font-bold text-purple-400 hover:bg-purple-500/25 transition-all disabled:opacity-50"
                    >
                        <Ghost className="size-3" />
                        {discoveringZeroDay ? 'Analisando...' : 'Descobrir'}
                    </button>
                </div>

                {zeroDayLoading ? (
                    <SkeletonCard />
                ) : zeroDay ? (
                    <div className="space-y-4">
                        {/* Risk Score */}
                        <div className="text-center p-4 rounded-xl bg-bg border border-border">
                            <p className="text-[8px] font-black text-text-dim uppercase mb-1">Pontuação de Risco</p>
                            <p className={cn("text-4xl font-black", (zeroDayData?.riskScore ?? 0) >= 70 ? "text-red-400" : (zeroDayData?.riskScore ?? 0) >= 40 ? "text-yellow-400" : "text-green-400")}>
                                {zeroDayData?.riskScore ?? 0}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: 'Padrões', value: zeroDayData?.patternsAnalyzed ?? 0, color: 'text-accent' },
                                { label: 'Anomalias', value: zeroDayData?.anomaliesDetected ?? 0, color: (zeroDayData?.anomaliesDetected ?? 0) > 0 ? 'text-red-400' : 'text-green-400' },
                                { label: 'Vulnerabilidades', value: zeroDayData?.vulnerabilities?.length ?? 0, color: (zeroDayData?.vulnerabilities?.length ?? 0) > 0 ? 'text-red-400' : 'text-green-400' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* High Risk Patterns */}
                        {(zeroDayData?.highRiskPatterns?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Padrões de Alto Risco</p>
                                <div className="flex flex-wrap gap-2">
                                    {zeroDayData?.highRiskPatterns?.map((pattern: any, i: number) => (
                                        <span key={i} className="text-[9px] font-black uppercase px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                            {pattern}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Zero-Day Vulnerabilities */}
                        {(zeroDayData?.vulnerabilities?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Vulnerabilidades Detectadas</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {zeroDayData?.vulnerabilities?.slice(0, 5).map((vuln: any) => (
                                        <div key={vuln.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{vuln.title}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", vuln.severity === 'critical' ? "bg-red-500/10 text-red-400" : vuln.severity === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400")}>
                                                    {vuln.severity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-2">{vuln.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                                <span>Confiança: {vuln.confidence}%</span>
                                                <span>•</span>
                                                <span>{vuln.category}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(zeroDayData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {zeroDayData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                            <AlertTriangle className="size-3 text-purple-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Attack Chain Analysis Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link2 className="size-5 text-primary" />
                        <span className="label-caps">Análise de Cadeia de Ataques</span>
                    </div>
                    <button
                        onClick={handleAnalyzeAttackChains}
                        disabled={analyzingChains}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/15 border border-orange-500/40 rounded-xl text-[10px] font-bold text-orange-400 hover:bg-orange-500/25 transition-all disabled:opacity-50"
                    >
                        <ArrowRight className="size-3" />
                        {analyzingChains ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                {attackChainsLoading ? (
                    <SkeletonCard />
                ) : attackChains ? (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Cadeias', value: attackChains?.summary?.totalChains || 0, color: 'text-accent' },
                                { label: 'Críticas', value: attackChains?.summary?.criticalChains || 0, color: 'text-red-400' },
                                { label: 'Alto Risco', value: attackChains?.summary?.highRiskChains || 0, color: 'text-orange-400' },
                                { label: 'Máxima', value: attackChains?.summary?.longestChain || 0, color: 'text-accent' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Attack Chains */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Cadeias de Ataques Detectadas</p>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {attackChainsData?.chains?.slice(0, 4).map((chain: any) => (
                                    <div key={chain.id} className="p-3 rounded-xl bg-bg border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-accent">{chain.name}</span>
                                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", chain.overallRisk === 'critical' ? "bg-red-500/10 text-red-400" : chain.overallRisk === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400")}>
                                                {chain.overallRisk}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-dim mb-2">{chain.description}</p>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] text-text-dim">Passos: {chain.totalSteps}</span>
                                            <span className="text-[9px] text-text-dim">•</span>
                                            <span className="text-[9px] text-text-dim">Confiança: {Math.round(chain.confidence * 100)}%</span>
                                        </div>
                                        {/* Chain visualization */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                            {chain.nodes?.map((node: any, i: number) => (
                                                <div key={node.id} className="flex items-center">
                                                    <div className={cn("size-6 rounded-full flex items-center justify-center text-[8px] font-bold", node.severity === 'critical' ? "bg-red-500/20 text-red-400" : node.severity === 'high' ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400")}>
                                                        {i + 1}
                                                    </div>
                                                    {i < chain.nodes.length - 1 && <ArrowRight className="size-3 text-text-dim" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Common Patterns */}
                        {(attackChainsData?.commonPatterns?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Padrões Comuns</p>
                                <div className="space-y-2">
                                    {attackChainsData?.commonPatterns?.slice(0, 3).map((pattern: any, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
                                            <AlertTriangle className="size-3 text-orange-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{pattern}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(attackChainsData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {attackChainsData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                            <AlertTriangle className="size-3 text-blue-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Dangerous Pattern Detection Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertOctagon className="size-5 text-primary" />
                        <span className="label-caps">Detecção de Padrões Perigosos</span>
                    </div>
                    <button
                        onClick={handleDetectDangerousPatterns}
                        disabled={detectingPatterns}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/40 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
                    >
                        <FileSearch className="size-3" />
                        {detectingPatterns ? 'Detectando...' : 'Detectar'}
                    </button>
                </div>

                {dangerousPatternsLoading ? (
                    <SkeletonCard />
                ) : dangerousPatterns ? (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Matches', value: dangerousPatternsData?.summary?.totalMatches ?? 0, color: 'text-accent' },
                                { label: 'Críticos', value: dangerousPatternsData?.summary?.criticalMatches ?? 0, color: 'text-red-400' },
                                { label: 'Arquivos', value: dangerousPatternsData?.summary?.filesWithMatches ?? 0, color: (dangerousPatternsData?.summary?.filesWithMatches ?? 0) > 0 ? 'text-orange-400' : 'text-green-400' },
                                { label: 'Padrões', value: dangerousPatternsData?.patternsAnalyzed ?? 0, color: 'text-accent' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Category Breakdown */}
                        {Object.keys(dangerousPatternsData?.categoryBreakdown || {}).length > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Breakdown por Categoria</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(dangerousPatternsData?.categoryBreakdown || {}).map(([category, count]) => (
                                        <div key={category} className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border">
                                            <span className="text-xs font-bold text-accent capitalize">{category}</span>
                                            <span className="text-[10px] font-bold text-text-dim">{String(count)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Risky Files */}
                        {(dangerousPatternsData?.topRiskyFiles?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Arquivos de Maior Risco</p>
                                <div className="space-y-2">
                                    {dangerousPatternsData?.topRiskyFiles?.slice(0, 5).map((file: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <span className="text-xs text-text-dim truncate max-w-[200px]">{file.file}</span>
                                            <span className="text-[10px] font-bold text-red-400">{file.matchCount} matches</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pattern Matches */}
                        {(dangerousPatternsData?.matches?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Matches Recentes</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {dangerousPatternsData?.matches?.slice(0, 5).map((match: any) => (
                                        <div key={match.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{match.patternName}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", match.severity === 'critical' ? "bg-red-500/10 text-red-400" : match.severity === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400")}>
                                                    {match.severity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-1">{match.file}:{match.line}</p>
                                            <code className="text-[9px] text-text-dim bg-black/20 px-2 py-1 rounded block overflow-x-auto">
                                                {match.codeSnippet}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(dangerousPatternsData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {dangerousPatternsData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <AlertTriangle className="size-3 text-red-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Package Vulnerability Scanning Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="size-5 text-primary" />
                        <span className="label-caps">Verificação de Pacotes (CVE)</span>
                    </div>
                    <button
                        onClick={handleScanPackageVulnerabilities}
                        disabled={scanningPackages}
                        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/15 border border-yellow-500/40 rounded-xl text-[10px] font-bold text-yellow-400 hover:bg-yellow-500/25 transition-all disabled:opacity-50"
                    >
                        <ShieldAlert className="size-3" />
                        {scanningPackages ? 'Verificando...' : 'Verificar'}
                    </button>
                </div>

                {packageVulnerabilitiesLoading ? (
                    <SkeletonCard />
                ) : packageVulnerabilitiesData ? (
                    <div className="space-y-4">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Pacotes', value: packageVulnerabilitiesData?.packagesScanned ?? 0, color: 'text-accent' },
                                { label: 'Vulneráveis', value: packageVulnerabilitiesData?.summary?.vulnerablePackages ?? 0, color: (packageVulnerabilitiesData?.summary?.vulnerablePackages ?? 0) > 0 ? 'text-red-400' : 'text-green-400' },
                                { label: 'CVEs', value: packageVulnerabilitiesData?.vulnerabilitiesFound ?? 0, color: (packageVulnerabilitiesData?.vulnerabilitiesFound ?? 0) > 0 ? 'text-orange-400' : 'text-green-400' },
                                { label: 'Risco', value: packageVulnerabilitiesData?.summary?.overallRiskScore ?? 0, color: (packageVulnerabilitiesData?.summary?.overallRiskScore ?? 0) >= 70 ? 'text-red-400' : (packageVulnerabilitiesData?.summary?.overallRiskScore ?? 0) >= 40 ? 'text-yellow-400' : 'text-green-400' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Vulnerability Breakdown */}
                        {(packageVulnerabilitiesData?.vulnerabilitiesFound ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Breakdown por Severidade</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Críticas', value: packageVulnerabilitiesData?.criticalVulnerabilities ?? 0, color: 'text-red-400' },
                                        { label: 'Altas', value: packageVulnerabilitiesData?.highVulnerabilities ?? 0, color: 'text-orange-400' },
                                        { label: 'Médias', value: packageVulnerabilitiesData?.mediumVulnerabilities ?? 0, color: 'text-yellow-400' },
                                        { label: 'Baixas', value: packageVulnerabilitiesData?.lowVulnerabilities ?? 0, color: 'text-blue-400' },
                                    ].map(stat => (
                                        <div key={stat.label} className="text-center p-2 rounded-lg bg-bg border border-border">
                                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[8px] text-text-dim">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Vulnerable Packages */}
                        {(packageVulnerabilitiesData?.packageVulnerabilities?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Pacotes Vulneráveis</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {packageVulnerabilitiesData.packageVulnerabilities.slice(0, 5).map((vuln: any) => (
                                        <div key={vuln.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{vuln.package.name}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", vuln.vulnerability.severity === 'critical' ? "bg-red-500/10 text-red-400" : vuln.vulnerability.severity === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400")}>
                                                    {vuln.vulnerability.severity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-1">{vuln.vulnerability.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                                <span>Versão: {vuln.affectedVersion}</span>
                                                {vuln.recommendedVersion && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="text-green-400">Recomendado: {vuln.recommendedVersion}</span>
                                                    </>
                                                )}
                                            </div>
                                            {vuln.vulnerability.cveId && (
                                                <div className="mt-1">
                                                    <span className="text-[9px] font-mono text-blue-400">{vuln.vulnerability.cveId}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(packageVulnerabilitiesData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações</p>
                                <div className="space-y-2">
                                    {packageVulnerabilitiesData.recommendations.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                                            <AlertTriangle className="size-3 text-yellow-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* ML/AI Zero-Day Discovery Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Brain className="size-5 text-primary" />
                        <span className="label-caps">Descoberta ML/AI Zero-Day</span>
                    </div>
                    <button
                        onClick={handleRunMLAnalysis}
                        disabled={runningMLAnalysis}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/40 rounded-xl text-[10px] font-bold text-purple-400 hover:from-purple-500/25 hover:to-pink-500/25 transition-all disabled:opacity-50"
                    >
                        <Brain className="size-3" />
                        {runningMLAnalysis ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                {mlZeroDayLoading ? (
                    <SkeletonCard />
                ) : mlZeroDay ? (
                    <div className="space-y-4">
                        {/* Model Performance */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Modelos', value: mlZeroDayData?.modelsUsed?.length ?? 0, color: 'text-accent' },
                                { label: 'Padrões', value: mlZeroDayData?.patternsAnalyzed ?? 0, color: 'text-accent' },
                                { label: 'Anomalias', value: mlZeroDayData?.anomaliesDetected ?? 0, color: (mlZeroDayData?.anomaliesDetected ?? 0) > 0 ? 'text-purple-400' : 'text-green-400' },
                                { label: 'Confiança', value: `${Math.round((mlZeroDayData?.summary?.averageConfidence ?? 0) * 100)}%`, color: 'text-purple-400' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Model Performance Metrics */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Performance dos Modelos</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { label: 'Acurácia', value: `${Math.round((mlZeroDayData?.modelPerformance?.accuracy ?? 0) * 100)}%` },
                                    { label: 'Precisão', value: `${Math.round((mlZeroDayData?.modelPerformance?.precision ?? 0) * 100)}%` },
                                    { label: 'Recall', value: `${Math.round((mlZeroDayData?.modelPerformance?.recall ?? 0) * 100)}%` },
                                    { label: 'F1-Score', value: `${Math.round((mlZeroDayData?.modelPerformance?.f1Score ?? 0) * 100)}%` },
                                ].map(metric => (
                                    <div key={metric.label} className="text-center p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                        <p className="text-lg font-bold text-purple-400">{metric.value}</p>
                                        <p className="text-[8px] text-text-dim">{metric.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ML Vulnerabilities */}
                        {(mlZeroDayData?.vulnerabilities?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Vulnerabilidades Detectadas por ML</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {mlZeroDayData?.vulnerabilities?.slice(0, 5).map((vuln: any) => (
                                        <div key={vuln.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{vuln.title}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", vuln.severity === 'critical' ? "bg-red-500/10 text-red-400" : vuln.severity === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-purple-500/10 text-purple-400")}>
                                                    {vuln.severity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-1">{vuln.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                                <span>Modelo: {vuln.mlModel}</span>
                                                <span>•</span>
                                                <span>Confiança: {Math.round(vuln.confidence * 100)}%</span>
                                                <span>•</span>
                                                <span>Anomalia: {Math.round(vuln.anomalyScore * 100)}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(mlZeroDayData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações ML</p>
                                <div className="space-y-2">
                                    {mlZeroDayData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20">
                                            <Brain className="size-3 text-purple-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Exploitation Testing Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TestTube className="size-5 text-primary" />
                        <span className="label-caps">Testes de Exploração (Simulação)</span>
                    </div>
                    <button
                        onClick={handleRunExploitationTests}
                        disabled={runningExploitationTests}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/40 rounded-xl text-[10px] font-bold text-red-400 hover:bg-red-500/25 transition-all disabled:opacity-50"
                    >
                        <TestTube className="size-3" />
                        {runningExploitationTests ? 'Testando...' : 'Testar'}
                    </button>
                </div>

                {exploitationTestsLoading ? (
                    <SkeletonCard />
                ) : exploitationTests ? (
                    <div className="space-y-4">
                        {/* Test Summary */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Testes', value: exploitationTestsData?.testsExecuted ?? 0, color: 'text-accent' },
                                { label: 'Sucesso', value: exploitationTestsData?.testsSuccessful ?? 0, color: (exploitationTestsData?.testsSuccessful ?? 0) > 0 ? 'text-red-400' : 'text-green-400' },
                                { label: 'Bloqueados', value: exploitationTestsData?.testsBlocked ?? 0, color: (exploitationTestsData?.testsBlocked ?? 0) > 0 ? 'text-yellow-400' : 'text-green-400' },
                                { label: 'Taxa', value: `${exploitationTestsData?.summary?.successRate ?? 0}%`, color: (exploitationTestsData?.summary?.successRate ?? 0) > 20 ? 'text-red-400' : 'text-green-400' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Vulnerability Breakdown */}
                        {(exploitationTestsData?.vulnerabilitiesConfirmed ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Vulnerabilidades Confirmadas</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Críticas', value: exploitationTestsData?.summary?.criticalVulnerabilities ?? 0, color: 'text-red-400' },
                                        { label: 'Altas', value: exploitationTestsData?.summary?.highVulnerabilities ?? 0, color: 'text-orange-400' },
                                        { label: 'Médias', value: exploitationTestsData?.summary?.mediumVulnerabilities ?? 0, color: 'text-yellow-400' },
                                        { label: 'Baixas', value: exploitationTestsData?.summary?.lowVulnerabilities ?? 0, color: 'text-blue-400' },
                                    ].map(stat => (
                                        <div key={stat.label} className="text-center p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                                            <p className="text-[8px] text-text-dim">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Test Results */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Resultados dos Testes</p>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {exploitationTestsData?.results?.slice(0, 5).map((result: any) => (
                                    <div key={result.id} className="p-3 rounded-xl bg-bg border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-accent">{result.testName}</span>
                                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", 
                                                result.status === 'success' ? "bg-red-500/10 text-red-400" : 
                                                result.status === 'blocked' ? "bg-yellow-500/10 text-yellow-400" : 
                                                "bg-green-500/10 text-green-400")}>
                                                {result.status === 'success' ? 'Vulnerável' : result.status === 'blocked' ? 'Bloqueado' : 'Seguro'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-dim mb-1">{result.evidence}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                            <span>Tempo: {result.responseTime}ms</span>
                                            {result.responseCode && (
                                                <>
                                                    <span>•</span>
                                                    <span>Código: {result.responseCode}</span>
                                                </>
                                            )}
                                        </div>
                                        {result.vulnerabilityConfirmed && (
                                            <div className="mt-1">
                                                <p className="text-[9px] text-red-400">Impacto: {result.impact}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendations */}
                        {(exploitationTestsData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações de Segurança</p>
                                <div className="space-y-2">
                                    {exploitationTestsData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <TestTube className="size-3 text-red-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Comprehensive Compliance Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Scale className="size-5 text-primary" />
                        <span className="label-caps">Verificação Completa de Compliance</span>
                    </div>
                    <button
                        onClick={handleComprehensiveCompliance}
                        disabled={runningComprehensiveCompliance}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/15 to-green-500/15 border border-blue-500/40 rounded-xl text-[10px] font-bold text-blue-400 hover:from-blue-500/25 hover:to-green-500/25 transition-all disabled:opacity-50"
                    >
                        <Scale className="size-3" />
                        {runningComprehensiveCompliance ? 'Verificando...' : 'Verificar'}
                    </button>
                </div>

                {comprehensiveComplianceLoading ? (
                    <SkeletonCard />
                ) : comprehensiveCompliance ? (
                    <div className="space-y-4">
                                {/* Overall Compliance Score */}
                        <div className="text-center p-4 rounded-xl bg-bg border border-border">
                            <p className="text-[8px] font-black text-text-dim uppercase mb-1">Score Geral de Compliance</p>
                            <p className={cn("text-4xl font-black", 
                                comprehensiveCompliance?.overallScore >= 90 ? "text-green-400" : 
                                comprehensiveCompliance?.overallScore >= 70 ? "text-yellow-400" : 
                                "text-red-400")}>
                                {comprehensiveCompliance?.overallScore || 0}%
                            </p>
                            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded mt-2 inline-block",
                                comprehensiveCompliance?.overallStatus === 'compliant' ? "bg-green-500/10 text-green-400" :
                                comprehensiveCompliance?.overallStatus === 'partial' ? "bg-yellow-500/10 text-yellow-400" :
                                "bg-red-500/10 text-red-400")}>
                                {comprehensiveCompliance?.overallStatus === 'compliant' ? 'Conforme' :
                                 comprehensiveCompliance?.overallStatus === 'partial' ? 'Parcial' : 'Não Conforme'}
                            </span>
                        </div>

                        {/* Framework Scores */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { name: 'OWASP', score: comprehensiveCompliance?.frameworks?.owasp?.score || 0, version: 'Top 10 2021' },
                                { name: 'CIS', score: comprehensiveCompliance?.frameworks?.cis?.score || 0, version: 'Controls v8' },
                                { name: 'NIST', score: comprehensiveCompliance?.frameworks?.nist?.score || 0, version: 'CSF v1.1' },
                            ].map(framework => (
                                <div key={framework.name} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className="text-xs font-bold text-accent">{framework.name}</p>
                                    <p className={cn("text-2xl font-bold", 
                                        framework.score >= 90 ? "text-green-400" : 
                                        framework.score >= 70 ? "text-yellow-400" : 
                                        "text-red-400")}>
                                        {framework.score}%
                                    </p>
                                    <p className="text-[8px] text-text-dim">{framework.version}</p>
                                </div>
                            ))}
                        </div>

                        {/* Summary Statistics */}
                        {comprehensiveCompliance?.summary && (
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Controles', value: comprehensiveCompliance?.summary?.totalControls || 0, color: 'text-accent' },
                                    { label: 'Conformes', value: comprehensiveCompliance?.summary?.compliantControls || 0, color: 'text-green-400' },
                                    { label: 'Não Conformes', value: comprehensiveCompliance?.summary?.nonCompliantControls || 0, color: 'text-red-400' },
                                    { label: 'Críticos', value: comprehensiveCompliance?.summary?.criticalIssues || 0, color: 'text-red-400' },
                                ].map(stat => (
                                    <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Compliance Roadmap */}
                        {comprehensiveCompliance?.roadmap && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Roadmap de Compliance</p>
                                <div className="space-y-3">
                                    {[
                                        { title: 'Ações Imediatas', items: comprehensiveCompliance?.roadmap?.immediate || [], color: 'red' },
                                        { title: 'Curto Prazo', items: comprehensiveCompliance?.roadmap?.shortTerm || [], color: 'yellow' },
                                        { title: 'Longo Prazo', items: comprehensiveCompliance?.roadmap?.longTerm || [], color: 'green' },
                                    ].map(phase => (
                                        <div key={phase.title} className="p-3 rounded-xl bg-bg border border-border">
                                            <p className="text-xs font-bold text-accent mb-2">{phase.title}</p>
                                            <div className="space-y-1">
                                                {phase.items.slice(0, 2).map((item, i) => (
                                                    <div key={i} className="flex items-start gap-2">
                                                        <div className={cn("size-1.5 rounded-full mt-1.5 shrink-0",
                                                            phase.color === 'red' ? "bg-red-400" :
                                                            phase.color === 'yellow' ? "bg-yellow-400" :
                                                            "bg-green-400")} />
                                                        <p className="text-[10px] text-text-dim">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Framework Details */}
                        {comprehensiveCompliance?.frameworks && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Detalhes dos Frameworks</p>
                                <div className="space-y-3">
                                    {Object.entries(comprehensiveCompliance?.frameworks || {}).map(([name, framework]: [string, any]) => (
                                        <div key={name} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{name}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded",
                                                    framework?.score >= 90 ? "bg-green-500/10 text-green-400" :
                                                    framework?.score >= 70 ? "bg-yellow-500/10 text-yellow-400" :
                                                    "bg-red-500/10 text-red-400")}>
                                                    {framework?.score || 0}%
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-[9px] text-text-dim">
                                                <div className="text-center">
                                                    <p className="font-bold text-green-400">{framework?.compliantControls || 0}</p>
                                                    <p>Conformes</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-yellow-400">{framework?.partialControls || 0}</p>
                                                    <p>Parciais</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-red-400">{framework?.nonCompliantControls || 0}</p>
                                                    <p>Não Conformes</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-red-400">{framework?.criticalIssues || 0}</p>
                                                    <p>Críticos</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {comprehensiveCompliance?.recommendations && comprehensiveCompliance?.recommendations?.length > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações de Compliance</p>
                                <div className="space-y-2">
                                    {comprehensiveCompliance?.recommendations?.slice(0, 3).map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                            <Scale className="size-3 text-blue-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Detailed Infrastructure Analysis Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Server className="size-5 text-primary" />
                        <span className="label-caps">Análise Detalhada de Infraestrutura</span>
                    </div>
                    <button
                        onClick={handleDetailedInfrastructure}
                        disabled={runningDetailedInfrastructure}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/40 rounded-xl text-[10px] font-bold text-cyan-400 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all disabled:opacity-50"
                    >
                        <Cpu className="size-3" />
                        {runningDetailedInfrastructure ? 'Analisando...' : 'Analisar'}
                    </button>
                </div>

                {detailedInfrastructureLoading ? (
                    <SkeletonCard />
                ) : detailedInfrastructure ? (
                    <div className="space-y-4">
                        {/* Infrastructure Overview */}
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Recursos', value: detailedInfrastructure?.summary?.totalResources || 0, color: 'text-accent' },
                                { label: 'Seguros', value: detailedInfrastructure?.summary?.secureResources || 0, color: 'text-green-400' },
                                { label: 'Vulneráveis', value: detailedInfrastructure?.summary?.vulnerableResources || 0, color: (detailedInfrastructure?.summary?.vulnerableResources || 0) > 0 ? 'text-red-400' : 'text-green-400' },
                                { label: 'Saúde', value: `${detailedInfrastructure?.summary?.healthScore || 0}%`, color: (detailedInfrastructure?.summary?.healthScore || 0) >= 90 ? 'text-green-400' : (detailedInfrastructure?.summary?.healthScore || 0) >= 70 ? 'text-yellow-400' : 'text-red-400' },
                            ].map(stat => (
                                <div key={stat.label} className="text-center p-3 rounded-xl bg-bg border border-border">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-[8px] font-black text-text-dim uppercase mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Resource Type Breakdown */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Breakdown por Tipo de Recurso</p>
                            <div className="grid grid-cols-5 gap-2">
                                {Object.entries(detailedInfrastructure?.resourceBreakdown || {}).map(([type, count]) => (
                                    <div key={type} className="text-center p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                        <p className="text-lg font-bold text-cyan-400">{count}</p>
                                        <p className="text-[8px] text-text-dim">{type}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Provider Breakdown */}
                        <div>
                            <p className="text-[8px] font-black text-text-dim uppercase mb-2">Breakdown por Provedor</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(detailedInfrastructure?.providerBreakdown || {}).map(([provider, count]) => (
                                    <div key={provider} className="text-center p-2 rounded-lg bg-bg border border-border">
                                        <p className="text-lg font-bold text-accent">{count}</p>
                                        <p className="text-[8px] text-text-dim">{provider}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Infrastructure Vulnerabilities */}
                        {(detailedInfrastructureData?.vulnerabilities?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Vulnerabilidades de Infraestrutura</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {detailedInfrastructureData?.vulnerabilities?.slice(0, 5).map((vuln: any) => (
                                        <div key={vuln.id} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{vuln.vulnerability}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", vuln.severity === 'critical' ? "bg-red-500/10 text-red-400" : vuln.severity === 'high' ? "bg-orange-500/10 text-orange-400" : "bg-yellow-500/10 text-yellow-400")}>
                                                    {vuln.severity}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-1">{vuln.description}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                                <span>Recurso: {vuln.resourceType}</span>
                                                {vuln.cveId && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-mono text-blue-400">{vuln.cveId}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resource Configurations */}
                        {(detailedInfrastructureData?.configurations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Configurações de Recursos</p>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {detailedInfrastructureData?.configurations?.slice(0, 5).map((config: any, index: number) => (
                                        <div key={`${config.resourceId}-${index}`} className="p-3 rounded-xl bg-bg border border-border">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-accent">{config.setting}</span>
                                                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", 
                                                    config.isSecure ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                                                    {config.isSecure ? 'Seguro' : 'Inseguro'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-text-dim mb-1">{config.value}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-text-dim">
                                                <span>Risco: {config.riskLevel}</span>
                                                <span>•</span>
                                                <span>{config.category}</span>
                                            </div>
                                            {!config.isSecure && (
                                                <div className="mt-1">
                                                    <p className="text-[9px] text-yellow-400">Recomendação: {config.recommendation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Vulnerable Resources */}
                        {(detailedInfrastructureData?.topVulnerableResources?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recursos Mais Vulneráveis</p>
                                <div className="space-y-2">
                                    {detailedInfrastructureData?.topVulnerableResources?.slice(0, 3).map((item: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="size-3 text-red-400" />
                                                <span className="text-xs text-text-dim">{item.resource}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-red-400">{item.vulnerabilityCount} vulnerabilidades</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Infrastructure Metrics */}
                        {(detailedInfrastructureData?.metrics?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Métricas de Recursos</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {detailedInfrastructureData?.metrics?.slice(0, 3).map((metric: any) => (
                                        <div key={metric.resourceId} className="p-2 rounded-lg bg-bg border border-border">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] text-text-dim">CPU</span>
                                                    <span className={cn("text-[9px] font-bold", 
                                                        metric.cpu > 80 ? "text-red-400" : metric.cpu > 60 ? "text-yellow-400" : "text-green-400")}>
                                                        {metric.cpu}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] text-text-dim">Memória</span>
                                                    <span className={cn("text-[9px] font-bold", 
                                                        metric.memory > 80 ? "text-red-400" : metric.memory > 60 ? "text-yellow-400" : "text-green-400")}>
                                                        {metric.memory}%
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] text-text-dim">Uptime</span>
                                                    <span className="text-[9px] font-bold text-green-400">{metric.uptime}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {(detailedInfrastructureData?.recommendations?.length ?? 0) > 0 && (
                            <div>
                                <p className="text-[8px] font-black text-text-dim uppercase mb-2">Recomendações de Infraestrutura</p>
                                <div className="space-y-2">
                                    {detailedInfrastructureData?.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                            <Server className="size-3 text-cyan-400 mt-0.5 shrink-0" />
                                            <p className="text-xs text-text-dim">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Schedule Management Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-5 text-primary" />
                        <span className="label-caps">Agendamentos (Schedules)</span>
                    </div>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/15 border border-blue-500/40 rounded-xl text-[10px] font-bold text-blue-400 hover:bg-blue-500/25 transition-all"
                    >
                        <Plus className="size-3" />
                        Novo Schedule
                    </button>
                </div>

                {schedulesLoading ? (
                    <SkeletonCard />
                ) : schedules && Array.isArray((schedules as any)?.data ?? schedules) ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {((schedules as any)?.data ?? schedules).map((sched: any) => (
                            <div key={sched.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Clock className="size-4 text-text-dim shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-accent truncate">{sched.targetName || sched.scanType}</p>
                                        <p className="text-[10px] text-text-dim">{sched.scanType} · {sched.frequency}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleToggleSchedule(sched.id, !sched.enabled)}
                                        disabled={togglingScheduleId === sched.id}
                                        className={cn("rounded-lg p-1.5 transition-colors", sched.enabled ? "text-green-400 hover:bg-green-500/10" : "text-text-dim hover:bg-white/5")}
                                        aria-label={sched.enabled ? 'Desativar' : 'Ativar'}
                                    >
                                        <CheckCircle className={cn("size-3.5", sched.enabled ? "fill-green-500/20" : "")} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSchedule(sched.id)}
                                        disabled={deletingScheduleId === sched.id}
                                        className="rounded-lg p-1.5 text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        aria-label="Excluir schedule"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-text-dim">Nenhum agendamento configurado</p>
                )}
            </div>

            {/* Webhook Management Section */}
            <div className="bento-card space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="size-5 text-primary" />
                        <span className="label-caps">Webhooks</span>
                    </div>
                    <button
                        onClick={() => setShowWebhookModal(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/15 border border-purple-500/40 rounded-xl text-[10px] font-bold text-purple-400 hover:bg-purple-500/25 transition-all"
                    >
                        <Plus className="size-3" />
                        Novo Webhook
                    </button>
                </div>

                {webhooksLoading ? (
                    <SkeletonCard />
                ) : webhooks && Array.isArray((webhooks as any)?.data ?? webhooks) ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {((webhooks as any)?.data ?? webhooks).map((wh: any) => (
                            <div key={wh.id} className="flex items-center justify-between p-3 rounded-xl bg-bg border border-border">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Bell className="size-4 text-text-dim shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-accent truncate">{wh.url}</p>
                                        <p className="text-[10px] text-text-dim">{wh.events?.join(', ') || 'scan.completed'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleToggleWebhook(wh.id, !wh.enabled)}
                                        disabled={togglingWebhookId === wh.id}
                                        className={cn("rounded-lg p-1.5 transition-colors", wh.enabled ? "text-green-400 hover:bg-green-500/10" : "text-text-dim hover:bg-white/5")}
                                        aria-label={wh.enabled ? 'Desativar' : 'Ativar'}
                                    >
                                        <CheckCircle className={cn("size-3.5", wh.enabled ? "fill-green-500/20" : "")} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteWebhook(wh.id)}
                                        disabled={deletingWebhookId === wh.id}
                                        className="rounded-lg p-1.5 text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                        aria-label="Excluir webhook"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-text-dim">Nenhum webhook configurado</p>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
                </div>
            ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-3">
                    <ShieldCheck className="size-10 text-border" />
                    <p className="text-text-dim text-sm">Ainda não há varreduras — execute a primeira</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {list.map(scan => (
                        <div key={scan.id} className="bento-card flex flex-row items-center gap-3 overflow-hidden">
                            <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-bold text-accent truncate min-w-0 flex-1" title={scan.targetName}>{scan.targetName}</span>
                                    <span className="shrink-0">
                                        <SeverityBadge severity={scan.severity} />
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
                                    <span className="rounded-md bg-white/5 border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                                        {scan.type}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <AlertTriangle className="size-3" />
                                        <span className="text-accent font-semibold">{scan.vulnerabilityCount}</span> findings
                                    </span>
                                    <span className="ml-auto label-caps">{relativeTime(scan.analyzedAt)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpenId(scan.id)}
                                className="rounded-lg p-2 text-text-dim hover:text-accent hover:bg-white/5 transition-colors shrink-0"
                                aria-label="View details"
                            >
                                <Eye className="size-4" />
                            </button>
                            <span className="relative group">
                                <button className="rounded-lg p-2 text-text-dim hover:text-green-400 hover:bg-green-500/10 transition-colors shrink-0" aria-label="Download report">
                                    <Download className="size-4" />
                                </button>
                                <span className="absolute bottom-full right-0 mb-1 hidden group-hover:flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                                    {REPORT_FORMATS.map(f => (
                                        <a
                                            key={f}
                                            href={`/api/v1/security/scans/${scan.id}/report?format=${f}`}
                                            download={`scan-${scan.id}.${f === 'pdf' ? 'md' : 'json'}`}
                                            className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-dim hover:text-accent hover:bg-white/5 transition-colors whitespace-nowrap"
                                        >
                                            .{f === 'pdf' ? 'md' : 'json'}
                                        </a>
                                    ))}
                                </span>
                            </span>
                            <button
                                onClick={() => handleDelete(scan.id)}
                                disabled={deletingId === scan.id}
                                className="rounded-lg p-2 text-text-dim hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-50"
                                aria-label="Delete scan"
                            >
                                <Trash2 className="size-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        key="security-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.15 }}
                            className="bento-card w-full max-w-lg space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base">New Security Scan</h3>
                                <button onClick={closeModal} className="rounded-lg p-1 text-text-dim hover:text-accent transition-colors">
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="label-caps block mb-1">Target Name</label>
                                    <input
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={targetName}
                                        onChange={e => setTargetName(e.target.value)}
                                        placeholder="ex.: main-api"
                                    />
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">Type</label>
                                    <select
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={type}
                                        onChange={e => setType(e.target.value as ScanType)}
                                    >
                                        {SCAN_TYPES.map(t => (
                                            <option key={t} value={t}>{t === 'comprehensive' ? 'Comprehensive (All Scans)' : t}</option>
                                        ))}
                                    </select>
                                    {type === 'comprehensive' && (
                                        <p className="text-[10px] text-text-dim mt-1">Runs code, system, dependency, and infrastructure scans together</p>
                                    )}
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">
                                        Target Project {(type === 'code' || type === 'comprehensive') && !targetPath.trim() ? '(required)' : '(optional)'}
                                    </label>
                                    <select
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                    >
                                        <option value="">Nenhum projeto específico</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">
                                        Target Path {(type === 'code' || type === 'comprehensive') && !selectedProjectId ? '(required)' : '(optional)'}
                                    </label>
                                    <input
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={targetPath}
                                        onChange={e => setTargetPath(e.target.value)}
                                        placeholder="src/"
                                    />
                                </div>
                                {type === 'code' && (
                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => setDeepScan(!deepScan)}
                                            className={cn(
                                                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                                deepScan ? 'bg-primary' : 'bg-border'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                                    deepScan ? 'translate-x-4' : 'translate-x-0'
                                                )}
                                            />
                                        </button>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-accent">Deep Scan (AI-powered)</span>
                                            <span className="text-[10px] text-text-dim uppercase tracking-widest font-bold">Comprehensive 5-phase analysis</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={closeModal}
                                    className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-dim hover:text-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/40 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/25 transition-colors disabled:opacity-50"
                                >
                                    <Plus className="size-3.5" />
                                    {submitting ? 'Executando…' : 'Run Scan'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) setShowScheduleModal(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.15 }}
                            className="bento-card w-full max-w-lg space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base">Novo Schedule</h3>
                                <button onClick={() => setShowScheduleModal(false)} className="rounded-lg p-1 text-text-dim hover:text-accent transition-colors">
                                    <X className="size-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="label-caps block mb-1">Target Name</label>
                                    <input
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={scheduleTargetName}
                                        onChange={e => setScheduleTargetName(e.target.value)}
                                        placeholder="ex.: daily-scan-api"
                                    />
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">Scan Type</label>
                                    <select
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={scheduleScanType}
                                        onChange={e => setScheduleScanType(e.target.value as ScanType)}
                                    >
                                        {SCAN_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">Frequência</label>
                                    <select
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={scheduleFrequency}
                                        onChange={e => setScheduleFrequency(e.target.value)}
                                    >
                                        {SCHEDULE_FREQUENCIES.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-dim hover:text-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSchedule}
                                    disabled={creatingSchedule}
                                    className="flex items-center gap-2 rounded-xl bg-blue-500/15 border border-blue-500/40 px-4 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/25 transition-colors disabled:opacity-50"
                                >
                                    <Calendar className="size-3.5" />
                                    {creatingSchedule ? 'Criando…' : 'Criar Schedule'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showWebhookModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={e => { if (e.target === e.currentTarget) setShowWebhookModal(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 12 }}
                            transition={{ duration: 0.15 }}
                            className="bento-card w-full max-w-lg space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-base">Novo Webhook</h3>
                                <button onClick={() => setShowWebhookModal(false)} className="rounded-lg p-1 text-text-dim hover:text-accent transition-colors">
                                    <X className="size-4" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="label-caps block mb-1">URL</label>
                                    <input
                                        type="url"
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={webhookUrl}
                                        onChange={e => setWebhookUrl(e.target.value)}
                                        placeholder="https://hooks.example.com/scan"
                                    />
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">Eventos</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {WEBHOOK_EVENT_TYPES.map(event => (
                                            <label key={event} className="flex items-center gap-2 p-2 rounded-lg bg-bg border border-border cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={webhookEvents.includes(event)}
                                                    onChange={e => {
                                                        setWebhookEvents(prev =>
                                                            e.target.checked
                                                                ? [...prev, event]
                                                                : prev.filter(ev => ev !== event)
                                                        );
                                                    }}
                                                    className="rounded"
                                                />
                                                <span className="text-[10px] text-text-dim">{event}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="label-caps block mb-1">Secret (opcional)</label>
                                    <input
                                        className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60 transition-colors"
                                        value={webhookSecret}
                                        onChange={e => setWebhookSecret(e.target.value)}
                                        placeholder="hmac-secret"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    onClick={() => setShowWebhookModal(false)}
                                    className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-text-dim hover:text-accent transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateWebhook}
                                    disabled={creatingWebhook}
                                    className="flex items-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/40 px-4 py-2 text-xs font-bold text-purple-400 hover:bg-purple-500/25 transition-colors disabled:opacity-50"
                                >
                                    <Bell className="size-3.5" />
                                    {creatingWebhook ? 'Criando…' : 'Criar Webhook'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {openId && <DetailModal scanId={openId} onClose={() => setOpenId(null)} />}
            </AnimatePresence>
        </motion.div>
    );
}

