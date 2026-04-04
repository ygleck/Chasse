/**
 * Moteur de scoring intelligent pour les stations-service
 * Combine prix + proximité pour un score optimal
 *
 * DOCUMENTATION DU SCORING :
 *
 * Approche : normalisation min-max sur 0-100 pour chaque critère
 * - Critère distance : plus proche = meilleur score
 * - Critère prix : plus bas = meilleur score
 * - Score final : moyenne pondérée (ou autre stratégie configurable)
 *
 * Pondération par défaut :
 *   - Distance: 30% (proximité importante mais pas seule)
 *   - Prix: 70% (prix est le facteur principal)
 *
 * Stations avec prix invalides / manquants : exclues
 * Stations sans prix pour le carburant choisi : exclues
 */

import type { GasStation, GasStationWithScore, SearchParams } from '../types';

/**
 * Configuration du scoring
 */
export interface ScoringConfig {
  priceWeight: number; // 0-1
  distanceWeight: number; // 0-1
  // Peuvent être ajoutés : brandsPreference, recentnessWeight, etc.
}

const DEFAULT_CONFIG: ScoringConfig = {
  priceWeight: 0.7,
  distanceWeight: 0.3,
};

/**
 * Représente les limites min/max pour la normalisation
 */
interface Bounds {
  minPrice: number;
  maxPrice: number;
  minDistance: number;
  maxDistance: number;
}

/**
 * Extrait le prix pertinent selon le type de carburant choisi
 */
function getPriceForFuel(
  station: GasStation,
  fuelType: 'regular' | 'diesel' | 'premium' | 'all'
): number | null {
  switch (fuelType) {
    case 'regular':
      return station.regularPrice;
    case 'diesel':
      return station.dieselPrice;
    case 'premium':
      return station.premiumPrice;
    case 'all':
      // Si "tous les carburants", on utilise la moyenne des prix disponibles
      const prices = [
        station.regularPrice,
        station.dieselPrice,
        station.premiumPrice,
      ].filter((p): p is number => p !== null && p > 0);
      return prices.length > 0 ? prices.reduce((a, b) => a + b) / prices.length : null;
  }
}

/**
 * Filtre et valide les stations avant scoring
 * Exclut les stations sans prix valide pour le carburant choisi
 */
function filterValidStations(
  stations: Array<GasStation & { distance: number }>,
  fuelType: SearchParams['fuelType']
): Array<GasStation & { distance: number; price: number }> {
  return stations
    .map((station) => {
      const price = getPriceForFuel(station, fuelType);
      return { ...station, price };
    })
    .filter((station): station is GasStation & { distance: number; price: number } => {
      // Exclure si pas de prix valide
      return station.price !== null && station.price > 0;
    });
}

/**
 * Calcule les limites min/max pour la normalisation
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
 * Normalise une valeur entre 0 et 1 (min-max normalization)
 * Inverse=true : pour les critères où "moins = mieux" (prix, distance)
 */
function normalizeValue(
  value: number,
  min: number,
  max: number,
  inverse: boolean = true
): number {
  if (min === max) {
    return inverse ? 0.5 : 0.5;
  }

  const normalized = (value - min) / (max - min);
  return inverse ? 1 - normalized : normalized;
}

/**
 * Calcule le score pour une seule station
 * Score sur 100
 */
function calculateStationScore(
  station: GasStation & { distance: number; price: number },
  bounds: Bounds,
  config: ScoringConfig
): number {
  // Normaliser les critères (0-1)
  const priceNormalized = normalizeValue(station.price, bounds.minPrice, bounds.maxPrice, true);
  const distanceNormalized = normalizeValue(
    station.distance,
    bounds.minDistance,
    bounds.maxDistance,
    true
  );

  // Vérifier que les poids font 1
  const totalWeight = config.priceWeight + config.distanceWeight;
  const normalizedPriceWeight = config.priceWeight / totalWeight;
  const normalizedDistanceWeight = config.distanceWeight / totalWeight;

  // Moyenne pondérée
  const score =
    priceNormalized * normalizedPriceWeight +
    distanceNormalized * normalizedDistanceWeight;

  // Convertir en 0-100
  return Math.round(score * 100);
}

/**
 * Applique le scoring à un ensemble de stations
 * Retourne les stations triées par score (meilleur en premier)
 */
export function scoreStations(
  stations: Array<GasStation & { distance: number }>,
  params: SearchParams,
  config: ScoringConfig = DEFAULT_CONFIG
): GasStationWithScore[] {
  // Filtrer les stations valides (avec prix)
  const validStations = filterValidStations(stations, params.fuelType);

  if (validStations.length === 0) {
    return [];
  }

  // Calculer les bornes
  const bounds = calculateBounds(validStations);

  // Calculer les scores
  const scoredStations: GasStationWithScore[] = validStations
    .map((station) => {
      const price = getPriceForFuel(station, params.fuelType);
      return {
        ...station,
        score: calculateStationScore(station, bounds, config),
        priceForFuel: price,
        savingsVsAverage: 0, // Calculé après
      };
    })
    .sort((a, b) => b.score - a.score);

  // Calculer l'économie vs moyenne
  const averagePrice =
    scoredStations.reduce((sum, s) => sum + (s.priceForFuel || 0), 0) /
    scoredStations.length;

  return scoredStations.map((station) => ({
    ...station,
    savingsVsAverage: Number(
      ((averagePrice - (station.priceForFuel || 0)) * 100).toFixed(2)
    ),
  }));
}

/**
 * Extrait le top N stations
 */
export function getTopStations(
  stations: GasStationWithScore[],
  limit: number = 10
): GasStationWithScore[] {
  return stations.slice(0, limit);
}

/**
 * Calcule la meilleure option (première station)
 */
export function getBestOption(
  stations: GasStationWithScore[]
): GasStationWithScore | null {
  return stations.length > 0 ? stations[0] : null;
}

/**
 * Calcule le prix moyen des stations (pour comparaison)
 */
export function calculateAveragePrice(stations: GasStationWithScore[]): number {
  if (stations.length === 0) return 0;
  const total = stations.reduce((sum, s) => sum + (s.priceForFuel || 0), 0);
  return Number((total / stations.length).toFixed(3));
}
