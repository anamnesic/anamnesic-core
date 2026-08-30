# Security System — Planejamento e Nível de Implementação

## Legenda
- ✅ **Completo** — Implementado e funcional
- ⚠️ **Parcial** — Implementado mas com issues conhecidas
- ❌ **Ausente** — Não implementado
- 🔧 **Em andamento** — Sendo implementado agora

---

## 1. Backend — Rotas (Next.js App Router)

### Scans
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/scans` | ✅ | Lista scans com `?targetId=` opcional |
| `POST /api/v1/security/scans` | ⚠️ | Cria scan; valida `type` e `effectiveTarget` |
| `GET /api/v1/security/scans/[scanId]` | ✅ | Detalhe de um scan |
| `DELETE /api/v1/security/scans/[scanId]` | ✅ | Remove scan |
| `GET /api/v1/security/scans/[scanId]/report` | ✅ | Relatório JSON ou Markdown (`?format=json|pdf`) |

### Simulações
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/simulations` | ✅ | Lista com `?simulationId=` ou `?vulnerabilityId=` |
| `POST /api/v1/security/simulations` | ✅ | Cria simulação |
| `GET /api/v1/security/simulations/[simulationId]` | ✅ | Detalhe |

### Schedules (Agendamentos)
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/schedules` | ✅ | Lista por `workspaceId` ou `due=true` |
| `POST /api/v1/security/schedules` | ✅ | Cria schedule |
| `DELETE /api/v1/security/schedules/[scheduleId]` | ✅ | Remove schedule |
| `PATCH /api/v1/security/schedules/[scheduleId]` | ✅ | Ativa/desativa schedule |

### Webhooks
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/webhooks` | ✅ | Lista por `workspaceId` |
| `POST /api/v1/security/webhooks` | ✅ | Cria webhook |
| `DELETE /api/v1/security/webhooks/[webhookId]` | ✅ | Remove webhook |
| `PATCH /api/v1/security/webhooks/[webhookId]` | ✅ | Ativa/desativa webhook |

### Análises Individuais (GET)
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/api-analysis` | ✅ | `?targetUrl=` obrigatório |
| `GET /api/v1/security/infrastructure-analysis` | ✅ | `?projectPath=` |
| `GET /api/v1/security/compliance` | ✅ | `?projectPath=` |
| `GET /api/v1/security/zero-day` | ✅ | `?projectPath=` |
| `GET /api/v1/security/dangerous-patterns` | ✅ | `?projectPath=` |
| `GET /api/v1/security/package-vulnerabilities` | ✅ | `?projectPath=` |
| `GET /api/v1/security/ml-zero-day` | ✅ | `?projectPath=` |
| `GET /api/v1/security/exploitation-tests` | ✅ | `?targetUrl=` |
| `GET /api/v1/security/comprehensive-compliance` | ✅ | `?projectPath=` |
| `GET /api/v1/security/detailed-infrastructure` | ✅ | `?targetScope=` |

### Attack Chains
| Rota | Status | Observação |
|------|--------|------------|
| `GET /api/v1/security/attack-chains` | ✅ | Não faz fetch inicial; só via POST |
| `POST /api/v1/security/attack-chains` | ✅ | Análise baseada em vulnerabilidades |

### Agent Interface (Express Router)
| Rota | Status | Observação |
|------|--------|------------|
| `POST /api/v1/security/analyze` | ✅ | Usado pela extensão VSCode |
| `GET /api/v1/security/results/:resultId` | ✅ | Usado pela extensão VSCode |

---

## 2. Backend — Services

| Service | Status | Observação |
|---------|--------|------------|
| `SecurityAnalysisService` | ✅ | CRUD completo |
| `SecurityScanners` (Api/Dependency/Infra/System) | ✅ | Scanners individuais |
| `SecurityScheduleService` | ✅ | CRUD schedules + webhooks + notificações |
| `ProjectSecurityScanner` | ✅ | Pattern matching + AI deep scan |
| `AdvancedSecurityAnalysisService` | ✅ | 5-phase AI analysis |
| `ZeroDayDiscoveryService` | ✅ | Descoberta de zero-day |
| `ExploitationTestingService` | ✅ | Testes de exploração |
| `DangerousPatternDetectionService` | ✅ | Detecção de padrões perigosos |
| `MLZeroDayDiscoveryService` | ✅ | ML/AI zero-day |
| `InfrastructureAnalysisService` | ✅ | Análise de infraestrutura |
| `ComplianceAssessmentService` | ✅ | OWASP/CIS/NIST |
| `AttackChainAnalysisService` | ✅ | Cadeia de ataques |
| `APIAnalysisService` | ✅ | Análise de API |
| `PackageVulnerabilityService` | ✅ | CVE scanning |
| `ComprehensiveComplianceService` | ✅ | Compliance completo |
| `DetailedInfrastructureAnalysisService` | ✅ | Infraestrutura detalhada |
| `AttackSimulationFramework` | ✅ | Framework de simulação |

---

## 3. Frontend — Security.tsx

### Status atual
| Seção | Status | Observação |
|-------|--------|------------|
| Stats bar (total/critical/high) | ✅ | |
| Scan list + CRUD | ✅ | Lista + create modal + delete |
| Scan detail modal | ✅ | Vulnerabilidades + recomendações + simulate attack |
| API Analysis | ✅ | Só faz fetch quando usuário clica "Analisar" |
| Infrastructure Analysis | ✅ | |
| Attack Simulation | ✅ | |
| Compliance Assessment | ✅ | |
| Zero-Day Discovery | ✅ | |
| Attack Chain Analysis | ✅ | |
| Dangerous Pattern Detection | ✅ | |
| Package Vulnerability Scanning | ✅ | |
| ML/AI Zero-Day Discovery | ✅ | |
| Exploitation Testing | ✅ | |
| Comprehensive Compliance | ✅ | |
| Detailed Infrastructure | ✅ | |
| **Schedule Management** | ✅ | Lista, criar, toggle ativo/inativo, deletar |
| **Webhook Management** | ✅ | Lista, criar, toggle ativo/inativo, deletar |
| **Report Download** | ✅ | Botão com escolha de formato `.json` ou `.md` |

### Issues conhecidas
1. **Arquivo monolítico** — `Security.tsx` tem ~2800 linhas; precisa de componentização

---

## 4. Próximos Passos (Prioridade)

### Fase 1 — Frontend (concluído)
- [x] Adicionar seção de Schedules (listar + criar + toggle + deletar)
- [x] Adicionar seção de Webhooks (listar + criar + toggle + deletar)
- [x] Adicionar botão de download de relatório nos scans (json/md)

### Fase 2 — Backend (concluído)
- [x] Criar `DELETE /api/v1/security/schedules/[scheduleId]`
- [x] Criar `PATCH /api/v1/security/schedules/[scheduleId]` (toggle ativo/inativo)
- [x] Criar `DELETE /api/v1/security/webhooks/[webhookId]`
- [x] Criar `PATCH /api/v1/security/webhooks/[webhookId]` (toggle ativo/inativo)

### Fase 3 — Melhorias
- [x] Consertar URL hardcoded na API Analysis
- [x] Consertar GET attack-chains para não retornar mock vazio
- [ ] Componentizar Security.tsx em arquivos menores por seção
- [ ] Adicionar loading states coordenados na página inteira
