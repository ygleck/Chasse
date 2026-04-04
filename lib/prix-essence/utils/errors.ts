/**
 * Gestion des erreurs - Messages français
 */

export class PrixEssenceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'PrixEssenceError';
  }
}

export const ERROR_CODES = {
  ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',
  GEOLOCATION_DENIED: 'GEOLOCATION_DENIED',
  GEOLOCATION_UNAVAILABLE: 'GEOLOCATION_UNAVAILABLE',
  GEOLOCATION_TIMEOUT: 'GEOLOCATION_TIMEOUT',
  NO_STATIONS_FOUND: 'NO_STATIONS_FOUND',
  XLSX_FETCH_ERROR: 'XLSX_FETCH_ERROR',
  XLSX_PARSE_ERROR: 'XLSX_PARSE_ERROR',
  GEOCODING_ERROR: 'GEOCODING_ERROR',
  CACHE_ERROR: 'CACHE_ERROR',
  INVALID_PARAMS: 'INVALID_PARAMS',
  PROVIDER_ERROR: 'PROVIDER_ERROR',
};

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.ADDRESS_NOT_FOUND]: 'Adresse introuvable. Essayez avec une autre adresse.',
  [ERROR_CODES.GEOLOCATION_DENIED]:
    'Accès à votre position refusé. Veuillez accepter la géolocalisation ou entrer une adresse.',
  [ERROR_CODES.GEOLOCATION_UNAVAILABLE]:
    'Géolocalisation non disponible sur votre appareil.',
  [ERROR_CODES.GEOLOCATION_TIMEOUT]:
    'La géolocalisation a pris trop de temps. Réessayez ou entrez une adresse.',
  [ERROR_CODES.NO_STATIONS_FOUND]:
    'Aucune station-service trouvée à proximité. Essayez un rayon plus grand.',
  [ERROR_CODES.XLSX_FETCH_ERROR]:
    'Impossible de récupérer les données des stations. Réessayez plus tard.',
  [ERROR_CODES.XLSX_PARSE_ERROR]:
    'Erreur lors du traitement des données. Réessayez plus tard.',
  [ERROR_CODES.GEOCODING_ERROR]:
    'Erreur de géocodage. Vérifiez votre saisie et réessayez.',
  [ERROR_CODES.CACHE_ERROR]:
    'Erreur de cache. Les données peuvent être légèrement obsolètes.',
  [ERROR_CODES.INVALID_PARAMS]:
    'Paramètres invalides. Vérifiez votre saisie.',
  [ERROR_CODES.PROVIDER_ERROR]:
    'Service externe indisponible. Réessayez plus tard.',
};

/**
 * Crée une erreur avec code et message français
 */
export function createError(
  code: string,
  customMessage?: string,
  statusCode: number = 500
): PrixEssenceError {
  const message = customMessage || ERROR_MESSAGES[code] || 'Erreur inconnue';
  return new PrixEssenceError(code, message, statusCode);
}

/**
 * Vérifie si c'est une erreur attendue
 */
export function isKnownError(code: string): boolean {
  return code in ERROR_MESSAGES;
}
