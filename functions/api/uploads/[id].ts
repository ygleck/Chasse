// Cloudflare Pages Function for /api/uploads/[id]

import { getD1Adapter } from '../../../../lib/d1-adapter';

interface Env {
  DB: D1Database;
  UPLOADS: R2Bucket;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const { env, params } = context;
    const { id } = params;

    const db = getD1Adapter(env);
    const upload = await db.findUniqueUpload(id);

    if (!upload) {
      return new Response(
        JSON.stringify({ error: 'Soumission non trouvée' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Only return if approved (TODO: add admin auth check)
    if ((upload as any).status !== 'approved') {
      // For now, allow access (add auth later)
      // return new Response(
      //   JSON.stringify({ error: 'Non autorisé' }),
      //   { status: 403, headers: { 'Content-Type': 'application/json' } }
      // );
    }

    return new Response(JSON.stringify(upload), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Fetch single upload error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
