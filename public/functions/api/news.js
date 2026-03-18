// CEC News API - Noticias estáticas + KV cuando disponible

// Datos estáticos embedidos (fallback)
const STATIC_NEWS = [
  {"title":"Monseñor Rubén Darío Jaramillo Montoya asume como noveno obispo de Montería: llama a la fe, la unidad y el desarrollo humano integral","excerpt":"En medio de las recientes tensiones comerciales y políticas que viven las relaciones entre los países...","date":"16 de marzo de 2026","category":"Actualidad","image":"images/noticia1.jpg","url":"https://cec.org.co/sistema-informativo/monsignor-ruben-dario-jaramillo-montoya","video":""},
  {"title":"Iglesia en la frontera: la pastoral de los migrantes en la frontera colombo-venezolana","excerpt":"Durante los días 14, 15 y 16 de marzo se realizó en la Diócesis de Cúcuta el Seminario Internacional...","date":"15 de marzo de 2026","category":"Actualidad","image":"images/noticia2.jpg","url":"https://cec.org.co/sistema-informativo/iglesia-en-la-frontera","video":""},
  {"title":"Encuentro Nacional de Educación Católica: retos y perspectivas","excerpt":"Delegados de pastoral educativa de 33 jurisdicciones eclesiásticas del país se dieron cita...","date":"14 de marzo de 2026","category":"Actualidad","image":"images/noticia3.jpg","url":"https://cec.org.co/sistema-informativo/encuentro-nacional-educacion","video":""},
  {"title":"Por Mons. Ricardo Tobón Restrepo - En la Ultima Cena","excerpt":"Juan se recuesta en el pecho de Jesús, como el discípulo amado que es. Y le pregunta quién lo va a traicionar...","date":"14 de marzo de 2026","category":"Opinión","image":"images/noticia5.jpg","url":"https://cec.org.co/sistema-informativo/ultima-cena","video":""},
  {"title":"Camino Sinodal: Proceso del Sínodo en Colombia: tres informes publicados","excerpt":"La Conferencia Episcopal de Colombia publica tres informes sobre el proceso sinodal...","date":"13 de marzo de 2026","category":"Actualidad","image":"images/noticia6.jpg","url":"https://cec.org.co/sistema-informativo/camino-sinodal","video":""},
  {"title":"Asamblea Diocesana de San Vicente del Caguán impulsa su camino sínodal","excerpt":"Con gran participación de fieles, laicos, religiosos y sacerdotes...","date":"12 de marzo de 2026","category":"Actualidad","image":"images/noticia7.jpg","url":"https://cec.org.co/sistema-informativo/asamblea-diocesana","video":""},
  {"title":"Elecciones 2026 en Colombia: Diócesis de Palmira publica orientaciones pastorales","excerpt":"En el contexto del proceso electoral, la Diócesis de Palmira ha publicado orientaciones pastorales...","date":"11 de marzo de 2026","category":"Actualidad","image":"images/noticia8.jpg","url":"https://cec.org.co/sistema-informativo/elecciones-2026","video":""}
];

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
    // 1. Intentar leer de KV (actualizado por trigger)
    const kv = env.CEC_NEWS;
    if (kv) {
      const cached = await kv.get('news-data', { type: 'json' });
      if (cached && cached.length > 0) {
        return new Response(JSON.stringify(cached, null, 2), {
          headers: { ...corsHeaders, 'X-Source': 'kv', 'Cache-Control': 'public, max-age=300' }
        });
      }
    }
    
    // 2. Devolver datos estáticos embedidos
    return new Response(JSON.stringify(STATIC_NEWS, null, 2), {
      headers: { ...corsHeaders, 'X-Source': 'static', 'Cache-Control': 'public, max-age=60' }
    });
    
  } catch (error) {
    // 3. Fallback: datos estáticos
    return new Response(JSON.stringify(STATIC_NEWS, null, 2), {
      headers: { ...corsHeaders, 'X-Source': 'fallback' }
    });
  }
}