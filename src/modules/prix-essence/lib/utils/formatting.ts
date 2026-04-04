/**
 * Utilities pour formatage d'affichage
 */

/**
 * Formate un prix en devise CAD
 */
export function formatPrice(price: number | null): string {
  if (price === null || price === undefined) {
    return '—';
  }
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);
}

/**
 * Formate une distance en km
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Formate une économie en cents
 */
export function formatSavings(cents: number): string {
  if (cents === 0) {
    return '+ 0¢';
  }
  const prefix = cents > 0 ? '+' : '';
  return `${prefix}${cents}¢`;
}

/**
 * Formate un score 0-100
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}

/**
 * Formate une date
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Formate un label de ville + code postal
 */
export function formatLocation(city: string, postalCode: string): string {
  const parts = [city, postalCode].filter(Boolean);
  return parts.join(', ');
}

/**
 * Génère un lien Google Maps
 */
export function getGoogleMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/@${latitude},${longitude},13z`;
}

/**
 * Génère un lien OpenStreetMap
 */
export function getOpenStreetMapLink(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/#map=13/${latitude}/${longitude}`;
}

/**
 * Génère un lien itinéraire (heuristique)
 * Préfère Google Maps si disponible, sinon OSM
 */
export function getDirectionsLink(latitude: number, longitude: number): string {
  return getGoogleMapsLink(latitude, longitude);
}
