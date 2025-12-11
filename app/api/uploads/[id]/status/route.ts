import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, rejectionReason } = await request.json();

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const upload = await prisma.userUpload.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : null,
      },
      include: { photos: true },
    });

    return NextResponse.json(upload);
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.userUpload.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Soumission supprimée' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
