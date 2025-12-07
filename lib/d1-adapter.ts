// D1 Database adapter for Cloudflare Pages
// Replaces Prisma for D1 compatibility

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

export class D1Adapter {
  constructor(private db: D1Database) {}

  // UserUpload queries
  async createUpload(data: {
    id: string;
    type: string;
    title: string;
    description: string;
    uploaderName: string;
    uploaderEmail?: string;
    species?: string;
    huntDate?: Date;
    region?: string;
    weight?: number;
    weightUnit?: string;
    points?: number;
    weaponType?: string;
    caliber?: string;
    eventDate?: Date;
    category?: string;
    participants?: string;
  }) {
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

  async createPhoto(data: {
    id: string;
    uploadId: string;
    path: string;
    thumbnailPath: string;
  }) {
    const stmt = this.db
      .prepare(
        `INSERT INTO Photo (id, uploadId, path, thumbnailPath, createdAt) VALUES (?, ?, ?, ?, ?)`
      )
      .bind(data.id, data.uploadId, data.path, data.thumbnailPath, Date.now());
    await stmt.run();
    return { id: data.id };
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

  async findManyUploads(filter: { status?: string; type?: string } = {}) {
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

    const stmt = this.db.prepare(query);
    bindings.forEach((val, idx) => stmt.bind(val));
    
    const result = await stmt.all();
    const uploads = result.results || [];

    // Fetch photos for each upload
    for (const upload of uploads) {
      const photos = await this.db
        .prepare(`SELECT * FROM Photo WHERE uploadId = ?`)
        .bind((upload as any).id)
        .all();
      (upload as any).photos = photos.results || [];
    }

    return uploads;
  }

  async updateUpload(id: string, data: {
    status?: string;
    rejectionReason?: string;
  }) {
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
}

// Export for use in Pages Functions
export function getD1Adapter(env: { DB: D1Database }): D1Adapter {
  return new D1Adapter(env.DB);
}
