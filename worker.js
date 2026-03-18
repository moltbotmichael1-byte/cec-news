// Cloudflare Worker para actualizar noticias CEC
// Se ejecuta cada 30 minutos via Cron Triggers

export default {
  async scheduled(event, env, ctx) {
    console.log('🔄 Iniciando scrapeo CEC...');
    
    try {
      // Fetch página principal
      const response = await fetch('https://cec.org.co/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        }
      });
      
      const html = await response.text();
      console.log(`📄 HTML recibido: ${html.length} bytes`);
      
      // Extraer noticias con regex
      const news = [];
      const linkRegex = /<a[^>]*href="([^"]*sistema-informativo[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      const titleRegex = /<h[2-5][^>]*>([^<]+)<\/h[2-5]>/i;
      const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
      
      const seen = new Set();
      let match;
      let count = 0;
      
      while ((match = linkRegex.exec(html)) !== null && count < 12) {
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
          excerpt: 'Lea más en CEC.org.co',
          date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
          category: 'Actualidad',
          image: imageUrl || '',
          url: url.startsWith('http') ? url : 'https://cec.org.co' + url
        });
        
        count++;
      }
      
      console.log(`📰 Encontradas ${news.length} noticias`);
      
      // Guardar en KV
      await env.CEC_NEWS.put('news-data', JSON.stringify(news));
      
      // También disparar deploy
      if (env.DEPLOY_HOOK) {
        await fetch(env.DEPLOY_HOOK, { method: 'POST' });
        console.log('🚀 Deploy disparado');
      }
      
      return new Response(JSON.stringify({ success: true, count: news.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('❌ Error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};