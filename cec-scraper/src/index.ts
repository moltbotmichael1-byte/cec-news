// Cloudflare Worker para scrapear noticias de CEC.org.co
// Se ejecuta cada 30 minutos via Cron Trigger

interface Env {
  CEC_NEWS: KVNamespace;
  DEPLOY_HOOK: string;
}

interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  url: string;
  video?: string;
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.text();
}

async function extractNewsDetails(url: string): Promise<{excerpt: string; image: string; date: string; video: string}> {
  try {
    const html = await fetchPage(url);
    
    // Extraer meta descripción
    const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
    let excerpt = descMatch ? descMatch[1] : (ogDescMatch ? ogDescMatch[1] : '');
    
    // Buscar contenido schema:text
    if (excerpt.length < 100) {
      const schemaMatch = html.match(/property="schema:text"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
      if (schemaMatch) {
        const content = schemaMatch[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        excerpt = content.substring(0, 250);
      }
    }
    
    // Buscar párrafos
    if (excerpt.length < 100) {
      const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (paragraphs) {
        const texts = paragraphs.map(p => p.replace(/<[^>]*>/g, '').trim()).filter(t => t.length > 30);
        if (texts.length > 0) {
          excerpt = texts.slice(0, 2).join(' ').substring(0, 250);
        }
      }
    }
    
    // Extraer imagen OG
    const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    const image = ogImageMatch ? ogImageMatch[1] : '';
    
    // Extraer video YouTube
    let video = '';
    const iframeMatch = html.match(/<iframe[^>]*src="[^"]*youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
    if (iframeMatch) {
      video = `https://www.youtube.com/embed/${iframeMatch[1]}`;
    }
    
    // Extraer fecha
    let date = '';
    const schemaDate = html.match(/property="schema:dateCreated"[^>]*content="([^"]+)"/i);
    if (schemaDate) {
      const d = new Date(schemaDate[1]);
      date = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    
    if (!date) {
      const dateTextMatch = html.match(/text-\[#999999\]">([^<]+)<\/p>/i);
      if (dateTextMatch) {
        date = dateTextMatch[1].replace(/^[A-Z][a-z]+\s+/, '');
      }
    }
    
    if (!date) {
      const altMatch = html.match(/([A-Z][a-z]{2})\s+(\d{1,2})\s+([A-Z][a-z]{2})\s+(\d{4})/i);
      if (altMatch) {
        date = `${altMatch[2]} de ${altMatch[3].toLowerCase()} de ${altMatch[4]}`;
      }
    }
    
    return { excerpt: excerpt || 'Lea más en CEC.org.co', image, date: date || new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), video };
    
  } catch (e) {
    return { 
      excerpt: 'Lea más en CEC.org.co', 
      image: '', 
      date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }), 
      video: '' 
    };
  }
}

function parseHTML(html: string): Array<{title: string; url: string; imageUrl: string}> {
  const news: Array<{title: string; url: string; imageUrl: string}> = [];
  
  const linkRegex = /<a[^>]*href="([^"]*sistema-informativo[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const titleRegex = /<h[2-5][^>]*>([^<]+)<\/h[2-5]>/i;
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
  
  const seen = new Set<string>();
  let match;
  
  while ((match = linkRegex.exec(html)) !== null && news.length < 12) {
    const url = match[1];
    const content = match[2];
    
    if (seen.has(url)) continue;
    seen.add(url);
    
    const titleMatch = content.match(titleRegex);
    let title = titleMatch ? titleMatch[1].trim() : '';
    
    if (!title) {
      const textMatch = content.match(/>([^<]{20,})</);
      title = textMatch ? textMatch[1].trim() : '';
    }
    
    if (title.length < 20) continue;
    
    const imgMatch = content.match(imgRegex);
    let imageUrl = imgMatch ? imgMatch[1] : '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = 'https://cec.org.co' + imageUrl;
    }
    
    news.push({
      title: title.substring(0, 150),
      url: url.startsWith('http') ? url : 'https://cec.org.co' + url,
      imageUrl
    });
  }
  
  return news;
}

export default {
  // HTTP endpoint para servir noticias
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // GET /scrape - ejecutar scraper manualmente
    if (url.pathname === '/scrape') {
      try {
        const result = await this.scheduled!({} as ScheduledEvent, env, ctx);
        return new Response(JSON.stringify({ success: true, message: 'Scraping completed' }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: corsHeaders });
      }
    }
    
    // GET /news-data.json - servir noticias
    if (url.pathname === '/news-data.json' || url.pathname === '/') {
      const news = await env.CEC_NEWS.get('news-data', 'json');
      return new Response(JSON.stringify(news || []), { headers: corsHeaders });
    }
    
    return new Response('Not found', { status: 404 });
  },
  
  // Cron scheduled task
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('🔄 Iniciando scrapeo CEC desde Cloudflare Worker...');
    
    try {
      // Fetch página principal
      const html = await fetchPage('https://cec.org.co/');
      console.log(`📄 HTML recibido: ${html.length} bytes`);
      
      // También buscar en categorías
      const categories = [
        '/sistema-informativo/actualidad',
        '/sistema-informativo/evangelio-diario'
      ];
      
      const allLinks = parseHTML(html);
      const seenUrls = new Set(allLinks.map(n => n.url));
      
      for (const cat of categories) {
        try {
          const catHtml = await fetchPage('https://cec.org.co' + cat);
          const catLinks = parseHTML(catHtml);
          for (const link of catLinks) {
            if (!seenUrls.has(link.url) && allLinks.length < 12) {
              seenUrls.add(link.url);
              allLinks.push(link);
            }
          }
        } catch (e) {
          console.log(`⚠️ Error en ${cat}: ${e}`);
        }
      }
      
      console.log(`📰 Encontrados ${allLinks.length} enlaces`);
      
      // Procesar cada noticia
      const news: NewsItem[] = [];
      
      for (let i = 0; i < Math.min(allLinks.length, 12); i++) {
        const item = allLinks[i];
        console.log(`[${i + 1}/${allLinks.length}] ${item.title.substring(0, 40)}...`);
        
        const details = await extractNewsDetails(item.url);
        
        let category = 'Actualidad';
        if (item.url.includes('/episcopado')) category = 'Episcopado';
        else if (item.url.includes('/iglesia-en-colombia')) category = 'Iglesia en Colombia';
        else if (item.url.includes('/evangelio')) category = 'Evangelio';
        else if (item.url.includes('/opinion')) category = 'Opinión';
        
        news.push({
          title: item.title,
          excerpt: details.excerpt,
          date: details.date,
          category,
          image: details.image || item.imageUrl || '',
          url: item.url,
          video: details.video
        });
      }
      
      // Guardar en KV
      await env.CEC_NEWS.put('news-data', JSON.stringify(news));
      console.log(`✅ Guardado en KV: ${news.length} noticias`);
      
      // Disparar deploy
      if (env.DEPLOY_HOOK) {
        try {
          await fetch(env.DEPLOY_HOOK, { method: 'POST' });
          console.log('🚀 Deploy hook disparado');
        } catch (e) {
          console.log('⚠️ Deploy hook falló:', e);
        }
      }
      
      return new Response(JSON.stringify({ success: true, count: news.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};