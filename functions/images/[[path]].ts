// Cloudflare Pages Function to serve images from R2
// Route: /images/[...path]

interface Env {
  UPLOADS: any;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { path: string[] };
}): Promise<Response> {
  try {
    const { env, params } = context;
    const path = params.path.join('/');
    const key = `images/${path}`;

    const object = await env.UPLOADS.get(key);

    if (!object) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Image serve error:', error);
    return new Response('Error serving image', { status: 500 });
  }
}
