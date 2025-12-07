import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/uploads/[id]/status
 * Met à jour le statut d'une soumission (admin only)
 * 
 * TODO: Ajouter authentification (Cloudflare Access, JWT, etc.)
 * Pour l'instant, accès ouvert en développement
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add auth check here
    // const isAdmin = await checkAdminAuth(request);
    // if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { id } = params;
    const body = await request.json();
    const { status, rejectionReason } = body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    const updateData: any = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updated = await prisma.userUpload.update({
      where: { id },
      data: updateData,
      include: { photos: true },
    });

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour: ${status}`,
      upload: updated,
    });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
