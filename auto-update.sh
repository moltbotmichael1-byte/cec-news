#!/bin/bash
# CEC News Auto-Update - Actualiza noticias y deploya automáticamente
# Ejecutar desde launchd cada 30 minutos

set -e

cd /Users/michaelc/.openclaw/workspace/skills/cec-news

LOG_FILE="/tmp/cec-news-update.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] 🔄 Iniciando actualización CEC News..." >> "$LOG_FILE"

# 1. Ejecutar scraper
echo "[$TIMESTAMP] 📥 Ejecutando scraper..." >> "$LOG_FILE"
if node scraper.js >> "$LOG_FILE" 2>&1; then
    echo "[$TIMESTAMP] ✅ Scraper OK" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ⚠️ Scraper falló, continuando..." >> "$LOG_FILE"
fi

# 2. Copiar datos actualizados a public/
echo "[$TIMESTAMP] 📋 Copiando archivos a public/..." >> "$LOG_FILE"
cp news-data.json public/ 2>/dev/null || true
cp -r images public/ 2>/dev/null || true

# 3. Deploy a Cloudflare
echo "[$TIMESTAMP] 🚀 Deployando..." >> "$LOG_FILE"
if npx wrangler pages deploy public --project-name=cec-news --commit-dirty=true >> "$LOG_FILE" 2>&1; then
    echo "[$TIMESTAMP] ✅ Deploy completado" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Deploy falló" >> "$LOG_FILE"
    exit 1
fi

echo "[$TIMESTAMP] ✅ Actualización completa" >> "$LOG_FILE"