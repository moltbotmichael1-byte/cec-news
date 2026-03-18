import { serveStatic } from '@cloudflare/kv-asset-handler';

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event));
});

async function handleEvent(event) {
  try {
    return await serveStatic(event, {
      bucket: 'ceu-news-assets'
    });
  } catch (e) {
    return new Response('Not Found', { status: 404 });
  }
}