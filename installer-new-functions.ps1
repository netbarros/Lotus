# ═══════════════════════════════════════════════════════════════════════════
# ETAPA 2: NOVAS FUNÇÕES DE VALIDAÇÃO ENTERPRISE
# Adicionar estas funções ANTES do "# STEP 8: VERIFY INSTALLATION"
# ═══════════════════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════════════════
# STEP 20: VALIDATE PROMETHEUS EXPORTERS
# ═══════════════════════════════════════════════════════════════════════════

function Test-PrometheusExporters {
    Write-Header "VALIDANDO PROMETHEUS EXPORTERS"

    $exporters = @(
        @{ Name = "PostgreSQL Exporter"; Port = 9187; Container = "magicsaas-postgres-exporter" },
        @{ Name = "Redis Exporter"; Port = 9121; Container = "magicsaas-redis-exporter" }
    )

    foreach ($exporter in $exporters) {
        Write-InfoLine "Verificando $($exporter.Name)..."

        # Check container running
        $containerStatus = docker ps --filter "name=$($exporter.Container)" --format "{{.Status}}"

        if ($containerStatus -like "*Up*") {
            Write-Success "  ✓ Container rodando"

            # Check metrics endpoint
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$($exporter.Port)/metrics" -UseBasicParsing -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-Success "  ✓ Endpoint /metrics respondendo"

                    # Count metrics
                    $metricsCount = ($response.Content -split "`n" | Where-Object { $_ -notmatch "^#" -and $_.Trim() -ne "" }).Count
                    Write-Success "  ✓ $metricsCount métricas expostas"
                } else {
                    Write-Warning "  ⚠ Endpoint retornou status $($response.StatusCode)"
                }
            } catch {
                Write-Warning "  ⚠ Não foi possível acessar endpoint: $_"
            }
        } else {
            Write-Warning "  ⚠ Container não está rodando"
            $Global:InstallationErrors += "$($exporter.Name) não está rodando"
        }
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 21: VALIDATE GRAFANA DASHBOARDS
# ═══════════════════════════════════════════════════════════════════════════

function Test-GrafanaDashboards {
    Write-Header "VALIDANDO GRAFANA DASHBOARDS"

    $expectedDashboards = @(
        "01-sofia-ai-performance.json",
        "01-system-overview.json",
        "02-database-health.json",
        "02-sofia-ai-cognitive-layers.json",
        "03-business-metrics.json",
        "03-redis-performance.json",
        "04-api-overview.json",
        "04-security-dashboard.json",
        "05-performance-slo.json"
    )

    $dashboardPath = Join-Path $ProjectRoot "infrastructure/docker/monitoring/grafana/dashboards"

    Write-InfoLine "Verificando dashboards em $dashboardPath..."

    $foundCount = 0
    foreach ($dashboard in $expectedDashboards) {
        $fullPath = Join-Path $dashboardPath $dashboard
        if (Test-Path $fullPath) {
            Write-Success "  ✓ $dashboard"
            $foundCount++
        } else {
            Write-Warning "  ⚠ $dashboard NÃO ENCONTRADO"
        }
    }

    Write-Host ""
    if ($foundCount -eq $expectedDashboards.Count) {
        Write-Success "✅ Todos os $foundCount dashboards estão presentes"
    } else {
        Write-Warning "⚠️  $foundCount de $($expectedDashboards.Count) dashboards encontrados"
        $Global:InstallationErrors += "Alguns dashboards Grafana estão faltando"
    }

    # Check if Grafana is accessible
    Write-InfoLine "Verificando Grafana API..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "  ✓ Grafana API respondendo"
        }
    } catch {
        Write-Warning "  ⚠ Grafana pode não estar totalmente inicializado ainda"
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 22: VALIDATE DIRECTUS EXTENSIONS
# ═══════════════════════════════════════════════════════════════════════════

function Test-DirectusExtensions {
    Write-Header "VALIDANDO DIRECTUS EXTENSIONS"

    $extensionsPath = Join-Path $ProjectRoot "backend/directus/extensions"

    # Check panel extension
    Write-InfoLine "Verificando Panel Extension..."
    $panelPath = Join-Path $extensionsPath "panels/magicsaas-dashboard"
    if (Test-Path (Join-Path $panelPath "package.json")) {
        Write-Success "  ✓ Panel extension encontrada"

        if (Test-Path (Join-Path $panelPath "dist")) {
            Write-Success "  ✓ Panel extension BUILDADA (dist/ existe)"
        } else {
            Write-Warning "  ⚠ Panel extension NÃO buildada - execute:"
            Write-Host "    cd $panelPath && pnpm install && pnpm build" -ForegroundColor Yellow
            $Global:InstallationErrors += "Directus Panel Extension não buildada"
        }
    } else {
        Write-Warning "  ⚠ Panel extension NÃO encontrada"
    }

    # Check endpoint extension
    Write-InfoLine "Verificando Endpoint Extension..."
    $endpointPath = Join-Path $extensionsPath "endpoints/magicsaas-dashboard"
    if (Test-Path (Join-Path $endpointPath "package.json")) {
        Write-Success "  ✓ Endpoint extension encontrada"

        if (Test-Path (Join-Path $endpointPath "dist")) {
            Write-Success "  ✓ Endpoint extension BUILDADA (dist/ existe)"
        } else {
            Write-Warning "  ⚠ Endpoint extension NÃO buildada - execute:"
            Write-Host "    cd $endpointPath && pnpm install && pnpm build" -ForegroundColor Yellow
            $Global:InstallationErrors += "Directus Endpoint Extension não buildada"
        }
    } else {
        Write-Warning "  ⚠ Endpoint extension NÃO encontrada"
    }

    # Suggest build script
    Write-Host ""
    Write-InfoLine "💡 Dica: Execute o script de build automatizado:"
    Write-Host "    bash infrastructure/scripts/build-directus-extensions.sh" -ForegroundColor Cyan
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 23: VALIDATE PROMETHEUS SLO RULES
# ═══════════════════════════════════════════════════════════════════════════

function Test-PrometheusSLORules {
    Write-Header "VALIDANDO PROMETHEUS SLO RULES"

    $sloRulesPath = Join-Path $ProjectRoot "infrastructure/docker/monitoring/slo-rules.yml"

    Write-InfoLine "Verificando SLO rules file..."
    if (Test-Path $sloRulesPath) {
        Write-Success "  ✓ slo-rules.yml encontrado"

        # Count rules
        $content = Get-Content $sloRulesPath -Raw
        $groupCount = ([regex]::Matches($content, "- name:")).Count
        $ruleCount = ([regex]::Matches($content, "- record:|- alert:")).Count

        Write-Success "  ✓ $groupCount grupos de regras"
        Write-Success "  ✓ $ruleCount recording rules + alerts"

        # Check if mounted in docker-compose
        $dockerComposePath = Join-Path $ProjectRoot "infrastructure/docker/docker-compose.dev.yml"
        $dockerContent = Get-Content $dockerComposePath -Raw

        if ($dockerContent -match "slo-rules\.yml") {
            Write-Success "  ✓ Montado no Prometheus via docker-compose"
        } else {
            Write-Warning "  ⚠ NÃO montado no docker-compose.dev.yml"
            $Global:InstallationErrors += "SLO rules não montadas no Prometheus"
        }
    } else {
        Write-Warning "  ⚠ slo-rules.yml NÃO encontrado"
        $Global:InstallationErrors += "Arquivo slo-rules.yml não encontrado"
    }

    # Check Prometheus config
    Write-InfoLine "Verificando prometheus.yml..."
    $prometheusConfigPath = Join-Path $ProjectRoot "infrastructure/docker/monitoring/prometheus.yml"
    if (Test-Path $prometheusConfigPath) {
        $prometheusConfig = Get-Content $prometheusConfigPath -Raw
        if ($prometheusConfig -match "rule_files:") {
            Write-Success "  ✓ rule_files configurado"
        } else {
            Write-Warning "  ⚠ rule_files NÃO configurado em prometheus.yml"
        }
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 24: VALIDATE PRISMA SEED DATA
# ═══════════════════════════════════════════════════════════════════════════

function Test-PrismaSeedData {
    Write-Header "VALIDANDO PRISMA SEED DATA"

    $seedPath = Join-Path $ProjectRoot "backend/api/prisma/seed.ts"

    Write-InfoLine "Verificando seed.ts..."
    if (Test-Path $seedPath) {
        Write-Success "  ✓ seed.ts encontrado"

        # Check if seed command is in package.json
        $packageJsonPath = Join-Path $ProjectRoot "backend/api/package.json"
        if (Test-Path $packageJsonPath) {
            $packageJson = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
            if ($packageJson.prisma.seed) {
                Write-Success "  ✓ Comando seed configurado em package.json"
                Write-Success "    $($packageJson.prisma.seed)"
            } else {
                Write-Warning "  ⚠ Comando seed NÃO configurado em package.json"
            }
        }

        # Count what seed creates
        $seedContent = Get-Content $seedPath -Raw
        $plansCount = ([regex]::Matches($seedContent, "prisma\.plan\.upsert")).Count
        $tenantsCount = ([regex]::Matches($seedContent, "prisma\.tenant\.upsert")).Count
        $usersCount = ([regex]::Matches($seedContent, "prisma\.user\.upsert")).Count

        Write-Success "  ✓ Seed cria:"
        Write-Success "    • $plansCount Plans (Free → Quantum)"
        Write-Success "    • $tenantsCount Tenants demo"
        Write-Success "    • $usersCount Users com credenciais"

        Write-Host ""
        Write-InfoLine "💡 Para executar seed:"
        Write-Host "    cd backend/api && pnpm db:seed" -ForegroundColor Cyan
    } else {
        Write-Warning "  ⚠ seed.ts NÃO encontrado"
        $Global:InstallationErrors += "Arquivo seed.ts não encontrado"
    }

    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════
# STEP 25: VALIDATE NETWORK POLICIES
# ═══════════════════════════════════════════════════════════════════════════

function Test-NetworkPolicies {
    Write-Header "VALIDANDO NETWORK POLICIES (K8S)"

    $networkPoliciesPath = Join-Path $ProjectRoot "infrastructure/kubernetes/network-policies.yaml"

    Write-InfoLine "Verificando network-policies.yaml..."
    if (Test-Path $networkPoliciesPath) {
        Write-Success "  ✓ network-policies.yaml encontrado"

        $content = Get-Content $networkPoliciesPath -Raw
        $policyCount = ([regex]::Matches($content, "kind: NetworkPolicy")).Count

        Write-Success "  ✓ $policyCount policies definidas"

        # Check key policies
        if ($content -match "default-deny-all") {
            Write-Success "  ✓ Default deny-all policy (zero-trust)"
        }

        if ($content -match "sofia-ai-ingress") {
            Write-Success "  ✓ Sofia AI ingress policy"
        }

        if ($content -match "postgres.*ingress") {
            Write-Success "  ✓ PostgreSQL ingress policy"
        }

        Write-Host ""
        Write-InfoLine "⚠️  NOTA: Network Policies só funcionam em cluster Kubernetes"
        Write-InfoLine "   Docker Compose local NÃO usa network policies"
    } else {
        Write-Warning "  ⚠ network-policies.yaml NÃO encontrado"
    }

    Write-Host ""
}
