/**
 * Calculs de distance et géométrie
 * Formule Haversine pour distance entre deux points GPS
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calcule la distance en km entre deux coordonnées GPS using Haversine formula
 * @param lat1 Latitude du point 1 en degrés
 * @param lon1 Longitude du point 1 en degrés
 * @param lat2 Latitude du point 2 en degrés
 * @param lon2 Longitude du point 2 en degrés
 * @returns Distance en km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Number(distance.toFixed(2));
}

/**
 * Filtre les stations dans le rayon spécifié
 */
export function filterByRadius(
  stations: Array<{ latitude: number; longitude: number; id: string }>,
  userLat: number,
  userLon: number,
  radiusKm: number
): string[] {
  return stations
    .filter((station) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        station.latitude,
        station.longitude
      );
      return distance <= radiusKm;
    })
    .map((s) => s.id);
}

/**
 * Calcule la distance et l'ajoute aux stations
 */
export function addDistanceToStations<T extends { latitude: number; longitude: number }>(
  stations: T[],
  userLat: number,
  userLon: number
): (T & { distance: number })[] {
  return stations.map((station) => ({
    ...station,
    distance: calculateDistance(
      userLat,
      userLon,
      station.latitude,
      station.longitude
    ),
  }));
}
