import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

/**
 * POST /api/uploads
 * Upload simple - accepte et sauvegarde les photos
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

    // Créer le répertoire uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const savedPhotos = [];

    // Traiter chaque photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const buffer = await photo.arrayBuffer();
      const photoId = `${uploadId}-${i}`;
      
      try {
        // Convertir en WebP
        const webpBuffer = await sharp(Buffer.from(buffer))
          .webp({ quality: 80 })
          .toBuffer();
        
        const photoPath = join(uploadsDir, `${photoId}.webp`);
        await writeFile(photoPath, webpBuffer);

        // Créer thumbnail
        const thumbBuffer = await sharp(Buffer.from(buffer))
          .resize(300, 300, { fit: 'cover' })
          .webp({ quality: 70 })
          .toBuffer();
        
        const thumbPath = join(uploadsDir, `${photoId}-thumb.webp`);
        await writeFile(thumbPath, thumbBuffer);

        savedPhotos.push({
          id: photoId,
          path: `/uploads/${photoId}.webp`,
          thumbnailPath: `/uploads/${photoId}-thumb.webp`,
        });
      } catch (error) {
        console.error(`Erreur traitement photo ${i}:`, error);
      }
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
 * Récupère les soumissions (mock pour maintenant)
 */
export async function GET() {
  try {
    // Pour l'instant, retourner un array vide
    // Aprés on va ajouter Prisma
    return NextResponse.json([]);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
