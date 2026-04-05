/**
 * API Route: GET /api/prix-essence/search
 * Recherche les stations autour d'une position
 * 
 * Query params:
 *   - latitude: number
 *   - longitude: number
 *   - radius: number (km)
 *   - fuelType: 'regular' | 'diesel' | 'premium' | 'all'
 *   - autoExpand: boolean (default: true) - élargir le rayon si aucun résultat
 */

/// <reference path="../../../../astro.d.ts" />

import type { APIRoute } from 'astro';
import type { GasStation, FuelType } from '../../../modules/prix-essence/types';
import { addDistanceToStations } from '../../../modules/prix-essence/lib/geo/distance';
import { scoreStations, getTopStations, getBestOption, calculateAveragePrice } from '../../../modules/prix-essence/lib/scoring/scoringEngine';
import { getCachedStations } from '../../../modules/prix-essence/lib/cache/kvCache';
import { PRIX_ESSENCE_CONFIG } from '../../../modules/prix-essence/config';
import { createError, ERROR_CODES } from '../../../modules/prix-essence/lib/utils/errors';

/**
 * Valide les paramètres de recherche
 */
function validateSearchParams(
  lat: string | undefined,
  lon: string | undefined,
  radius: string | undefined,
  fuel: string | undefined
) {
  const latitude = parseFloat(lat || '');
  const longitude = parseFloat(lon || '');
  const radiusNum = parseFloat(radius || '');

  if (!latitude || !longitude) {
    throw createError(
      ERROR_CODES.INVALID_PARAMS,
      'Latitude et longitude sont requis',
      400
    );
  }

  if (radiusNum <= 0) {
    throw createError(
      ERROR_CODES.INVALID_PARAMS,
      'Rayon invalide',
      400
    );
  }

  const validFuels = ['regular', 'diesel', 'premium', 'all'];
  if (!validFuels.includes(fuel || '')) {
    throw createError(
      ERROR_CODES.INVALID_PARAMS,
      'Type de carburant invalide',
      400
    );
  }

  return {
    latitude,
    longitude,
    radius: radiusNum,
    fuelType: fuel as FuelType,
  };
}

/**
 * Filtre les stations dans le rayon
 */
function filterStationsByRadius(
  stations: GasStation[],
  userLat: number,
  userLon: number,
  radiusKm: number
): GasStation[] {
  return stations.filter((s) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(s.latitude - userLat);
    const dLon = toRad(s.longitude - userLon);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(s.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // Earth radius
    return distance <= radiusKm;
  });
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const lat = url.searchParams.get('latitude');
    const lon = url.searchParams.get('longitude');
    const radius = url.searchParams.get('radius');
    const fuel = url.searchParams.get('fuelType');
    const autoExpand = url.searchParams.get('autoExpand') !== 'false';

    const params = validateSearchParams(lat, lon, radius, fuel);

    // Récupérer les stations du cache
    let allStations = await getCachedStations();
    if (!allStations) {
      throw createError(
        ERROR_CODES.CACHE_ERROR,
        'Données stations non disponibles',
        503
      );
    }

    // Ajouter les distances
    const withDistances = addDistanceToStations(
      allStations,
      params.latitude,
      params.longitude
    );

    // Filtrer par rayon
    let inRadius = withDistances.filter((s) => s.distance <= params.radius);

    let expandedRadius: number | undefined;
    let errorMessage: string | undefined;

    // Auto-expand si demandé et aucun résultat
    if (autoExpand && inRadius.length === 0) {
      const expandRadii = PRIX_ESSENCE_CONFIG.AUTO_EXPAND_RADII;
      const currentRadius = params.radius;

      for (const newRadius of expandRadii) {
        if (newRadius > currentRadius) {
          inRadius = withDistances.filter((s) => s.distance <= newRadius);
          if (inRadius.length > 0) {
            expandedRadius = newRadius;
            errorMessage = `Aucune station à ${params.radius} km. La recherche s'est élargie à ${newRadius} km.`;
            break;
          }
        }
      }
    }

    // Si toujours rien
    if (inRadius.length === 0) {
      throw createError(
        ERROR_CODES.NO_STATIONS_FOUND,
        'Aucune station trouvée même après élargissement',
        404
      );
    }

    // Scorer et trier
    const scored = scoreStations(inRadius, params.fuelType);
    const topStations = getTopStations(scored, PRIX_ESSENCE_CONFIG.TOP_STATIONS_LIMIT);
    const bestOption = getBestOption(scored);
    const averagePrice = calculateAveragePrice(scored);

    return new Response(
      JSON.stringify({
        error: false,
        data: {
          bestOption,
          topStations,
          averagePrice,
          expandedRadius,
          message: errorMessage,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60', // Cache 1 min en client
        },
      }
    );
  } catch (error) {
    const err = error instanceof Error && 'code' in error ? error : createError(ERROR_CODES.PROVIDER_ERROR);

    return new Response(
      JSON.stringify({
        error: true,
        message: err instanceof Error && 'message' in err ? err.message : 'Erreur inconnue',
        code: err instanceof Error && 'code' in err ? (err as any).code : 'UNKNOWN',
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
