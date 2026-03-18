# CEC News Widget

Widget de noticias de la Conferencia Episcopal de Colombia.

## URLs

- **Widget:** https://cecnews.pages.dev/widget
- **Landing:** https://cecnews.pages.dev/
- **API:** https://cecnews.pages.dev/api/news

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

## Licencia

MIT