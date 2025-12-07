// Cloudflare Pages Function for /api/uploads
// Uses D1 for database and R2 for image storage

// D1 adapter (inlined for Pages Functions)
class D1Adapter {
  constructor(private db: any) {}

  async createUpload(data: any) {
    const now = Date.now();
    const stmt = this.db
      .prepare(
        `INSERT INTO UserUpload (
          id, type, status, title, description, uploaderName, uploaderEmail,
          species, huntDate, region, weight, weightUnit, points, weaponType, caliber,
          eventDate, category, participants, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        data.id,
        data.type,
        'pending',
        data.title,
        data.description,
        data.uploaderName,
        data.uploaderEmail || null,
        data.species || null,
        data.huntDate?.getTime() || null,
        data.region || null,
        data.weight || null,
        data.weightUnit || 'lb',
        data.points || null,
        data.weaponType || null,
        data.caliber || null,
        data.eventDate?.getTime() || null,
        data.category || null,
        data.participants || null,
        now,
        now
      );
    await stmt.run();
    return { id: data.id };
  }

  async createPhoto(data: any) {
    const stmt = this.db
      .prepare(
        `INSERT INTO Photo (id, uploadId, path, thumbnailPath, createdAt) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(data.id, data.uploadId, data.path, data.thumbnailPath, Date.now());
    await stmt.run();
    return { id: data.id };
  }

  async findManyUploads(filter: any = {}) {
    let query = `SELECT * FROM UserUpload WHERE 1=1`;
    const bindings: any[] = [];

    if (filter.status) {
      query += ` AND status = ?`;
      bindings.push(filter.status);
    }
    if (filter.type) {
      query += ` AND type = ?`;
      bindings.push(filter.type);
    }

    query += ` ORDER BY createdAt DESC`;

    let stmt = this.db.prepare(query);
    bindings.forEach((val) => {
      stmt = stmt.bind(val);
    });
    
    const result = await stmt.all();
    const uploads = result.results || [];

    for (const upload of uploads) {
      const photos = await this.db
        .prepare(`SELECT * FROM Photo WHERE uploadId = ?`)
        .bind((upload as any).id)
        .all();
      (upload as any).photos = photos.results || [];
    }

    return uploads;
  }
}

interface Env {
  DB: any;
  UPLOADS: any;
}

// Helper to generate unique IDs (simple cuid replacement)
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Process image and upload to R2
async function processAndUploadImage(
  file: File,
  env: Env
): Promise<{ path: string; thumbnailPath: string }> {
  const buffer = await file.arrayBuffer();
  const imageId = generateId();
  const fileName = `${imageId}.webp`;
  const thumbnailName = `${imageId}_thumb.webp`;

  // For simplicity, upload original to R2 (you can add sharp processing here later)
  await env.UPLOADS.put(`images/${fileName}`, buffer, {
    httpMetadata: {
      contentType: 'image/webp',
    },
  });

  // Create a simple thumbnail (for now, same as original - add sharp later)
  await env.UPLOADS.put(`images/${thumbnailName}`, buffer, {
    httpMetadata: {
      contentType: 'image/webp',
    },
  });

  return {
    path: `images/${fileName}`,
    thumbnailPath: `images/${thumbnailName}`,
  };
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const { request, env } = context;
    const formData = await request.formData();

    // Parse form data
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const uploaderEmail = formData.get('uploaderEmail') as string | null;

    // Validation
    if (!type || !['souvenir', 'record'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Type invalide' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!title || !uploaderName) {
      return new Response(JSON.stringify({ error: 'Titre et nom requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get files
    const photos = formData.getAll('photos') as File[];
    if (!photos || photos.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Au moins une photo requise' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (photos.length > 5) {
      return new Response(JSON.stringify({ error: 'Maximum 5 photos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process and upload photos to R2
    const processedPhotos: Array<{ path: string; thumbnailPath: string }> = [];
    for (const photo of photos) {
      try {
        const result = await processAndUploadImage(photo, env);
        processedPhotos.push(result);
      } catch (error) {
        console.error('Image processing failed:', error);
        return new Response(
          JSON.stringify({ error: "Erreur lors du traitement d'une image" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Prepare upload data
    const uploadId = generateId();
    const uploadData: any = {
      id: uploadId,
      type,
      title,
      description: description || '',
      uploaderName,
      uploaderEmail: uploaderEmail || null,
    };

    // Add type-specific fields
    if (type === 'souvenir') {
      uploadData.category = formData.get('category') as string | null;
      const eventDateStr = formData.get('eventDate') as string | null;
      uploadData.eventDate = eventDateStr ? new Date(eventDateStr) : null;
      uploadData.participants = formData.get('participants') as string | null;
    } else {
      uploadData.species = formData.get('species') as string | null;
      const huntDateStr = formData.get('huntDate') as string | null;
      uploadData.huntDate = huntDateStr ? new Date(huntDateStr) : null;
      uploadData.region = formData.get('region') as string | null;
      const weightStr = formData.get('weight') as string | null;
      uploadData.weight = weightStr ? parseFloat(weightStr) : null;
      const pointsStr = formData.get('points') as string | null;
      uploadData.points = pointsStr ? parseInt(pointsStr) : null;
      uploadData.weaponType = formData.get('weaponType') as string | null;
      uploadData.caliber = formData.get('caliber') as string | null;
    }

    // Save to D1
    const db = new D1Adapter(env.DB);
    await db.createUpload(uploadData);

    // Save photos
    for (const photo of processedPhotos) {
      await db.createPhoto({
        id: generateId(),
        uploadId,
        path: photo.path,
        thumbnailPath: photo.thumbnailPath,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Soumission reçue et en modération',
        id: uploadId,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur serveur lors de la soumission' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'approved';
    const type = url.searchParams.get('type') || undefined;

    const db = new D1Adapter(env.DB);
    const uploads = await db.findManyUploads({ status, type });

    return new Response(JSON.stringify(uploads), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
