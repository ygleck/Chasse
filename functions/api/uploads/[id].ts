// Cloudflare Pages Function for /api/uploads/[id]

// D1 adapter (inlined for Pages Functions)
class D1Adapter {
  constructor(private db: any) {}

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
  UPLOADS: any;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { id: string };
}): Promise<Response> {
  try {
    const { env, params } = context;
    const { id } = params;

    const db = new D1Adapter(env.DB);
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
