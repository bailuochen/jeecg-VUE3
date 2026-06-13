param(
  [string]$NginxHome = "C:\Users\Administrator\Desktop\jeecg-boot-latest\tools\nginx-1.31.1"
)

$ErrorActionPreference = "SilentlyContinue"

$nginxExe = Join-Path $NginxHome "nginx.exe"
if (Test-Path -LiteralPath $nginxExe) {
  Push-Location $NginxHome
  try {
    & $nginxExe -s stop
  }
  finally {
    Pop-Location
  }
}

Get-Process -Name nginx -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Local Nginx stopped."
