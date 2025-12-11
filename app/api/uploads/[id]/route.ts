import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(
  _request: unknown,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    return NextResponse.json({
      id,
      type: 'souvenir',
      title: 'Photo exemple',
      uploaderName: 'Jean',
      status: 'approved',
    });
  } catch (error) {
    console.error('Get upload error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: unknown,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
