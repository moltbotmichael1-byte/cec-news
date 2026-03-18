#!/bin/bash
# CEC News Auto-Updater
# Ejecutado por cron cada 30 minutos

cd "$(dirname "$0")"

echo "====== CEC News Update $(date) ======"

# Ejecutar scraper
echo "📰 Obteniendo noticias de CEC.org.co..."
node scraper.js

if [ $? -ne 0 ]; then
    echo "❌ Error en scraper"
    exit 1
fi

# Copiar a public
echo "📋 Copiando a public/..."
cp news-data.json public/

# Deploy a Cloudflare
echo "🚀 Desplegando a Cloudflare..."
npx wrangler pages deploy public --project-name=cecnews --commit-dirty=true

echo "✅ Actualización completada"