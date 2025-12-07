// Cloudflare Pages Function for /api/uploads/[id]/status

import { getD1Adapter } from '../../../../../lib/d1-adapter';

interface Env {
  DB: D1Database;
}

export async function onRequestPatch(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const { request, env, params } = context;
    const { id } = params;

    // TODO: Add admin auth check here
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });

    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Statut invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updateData: any = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const db = getD1Adapter(env);
    const updated = await db.updateUpload(id, updateData);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Statut mis à jour: ${status}`,
        upload: updated,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Update status error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
