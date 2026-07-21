$ErrorActionPreference = "Stop"

$obsoleteFiles = @(
  "src\data\mockData.ts",
  "src\types\project.ts",
  "src\components\StatusBadge.tsx"
)

foreach ($file in $obsoleteFiles) {
  if (Test-Path $file) {
    Remove-Item $file -Force
    Write-Host "Eliminado: $file"
  } else {
    Write-Host "Ya no existe: $file"
  }
}

if (
  (Test-Path "src\data") -and
  -not (Get-ChildItem "src\data" -Force | Select-Object -First 1)
) {
  Remove-Item "src\data" -Force
  Write-Host "Eliminada carpeta vacía: src\data"
}

Write-Host ""
Write-Host "Limpieza terminada. Ejecuta:"
Write-Host "pnpm lint"
Write-Host "pnpm build"
