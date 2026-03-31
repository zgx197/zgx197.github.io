param()

$ErrorActionPreference = "Stop"
$script:RepoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$OutRoot = Join-Path $script:RepoRoot "generated/resume-baseline/stage0"

function Resolve-RepoPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathValue
  )

  if ([System.IO.Path]::IsPathRooted($PathValue)) {
    return [System.IO.Path]::GetFullPath($PathValue)
  }

  return [System.IO.Path]::GetFullPath((Join-Path $script:RepoRoot $PathValue))
}

function To-RepoRelativePath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$AbsolutePath
  )

  $fullPath = [System.IO.Path]::GetFullPath($AbsolutePath)
  if ($fullPath.StartsWith($script:RepoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $fullPath.Substring($script:RepoRoot.Length).TrimStart([char]'\').Replace("\", "/")
  }

  return $fullPath.Replace("\", "/")
}

function Ensure-Array {
  param($Value)

  if ($null -eq $Value) {
    return @()
  }

  return @($Value)
}

function Read-JsonFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathValue
  )

  $utf8 = New-Object System.Text.UTF8Encoding($false)
  $jsonText = [System.IO.File]::ReadAllText((Resolve-RepoPath $PathValue), $utf8)
  return $jsonText | ConvertFrom-Json
}

function Clip-Text {
  param(
    [string]$Text,
    [int]$MaxLength = 140
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return ""
  }

  $trimmed = $Text.Trim()
  if ($trimmed.Length -le $MaxLength) {
    return $trimmed
  }

  return "{0}..." -f $trimmed.Substring(0, $MaxLength)
}

function Invoke-SampleCommand {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Sample
  )

  $resolvedOutputDir = Resolve-RepoPath $Sample.outputDir
  New-Item -ItemType Directory -Path $resolvedOutputDir -Force | Out-Null

  if ($Sample.inputType -eq "pdf") {
    $arguments = @(
      "scripts/import-resume-pdf.py",
      $Sample.inputPath,
      "--out-dir",
      $Sample.outputDir
    )

    & python @arguments
  }
  else {
    $arguments = @(
      "scripts/import-resume-text.mjs",
      $Sample.inputPath,
      "--out-dir",
      $Sample.outputDir,
      "--stem",
      $Sample.outputStem
    )

    & node @arguments
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to build baseline sample '$($Sample.id)'."
  }
}

$samples = @(
  [ordered]@{
    id = "pdf-current"
    title = "当前 PDF 输入"
    inputType = "pdf"
    inputPath = "张国鑫-U3D-202603-v2.pdf"
    outputDir = "generated/resume-baseline/stage0/pdf-current"
    outputStem = "张国鑫-U3D-202603-v2"
    command = 'python scripts/import-resume-pdf.py "张国鑫-U3D-202603-v2.pdf" --out-dir "generated/resume-baseline/stage0/pdf-current"'
    rationale = "冻结当前真实 PDF 到现有链路的完整输出。"
  },
  [ordered]@{
    id = "text-current"
    title = "当前文本输入"
    inputType = "text"
    inputPath = "generated/resume-import/张国鑫-U3D-202603-v2.extracted.txt"
    outputDir = "generated/resume-baseline/stage0/text-current"
    outputStem = "张国鑫-U3D-202603-v2-text"
    command = 'node scripts/import-resume-text.mjs "generated/resume-import/张国鑫-U3D-202603-v2.extracted.txt" --out-dir "generated/resume-baseline/stage0/text-current" --stem "张国鑫-U3D-202603-v2-text"'
    rationale = "隔离验证文本解析层，不让 PDF 抽取差异掩盖真实问题。"
  },
  [ordered]@{
    id = "text-202507"
    title = "历史文本输入"
    inputType = "text"
    inputPath = "generated/resume-import/张国鑫-U3D-202507.extracted.txt"
    outputDir = "generated/resume-baseline/stage0/text-202507"
    outputStem = "张国鑫-U3D-202507-text"
    command = 'node scripts/import-resume-text.mjs "generated/resume-import/张国鑫-U3D-202507.extracted.txt" --out-dir "generated/resume-baseline/stage0/text-202507" --stem "张国鑫-U3D-202507-text"'
    rationale = "保留一份历史样本，方便后续比较结构识别是否回退。"
  }
)

Push-Location $script:RepoRoot
try {
  foreach ($sample in $samples) {
    Invoke-SampleCommand -Sample $sample
  }

  $sampleOutputs = foreach ($sample in $samples) {
    $outputDir = Resolve-RepoPath $sample.outputDir
    $draftPath = Join-Path $outputDir ($sample.outputStem + ".draft.json")
    $reportPath = Join-Path $outputDir ($sample.outputStem + ".report.json")
    $normalizedPath = Join-Path $outputDir ($sample.outputStem + ".normalized.txt")
    $resumeSourceJsonPath = Join-Path $outputDir ($sample.outputStem + ".resume-source.json")
    $resumeSourceTsPath = Join-Path $outputDir ($sample.outputStem + ".resume-source.ts")
    $extractedPath = $null

    if ($sample.inputType -eq "pdf") {
      $extractedPath = Join-Path $outputDir ($sample.outputStem + ".extracted.txt")
    }

    $draft = Read-JsonFile $draftPath
    $report = Read-JsonFile $reportPath
    $latestExperience = Ensure-Array $draft.experiences | Select-Object -First 1
    $projectsNeedingReview = Ensure-Array $report.projectsNeedingReview
    $warnings = Ensure-Array $report.warnings
    $summaryLength = 0

    if ($null -ne $latestExperience -and $null -ne $latestExperience.summary) {
      $summaryLength = $latestExperience.summary.Length
    }

    [ordered]@{
      id = $sample.id
      title = $sample.title
      rationale = $sample.rationale
      inputType = $sample.inputType
      inputPath = $sample.inputPath
      command = $sample.command
      outputDir = $sample.outputDir
      outputFiles = @(
        if ($extractedPath) { To-RepoRelativePath $extractedPath }
        To-RepoRelativePath $normalizedPath
        To-RepoRelativePath $draftPath
        To-RepoRelativePath $reportPath
        To-RepoRelativePath $resumeSourceJsonPath
        To-RepoRelativePath $resumeSourceTsPath
      ) | Where-Object { $_ }
      experienceCount = [int]$report.experienceCount
      projectCount = [int]$report.projectCount
      warningCount = $warnings.Count
      warnings = @($warnings)
      projectsNeedingReview = @($projectsNeedingReview | ForEach-Object { $_.title })
      experienceCompanies = @(Ensure-Array $draft.experiences | ForEach-Object { $_.company })
      projectTitles = @(Ensure-Array $draft.projects | ForEach-Object { $_.title })
      latestExperience = if ($latestExperience) {
        [ordered]@{
          company = $latestExperience.company
          role = $latestExperience.role
          period = $latestExperience.period
          hasProjects = (Ensure-Array $latestExperience.relatedProjects).Count -gt 0
          relatedProjects = @(Ensure-Array $latestExperience.relatedProjects)
          summaryPreview = Clip-Text $latestExperience.summary 180
          summaryLength = $summaryLength
        }
      } else {
        $null
      }
    }
  }

  $allArtifacts = Get-ChildItem -Recurse -File $OutRoot | Sort-Object FullName
  $hashArtifacts = @(
    $allArtifacts | Get-FileHash -Algorithm SHA256 | ForEach-Object {
      [ordered]@{
        path = To-RepoRelativePath $_.Path
        sha256 = $_.Hash
      }
    }
  )

  $pdfResumeHash = ($hashArtifacts | Where-Object { $_.path -eq "generated/resume-baseline/stage0/pdf-current/张国鑫-U3D-202603-v2.resume-source.json" }).sha256
  $textResumeHash = ($hashArtifacts | Where-Object { $_.path -eq "generated/resume-baseline/stage0/text-current/张国鑫-U3D-202603-v2-text.resume-source.json" }).sha256
  $pdfNormalizedHash = ($hashArtifacts | Where-Object { $_.path -eq "generated/resume-baseline/stage0/pdf-current/张国鑫-U3D-202603-v2.normalized.txt" }).sha256
  $textNormalizedHash = ($hashArtifacts | Where-Object { $_.path -eq "generated/resume-baseline/stage0/text-current/张国鑫-U3D-202603-v2-text.normalized.txt" }).sha256

  $manifest = [ordered]@{
    schemaVersion = "resume-stage0-manifest@v1"
    generatedAt = (Get-Date).ToString("o")
    stage = "phase-0"
    purpose = "冻结当前简历解析链路的可复现基线产物。"
    constraints = @(
      "历史旧版 PDF 原件当前不在仓库中，阶段 0 以保留下来的 extracted.txt 作为历史样本文本输入。",
      "阶段 0 不修改解析规则，不以页面效果优化为目标，只记录当前行为与问题。"
    )
    commands = @($samples | ForEach-Object { $_.command })
    equivalenceChecks = @(
      [ordered]@{
        name = "current-normalized-text"
        left = "generated/resume-baseline/stage0/pdf-current/张国鑫-U3D-202603-v2.normalized.txt"
        right = "generated/resume-baseline/stage0/text-current/张国鑫-U3D-202603-v2-text.normalized.txt"
        sameSha256 = $pdfNormalizedHash -eq $textNormalizedHash
        leftSha256 = $pdfNormalizedHash
        rightSha256 = $textNormalizedHash
      },
      [ordered]@{
        name = "current-resume-source-json"
        left = "generated/resume-baseline/stage0/pdf-current/张国鑫-U3D-202603-v2.resume-source.json"
        right = "generated/resume-baseline/stage0/text-current/张国鑫-U3D-202603-v2-text.resume-source.json"
        sameSha256 = $pdfResumeHash -eq $textResumeHash
        leftSha256 = $pdfResumeHash
        rightSha256 = $textResumeHash
      }
    )
    samples = $sampleOutputs
  }

  $currentPdf = $sampleOutputs | Where-Object { $_.id -eq "pdf-current" }
  $historyText = $sampleOutputs | Where-Object { $_.id -eq "text-202507" }

  $knownIssues = [ordered]@{
    schemaVersion = "resume-stage0-known-issues@v1"
    capturedAt = (Get-Date).ToString("o")
    issues = @(
      [ordered]@{
        id = "latest-experience-not-segmented"
        severity = "high"
        sampleIds = @("pdf-current", "text-current")
        phaseHint = "phase-1/phase-2"
        description = "最新经历 北京畅聊天下科技有限公司 / Unity开发工程师 / 2025.07-至今 没有拆出任何 relatedProjects。"
        evidence = [ordered]@{
          experienceCompany = $currentPdf.latestExperience.company
          hasProjects = $currentPdf.latestExperience.hasProjects
          projectCount = $currentPdf.projectCount
          detectedProjectTitles = $currentPdf.projectTitles
        }
      },
      [ordered]@{
        id = "latest-experience-collapsed-into-long-summary"
        severity = "high"
        sampleIds = @("pdf-current", "text-current")
        phaseHint = "phase-1"
        description = "最新经历被压成一条超长 summary，说明结构切分失败后直接退化成整段文案拼接。"
        evidence = [ordered]@{
          summaryLength = $currentPdf.latestExperience.summaryLength
          summaryPreview = $currentPdf.latestExperience.summaryPreview
        }
      },
      [ordered]@{
        id = "profile-strengths-missing"
        severity = "medium"
        sampleIds = @("pdf-current", "text-current")
        phaseHint = "phase-1/phase-4"
        description = "当前 202603 样本稳定触发 profile.strengths 缺失告警。"
        evidence = [ordered]@{
          warnings = @($currentPdf.warnings)
        }
      },
      [ordered]@{
        id = "metrics-coverage-is-low"
        severity = "medium"
        sampleIds = @("pdf-current", "text-current", "text-202507")
        phaseHint = "phase-3/phase-4"
        description = "多个项目缺少指标提取，report 只能指出缺少 metrics，说明字段候选层与校验层都还不够强。"
        evidence = [ordered]@{
          currentProjectsNeedingReview = $currentPdf.projectsNeedingReview
          historyProjectsNeedingReview = $historyText.projectsNeedingReview
        }
      },
      [ordered]@{
        id = "historical-sample-depends-on-preserved-text"
        severity = "medium"
        sampleIds = @("text-202507")
        phaseHint = "phase-0"
        description = "历史基线目前依赖保留的 extracted.txt，不能再回到原始 PDF 抽取层验证。"
        evidence = [ordered]@{
          inputPath = $historyText.inputPath
          inputType = $historyText.inputType
        }
      }
    )
  }

  $hashesDocument = [ordered]@{
    schemaVersion = "resume-stage0-hashes@v1"
    generatedAt = (Get-Date).ToString("o")
    artifacts = $hashArtifacts
  }

  $utf8Bom = New-Object System.Text.UTF8Encoding($true)
  [System.IO.File]::WriteAllText((Join-Path $OutRoot "manifest.json"), ($manifest | ConvertTo-Json -Depth 8), $utf8Bom)
  [System.IO.File]::WriteAllText((Join-Path $OutRoot "known-issues.json"), ($knownIssues | ConvertTo-Json -Depth 8), $utf8Bom)
  [System.IO.File]::WriteAllText((Join-Path $OutRoot "hashes.json"), ($hashesDocument | ConvertTo-Json -Depth 8), $utf8Bom)
}
finally {
  Pop-Location
}