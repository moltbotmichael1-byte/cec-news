# CEC News Widget
## Widget de Noticias de la Conferencia Episcopal de Colombia

### Presentación Técnica para Comunicadores

---

## ¿Qué es?

Un **widget embebible** que muestra las noticias más recientes de la Conferencia Episcopal de Colombia (CEC) en tiempo real, directamente en cualquier sitio web.

**URL del widget:** `https://cecnews.pages.dev/widget`

---

## ¿Cómo funciona?

```
CEC.org.co (fuente original)
       ↓  Scraping automático cada 30 min
Cloudflare Worker (cec-scraper)
       ↓  Almacena en KV
Widget HTML/JS
       ↓  Muestra noticias en tiempo real
Sitio web del comunicador
```

### Componentes:

| Componente | Tecnología | Función |
|------------|-----------|---------|
| Scraper | Cloudflare Worker | Extrae noticias de CEC.org.co |
| Almacenamiento | Cloudflare KV | Cache de noticias (CDN global) |
| Cron | Cloudflare Cron Trigger | Actualización automática cada 30 min |
| Widget | HTML/CSS/JS puro | Renderiza noticias sin dependencias |

---

## Características

- ✅ **Actualización automática** cada 30 minutos (sin intervención humana)
- ✅ **14 noticias activas** de CEC.org.co
- ✅ **Categorías:** Actualidad, Opinión, Evangelio
- ✅ **Responsive:** Se adapta a móvil y escritorio
- ✅ **Video embebido:** Noticias con video de YouTube se reproducen dentro del widget
- ✅ **Scroll infinito:** Carga más noticias al hacer scroll
- ✅ **Sin dependencias:** HTML/CSS/JS puro, no requiere React ni frameworks
- ✅ **CDN global:** Cloudflare Pages (latencia baja en cualquier país)
- ✅ **SSL incluido:** HTTPS por defecto

---

## Cómo embeberlo

Opción 1 — **Iframe** (más simple):
```html
<iframe 
  src="https://cecnews.pages.dev/widget" 
  width="100%" 
  height="600" 
  frameborder="0" 
  style="border:none; border-radius:8px;">
</iframe>
```

Opción 2 — **Iframe responsive** (se adapta al contenedor):
```html
<div style="position:relative; width:100%; padding-bottom:150%;">
  <iframe 
    src="https://cecnews.pages.dev/widget" 
    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:8px;">
  </iframe>
</div>
```

Opción 3 — **Enlace directo:**
```
https://cecnews.pages.dev/widget
```

---

## Especificaciones Técnicas

| Detalle | Valor |
|---------|-------|
| Fuente de datos | CEC.org.co (scraping automatizado) |
| Frecuencia de actualización | Cada 30 minutos |
| Hosting | Cloudflare Pages + Workers |
| CDN | 300+ ubicaciones globales |
| Latencia estimada | <50ms en Colombia |
| Tamaño del widget | ~16KB HTML + fuentes externas |
| Compatibilidad | Todos los navegadores modernos |
| SSL | Incluido (Cloudflare) |
| Costo de operación | $0 (Cloudflare free tier) |

---

## Contenido que muestra

El widget extrae automáticamente de CEC.org.co:

- **Título** de la noticia
- **Categoría** (Actualidad, Opinión, Evangelio)
- **Fecha** de publicación
- **Imagen** destacada (si existe)
- **Video** de YouTube (si la noticia lo incluye)
- **Enlace** directo a la noticia original en CEC.org.co

---

## Preguntas Frecuentes

**¿Necesito instalar algo?**
No. Solo copia el código iframe y pégalo en tu sitio.

**¿Las noticias se actualizan solas?**
Sí. Cada 30 minutos el sistema scrapea CEC.org.co y actualiza el widget.

**¿Puedo personalizar el diseño?**
Actualmente el widget tiene diseño fijo. Personalización disponible bajo solicitud.

**¿Qué pasa si CEC.org.co se cae?**
El widget muestra las últimas noticias cacheadas en Cloudflare KV. No se queda en blanco.

**¿Es gratuito?**
Sí. Sin costo de operación ni licencia.

**¿Necesita mantenimiento?**
No. Funciona 100% automático en Cloudflare.

---

## Arquitectura Detallada

```
┌─────────────────────────────────────────┐
│           Cloudflare Cron               │
│       (cada 30 minutos)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Cloudflare Worker               │
│         (cec-scraper)                   │
│                                         │
│  1. Scrapea CEC.org.co                  │
│  2. Extrae títulos, URLs, imágenes     │
│  3. Detecta videos de YouTube           │
│  4. Guarda en KV                         │
│  5. Genera news-data.json               │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         Cloudflare KV                   │
│         (CEC_NEWS)                      │
│                                         │
│  Cache de noticias                      │
│  TTL: 30 minutos                        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Cloudflare Pages                  │
│       (cecnews.pages.dev)               │
│                                         │
│  widget.html ← consume API del Worker  │
│  Fallback: news-data.json local         │
└─────────────────────────────────────────┘
```

---

## Contacto y Soporte

Para reportar problemas, solicitar personalización o integración:

- **Widget:** https://cecnews.pages.dev/widget
- **API:** https://cec-scraper.moltbotmichael1.workers.dev

---

*Documento generado el 23 de abril de 2026*