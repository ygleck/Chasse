/**
 * Calculs de distance - Haversine formula
 * Module autonome
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Distance entre deux points GPS
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
  return Number((EARTH_RADIUS_KM * c).toFixed(2));
}

/**
 * Filtre stations par rayon
 */
export function filterByRadius(
  stations: Array<{ latitude: number; longitude: number; id: string }>,
  userLat: number,
  userLon: number,
  radiusKm: number
): string[] {
  return stations
    .filter((s) => {
      const dist = calculateDistance(userLat, userLon, s.latitude, s.longitude);
      return dist <= radiusKm;
    })
    .map((s) => s.id);
}

/**
 * Ajoute distance à chaque station
 */
export function addDistanceToStations<T extends { latitude: number; longitude: number }>(
  stations: T[],
  userLat: number,
  userLon: number
): (T & { distance: number })[] {
  return stations.map((s) => ({
    ...s,
    distance: calculateDistance(userLat, userLon, s.latitude, s.longitude),
  }));
}
