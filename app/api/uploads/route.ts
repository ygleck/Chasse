import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { r2, getPublicBaseUrl } from '@/lib/r2';

export const runtime = 'edge';

/**
 * POST /api/uploads
 * Upload simple vers R2 (sans conversion d'images)
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
      const fileExt = photo.name.split('.').pop() || 'jpg';

      const key = `${prefix}/${photoId}.${fileExt}`;

      await r2.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: new Uint8Array(buffer),
          ContentType: photo.type || 'image/jpeg',
        })
      );

      savedPhotos.push({
        id: photoId,
        path: `${publicBase}/${key}`,
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

    // Retourner tous les fichiers images
    const photos = contents
      .filter((obj) => obj.Key && /\.(jpg|jpeg|png|gif|webp)$/i.test(obj.Key))
      .map((obj) => {
        const key = obj.Key as string;
        const id = key.split('/').pop() || 'photo';

        return {
          id,
          path: `${publicBase}/${key}`,
        };
      });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

