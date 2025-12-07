// Cloudflare Pages Function for /api/uploads/[id]/status

// D1 adapter (inlined for Pages Functions)
class D1Adapter {
  constructor(private db: any) {}

  async updateUpload(id: string, data: any) {
    const updates: string[] = [];
    const bindings: any[] = [];

    if (data.status) {
      updates.push('status = ?');
      bindings.push(data.status);
    }
    if (data.rejectionReason !== undefined) {
      updates.push('rejectionReason = ?');
      bindings.push(data.rejectionReason);
    }

    updates.push('updatedAt = ?');
    bindings.push(Date.now());
    bindings.push(id);

    const stmt = this.db
      .prepare(`UPDATE UserUpload SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...bindings);
    
    await stmt.run();
    return this.findUniqueUpload(id);
  }

  async findUniqueUpload(id: string) {
    const upload = await this.db
      .prepare(`SELECT * FROM UserUpload WHERE id = ?`)
      .bind(id)
      .first();
    
    if (!upload) return null;

    const photos = await this.db
      .prepare(`SELECT * FROM Photo WHERE uploadId = ?`)
      .bind(id)
      .all();

    return {
      ...upload,
      photos: photos.results || [],
    };
  }
}

interface Env {
  DB: any;
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

    const db = new D1Adapter(env.DB);
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
