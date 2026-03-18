# CEC News Widget - Deploy Script
# Este script prepara los archivos para deploy manual a Cloudflare Pages

## Deploy Manual

### Opción 1: Cloudflare Dashboard
1. Ir a https://dash.cloudflare.com/
2. Pages > Create a project > Direct Upload
3. Subir la carpeta `public/`
4. Nombra el proyecto: `cec-news`

### Opción 2: Wrangler CLI
```bash
# Login en Cloudflare
wrangler login

# Deploy
cd ~/.openclaw/workspace/skills/cec-news
wrangler pages deploy public --project-name=cec-news
```

### Estructura del Proyecto
```
cec-news/
├── public/
│   ├── index.html      # Widget HTML
│   └── news-data.json  # Datos de noticias
├── widget.html         # Source HTML
├── widget.py           # Scraper (actualizar datos)
└── SKILL.md            # Documentación
```

### Actualizar Noticias
```bash
cd ~/.openclaw/workspace/skills/cec-news
python3 widget.py
cp news-data.json public/
# Re-deploy
```