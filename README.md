# CEC News Widget

Widget de noticias de la Conferencia Episcopal de Colombia.

## URLs

- **Widget:** https://cec-news.pages.dev/widget
- **Landing:** https://cec-news.pages.dev/
- **API:** https://cec-news.pages.dev/api/news
- **GitHub:** https://github.com/moltbotmichael1-byte/cec-news

## Arquitectura

```
GitHub Actions (cada 30 min)
      │
      ▼
  scraper.js
      │
      ▼
  news-data.json
      │
      ▼
  Git push
      │
      ▼
Cloudflare Pages (auto-deploy)
      │
      ▼
  Widget actualizado
```

## Archivos

- `scraper.js` - Extrae noticias de CEC.org.co
- `news-data.json` - Datos JSON de noticias
- `public/widget.html` - Widget principal
- `public/index.html` - Landing con generador de iframe
- `public/functions/api/news.js` - API que sirve las noticias
- `.github/workflows/update.yml` - Actualización automática

## Actualización manual

```bash
cd ~/.openclaw/workspace/skills/cec-news
node scraper.js
git add -A && git commit -m "Update news"
git push
```

## Licencia

MIT