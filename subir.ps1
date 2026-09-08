# Sobe o app para a internet (Cloudflare Pages).
#
# Uso:  npm run subir
#
# Publica em https://gestao-franquias.pages.dev
#
# Primeira vez: rode "npx wrangler login" uma unica vez para autorizar no
# navegador. Depois disso este script roda sozinho, sem perguntar nada.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$projeto = 'gestao-franquias'
$url = "https://$projeto.pages.dev"

# --- 1. compilar ---------------------------------------------------------
Write-Host ''
Write-Host '1/3  Compilando o app...' -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Build falhou. Nada foi publicado.' -ForegroundColor Red
  exit 1
}

# --- 2. enviar -----------------------------------------------------------
Write-Host ''
Write-Host '2/3  Enviando e publicando...' -ForegroundColor Cyan
# --branch main marca o envio como producao (e nao preview).
# --commit-dirty evita o aviso de repositorio sujo; aqui nem ha git.
# "npx wrangler" (sem @latest) usa o wrangler instalado no projeto. Com
# "@latest" o npx ia a internet resolver a versao a cada execucao, o que
# sozinho custava ~16s de um deploy de ~25s.
npx wrangler pages deploy dist --project-name $projeto --branch main --commit-dirty=true
if ($LASTEXITCODE -ne 0) {
  Write-Host ''
  Write-Host 'Publicacao falhou. Se a mensagem falar em login, rode: npx wrangler login' -ForegroundColor Red
  exit 1
}

# --- 3. conferir ---------------------------------------------------------
Write-Host ''
Write-Host '3/3  Conferindo...' -ForegroundColor Cyan
Start-Sleep -Seconds 1
try {
  $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
  if ($r.StatusCode -eq 200 -and $r.Content -match '<title>(.*?)</title>') {
    Write-Host ''
    Write-Host "No ar: $url" -ForegroundColor Green
    Write-Host "Pagina servida: $($Matches[1])" -ForegroundColor Green
  } else {
    Write-Host ''
    Write-Host "Publicado, mas o site respondeu $($r.StatusCode): $url" -ForegroundColor Yellow
  }
} catch {
  Write-Host ''
  Write-Host "Publicado, mas nao consegui conferir: $($_.Exception.Message)" -ForegroundColor Yellow
  Write-Host "Confira em: $url"
}
