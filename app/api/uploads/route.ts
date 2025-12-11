import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// En développement local, on stocke dans public/uploads
const UPLOADS_DIR = path.join(process.cwd(), 'public/uploads');

/**
 * POST /api/uploads
 * Upload dans le stockage local (développement)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const uploaderName = formData.get('uploaderName') as string;

    if (!type || !['souvenir', 'record'].includes(type)) {
      return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    if (!title || !uploaderName) {
      return NextResponse.json({ error: 'Titre et nom requis' }, { status: 400 });
    }

    const photos = formData.getAll('photos') as File[];
    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une photo requise' },
        { status: 400 }
      );
    }

    const uploadId = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const savedPhotos: Array<{ id: string; path: string }> = [];

    // Créer les dossiers
    const uploadDir = path.join(UPLOADS_DIR, type, uploadId);
    await fs.mkdir(uploadDir, { recursive: true });

    // Sauvegarder chaque photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const buffer = await photo.arrayBuffer();
      const photoId = `${i}`;
      const fileExt = photo.name.split('.').pop() || 'jpg';
      const fileName = `${photoId}.${fileExt}`;
      
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, Buffer.from(buffer));

      savedPhotos.push({
        id: photoId,
        path: `/uploads/${type}/${uploadId}/${fileName}`,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Soumission reçue avec succès!',
        id: uploadId,
        type,
        title,
        uploaderName,
        photos: savedPhotos,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/uploads
 * Liste les photos du stockage local
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const searchDir = type 
      ? path.join(UPLOADS_DIR, type)
      : UPLOADS_DIR;

    // Lister tous les fichiers
    const photos: Array<{ id: string; path: string }> = [];

    try {
      const entries = await fs.readdir(searchDir, { recursive: true, withFileTypes: true });
      
      entries.forEach((entry) => {
        if (entry.isFile && /\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) {
          const relativePath = path.relative(UPLOADS_DIR, path.join(entry.parentPath, entry.name));
          const filePath = path.posix.join('/uploads', relativePath);
          
          photos.push({
            id: entry.name,
            path: filePath,
          });
        }
      });
    } catch {
      // Dossier n'existe pas encore - c'est ok
    }

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}