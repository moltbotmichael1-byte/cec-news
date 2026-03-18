// Cloudflare Worker - Trigger para actualizar noticias
// Llamado desde cPanel cron cada 30 min
// Usa archivo estático como fuente (actualizado manualmente o por GitHub Actions)

export async function onRequest(context) {
  const { request, env } = context;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Leer archivo estático
    const staticUrl = new URL('/news-data.json', request.url);
    const staticResponse = await fetch(staticUrl);
    
    if (!staticResponse.ok) {
      throw new Error('No se pudo leer news-data.json');
    }
    
    const news = await staticResponse.json();
    
    if (!Array.isArray(news) || news.length === 0) {
      throw new Error('news-data.json inválido o vacío');
    }
    
    // Guardar en KV
    const kv = env.CEC_NEWS;
    if (kv) {
      await kv.put('news-data', JSON.stringify(news, null, 2));
    }
    
    return new Response(JSON.stringify({
      success: true,
      count: news.length,
      source: 'static-to-kv',
      timestamp: new Date().toISOString(),
      sample: news.slice(0, 2)
    }), { headers: corsHeaders });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}