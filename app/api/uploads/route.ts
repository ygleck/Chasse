import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

/**
 * POST /api/uploads
 * Traite les soumissions de photos avec Prisma
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const uploaderEmail = formData.get('uploaderEmail') as string;
    const description = formData.get('description') as string;

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

    // Créer l'upload dans la DB
    const upload = await prisma.userUpload.create({
      data: {
        type,
        title,
        uploaderName,
        uploaderEmail,
        description,
        status: 'pending',
        species: type === 'record' ? (formData.get('species') as string) : undefined,
        huntDate: type === 'record' && formData.get('huntDate') ? new Date(formData.get('huntDate') as string) : undefined,
        region: type === 'record' ? (formData.get('region') as string) : undefined,
        weight: type === 'record' && formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
        points: type === 'record' && formData.get('points') ? parseInt(formData.get('points') as string) : undefined,
        weaponType: type === 'record' ? (formData.get('weaponType') as string) : undefined,
        caliber: type === 'record' ? (formData.get('caliber') as string) : undefined,
        category: type === 'souvenir' ? (formData.get('category') as string) : undefined,
        eventDate: type === 'souvenir' && formData.get('eventDate') ? new Date(formData.get('eventDate') as string) : undefined,
        participants: type === 'souvenir' ? (formData.get('participants') as string) : undefined,
      },
    });

    // Traiter les photos
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const buffer = await photo.arrayBuffer();
      const photoId = `${upload.id}-${i}`;
      
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

      // Enregistrer en DB
      await prisma.photo.create({
        data: {
          uploadId: upload.id,
          path: `/uploads/${photoId}.webp`,
          thumbnailPath: `/uploads/${photoId}-thumb.webp`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Soumission reçue avec succès!',
        id: upload.id,
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
 * Récupère les soumissions avec filtres
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const uploads = await prisma.userUpload.findMany({
      where,
      include: { photos: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
