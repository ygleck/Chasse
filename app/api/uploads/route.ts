import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { r2, getPublicBaseUrl } from '@/lib/r2';

export const runtime = 'nodejs';

/**
 * POST /api/uploads
 * Upload vers R2 (WebP + thumbnail)
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
    const savedPhotos: Array<{ id: string; path: string; thumbnailPath: string }> = [];

    const bucket = process.env.R2_BUCKET;
    const publicBase = getPublicBaseUrl();

    if (!bucket || !publicBase) {
      return NextResponse.json({ error: 'Configuration R2 manquante' }, { status: 500 });
    }

    // Dossiers distincts par type pour ne pas mélanger
    const prefix = `${type}/${uploadId}`;

    // Traiter chaque photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const buffer = await photo.arrayBuffer();
      const photoId = `${i}`;

      // Convertir en WebP
      const webpBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 80 })
        .toBuffer();

      // Créer thumbnail
      const thumbBuffer = await sharp(Buffer.from(buffer))
        .resize(300, 300, { fit: 'cover' })
        .webp({ quality: 70 })
        .toBuffer();

      const mainKey = `${prefix}/${photoId}.webp`;
      const thumbKey = `${prefix}/${photoId}-thumb.webp`;

      await r2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: mainKey,
          Body: webpBuffer,
          ContentType: 'image/webp',
        })
      );

      await r2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: thumbKey,
          Body: thumbBuffer,
          ContentType: 'image/webp',
        })
      );

      savedPhotos.push({
        id: photoId,
        path: `${publicBase}/${mainKey}`,
        thumbnailPath: `${publicBase}/${thumbKey}`,
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
 * Liste les objets depuis R2 (optionnellement filtrés par type)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const bucket = process.env.R2_BUCKET;
    const publicBase = getPublicBaseUrl();
    if (!bucket || !publicBase) {
      return NextResponse.json({ error: 'Configuration R2 manquante' }, { status: 500 });
    }

    const prefix = type ? `${type}/` : '';

    const list = await r2.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      })
    );

    const contents = list.Contents || [];

    // On ne retient que les fichiers principaux (pas les thumbs)
    const photos = contents
      .filter((obj) => obj.Key && !obj.Key.endsWith('-thumb.webp'))
      .map((obj) => {
        const key = obj.Key as string;
        const thumbKey = key.replace(/\.webp$/, '-thumb.webp');
        const id = key.split('/').pop() || 'photo';

        return {
          id,
          path: `${publicBase}/${key}`,
          thumbnailPath: `${publicBase}/${thumbKey}`,
        };
      });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
