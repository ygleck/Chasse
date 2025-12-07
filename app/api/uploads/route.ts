import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processImage } from '@/lib/imageProcessor';

/**
 * POST /api/uploads
 * Crée une nouvelle soumission (souvenir ou record) avec photos
 * Les photos sont converties en WebP et les métadonnées EXIF sont supprimées
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Parse form data
    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const uploaderEmail = formData.get('uploaderEmail') as string | null;

    // Validation
    if (!type || !['souvenir', 'record'].includes(type)) {
      return NextResponse.json(
        { error: 'Type invalide' },
        { status: 400 }
      );
    }

    if (!title || !uploaderName) {
      return NextResponse.json(
        { error: 'Titre et nom requis' },
        { status: 400 }
      );
    }

    // Get files
    const photos = formData.getAll('photos') as File[];
    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une photo requise' },
        { status: 400 }
      );
    }

    if (photos.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 photos' },
        { status: 400 }
      );
    }

    // Process each file
    const processedPhotos: Array<{ path: string; thumbnailPath: string }> = [];

    for (const photo of photos) {
      try {
        const buffer = await photo.arrayBuffer();
        const result = await processImage(
          Buffer.from(buffer),
          photo.name
        );
        processedPhotos.push(result);
      } catch (error) {
        console.error('Image processing failed:', error);
        return NextResponse.json(
          { error: 'Erreur lors du traitement d\'une image' },
          { status: 400 }
        );
      }
    }

    // Prepare upload data
    const uploadData: any = {
      type,
      title,
      description: description || '',
      uploaderName,
      uploaderEmail: uploaderEmail || null,
      status: 'pending', // Always pending until admin approves
      photos: {
        create: processedPhotos.map((photo) => ({
          path: photo.webpPath,
          thumbnailPath: photo.thumbnailPath,
        })),
      },
    };

    // Add type-specific fields
    if (type === 'souvenir') {
      uploadData.category = formData.get('category') as string | null;
      uploadData.eventDate = formData.get('eventDate') as string | null;
      uploadData.participants = formData.get('participants') as string | null;
    } else {
      uploadData.species = formData.get('species') as string | null;
      uploadData.huntDate = formData.get('huntDate') as string | null;
      uploadData.region = formData.get('region') as string | null;
      uploadData.weight = formData.get('weight')
        ? parseFloat(formData.get('weight') as string)
        : null;
      uploadData.points = formData.get('points')
        ? parseInt(formData.get('points') as string)
        : null;
      uploadData.weaponType = formData.get('weaponType') as string | null;
      uploadData.caliber = formData.get('caliber') as string | null;
    }

    // Save to database
    const newUpload = await prisma.userUpload.create({
      data: uploadData,
      include: { photos: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Soumission reçue et en modération',
        id: newUpload.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la soumission' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/uploads
 * Récupère les soumissions avec filtres
 * Params: status, type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'approved';
    const type = searchParams.get('type');

    const where: any = { status };
    if (type) {
      where.type = type;
    }

    const uploads = await prisma.userUpload.findMany({
      where,
      include: { photos: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(uploads);
  } catch (error) {
    console.error('Fetch uploads error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
