// CEC News API - Sirve noticias
// Prioridad: KV (actualizado por cron) → estático

export async function onRequest(context) {
  const { request, env } = context;
  
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
    // 1. Intentar leer de KV (noticias actualizadas por cron)
    const kv = env.CEC_NEWS;
    if (kv) {
      const cached = await kv.get('news-data', { type: 'json' });
      if (cached && cached.length > 0) {
        return new Response(JSON.stringify(cached, null, 2), {
          headers: {
            ...corsHeaders,
            'X-Source': 'kv',
            'Cache-Control': 'public, max-age=300'
          }
        });
      }
    }
    
    // 2. Fallback: archivo estático
    const staticUrl = new URL('/news-data.json', request.url);
    const response = await fetch(staticUrl);
    
    if (response.ok) {
      return new Response(await response.text(), {
        headers: {
          ...corsHeaders,
          'X-Source': 'static',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }
    
    throw new Error('No news available');
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: corsHeaders
    });
  }
}