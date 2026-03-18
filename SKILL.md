# CEC News Widget

Widget para extraer y mostrar noticias de la Conferencia Episcopal de Colombia (CEC.org.co).

## 🖥️ Ejecutar Localmente

```bash
cd ~/.openclaw/workspace/skills/cec-news
python3 server.py
```

El widget estará disponible en:
- **Widget completo:** http://localhost:3457
- **Iframe embebible:** http://localhost:3457/iframe
- **API JSON:** http://localhost:3457/api/news

## 📋 Embeber en otra página

### Opción 1: Iframe compacto (recomendado para embeber)

```html
<iframe 
    src="http://localhost:3458/iframe.html" 
    width="100%" 
    height="600" 
    frameborder="0"
    style="border-radius: 12px;">
</iframe>
```

### Opción 2: Widget completo (con imágenes grandes)

```html
<iframe 
    src="http://localhost:3458/widget.html" 
    width="100%" 
    height="800" 
    frameborder="0"
    style="border-radius: 12px;">
</iframe>
```

### Opción 2: Abrir widget en Canvas

```bash
# En OpenClaw, usa:
canvas action=present url=http://localhost:3457
```

### Opción 3: HTML directo

Abrir `widget.html` en el navegador para ver el widget completo.

## 🎨 Características

- ✅ **Logo oficial CEC** cargado desde cec.org.co
- ✅ **Imágenes de noticias** con fallback a Unsplash
- ✅ Noticias en tiempo real
- ✅ Diseño responsive (2 columnas en desktop)
- ✅ Tema oscuro elegante
- ✅ Links directos a cec.org.co
- ✅ Versión iframe para embeber
- ✅ Auto-actualización cada 5 minutos

## 🔧 Estructura

```
cec-news/
├── SKILL.md        # Documentación
├── widget.html     # Widget HTML principal
├── server.py       # Servidor Python (opcional)
├── cec-news        # Script bash de respaldo
└── widget.py       # Parser Python (backup)
```

## 📰 Categorías

| Categoría | Descripción |
|-----------|-------------|
| Actualidad | Noticias principales |
| Iglesia en Colombia | Eventos diocesanos |
| Episcopado al día | Comunicados oficiales |
| Opinión | Artículos de opinión |
| Evangelio diario | Lecturas del día |

## 🔗 URLs

- **Sitio:** https://cec.org.co
- **Prensa:** https://cec.org.co/prensa
- **Twitter:** @episcopadocol
- **YouTube:** youtube.com/c/episcopadocoltv