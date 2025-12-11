import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

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

    // Mock update - Dans une vraie app, on utiliserait une DB
    return NextResponse.json({
      id,
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      message: 'Statut mis à jour (mock)',
    });
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

    // Mock delete
    return NextResponse.json({ success: true, message: 'Soumission supprimée (mock)', id });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
