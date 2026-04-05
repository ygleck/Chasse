/**
 * API Route: POST /api/prix-essence/refresh
 * Force un rafraîchissement des données stations
 * Protégé - optionnel selon vos besoins de sécurité
 *
 * Headers optionnels:
 *   - Authorization: Bearer YOUR_SECRET (si configuré)
 */

/// <reference path="../../../../astro.d.ts" />

import type { APIRoute } from 'astro';
import { detectLatestXLSXUrl, downloadXLSXFile } from '../../../modules/prix-essence/lib/data/xlsxFetcher';
import { parseXLSXData } from '../../../modules/prix-essence/lib/data/xlsxParser';
import { cacheStations, clearCache } from '../../../modules/prix-essence/lib/cache/kvCache';
import { createError, ERROR_CODES } from '../../../modules/prix-essence/lib/utils/errors';

/**
 * Vérifie le token d'autorisation (optionnel)
 */
function verifyAuth(request: Request): boolean {
  const env = (globalThis as any).process?.env as Record<string, string> | undefined;
  const secret = env?.PRIX_ESSENCE_REFRESH_SECRET;
  if (!secret) return true; // Pas de protection si pas de secret

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return token === secret;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Vérifier l'autorisation
    if (!verifyAuth(request)) {
      throw createError(
        ERROR_CODES.PROVIDER_ERROR,
        'Non autorisé',
        403
      );
    }

    console.log('[PrixEssence] Refresh triggered');

    // Détecter le XLSX le plus récent
    const xlsxUrl = await detectLatestXLSXUrl();
    console.log(`[PrixEssence] Detected XLSX: ${xlsxUrl}`);

    // Télécharger
    const buffer = await downloadXLSXFile(xlsxUrl);

    // Parser (nécessite une lib XLSX - voir dependencies)
    // Pour le prototype, on va simuler ou utiliser une approche manuelle
    // En production, vous utiliseriez:
    // import * as XLSX from 'xlsx';
    // const workbook = XLSX.read(buffer);
    // const sheet = workbook.Sheets[workbook.SheetNames[0]];
    // const rawData = XLSX.utils.sheet_to_json(sheet);

    // Pour maintenant, on retourne une erreur indiquant la dépendance
    throw new Error(
      'Parsing XLSX nécessite la dépendance "xlsx". Voir README pour l\'installation.'
    );

    // Une fois parsé :
    // const stations = parseXLSXData(rawData);
    // const metadata = {
    //   xlsxUrl,
    //   downloadedAt: new Date().toISOString(),
    //   parsedAt: new Date().toISOString(),
    //   stationCount: stations.length,
    //   version: '1.0',
    // };
    // await cacheStations(stations, metadata);

    // return new Response(
    //   JSON.stringify({
    //     error: false,
    //     data: {
    //       message: `${stations.length} stations mises en cache`,
    //       xlsxUrl,
    //     },
    //   }),
    //   {
    //     status: 200,
    //     headers: { 'Content-Type': 'application/json' },
    //   }
    // );
  } catch (error) {
    const err =
      error instanceof Error && 'code' in error
        ? error
        : createError(ERROR_CODES.XLSX_FETCH_ERROR);

    return new Response(
      JSON.stringify({
        error: true,
        message: err instanceof Error && 'message' in err ? err.message : 'Erreur refresh',
        code: err instanceof Error && 'code' in err ? (err as any).code : 'REFRESH_ERROR',
      }),
      {
        status: err instanceof Error && 'statusCode' in err ? (err as any).statusCode : 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};
