import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/uploads/[id]
 * Récupère les détails d'une soumission
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const upload = await prisma.userUpload.findUnique({
      where: { id },
      include: { photos: true },
    });

    if (!upload) {
      return NextResponse.json(
        { error: 'Soumission non trouvée' },
        { status: 404 }
      );
    }

    // Only return if approved or if accessed from admin
    // TODO: Ajouter vérification d'authentification admin ici
    if (upload.status !== 'approved') {
      // return NextResponse.json(
      //   { error: 'Non autorisé' },
      //   { status: 403 }
      // );
    }

    return NextResponse.json(upload);
  } catch (error) {
    console.error('Fetch single upload error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
