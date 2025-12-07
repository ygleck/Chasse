import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/uploads
 * Stub pour Cloudflare Pages - juste accepter et retourner succès
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

    // Mock: accepter la soumission
    return NextResponse.json(
      {
        success: true,
        message: 'Soumission reçue (mode démo)',
        id: `mock-${Date.now()}`,
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
 * Récupère les soumissions (mock pour Pages)
 */
export async function GET() {
  try {
    // Mock data
    const mockUploads = [
      {
        id: 'demo-1',
        type: 'souvenir',
        title: 'Belle journée au camp',
        description: 'Magnifique temps!',
        uploaderName: 'Jean',
        status: 'approved',
        photos: [],
        createdAt: new Date(),
      },
    ];

    return NextResponse.json(mockUploads);
  } catch (error) {
    console.error('Get uploads error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
