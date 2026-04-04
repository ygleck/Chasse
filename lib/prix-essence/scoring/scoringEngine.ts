/**
 * Moteur de scoring intelligent
 * Module autonome
 *
 * Stratégie : normalisation min-max avec pondération
 * - Distance: 30% (proximité importante)
 * - Prix: 70% (facteur principal)
 * - Plus bas = mieux pour les deux critères
 */

import type { GasStation, GasStationWithScore, SearchParams, FuelType } from '../../types';
import { PRIX_ESSENCE_CONFIG } from '../../config';

interface Bounds {
  minPrice: number;
  maxPrice: number;
  minDistance: number;
  maxDistance: number;
}

/**
 * Extrait le prix pour le carburant choisi
 */
function getPriceForFuel(station: GasStation, fuelType: FuelType): number | null {
  switch (fuelType) {
    case 'regular':
      return station.regularPrice;
    case 'diesel':
      return station.dieselPrice;
    case 'premium':
      return station.premiumPrice;
    case 'all': {
      // Moyenne des prix disponibles
      const prices = [
        station.regularPrice,
        station.dieselPrice,
        station.premiumPrice,
      ].filter((p): p is number => p !== null && p > 0);
      return prices.length > 0 ? prices.reduce((a, b) => a + b) / prices.length : null;
    }
  }
}

/**
 * Filtre stations valides (prix disponible)
 */
function filterValidStations(
  stations: Array<GasStation & { distance: number }>,
  fuelType: FuelType
): Array<GasStation & { distance: number; price: number }> {
  return stations
    .map((s) => {
      const price = getPriceForFuel(s, fuelType);
      return { ...s, price };
    })
    .filter((s): s is GasStation & { distance: number; price: number } => {
      return s.price !== null && s.price > 0;
    });
}

/**
 * Calcule les bornes min/max
 */
function calculateBounds(
  stations: Array<GasStation & { distance: number; price: number }>
): Bounds {
  if (stations.length === 0) {
    return { minPrice: 0, maxPrice: 1, minDistance: 0, maxDistance: 1 };
  }

  const prices = stations.map((s) => s.price);
  const distances = stations.map((s) => s.distance);

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minDistance: Math.min(...distances),
    maxDistance: Math.max(...distances),
  };
}

/**
 * Normalise une valeur (0-1)
 * inverse=true : plutôt bas = mieux (prix, distance)
 */
function normalizeValue(
  value: number,
  min: number,
  max: number,
  inverse: boolean = true
): number {
  if (min === max) {
    return 0.5;
  }

  const normalized = (value - min) / (max - min);
  return inverse ? 1 - normalized : normalized;
}

/**
 * Score une station (0-100)
 */
function calculateStationScore(
  station: GasStation & { distance: number; price: number },
  bounds: Bounds,
  priceWeight: number,
  distanceWeight: number
): number {
  const priceNorm = normalizeValue(station.price, bounds.minPrice, bounds.maxPrice, true);
  const distNorm = normalizeValue(
    station.distance,
    bounds.minDistance,
    bounds.maxDistance,
    true
  );

  const totalWeight = priceWeight + distanceWeight;
  const normalizedPrice = priceWeight / totalWeight;
  const normalizedDist = distanceWeight / totalWeight;

  const score = priceNorm * normalizedPrice + distNorm * normalizedDist;
  return Math.round(score * 100);
}

/**
 * Score toutes les stations et les ordonne
 */
export function scoreStations(
  stations: Array<GasStation & { distance: number }>,
  fuelType: FuelType
): GasStationWithScore[] {
  const validStations = filterValidStations(stations, fuelType);

  if (validStations.length === 0) {
    return [];
  }

  const bounds = calculateBounds(validStations);
  const { priceWeight, distanceWeight } = PRIX_ESSENCE_CONFIG.SCORING;

  const scored: GasStationWithScore[] = validStations
    .map((s) => {
      const price = getPriceForFuel(s, fuelType);
      return {
        ...s,
        score: calculateStationScore(s, bounds, priceWeight, distanceWeight),
        priceForFuel: price,
        savingsVsAverage: 0, // Calculé après
      };
    })
    .sort((a, b) => b.score - a.score);

  // Averageprix
  const avgPrice =
    scored.reduce((sum, s) => sum + (s.priceForFuel || 0), 0) / scored.length;

  return scored.map((s) => ({
    ...s,
    savingsVsAverage: Number(((avgPrice - (s.priceForFuel || 0)) * 100).toFixed(2)),
  }));
}

/**
 * Top N stations
 */
export function getTopStations(stations: GasStationWithScore[], limit: number = 10): GasStationWithScore[] {
  return stations.slice(0, limit);
}

/**
 * Meilleure option
 */
export function getBestOption(stations: GasStationWithScore[]): GasStationWithScore | null {
  return stations.length > 0 ? stations[0] : null;
}

/**
 * Prix moyen
 */
export function calculateAveragePrice(stations: GasStationWithScore[]): number {
  if (stations.length === 0) return 0;
  const total = stations.reduce((sum, s) => sum + (s.priceForFuel || 0), 0);
  return Number((total / stations.length).toFixed(3));
}
