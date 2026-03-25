# CEC News Widget - Sistema de Actualización Automática

## 📋 Resumen

Widget de noticias de la Conferencia Episcopal de Colombia que se actualiza automáticamente cada 30 minutos.

## 🔄 Arquitectura

```
Cloudflare Cron (cada 30 min)
       ↓
cec-scraper Worker
       ↓
   Scrapea CEC.org.co
       ↓
   Guarda en KV (CEC_NEWS)
       ↓
Widget consume API
       ↓
   Fallback: news-data.json
```

## 🚀 Componentes

### 1. Worker (cec-scraper)
- **URL:** https://cec-scraper.moltbotmichael1.workers.dev
- **Archivo:** `cec-scraper/src/index.ts`
- **Config:** `cec-scraper/wrangler.toml`
- **KV:** `CEC_NEWS` (id: 7eeb23a2aaa844d88c7ecb1411725253)
- **Cron:** `*/30 * * * *` (cada 30 minutos)

### 2. Widget
- **URL:** https://cecnews.pages.dev/widget
- **Archivo:** `public/widget.html`
- **Logo:** 48px (desktop) / 38px (mobile)
- **Texto:** "Noticias de la Iglesia Católica"

## ⚙️ Comandos

```bash
# Desplegar worker
cd cec-scraper && npx wrangler deploy

# Desplegar widget
cd .. && npx wrangler pages deploy public --project-name=cecnews --commit-dirty=true

# Probar worker
curl https://cec-scraper.moltbotmichael1.workers.dev | jq '.[0:2]'

# Verificar cron
cat cec-scraper/wrangler.toml | grep crons
```

## 🔧 Problemas Comunes

### Widget no actualiza
1. Verificar que el worker responda: `curl https://cec-scraper...`
2. Verificar cron en wrangler.toml: `crons = ["*/30 * * * *"]`
3. Verificar KV namespace en wrangler.toml

### Worker falla
1. Verificar logs: `cd cec-scraper && npx wrangler tail`
2. Verificar que CEC.org.co esté accesible
3. Verificar que el KV esté vinculado

### Imágenes no cargan
- El worker usa URLs originales de CEC.org.co
- Si CEC cambia URLs, el worker extraerá las nuevas

## 📅 Historial

| Fecha | Cambio |
|-------|--------|
| Mar 18 | Worker creado |
| Mar 18 | GitHub Actions deshabilitado (CEC bloquea IPs) |
| Mar 25 | Cron trigger configurado |
| Mar 25 | Widget actualizado para usar API del worker |
| Mar 25 | Logo ajustado (48px), texto cambiado |

## 🔐 Cloudflare Dashboard

- **Workers:** https://dash.cloudflare.com → Workers & Pages → cec-scraper
- **Pages:** https://dash.cloudflare.com → Workers & Pages → cecnews
- **KV:** https://dash.cloudflare.com → KV → CEC_NEWS
- **Cron Triggers:** Workers → cec-scraper → Triggers

## ⚠️ Importante

- **NO eliminar** `wrangler.toml` - contiene el cron config
- **NO eliminar** el KV namespace `CEC_NEWS`
- **NO cambiar** la URL del worker en widget.html sin actualizar también el fallback