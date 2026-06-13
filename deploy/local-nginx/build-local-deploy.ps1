param(
  [string]$NodeHome = "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\node-v20.20.2-win-x64",
  [string]$CorepackHome = "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\corepack"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$htmlRoot = Join-Path $repoRoot "deploy\local-server\html"

$env:COREPACK_HOME = $CorepackHome
$env:PATH = "$NodeHome;$env:PATH"

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE"
  }
}

if (Test-Path -LiteralPath $htmlRoot) {
  Remove-Item -LiteralPath $htmlRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $htmlRoot | Out-Null

Push-Location (Join-Path $repoRoot "jeecgboot-vue3")
try {
  Invoke-Native { corepack pnpm build:localdeploy }
  Copy-Item -Path ".\dist\*" -Destination $htmlRoot -Recurse -Force
}
finally {
  Pop-Location
}

Push-Location (Join-Path $repoRoot "jeecg-app-1")
try {
  Invoke-Native { corepack pnpm build }
  Copy-Item -Path ".\dist" -Destination (Join-Path $htmlRoot "micro-apps\jeecg-app-1") -Recurse -Force
}
finally {
  Pop-Location
}

Push-Location (Join-Path $repoRoot "vue-admin")
try {
  Invoke-Native { corepack pnpm build }
  Copy-Item -Path ".\dist" -Destination (Join-Path $htmlRoot "micro-apps\vue-admin") -Recurse -Force
}
finally {
  Pop-Location
}

$nginxConfTemplate = Get-Content -LiteralPath (Join-Path $PSScriptRoot "nginx.conf") -Raw
$htmlRootForNginx = ($htmlRoot -replace "\\", "/")
$nginxConf = $nginxConfTemplate.Replace("__HTML_ROOT__", $htmlRootForNginx)
$outConf = Join-Path $repoRoot "deploy\local-server\nginx.conf"
Set-Content -LiteralPath $outConf -Value $nginxConf -Encoding ascii

Write-Host "Local deploy files are ready:"
Write-Host $htmlRoot
Write-Host "Nginx config:"
Write-Host $outConf
