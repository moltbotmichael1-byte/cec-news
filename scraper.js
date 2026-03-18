#!/usr/bin/env node
/**
 * CEC News Scraper - Extrae noticias de CEC.org.co
 * Obtiene título, extracto, fecha, imagen y URL de cada noticia
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://cec.org.co';
const OUTPUT_FILE = 'news-data.json';
const IMAGES_DIR = 'images';
const MAX_NEWS = 20;

// Crear directorio de imágenes si no existe
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

function fetch(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const chunks = [];
        
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirect
                const redirectUrl = res.headers.location.startsWith('http') 
                    ? res.headers.location 
                    : new URL(res.headers.location, url).href;
                fetch(redirectUrl).then(resolve).catch(reject);
                return;
            }
            
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const data = Buffer.concat(chunks).toString('utf8');
                resolve(data);
            });
        });
        
        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);
        
        const req = client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                fs.unlinkSync(filepath);
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
        });
        
        req.on('error', (err) => {
            file.close();
            fs.unlinkSync(filepath);
            reject(err);
        });
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

function parseHTML(html) {
    const news = [];
    
    // Buscar artículos de noticias
    const articleRegex = /<article[^>]*>([\s\S]*?)<\/article>/gi;
    const linkRegex = /<a[^>]*href="([^"]*sistema-informativo[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const titleRegex = /<h[2-5][^>]*>([^<]+)<\/h[2-5]>/i;
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
    
    // Buscar enlaces a noticias
    const links = html.matchAll(linkRegex);
    const seenUrls = new Set();
    
    for (const match of links) {
        const url = match[1];
        const content = match[2];
        
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        
        // Extraer título
        const titleMatch = content.match(titleRegex);
        let title = titleMatch ? titleMatch[1].trim() : '';
        
        // Si no hay título en h2-h5, buscar en el texto
        if (!title) {
            const textMatch = content.match(/>([^<]{20,})</);
            title = textMatch ? textMatch[1].trim() : '';
        }
        
        if (title.length < 20) continue;
        
        // límite de noticias
        if (seenUrls.size >= MAX_NEWS) continue;
        
        // Extraer imagen
        const imgMatch = content.match(imgRegex);
        let imageUrl = imgMatch ? imgMatch[1] : '';
        
        if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = new URL(imageUrl, BASE_URL).href;
        }
        
        news.push({
            title: title.substring(0, 150),
            url: url.startsWith('http') ? url : BASE_URL + url,
            imageUrl: imageUrl,
            date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
            category: 'Actualidad'
        });
        
        if (news.length >= 6) break;
    }
    
    return news;
}

async function extractNewsDetails(newsUrl) {
    try {
        const html = await fetch(newsUrl);
        
        // Extraer meta descripción
        const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
        const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
        let description = (descMatch ? descMatch[1] : (ogDescMatch ? ogDescMatch[1] : ''));
        
        // Si la descripción es muy corta, buscar en el contenido
        if (description.length < 50) {
            const pMatch = html.match(/<p[^>]*>([^<]{50,300})<\/p>/i);
            if (pMatch) description = pMatch[1].substring(0, 200);
        }
        
        // Extraer imagen OG
        const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
        const ogImage = ogImageMatch ? ogImageMatch[1] : '';
        
        // Extraer video de YouTube si existe (buscar en el contenido principal, no en sidebar)
        let video = '';
        // Primero buscar el iframe de YouTube en el contenido de la noticia
        const iframeMatch = html.match(/<iframe[^>]*src="[^"]*youtube\.com\/embed\/([a-zA-Z0-9_-]+)[^"]*"[^>]*>/i);
        if (iframeMatch) {
            video = `https://www.youtube.com/embed/${iframeMatch[1]}`;
        } else {
            // Buscar en el property="schema:text" que es el contenido real
            const schemaTextMatch = html.match(/property="schema:text"[^>]*>([\s\S]*?)<\/div>/i);
            if (schemaTextMatch) {
                const contentText = schemaTextMatch[1];
                const contentVideoMatch = contentText.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
                if (contentVideoMatch) {
                    video = `https://www.youtube.com/embed/${contentVideoMatch[1]}`;
                }
            }
        }
        
        // Extraer fecha de schema:dateCreated
        let date = '';
        const schemaMatch = html.match(/property="schema:dateCreated"[^>]*content="([^"]+)"/i);
        if (schemaMatch) {
            const d = new Date(schemaMatch[1]);
            date = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        
        // Si no hay schema, buscar en el texto de fecha
        if (!date) {
            const dateTextMatch = html.match(/text-\[#999999\]">([^<]+)<\/p>/i);
            if (dateTextMatch) {
                date = dateTextMatch[1].replace(/^[A-Z][a-z]+\s+/, ''); // Quitar día de la semana
            }
        }
        
        // Formato alternativo: Vie 6 Mar 2026
        if (!date) {
            const altMatch = html.match(/([A-Z][a-z]{2})\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})/i);
            if (altMatch) {
                date = `${altMatch[2]} de ${altMatch[3].toLowerCase()} de ${altMatch[4]}`;
            }
        }
        
        // Si aún no hay fecha, usar ISO del meta
        if (!date) {
            const isoMatch = html.match(/(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}/);
            if (isoMatch) {
                const d = new Date(isoMatch[0]);
                date = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
            }
        }
        
        // Si nada funciona, fecha actual
        if (!date) {
            date = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
        }
        
        // Determinar categoría de la URL
        let category = 'Actualidad';
        if (newsUrl.includes('/episcopado') || newsUrl.includes('/episcopado-al-dia')) category = 'Episcopado';
        else if (newsUrl.includes('/iglesia-en-colombia')) category = 'Iglesia en Colombia';
        else if (newsUrl.includes('/evangelio') || newsUrl.includes('/evangelio-diario')) category = 'Evangelio';
        else if (newsUrl.includes('/opinion')) category = 'Opinión';
        
        return { description, ogImage, date, category, video };
    } catch (err) {
        return { 
            description: 'Conferencia Episcopal de Colombia', 
            ogImage: '', 
            date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), 
            category: 'Actualidad',
            video: ''
        };
    }
}

async function main() {
    console.log('🔄 Scrapeando CEC.org.co...');
    
    try {
        // Primero obtener noticias de la página principal
        const html = await fetch(BASE_URL);
        const mainNews = parseHTML(html);
        
        // También buscar en categorías específicas
        const categories = [
            '/sistema-informativo/actualidad',
            '/sistema-informativo/evangelio-diario',
            '/categorias-articulos/actualidad',
            '/categorias-articulos/la-iglesia-en-colombia'
        ];
        
        const allNews = [...mainNews];
        const seenUrls = new Set(mainNews.map(n => n.url));
        
        for (const cat of categories) {
            if (allNews.length >= MAX_NEWS) break;
            
            try {
                console.log(`  📂 Revisando: ${cat}`);
                const catHtml = await fetch(BASE_URL + cat);
                const catNews = parseHTML(catHtml);
                
                for (const item of catNews) {
                    if (!seenUrls.has(item.url) && allNews.length < MAX_NEWS) {
                        seenUrls.add(item.url);
                        allNews.push(item);
                    }
                }
            } catch (err) {
                console.log(`    ⚠️ Error en ${cat}: ${err.message}`);
            }
        }
        
        console.log(`📰 Encontrados ${allNews.length} enlaces de noticias`);
        
        // Procesar cada noticia
        const processedNews = [];
        
        for (let i = 0; i < Math.min(allNews.length, MAX_NEWS); i++) {
            const item = allNews[i];
            console.log(`  [${i + 1}/${Math.min(allNews.length, MAX_NEWS)}] ${item.title.substring(0, 50)}...`);
            
            // Obtener detalles de la página de la noticia
            const details = await extractNewsDetails(item.url);
            
            // Usar imagen OG si no hay imagen en el listado
            const imageUrl = item.imageUrl || details.ogImage;
            
            // Descargar imagen
            let localImage = '';
            if (imageUrl) {
                const ext = imageUrl.includes('.png') ? 'png' : 'jpg';
                const filename = `noticia${i + 1}.${ext}`;
                const filepath = path.join(IMAGES_DIR, filename);
                
                try {
                    await downloadImage(imageUrl, filepath);
                    localImage = `images/${filename}`;
                    console.log(`    ✅ Imagen descargada: ${filename}`);
                } catch (err) {
                    console.log(`    ⚠️ Error descargando imagen: ${err.message}`);
                    localImage = `images/noticia${i + 1}.jpg`;
                }
            }
            
            processedNews.push({
                title: item.title,
                excerpt: details.description || 'Lea más en CEC.org.co',
                date: details.date || item.date,
                category: details.category || item.category,
                image: localImage || `images/noticia${i + 1}.jpg`,
                url: item.url,
                video: details.video || ''
            });
        }
        
        // Guardar datos
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedNews, null, 2));
        console.log(`\n✅ Guardado en ${OUTPUT_FILE}`);
        
        // Mostrar resumen
        console.log('\n📰 Noticias:');
        processedNews.forEach((n, i) => {
            console.log(`  ${i + 1}. ${n.title.substring(0, 60)}...`);
        });
        
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        process.exit(1);
    }
}

main();