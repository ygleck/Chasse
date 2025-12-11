import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * GET /api/uploads
 * Retourne photos sauvegardées (vide par défaut)
 */
export async function GET() {
  try {
    // En Edge Runtime sans R2, on retourne un tableau vide
    // Le formulaire de upload ne sera pas fonctionnel localement
    return NextResponse.json([]);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/uploads
 * Upload non supporté en Edge Runtime sans R2
 */
export async function POST() {
  try {
    return NextResponse.json(
      { error: 'Upload not available - missing R2 configuration' },
      { status: 503 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}