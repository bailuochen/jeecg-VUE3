param(
  [string]$NginxHome = "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\nginx-1.31.1"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$confPath = Join-Path $repoRoot "deploy\local-server\nginx.conf"
$nginxExe = Join-Path $NginxHome "nginx.exe"

if (-not (Test-Path -LiteralPath $nginxExe)) {
  throw "nginx.exe not found: $nginxExe"
}
if (-not (Test-Path -LiteralPath $confPath)) {
  throw "nginx config not found. Run build-local-deploy.ps1 first: $confPath"
}

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

Push-Location $NginxHome
try {
  Invoke-Native { & $nginxExe -t -c $confPath -p $NginxHome }
  $listening = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue
  if (-not $listening) {
    Start-Process -WindowStyle Hidden -FilePath $nginxExe -ArgumentList @("-c", $confPath, "-p", $NginxHome)
    Start-Sleep -Seconds 1
  }
}
finally {
  Pop-Location
}

$listening = Get-NetTCPConnection -LocalPort 8090 -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
  throw "Nginx did not start on port 8090."
}

Write-Host "Local Nginx is available at http://127.0.0.1:8090/"
