#!/usr/bin/env node
/**
 * Actualiza widget.html con las noticias scrapeadas
 */

const fs = require('fs');
const path = require('path');

const NEWS_FILE = 'news-data.json';
const WIDGET_FILE = 'widget.html';
const BACKUP_FILE = 'widget.html.bak';

async function updateWidget() {
    // Leer noticias
    if (!fs.existsSync(NEWS_FILE)) {
        console.error('❌ No hay archivo de noticias');
        process.exit(1);
    }

    const news = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));

    if (!news || news.length === 0) {
        console.error('❌ No hay noticias para actualizar');
        process.exit(1);
    }

    console.log(`📰 Actualizando widget con ${news.length} noticias...`);

    // Backup del widget actual
    if (fs.existsSync(WIDGET_FILE)) {
        fs.copyFileSync(WIDGET_FILE, BACKUP_FILE);
    }

    // Generar JavaScript con las noticias
    const newsJS = news.map((item, i) => `            {
                title: "${item.title.replace(/"/g, '\\"')}",
                excerpt: "${item.excerpt.replace(/"/g, '\\"')}",
                date: "${item.date}",
                category: "${item.category}",
                image: "${item.image}",
                url: "${item.url}",
                video: "${item.video || ''}"
            }`).join(',\n');

    // Template del widget
    const widgetHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Noticias CEC - Conferencia Episcopal de Colombia</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            padding: 40px 20px;
            background: #ffffff;
            border-radius: 16px;
            margin-bottom: 30px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            border: 1px solid #e9ecef;
        }

        .logo-container {
            margin-bottom: 20px;
        }

        .logo {
            max-width: 300px;
            width: 100%;
            height: auto;
        }

        .header h1 {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1a365d;
            margin-bottom: 4px;
        }

        .header p {
            font-size: 0.85rem;
            color: #666;
        }

        .news-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
        }

        @media (max-width: 400px) {
            .news-grid {
                grid-template-columns: 1fr;
            }
            .header {
                padding: 25px 15px;
            }
            .header h1 {
                font-size: 1.5rem;
            }
        }

        .news-card {
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            cursor: pointer;
            transition: transform 0.3s, box-shadow 0.3s;
            border: 1px solid #e9ecef;
        }

        .news-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }

        .news-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
        }

        .news-content {
            padding: 20px;
        }

        .news-meta {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 0.85rem;
        }

        .news-category {
            background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
            color: #fff;
            padding: 4px 14px;
            border-radius: 20px;
            font-size: 0.75rem;
            text-transform: uppercase;
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .news-date {
            color: #666;
            display: flex;
            align-items: center;
        }

        .news-title {
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.4;
            color: #1a1a2e;
            margin-bottom: 10px;
        }

        .news-excerpt {
            font-size: 0.9rem;
            color: #555;
            line-height: 1.6;
        }

        .news-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 15px;
            color: #2c5282;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.2s;
        }

        .news-link:hover {
            color: #1a365d;
        }

        /* Video Container */
        .video-container {
            width: 100%;
            margin-top: 15px;
            border-radius: 8px;
            overflow: hidden;
            background: #000;
        }

        .video-container iframe {
            width: 100%;
            aspect-ratio: 16/9;
            border: none;
        }

        .play-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255,0,0,0.9);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 600;
        }

        /* Scroll Infinito */
        html {
            scroll-behavior: smooth;
        }

        body {
            overflow-x: hidden;
            overflow-y: auto;
        }

        body::-webkit-scrollbar {
            width: 10px;
        }

        body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 5px;
        }

        body::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
            border-radius: 5px;
        }

        body::-webkit-scrollbar-thumb:hover {
            background: #1a365d;
        }

        .container {
            max-width: 1400px;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 25px;
            color: #666;
            font-size: 0.9rem;
            border-top: 1px solid #e9ecef;
        }

        .footer a {
            color: #2c5282;
            text-decoration: none;
            font-weight: 500;
        }

        .placeholder-image {
            width: 100%;
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2c5282 0%, #1a365d 100%);
            color: rgba(255,255,255,0.3);
            font-size: 48px;
        }

        .update-badge {
            background: #48bb78;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        /* Featured Card (First news with video) */
        .news-card.featured {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            max-width: none;
        }

        @media (max-width: 768px) {
            .news-card.featured {
                grid-template-columns: 1fr;
            }
        }

        .featured .news-image {
            height: 300px;
        }

        .featured .news-content {
            padding: 25px;
        }

        .featured .news-title {
            font-size: 1.4rem;
        }

        .featured .news-excerpt {
            font-size: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="images/logo.svg" alt="CEC Logo" class="logo">
            </div>
            <h1>Conferencia Episcopal de Colombia</h1>
            <p>Noticias de la Iglesia en Colombia</p>
        </div>

        <div id="news-container" class="news-grid">
            <div style="text-align: center; padding: 40px; grid-column: 1/-1;">
                <p style="color: #666;">Cargando noticias...</p>
            </div>
        </div>

        <div class="footer">
            <p>Fuente: <a href="https://cec.org.co" target="_blank">cec.org.co</a> |
            Actualizado: <span id="timestamp">-</span>
            <span class="update-badge" id="update-badge">Automático</span></p>
        </div>
    </div>

    <script>
        // Noticias actualizadas automáticamente desde CEC.org.co
        const news = [
${newsJS}
        ];

        // Configuración de lazy loading
        const INITIAL_LOAD = 6;
        const LOAD_MORE = 3;
        let currentIndex = 0;
        let isLoading = false;
        
        function renderNews() {
            const container = document.getElementById('news-container');
            
            // Primera carga
            if (currentIndex === 0) {
                container.innerHTML = '';
            }
            
            // Cargar siguiente lote de noticias
            const endIndex = Math.min(currentIndex + (currentIndex === 0 ? INITIAL_LOAD : LOAD_MORE), news.length);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const item = news[i];
                const card = document.createElement('div');
                const isFeatured = i === 0;
                card.className = isFeatured ? 'news-card featured' : 'news-card';
                card.setAttribute('data-index', i);

                // Si tiene video, mostrar video en lugar de imagen
                if (item.video) {
                    card.innerHTML = \`
                        <div class="video-container" style="border-radius: 12px 12px 0 0; overflow: hidden;">
                            <iframe src="\${item.video}?rel=0&modestbranding=1"
                                    title="\${item.title}"
                                    frameborder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowfullscreen
                                    loading="lazy"
                                    style="width: 100%; aspect-ratio: 16/9; border: none;">
                            </iframe>
                        </div>
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-category">\${item.category}</span>
                                <span class="news-date">\${item.date}</span>
                            </div>
                            <h3 class="news-title">\${item.title}</h3>
                            <p class="news-excerpt">\${item.excerpt}</p>
                            <a href="\${item.url}" target="_blank" class="news-link" onclick="event.stopPropagation()">
                                Leer más →
                            </a>
                        </div>
                    \`;
                } else {
                    card.innerHTML = \`
                        <img src="\${item.image}" alt="\${item.title}" class="news-image"
                             onerror="this.outerHTML='<div class=\\'placeholder-image\\'>📰</div>'"
                             loading="lazy">
                        <div class="news-content">
                            <div class="news-meta">
                                <span class="news-category">\${item.category}</span>
                                <span class="news-date">\${item.date}</span>
                            </div>
                            <h3 class="news-title">\${item.title}</h3>
                            <p class="news-excerpt">\${item.excerpt}</p>
                            <a href="\${item.url}" target="_blank" class="news-link" onclick="event.stopPropagation()">
                                Leer más →
                            </a>
                        </div>
                    \`;
                }

                card.onclick = (e) => {
                    if (e.target.tagName !== 'A' && e.target.tagName !== 'IFRAME') {
                        window.open(item.url, '_blank');
                    }
                };

                container.appendChild(card);
            }

            currentIndex = endIndex;

            // Mostrar timestamp de actualización
            const now = new Date();
            document.getElementById('timestamp').textContent = now.toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Añadir indicador de carga si hay más noticias
            if (currentIndex < news.length) {
                const loader = document.createElement('div');
                loader.id = 'load-more-indicator';
                loader.style.cssText = 'text-align: center; padding: 20px; grid-column: 1/-1; color: #666;';
                loader.innerHTML = '<p>↓ Desliza para ver más noticias ↓</p>';
                container.appendChild(loader);
            }
        }

        // Inicializar
        renderNews();

        // Intersection Observer para scroll infinito
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentIndex < news.length) {
                    const loader = document.getElementById('load-more-indicator');
                    if (loader) {
                        loader.remove();
                        renderNews();
                        // Re-observar el nuevo indicador
                        setTimeout(() => {
                            const newLoader = document.getElementById('load-more-indicator');
                            if (newLoader) observer.observe(newLoader);
                        }, 100);
                    }
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '200px' 
        });

        // Observar el indicador de carga inicial
        setTimeout(() => {
            const loader = document.getElementById('load-more-indicator');
            if (loader) observer.observe(loader);
        }, 500);
    </script>
</body>
</html>`;

    // Guardar widget actualizado
    fs.writeFileSync(WIDGET_FILE, widgetHTML);
    console.log(`✅ Widget actualizado: ${WIDGET_FILE}`);

    // Mostrar noticias
    console.log('\n📰 Noticias:');
    news.forEach((n, i) => {
        console.log(`  ${i + 1}. [${n.category}] ${n.title.substring(0, 50)}...`);
    });
}

updateWidget().catch(err => {
    console.error('❌ Error:', err.message);
    // Restaurar backup si hay error
    if (fs.existsSync(BACKUP_FILE)) {
        fs.copyFileSync(BACKUP_FILE, WIDGET_FILE);
    }
    process.exit(1);
});