export default {
  async fetch(request, env) {
    // OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://darkstyle.media',
          'Access-Control-Allow-Methods': 'GET, HEAD',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Referer / Origin check — only serve to our own site (+ localhost for dev)
    const referer = request.headers.get('Referer') || '';
    const origin  = request.headers.get('Origin')  || '';
    const allowed =
      referer.includes('darkstyle.media') ||
      origin.includes('darkstyle.media')  ||
      referer.includes('localhost')        ||
      origin.includes('localhost');

    if (!allowed) {
      return new Response('Forbidden', { status: 403 });
    }

    const url = new URL(request.url);
    const key = url.pathname.slice(1); // strip leading /

    if (!key) return new Response('Not Found', { status: 404 });

    // Pass Range header through so video seeking works
    const object = await env.BUCKET.get(key, {
      range:  request.headers,
      onlyIf: request.headers,
    });

    if (!object) return new Response('Not Found', { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Disposition', 'inline');
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('Access-Control-Allow-Origin', 'https://darkstyle.media');
    headers.set('Vary', 'Origin');

    // 206 Partial Content for range requests, 200 otherwise
    if (object.range) {
      const { offset, length } = object.range;
      headers.set('Content-Range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
      return new Response(object.body, { status: 206, headers });
    }

    return new Response(object.body, { status: 200, headers });
  },
};
