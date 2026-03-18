#!/bin/bash
# CEC News Updater - Actualiza noticias cada 5 min
# Extrae noticias de CEC.org.co, descarga imágenes, deploy a Cloudflare

set -e

cd "$(dirname "$0")"

LOG_FILE="/tmp/cec-news-update.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] 🔄 CEC News Updater iniciando..." | tee -a "$LOG_FILE"

# 1. Ejecutar scraper Node.js
echo "[$TIMESTAMP] 📥 Extrayendo noticias de CEC.org.co..." | tee -a "$LOG_FILE"

if node scraper.js 2>&1 | tee -a "$LOG_FILE"; then
    echo "[$TIMESTAMP] ✅ Scraper completado" | tee -a "$LOG_FILE"
else
    echo "[$TIMESTAMP] ⚠️ Scraper falló, intentando Python..." | tee -a "$LOG_FILE"
    python3 widget.py > /tmp/cec-news-raw.txt 2>&1 || true
fi

# 2. Verificar que hay noticias
if [ ! -f "news-data.json" ]; then
    echo "[$TIMESTAMP] ❌ No se generó news-data.json" | tee -a "$LOG_FILE"
    exit 1
fi

NEWS_COUNT=$(grep -c '"title"' news-data.json 2>/dev/null || echo "0")
echo "[$TIMESTAMP] 📰 $NEWS_COUNT noticias encontradas" | tee -a "$LOG_FILE"

# 3. Actualizar widget HTML
if node update-widget.js 2>&1 | tee -a "$LOG_FILE"; then
    echo "[$TIMESTAMP] ✅ Widget HTML actualizado" | tee -a "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Error actualizando widget" | tee -a "$LOG_FILE"
    exit 1
fi

# 4. Deploy a Cloudflare Pages
echo "[$TIMESTAMP] 🚀 Desplegando a Cloudflare..." | tee -a "$LOG_FILE"

if npx wrangler pages deploy . --project-name=cec-news --commit-dirty=true 2>&1 | tee -a "$LOG_FILE" | tail -5; then
    echo "[$TIMESTAMP] ✅ Deploy completado" | tee -a "$LOG_FILE"
else
    echo "[$TIMESTAMP] ⚠️ Deploy falló pero widget actualizado localmente" | tee -a "$LOG_FILE"
fi

# 5. Resumen final
echo "[$TIMESTAMP] ✅ CEC News actualizado: $(date '+%H:%M:%S')" | tee -a "$LOG_FILE"
echo "[$TIMESTAMP] 🔗 https://cecnews.pages.dev" | tee -a "$LOG_FILE"

# Cleanup
rm -f /tmp/cec-news-raw.txt 2>/dev/null || true