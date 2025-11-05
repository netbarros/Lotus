<#
.SYNOPSIS
    Sofia AI - Intelligent Metronic Demo Manager

.DESCRIPTION
    Sistema inteligente que varre, cataloga e mescla demos do Metronic
    de forma automática e otimizada para o MagicSaaS System-∞

.AUTHOR
    Sofia Lotus AI - PhD Full-Stack Engineer

.VERSION
    1.0.0
#>

[CmdletBinding()]
param(
    [Parameter()]
    [string]$MetronicPath = "$PSScriptRoot/metronic",

    [Parameter()]
    [string]$OutputPath = "$PSScriptRoot/frontend/admin",

    [Parameter()]
    [ValidateSet('Auto', 'Single', 'Merged', 'Best')]
    [string]$MergeStrategy = 'Auto',

    [Parameter()]
    [switch]$Verbose
)

# ============================================================================
# CLASSES - Sofia AI Intelligence
# ============================================================================

class SofiaLogger {
    [string]$LogPath
    [System.IO.StreamWriter]$Stream

    SofiaLogger([string]$path) {
        $this.LogPath = $path
        $dir = Split-Path $path -Parent
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        $this.Stream = [System.IO.StreamWriter]::new($path, $true, [System.Text.Encoding]::UTF8)
    }

    [void] Info([string]$message) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
        $line = "[$timestamp] [INFO] 🌸 Sofia: $message"
        $this.Stream.WriteLine($line)
        $this.Stream.Flush()
        Write-Host $line -ForegroundColor Cyan
    }

    [void] Success([string]$message) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
        $line = "[$timestamp] [SUCCESS] ✅ $message"
        $this.Stream.WriteLine($line)
        $this.Stream.Flush()
        Write-Host $line -ForegroundColor Green
    }

    [void] Warning([string]$message) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
        $line = "[$timestamp] [WARNING] ⚠️  $message"
        $this.Stream.WriteLine($line)
        $this.Stream.Flush()
        Write-Host $line -ForegroundColor Yellow
    }

    [void] Error([string]$message) {
        $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff'
        $line = "[$timestamp] [ERROR] ❌ $message"
        $this.Stream.WriteLine($line)
        $this.Stream.Flush()
        Write-Host $line -ForegroundColor Red
    }

    [void] Close() {
        $this.Stream.Close()
    }
}

class MetronicDemo {
    [string]$Name
    [string]$Path
    [int]$ComponentCount
    [int]$HookCount
    [int]$StoreCount
    [int]$ServiceCount
    [double]$QualityScore
    [double]$ComplexityScore
    [double]$PerformanceScore
    [hashtable]$Components
    [hashtable]$Metadata

    MetronicDemo([string]$name, [string]$path) {
        $this.Name = $name
        $this.Path = $path
        $this.Components = @{}
        $this.Metadata = @{}
        $this.ComponentCount = 0
        $this.HookCount = 0
        $this.StoreCount = 0
        $this.ServiceCount = 0
        $this.QualityScore = 0.0
        $this.ComplexityScore = 0.0
        $this.PerformanceScore = 0.0
    }
}

class ComponentInfo {
    [string]$Name
    [string]$Path
    [string]$Type
    [string]$Demo
    [int]$LineCount
    [int]$DependencyCount
    [double]$QualityScore
    [string[]]$Dependencies
    [string]$Content

    ComponentInfo([string]$name, [string]$path, [string]$demo) {
        $this.Name = $name
        $this.Path = $path
        $this.Demo = $demo
        $this.Type = $this.DetermineType($path)
        $this.Dependencies = @()
        $this.LineCount = 0
        $this.DependencyCount = 0
        $this.QualityScore = 0.0
    }

    [string] DetermineType([string]$path) {
        if ($path -like "*component*" -or $path -like "*.tsx") { return "Component" }
        if ($path -like "*hook*" -or $path -like "use*.ts") { return "Hook" }
        if ($path -like "*store*" -or $path -like "*Store.ts") { return "Store" }
        if ($path -like "*service*" -or $path -like "*.service.ts") { return "Service" }
        if ($path -like "*util*" -or $path -like "*helper*") { return "Utility" }
        if ($path -like "*type*" -or $path -like "*.d.ts") { return "Type" }
        return "Other"
    }
}

class SofiaCatalog {
    [string]$Version
    [datetime]$ScannedAt
    [hashtable]$Demos
    [hashtable]$Components
    [hashtable]$BestPractices
    [hashtable]$MergeDecisions

    SofiaCatalog() {
        $this.Version = "1.0.0"
        $this.ScannedAt = Get-Date
        $this.Demos = @{}
        $this.Components = @{}
        $this.BestPractices = @{}
        $this.MergeDecisions = @{}
    }

    [string] ToJson() {
        return @{
            version = $this.Version
            scanned_at = $this.ScannedAt.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            demos = $this.Demos
            components = $this.Components
            best_practices = $this.BestPractices
            merge_decisions = $this.MergeDecisions
        } | ConvertTo-Json -Depth 10
    }
}

class SofiaIntelligence {
    [SofiaLogger]$Logger
    [SofiaCatalog]$Catalog

    SofiaIntelligence([SofiaLogger]$logger) {
        $this.Logger = $logger
        $this.Catalog = [SofiaCatalog]::new()
    }

    # Analisa qualidade de código
    [double] AnalyzeQuality([string]$content) {
        $score = 100.0

        # Penalidades
        if ($content -notmatch 'import.*React') { $score -= 5 }
        if ($content -match 'console\.log') { $score -= 2 }
        if ($content -match '// TODO|// FIXME') { $score -= 3 }
        if ($content -match 'any\s+\w+') { $score -= 5 }

        # Bonificações
        if ($content -match 'interface\s+\w+') { $score += 5 }
        if ($content -match 'type\s+\w+\s*=') { $score += 3 }
        if ($content -match '@typescript-eslint') { $score += 5 }
        if ($content -match 'use(State|Effect|Callback|Memo|Ref)') { $score += 3 }

        return [Math]::Max(0, [Math]::Min(100, $score))
    }

    # Analisa complexidade
    [double] AnalyzeComplexity([string]$content) {
        $lines = ($content -split "`n").Length
        $ifCount = ([regex]::Matches($content, '\bif\b')).Count
        $loopCount = ([regex]::Matches($content, '\b(for|while|map|filter|reduce)\b')).Count
        $nestingDepth = $this.CalculateNestingDepth($content)

        $complexityScore = $ifCount * 2 + $loopCount * 3 + $nestingDepth * 5

        # Normalizar para 0-100 (menor é melhor)
        return [Math]::Max(0, [Math]::Min(100, 100 - ($complexityScore / $lines * 100)))
    }

    [int] CalculateNestingDepth([string]$content) {
        $maxDepth = 0
        $currentDepth = 0

        foreach ($char in $content.ToCharArray()) {
            if ($char -eq '{') {
                $currentDepth++
                if ($currentDepth -gt $maxDepth) {
                    $maxDepth = $currentDepth
                }
            }
            elseif ($char -eq '}') {
                $currentDepth--
            }
        }

        return $maxDepth
    }

    # Decide qual componente usar
    [hashtable] DecideBestComponent([ComponentInfo[]]$components) {
        $this.Logger.Info("🧠 Sofia analisando $($components.Length) versões do componente...")

        $bestComponent = $null
        $bestScore = 0.0

        foreach ($comp in $components) {
            # Score ponderado
            $score = ($comp.QualityScore * 0.5) +
                     ((100 - $comp.LineCount / 10) * 0.3) +
                     ((100 - $comp.DependencyCount * 5) * 0.2)

            if ($score -gt $bestScore) {
                $bestScore = $score
                $bestComponent = $comp
            }
        }

        return @{
            selected = $bestComponent.Name
            demo = $bestComponent.Demo
            path = $bestComponent.Path
            score = $bestScore
            reason = $this.GenerateDecisionReason($bestComponent, $components)
        }
    }

    [string] GenerateDecisionReason([ComponentInfo]$selected, [ComponentInfo[]]$all) {
        $reasons = @()

        if ($selected.QualityScore -eq ($all.QualityScore | Measure-Object -Maximum).Maximum) {
            $reasons += "Melhor qualidade de código ($([Math]::Round($selected.QualityScore, 2))%)"
        }

        if ($selected.LineCount -eq ($all.LineCount | Measure-Object -Minimum).Minimum) {
            $reasons += "Mais conciso ($($selected.LineCount) linhas)"
        }

        if ($selected.DependencyCount -eq ($all.DependencyCount | Measure-Object -Minimum).Minimum) {
            $reasons += "Menos dependências ($($selected.DependencyCount))"
        }

        if ($reasons.Length -eq 0) {
            return "Score geral mais alto"
        }

        return $reasons -join ", "
    }
}

class MetronicScanner {
    [SofiaLogger]$Logger
    [SofiaIntelligence]$Sofia
    [string]$MetronicPath
    [hashtable]$Demos

    MetronicScanner([SofiaLogger]$logger, [string]$metronicPath) {
        $this.Logger = $logger
        $this.Sofia = [SofiaIntelligence]::new($logger)
        $this.MetronicPath = $metronicPath
        $this.Demos = @{}
    }

    # Varre todas as demos
    [void] ScanDemos() {
        $this.Logger.Info("🔍 Varrendo demos do Metronic em: $($this.MetronicPath)")

        $demosPath = Join-Path $this.MetronicPath "demos"

        if (-not (Test-Path $demosPath)) {
            $this.Logger.Warning("Pasta demos/ não encontrada. Crie em: $demosPath")
            return
        }

        $demoFolders = Get-ChildItem -Path $demosPath -Directory

        if ($demoFolders.Count -eq 0) {
            $this.Logger.Warning("Nenhuma demo encontrada em $demosPath")
            $this.Logger.Info("📝 Copie as demos do Metronic React para: $demosPath/demo1, $demosPath/demo2, etc.")
            return
        }

        $this.Logger.Success("✨ Encontradas $($demoFolders.Count) demos")

        foreach ($folder in $demoFolders) {
            $this.ScanDemo($folder)
        }
    }

    # Varre uma demo específica
    [void] ScanDemo([System.IO.DirectoryInfo]$folder) {
        $this.Logger.Info("📦 Analisando demo: $($folder.Name)")

        $demo = [MetronicDemo]::new($folder.Name, $folder.FullName)

        # Procurar pasta src
        $srcPath = Join-Path $folder.FullName "src"
        if (-not (Test-Path $srcPath)) {
            $this.Logger.Warning("Pasta src/ não encontrada em $($folder.Name)")
            return
        }

        # Varrer componentes
        $this.ScanComponents($demo, $srcPath)

        # Calcular scores
        $demo.QualityScore = $this.CalculateDemoQuality($demo)
        $demo.ComplexityScore = $this.CalculateDemoComplexity($demo)
        $demo.PerformanceScore = $this.CalculateDemoPerformance($demo)

        $this.Demos[$demo.Name] = $demo

        $this.Logger.Success("✅ $($folder.Name): $($demo.ComponentCount) componentes | Quality: $([Math]::Round($demo.QualityScore, 2))%")
    }

    # Varre componentes de uma demo
    [void] ScanComponents([MetronicDemo]$demo, [string]$srcPath) {
        # Procurar arquivos .tsx, .ts
        $files = Get-ChildItem -Path $srcPath -Recurse -Include "*.tsx", "*.ts" -File

        foreach ($file in $files) {
            # Ignorar arquivos de teste e config
            if ($file.Name -match '\.(test|spec|config)\.') {
                continue
            }

            $relativePath = $file.FullName.Replace($demo.Path, "").TrimStart('\', '/')
            $componentName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

            $component = [ComponentInfo]::new($componentName, $relativePath, $demo.Name)

            # Ler conteúdo
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content) {
                $component.Content = $content
                $component.LineCount = ($content -split "`n").Length

                # Analisar imports para dependências
                $imports = [regex]::Matches($content, "import.*from\s+['\`"](.+?)['\`"]")
                $component.Dependencies = $imports | ForEach-Object { $_.Groups[1].Value }
                $component.DependencyCount = $component.Dependencies.Length

                # Analisar qualidade
                $component.QualityScore = $this.Sofia.AnalyzeQuality($content)
            }

            # Categorizar
            $category = $component.Type
            if (-not $demo.Components.ContainsKey($category)) {
                $demo.Components[$category] = @()
            }
            $demo.Components[$category] += $component

            # Contar
            $demo.ComponentCount++
            if ($component.Type -eq "Hook") { $demo.HookCount++ }
            if ($component.Type -eq "Store") { $demo.StoreCount++ }
            if ($component.Type -eq "Service") { $demo.ServiceCount++ }
        }
    }

    [double] CalculateDemoQuality([MetronicDemo]$demo) {
        if ($demo.ComponentCount -eq 0) { return 0.0 }

        $totalQuality = 0.0
        foreach ($category in $demo.Components.Keys) {
            foreach ($comp in $demo.Components[$category]) {
                $totalQuality += $comp.QualityScore
            }
        }

        return $totalQuality / $demo.ComponentCount
    }

    [double] CalculateDemoComplexity([MetronicDemo]$demo) {
        if ($demo.ComponentCount -eq 0) { return 0.0 }

        $totalLines = 0
        foreach ($category in $demo.Components.Keys) {
            foreach ($comp in $demo.Components[$category]) {
                $totalLines += $comp.LineCount
            }
        }

        return $totalLines / $demo.ComponentCount
    }

    [double] CalculateDemoPerformance([MetronicDemo]$demo) {
        # Score baseado em complexidade (menos é melhor)
        $avgComplexity = $this.CalculateDemoComplexity($demo)
        return [Math]::Max(0, 100 - ($avgComplexity / 5))
    }

    # Gera catálogo Sofia
    [void] GenerateCatalog([string]$outputPath) {
        $this.Logger.Info("📝 Gerando catálogo Sofia...")

        # Popular catálogo
        foreach ($demoName in $this.Demos.Keys) {
            $demo = $this.Demos[$demoName]

            $this.Sofia.Catalog.Demos[$demoName] = @{
                name = $demo.Name
                path = $demo.Path
                component_count = $demo.ComponentCount
                hook_count = $demo.HookCount
                store_count = $demo.StoreCount
                service_count = $demo.ServiceCount
                quality_score = [Math]::Round($demo.QualityScore, 2)
                complexity_score = [Math]::Round($demo.ComplexityScore, 2)
                performance_score = [Math]::Round($demo.PerformanceScore, 2)
            }
        }

        # Agrupar componentes por nome
        $componentGroups = @{}
        foreach ($demoName in $this.Demos.Keys) {
            $demo = $this.Demos[$demoName]
            foreach ($category in $demo.Components.Keys) {
                foreach ($comp in $demo.Components[$category]) {
                    if (-not $componentGroups.ContainsKey($comp.Name)) {
                        $componentGroups[$comp.Name] = @()
                    }
                    $componentGroups[$comp.Name] += $comp
                }
            }
        }

        # Decidir melhores componentes
        foreach ($compName in $componentGroups.Keys) {
            $versions = $componentGroups[$compName]

            if ($versions.Length -gt 1) {
                $decision = $this.Sofia.DecideBestComponent($versions)
                $this.Sofia.Catalog.Components[$compName] = $decision
            }
            else {
                $comp = $versions[0]
                $this.Sofia.Catalog.Components[$compName] = @{
                    selected = $comp.Name
                    demo = $comp.Demo
                    path = $comp.Path
                    score = $comp.QualityScore
                    reason = "Única versão disponível"
                }
            }
        }

        # Salvar catálogo
        $catalogPath = Join-Path $outputPath "sofia-catalog.json"
        $this.Sofia.Catalog.ToJson() | Out-File -FilePath $catalogPath -Encoding UTF8

        $this.Logger.Success("✅ Catálogo Sofia salvo em: $catalogPath")
        $this.Logger.Info("📊 Total de componentes catalogados: $($this.Sofia.Catalog.Components.Count)")
    }
}

class MetronicMerger {
    [SofiaLogger]$Logger
    [SofiaIntelligence]$Sofia
    [MetronicScanner]$Scanner
    [string]$OutputPath

    MetronicMerger([SofiaLogger]$logger, [MetronicScanner]$scanner, [string]$outputPath) {
        $this.Logger = $logger
        $this.Sofia = [SofiaIntelligence]::new($logger)
        $this.Scanner = $scanner
        $this.OutputPath = $outputPath
    }

    # Mescla demos de forma inteligente
    [void] MergeDemos([string]$strategy) {
        $this.Logger.Info("🔄 Iniciando mesclagem inteligente com estratégia: $strategy")

        if ($this.Scanner.Demos.Count -eq 0) {
            $this.Logger.Warning("Nenhuma demo para mesclar")
            return
        }

        switch ($strategy) {
            'Auto' { $this.AutoMerge() }
            'Single' { $this.UseSingleDemo() }
            'Merged' { $this.MergeAllDemos() }
            'Best' { $this.UseBestComponents() }
        }

        $this.Logger.Success("✅ Mesclagem concluída!")
    }

    [void] AutoMerge() {
        $this.Logger.Info("🤖 Sofia decidindo estratégia automaticamente...")

        $demoCount = $this.Scanner.Demos.Count

        if ($demoCount -eq 1) {
            $this.Logger.Info("Uma demo encontrada, usando estratégia Single")
            $this.UseSingleDemo()
        }
        elseif ($demoCount -le 3) {
            $this.Logger.Info("$demoCount demos encontradas, usando estratégia Best")
            $this.UseBestComponents()
        }
        else {
            $this.Logger.Info("$demoCount demos encontradas, usando estratégia Merged")
            $this.MergeAllDemos()
        }
    }

    [void] UseSingleDemo() {
        # Usar a demo com melhor quality score
        $bestDemo = $null
        $bestScore = 0.0

        foreach ($demoName in $this.Scanner.Demos.Keys) {
            $demo = $this.Scanner.Demos[$demoName]
            if ($demo.QualityScore -gt $bestScore) {
                $bestScore = $demo.QualityScore
                $bestDemo = $demo
            }
        }

        if ($bestDemo) {
            $this.Logger.Success("🎯 Sofia selecionou: $($bestDemo.Name) (Score: $([Math]::Round($bestScore, 2))%)")
            $this.CopyDemo($bestDemo)
        }
    }

    [void] MergeAllDemos() {
        $this.Logger.Info("🔀 Mesclando todas as demos...")

        # Copiar estrutura base da melhor demo
        $this.UseSingleDemo()

        # Substituir com melhores componentes de outras demos
        $this.UseBestComponents()
    }

    [void] UseBestComponents() {
        $this.Logger.Info("⭐ Usando melhores componentes de cada demo...")

        $catalog = $this.Scanner.Sofia.Catalog

        foreach ($compName in $catalog.Components.Keys) {
            $decision = $catalog.Components[$compName]
            $this.Logger.Info("  → $compName: usando de $($decision.demo) ($($decision.reason))")

            # Copiar componente selecionado
            $demo = $this.Scanner.Demos[$decision.demo]
            $sourcePath = Join-Path $demo.Path "src" $decision.path

            if (Test-Path $sourcePath) {
                $destPath = Join-Path $this.OutputPath "src" $decision.path
                $destDir = Split-Path $destPath -Parent

                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }

                Copy-Item -Path $sourcePath -Destination $destPath -Force
            }
        }
    }

    [void] CopyDemo([MetronicDemo]$demo) {
        $this.Logger.Info("📋 Copiando demo: $($demo.Name)")

        $sourcePath = Join-Path $demo.Path "src"
        $destPath = Join-Path $this.OutputPath "src"

        if (Test-Path $sourcePath) {
            if (Test-Path $destPath) {
                $this.Logger.Info("  Removendo destino existente...")
                Remove-Item -Path $destPath -Recurse -Force
            }

            Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
            $this.Logger.Success("  ✅ Copiado: src/")
        }

        # Copiar arquivos de configuração
        $configFiles = @('package.json', 'tsconfig.json', 'vite.config.ts', 'tailwind.config.js')

        foreach ($file in $configFiles) {
            $sourceFile = Join-Path $demo.Path $file
            $destFile = Join-Path $this.OutputPath $file

            if (Test-Path $sourceFile) {
                Copy-Item -Path $sourceFile -Destination $destFile -Force
                $this.Logger.Success("  ✅ Copiado: $file")
            }
        }
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    $logger = [SofiaLogger]::new("$PSScriptRoot/.magicsaas/logs/sofia-metronic-$(Get-Date -Format 'yyyyMMdd-HHmmss').log")

    try {
        $logger.Info("═══════════════════════════════════════════════════════════")
        $logger.Info("  🌸 Sofia AI - Intelligent Metronic Manager")
        $logger.Info("  Version: 1.0.0")
        $logger.Info("  Cognitive Mesh OS System 11")
        $logger.Info("═══════════════════════════════════════════════════════════")
        $logger.Info("")

        # Verificar se pasta metronic existe
        if (-not (Test-Path $MetronicPath)) {
            $logger.Warning("Pasta metronic/ não encontrada: $MetronicPath")
            $logger.Info("📝 Crie a pasta e adicione as demos do Metronic React")
            $logger.Info("   Exemplo: $MetronicPath/demos/demo1")
            return
        }

        # Scanner - Varrer demos
        $scanner = [MetronicScanner]::new($logger, $MetronicPath)
        $scanner.ScanDemos()

        if ($scanner.Demos.Count -eq 0) {
            $logger.Warning("Nenhuma demo encontrada para processar")
            $logger.Info("📥 Copie as demos do Metronic React para: $MetronicPath/demos/")
            return
        }

        # Gerar catálogo
        $catalogPath = Join-Path $MetronicPath "components"
        if (-not (Test-Path $catalogPath)) {
            New-Item -ItemType Directory -Path $catalogPath -Force | Out-Null
        }
        $scanner.GenerateCatalog($catalogPath)

        # Merger - Mesclar demos
        $merger = [MetronicMerger]::new($logger, $scanner, $OutputPath)
        $merger.MergeDemos($MergeStrategy)

        # Relatório final
        $logger.Info("")
        $logger.Info("═══════════════════════════════════════════════════════════")
        $logger.Info("  📊 RELATÓRIO SOFIA AI")
        $logger.Info("═══════════════════════════════════════════════════════════")
        $logger.Info("  Demos analisadas: $($scanner.Demos.Count)")
        $logger.Info("  Componentes catalogados: $($scanner.Sofia.Catalog.Components.Count)")
        $logger.Info("  Estratégia usada: $MergeStrategy")
        $logger.Info("  Output: $OutputPath")
        $logger.Info("═══════════════════════════════════════════════════════════")
        $logger.Success("")
        $logger.Success("✨ Sofia AI concluiu o processamento com sucesso!")
        $logger.Info("")

    }
    catch {
        $logger.Error("Erro fatal: $_")
        $logger.Error($_.ScriptStackTrace)
        throw
    }
    finally {
        $logger.Close()
    }
}

# Executar
Main
