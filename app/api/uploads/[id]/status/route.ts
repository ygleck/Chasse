import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function PATCH(
  request: unknown,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await (request as any).json();
    const { status } = body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour (mock)',
      status,
    });
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
