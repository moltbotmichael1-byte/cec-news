#!/bin/bash
# Deploy CEC News Widget to Cloudflare Pages

echo "🚀 Deploy CEC News Widget"
echo ""

# Preparar archivos
mkdir -p public
cp widget.html public/index.html
cp news-data.json public/

# Verificar wrangler
if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler no instalado"
    echo "   Instalando..."
    npm install -g wrangler
fi

# Login check
echo ""
echo "📋 Pasos para deploy:"
echo ""
echo "1. Si wrangler pide login:"
echo "   wrangler login"
echo ""
echo "2. Deploy:"
echo "   wrangler pages deploy public --project-name=cec-news"
echo ""
echo "3. O manualmente desde Cloudflare Dashboard:"
echo "   - https://dash.cloudflare.com/"
echo "   - Pages > Create project > Direct Upload"
echo "   - Subir carpeta 'public/'"
echo ""
echo "✅ Archivos listos en public/"