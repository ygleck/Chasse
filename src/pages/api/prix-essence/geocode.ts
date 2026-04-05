/**
 * API Route: GET /api/prix-essence/geocode
 * Géocode une adresse en coordonnées
 *
 * Query params:
 *   - query: string (adresse, code postal, ou ville)
 */

/// <reference path="../../../../astro.d.ts" />

import type { APIRoute } from 'astro';
import { geocodeAddress } from '../../../modules/prix-essence/lib/geo/geocoder';
import { createError, ERROR_CODES } from '../../../modules/prix-essence/lib/utils/errors';

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = url.searchParams.get('query');

    if (!query || query.trim().length === 0) {
      throw createError(
        ERROR_CODES.INVALID_PARAMS,
        'Paramètre query requis',
        400
      );
    }

    const result = await geocodeAddress(query);

    return new Response(
      JSON.stringify({
        error: false,
        data: result,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600', // Cache 1h
        },
      }
    );
  } catch (error) {
    const err =
      error instanceof Error && 'code' in error
        ? error
        : createError(ERROR_CODES.GEOCODING_ERROR);

    return new Response(
      JSON.stringify({
        error: true,
        message: err instanceof Error && 'message' in err ? err.message : 'Erreur géocodage',
        code: err instanceof Error && 'code' in err ? (err as any).code : 'GEOCODING_ERROR',
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
