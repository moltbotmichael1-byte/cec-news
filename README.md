# CEC News Widget

Widget de noticias de la Conferencia Episcopal de Colombia para incrustar en sitios web.

## 📰 URL del Widget

```
https://cec-news.pages.dev/widget.html
```

## 🚀 Uso Rápido

### Opción 1: Iframe Simple

```html
<iframe 
  src="https://cec-news.pages.dev/widget.html" 
  width="100%" 
  height="800" 
  frameborder="0"
  loading="lazy">
</iframe>
```

### Opción 2: Con Scroll Infinito

```html
<div style="height: 800px; overflow-y: auto; -webkit-overflow-scrolling: touch;">
  <iframe 
    src="https://cec-news.pages.dev/widget.html" 
    width="100%" 
    height="100%" 
    frameborder="0"
    style="min-height: 1200px;">
  </iframe>
</div>
```

### Opción 3: Responsive Completo

```html
<style>
.cec-widget-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  height: 800px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.cec-widget-container iframe {
  width: 100%;
  height: 100%;
  border: none;
}

@media (max-width: 768px) {
  .cec-widget-container {
    height: 600px;
    border-radius: 8px;
  }
}
</style>

<div class="cec-widget-container">
  <iframe 
    src="https://cec-news.pages.dev/widget.html" 
    loading="lazy">
  </iframe>
</div>
```

## 📋 Características

| Característica | Descripción |
|----------------|-------------|
| **Actualización** | Automática cada 5 minutos |
| **Noticias** | 12+ noticias de CEC.org.co |
| **Videos** | YouTube embebido cuando disponible |
| **Scroll infinito** | 6 primeras, carga más al desplazar |
| **Responsive** | Adaptable a cualquier tamaño |
| **Logo oficial** | Banner blanco con logo CEC |
| **Fechas reales** | Extraídas del sitio original |
| **Categorías** | Actualidad, Opinión, Evangelio |

## 🎨 Personalización

### Cambiar Altura

```html
<!-- Altura fija -->
<iframe src="https://cec-news.pages.dev/widget.html" height="600"></iframe>

<!-- Altura dinámica -->
<div style="height: 80vh;">
  <iframe src="https://cec-news.pages.dev/widget.html" width="100%" height="100%"></iframe>
</div>
```

### Ocultar Scrollbar (CSS)

```html
<style>
.ce-widget::-webkit-scrollbar {
  display: none;
}
.ce-widget {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<div class="ce-widget" style="height: 800px; overflow-y: auto;">
  <iframe src="https://cec-news.pages.dev/widget.html" width="100%" height="100%"></iframe>
</div>
```

### Lazy Loading

```html
<!-- Cargar solo cuando sea visible -->
<iframe 
  src="https://cec-news.pages.dev/widget.html" 
  loading="lazy"
  width="100%" 
  height="800">
</iframe>
```

## 📱 Ejemplos por Plataforma

### WordPress

```html
<!-- En un bloque HTML personalizado -->
<div style="max-width: 1200px; margin: 0 auto; height: 800px; overflow: hidden;">
  <iframe 
    src="https://cec-news.pages.dev/widget.html" 
    width="100%" 
    height="100%" 
    frameborder="0"
    loading="lazy">
  </iframe>
</div>
```

### Blogger

```html
<!-- En un gadget HTML/JavaScript -->
<div style="height: 800px; overflow-y: auto;">
  <iframe src="https://cec-news.pages.dev/widget.html" width="100%" height="100%"></iframe>
</div>
```

### Wix / Squarespace

1. Añadir bloque "HTML Embed" o "Code Block"
2. Pegar el código del iframe
3. Ajustar altura del contenedor

### Ghost / Jekyll

```markdown
<!-- En un post o página -->
<iframe src="https://cec-news.pages.dev/widget.html" width="100%" height="800" frameborder="0" loading="lazy"></iframe>
```

## 🔧 API de Noticias (JSON)

Si necesitas los datos en bruto para tu propia implementación:

```javascript
// URL del JSON completo
const newsUrl = 'https://cec-news.pages.dev/news-data.json';

fetch(newsUrl)
  .then(res => res.json())
  .then(news => {
    news.forEach(item => {
      console.log(item.title, item.date, item.category);
      // item.video disponible si existe
    });
  });
```

### Estructura del JSON

```json
[
  {
    "title": "Título de la noticia",
    "excerpt": "Extracto de 200 caracteres",
    "date": "12 de marzo de 2026",
    "category": "Actualidad",
    "image": "images/noticia1.jpg",
    "url": "https://cec.org.co/noticia-completa",
    "video": "https://www.youtube.com/embed/xxxxx"
  }
]
```

## 🔄 Actualización Automática

El widget se actualiza automáticamente cada 5 minutos con las últimas noticias de CEC.org.co:

| Componente | Frecuencia |
|------------|------------|
| Scraper | Cada 5 minutos |
| Imágenes | Descarga automática |
| Videos | Detección automática |
| Deploy | Cloudflare Pages |

## ⚙️ Implementación Local (Opcional)

Si quieres tu propia instancia:

### Requisitos

- Node.js >= 16
- npm
- Cuenta Cloudflare (para deploy)

### Instalación

```bash
# Clonar o descargar
cd cec-news

# Instalar dependencias
npm install

# Ejecutar scraper
node scraper.js

# Actualizar widget
node update-widget.js

# Deploy local
npx wrangler pages deploy . --project-name=cec-news
```

### Cron Job (cPanel)

```
*/5 * * * * cd /home/usuario/public_html/cec-news && ./update-news.sh
```

### Cron Job (OpenClaw)

```bash
openclaw cron add \
  --name "cec-news-update" \
  --every "5m" \
  --message "cd /path/to/cec-news && ./update-news.sh"
```

## 📊 Logs y Monitoreo

```bash
# Ver log de actualizaciones
tail -f /tmp/cec-news-update.log

# Ver últimas noticias
cat news-data.json | jq '.[].title'
```

## 🐛 Solución de Problemas

### El widget no carga

1. Verificar que el sitio permita iframes
2. Comprobar conexión a internet
3. Revisar consola del navegador (F12)

### Las imágenes no aparecen

1. Esperar 1-2 minutos (están en Cloudflare)
2. Verificar que las imágenes existen en `images/`

### El video no se reproduce

1. Algunos videos requieren interacción del usuario
2. Verificar que el dominio permita embeds de YouTube

## 📞 Soporte

- **Sitio oficial:** https://cec.org.co
- **Widget:** https://cec-news.pages.dev/widget.html
- **JSON:** https://cec-news.pages.dev/news-data.json

## 📄 Licencia

Widget de noticias de la Conferencia Episcopal de Colombia.
Contenido original: © Conferencia Episcopal de Colombia

---

**Estado del servicio:** ✅ Activo - Actualización automática cada 5 minutos