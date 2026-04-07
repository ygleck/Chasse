/**
 * Configuration du module Prix Essence
 * À adapter selon vos besoins
 */

export const PRIX_ESSENCE_CONFIG = {
  // Rayon par défaut en km
  DEFAULT_RADIUS: 20,

  // TTL du cache en secondes (1 heure)
  CACHE_TTL: 3600,

  // URL officielle - peut être overridée via env var
  OFFICIAL_XLSX_ENDPOINT: 'https://regieessencequebec.ca/data/',

  // Nombre de stations dans le top
  TOP_STATIONS_LIMIT: 10,

  // Rayons progressifs pour élargissement auto
  AUTO_EXPAND_RADII: [5, 10, 20, 30, 50],

  // Scoring
  SCORING: {
    priceWeight: 0.7,
    distanceWeight: 0.3,
  },

  // Nominatim (géocodage gratuit)
  NOMINATIM: {
    url: 'https://nominatim.openstreetmap.org',
    userAgent: 'PrixEssenceQC/1.0 (+https://prixessencequebec.example.com)',
  },

  SEARCH_ASSIST: {
    debounceMs: 400,
    minAutocompleteChars: 3,
    maxSuggestions: 6,
    cacheTtlMs: 5 * 60 * 1000,
    photonUrl: 'https://photon.komoot.io/api',
    // Borne le moteur au Québec pour éviter les faux positifs hors sujet.
    quebecBbox: [-79.85, 44.99, -57.1, 62.62],
    defaultState: 'Quebec',
    defaultCountry: 'Canada',
    defaultCountryCode: 'ca',
    locale: 'fr',
  },

  // Leaflet / OpenStreetMap (cartographie gratuite)
  MAP: {
    defaultProvider: 'openstreetmap', // 'openstreetmap' ou 'google'
    osmTile: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    defaultZoom: 13,
    minZoom: 8,
    maxZoom: 18,
  },

  // localStorage keys
  STORAGE_KEYS: {
    history: 'prix_essence_history',
    favorites: 'prix_essence_favorites',
    preferences: 'prix_essence_preferences',
  },
};

export const API_ENDPOINTS = {
  search: '/api/prix-essence/search',
  geocode: '/api/prix-essence/geocode',
  refresh: '/api/prix-essence/refresh',
};
