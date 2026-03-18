// Cloudflare Worker - Scraping CEC.org.co con Browser Rendering API
// USA CHROME REAL - Bypassea Sucuri firewall

// NOTA: Necesitas crear un API Token con permiso "Browser Rendering - Edit"
// en: https://dash.cloudflare.com/profile/api-tokens

const CF_ACCOUNT_ID = 'TU_ACCOUNT_ID'; // Tu Account ID de Cloudflare
const CF_API_TOKEN = 'TU_API_TOKEN'; // Token con Browser Rendering - Edit

const CEC_URL = 'https://cec.org.co/sistema-informativo/actualidad';

export async function onRequest(context) {
  const { request } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Usar Browser Rendering API para scrapear
    const scrapeResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/browser-rendering/scrape`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: CEC_URL,
          elements: [
            { selector: 'article' },
            { selector: 'h2 a, h3 a' },
            { selector: 'img' },
            { selector: '.field--name-body p' }
          ],
          gotoOptions: {
            waitUntil: 'networkidle2' // Esperar a que cargue JS
          }
        })
      }
    );
    
    if (!scrapeResponse.ok) {
      throw new Error(`Browser Rendering failed: ${scrapeResponse.status}`);
    }
    
    const data = await scrapeResponse.json();
    
    // Parsear resultados
    const news = parseScrapedData(data);
    
    return new Response(JSON.stringify(news, null, 2), {
      headers: { ...corsHeaders, 'X-Source': 'browser-rendering' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    // Fallback a estático
    try {
      const staticResponse = await fetch(new URL('/news-data.json', request.url));
      if (staticResponse.ok) {
        return new Response(await staticResponse.text(), {
          headers: { ...corsHeaders, 'X-Source': 'fallback' }
        });
      }
    } catch (e) {}
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

function parseScrapedData(data) {
  const news = [];
  const seen = new Set();
  
  if (!data.result) return news;
  
  // Extraer artículos del resultado del scrape
  for (const element of data.result) {
    if (element.selector === 'article' && element.results) {
      for (const article of element.results) {
        // Parsear cada artículo
        const title = article.text?.trim();
        const url = article.attributes?.find(a => a.name === 'data-url')?.value;
        
        if (title && url && !seen.has(url)) {
          seen.add(url);
          news.push({
            title: title.substring(0, 200),
            excerpt: '',
            date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
            category: 'Actualidad',
            image: 'https://cec.org.co/wp-content/uploads/2024/01/cec-logo.png',
            url: url.startsWith('http') ? url : 'https://cec.org.co' + url,
            video: ''
          });
        }
      }
    }
  }
  
  return news.slice(0, 12);
}