import { API_ENDPOINTS, PRIX_ESSENCE_CONFIG } from '../../config';
import type {
  AutocompleteSuggestion,
  ResolvedSearchLocation,
  SearchInputType,
} from '../../types';
import {
  buildSearchQueryKey,
  detectSearchInputType,
  isCompleteCanadianPostalCode,
  normalizePostalCode,
  normalizeSearchQuery,
} from '../utils/searchInput';

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

type PhotonFeature = {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    osm_type?: string;
    osm_id?: string | number;
    type?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    postcode?: string;
  };
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
  };
};

const autocompleteCache = new Map<string, CacheEntry<AutocompleteSuggestion[]>>();
const geocodeCache = new Map<string, CacheEntry<ResolvedSearchLocation>>();

const SERVICE_TIMEOUT_MS = 6500;

export class SearchAssistError extends Error {
  constructor(
    public code:
      | 'INVALID_POSTAL_CODE'
      | 'ADDRESS_INVALID'
      | 'NO_SUGGESTION'
      | 'GEOCODING_FAILED'
      | 'SERVICE_UNAVAILABLE',
    message: string
  ) {
    super(message);
    this.name = 'SearchAssistError';
  }
}

function readCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): T {
  cache.set(key, {
    value,
    expiresAt: Date.now() + PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.cacheTtlMs,
  });

  return value;
}

async function fetchJson<T>(url: string, options: { signal?: AbortSignal } = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), SERVICE_TIMEOUT_MS);

  const relayAbort = () => controller.abort();
  options.signal?.addEventListener('abort', relayAbort);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429 || response.status >= 500) {
        throw new SearchAssistError(
          'SERVICE_UNAVAILABLE',
          'Le service de recherche d’adresses est temporairement indisponible.'
        );
      }

      throw new SearchAssistError(
        'GEOCODING_FAILED',
        'Le géocodage a échoué. Vérifiez votre saisie.'
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof SearchAssistError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    throw new SearchAssistError(
      'SERVICE_UNAVAILABLE',
      'Le service de recherche d’adresses est temporairement indisponible.'
    );
  } finally {
    globalThis.clearTimeout(timeoutId);
    options.signal?.removeEventListener('abort', relayAbort);
  }
}

function buildPhotonUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    limit: String(PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.maxSuggestions * 2),
    lang: PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.locale,
    bbox: PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.quebecBbox.join(','),
  });

  return `${PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.photonUrl}?${params.toString()}`;
}

function formatSuggestionTexts(feature: PhotonFeature): {
  primaryText: string;
  secondaryText: string;
  label: string;
} | null {
  const properties = feature.properties ?? {};
  const streetLabel = [properties.housenumber, properties.street].filter(Boolean).join(' ').trim();
  const cityLabel =
    properties.city || properties.county || properties.name || properties.state || '';
  const primaryText = streetLabel || properties.name || cityLabel;
  const secondaryParts = [
    streetLabel && properties.name ? properties.name : '',
    streetLabel ? cityLabel : properties.city || properties.county || properties.state || '',
    properties.state,
    properties.postcode,
  ].filter(Boolean);

  if (!primaryText) {
    return null;
  }

  const secondaryText = secondaryParts
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(' • ');

  return {
    primaryText,
    secondaryText,
    label: [primaryText, secondaryText].filter(Boolean).join(', '),
  };
}

function rankPhotonFeature(feature: PhotonFeature, inputType: SearchInputType): number {
  const properties = feature.properties ?? {};
  const hasAddress = Boolean(properties.street || properties.housenumber);
  const placeType = properties.type?.toLowerCase() ?? '';
  const isCityLike = ['city', 'town', 'village'].includes(placeType);
  const isQuebec = (properties.state ?? '').toLowerCase().includes('québec')
    || (properties.state ?? '').toLowerCase().includes('quebec');

  let score = 0;

  if ((properties.countrycode ?? '').toLowerCase() === 'ca') {
    score += 60;
  }

  if (isQuebec) {
    score += 30;
  }

  if (inputType === 'address') {
    if (hasAddress) {
      score += 40;
    }
    if (placeType === 'house') {
      score += 15;
    }
  }

  if (inputType === 'city' && isCityLike) {
    score += 50;
  }

  if (properties.name && properties.city && properties.name === properties.city) {
    score += 10;
  }

  return score;
}

function createSuggestionFromPhotonFeature(
  feature: PhotonFeature,
  inputType: SearchInputType
): AutocompleteSuggestion | null {
  const coordinates = feature.geometry?.coordinates;
  const properties = feature.properties ?? {};
  const labels = formatSuggestionTexts(feature);

  if (!coordinates || coordinates.length < 2 || !labels) {
    return null;
  }

  if ((properties.countrycode ?? '').toLowerCase() !== 'ca') {
    return null;
  }

  const suggestionType: SearchInputType =
    properties.street || properties.housenumber ? 'address' : 'city';

  return {
    id: `${properties.osm_type ?? 'osm'}-${properties.osm_id ?? labels.label}`,
    label: labels.label,
    primaryText: labels.primaryText,
    secondaryText: labels.secondaryText,
    latitude: coordinates[1],
    longitude: coordinates[0],
    city: properties.city || properties.name || '',
    postalCode: properties.postcode || '',
    inputType: inputType === 'address' ? suggestionType : 'city',
    queryKey: buildSearchQueryKey(labels.label),
  };
}

function deduplicateSuggestions(
  suggestions: AutocompleteSuggestion[]
): AutocompleteSuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.label}|${suggestion.latitude.toFixed(5)}|${suggestion.longitude.toFixed(5)}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export async function fetchAutocompleteSuggestions(
  query: string,
  options: { signal?: AbortSignal } = {}
): Promise<AutocompleteSuggestion[]> {
  const normalizedQuery = normalizeSearchQuery(query);
  const inputType = detectSearchInputType(normalizedQuery);
  const queryKey = buildSearchQueryKey(normalizedQuery);

  if (
    !normalizedQuery ||
    inputType === 'postalCode' ||
    normalizedQuery.length < PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.minAutocompleteChars
  ) {
    return [];
  }

  const cacheKey = `autocomplete:${inputType}:${queryKey}`;
  const cached = readCache(autocompleteCache, cacheKey);
  if (cached) {
    return cached;
  }

  const payload = await fetchJson<{ features?: PhotonFeature[] }>(buildPhotonUrl(normalizedQuery), options);
  const suggestions = deduplicateSuggestions(
    (payload.features ?? [])
      .map((feature) => ({
        feature,
        suggestion: createSuggestionFromPhotonFeature(feature, inputType),
      }))
      .filter(
        (
          item
        ): item is {
          feature: PhotonFeature;
          suggestion: AutocompleteSuggestion;
        } => Boolean(item.suggestion)
      )
      .sort((left, right) => {
        return (
          rankPhotonFeature(right.feature, inputType) -
          rankPhotonFeature(left.feature, inputType)
        );
      })
      .map((item) => item.suggestion)
  ).slice(0, PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.maxSuggestions);

  return writeCache(autocompleteCache, cacheKey, suggestions);
}

function mapNominatimResult(
  result: NominatimResult,
  inputType: SearchInputType
): ResolvedSearchLocation {
  return {
    latitude: Number.parseFloat(result.lat),
    longitude: Number.parseFloat(result.lon),
    displayName: result.display_name,
    city:
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.address?.municipality ||
      '',
    postalCode: result.address?.postcode || '',
    inputType,
    provider: 'nominatim',
  };
}

async function geocodePostalCode(query: string): Promise<ResolvedSearchLocation> {
  const normalizedPostalCode = normalizePostalCode(query);
  const cacheKey = `postal:${normalizedPostalCode}`;
  const cached = readCache(geocodeCache, cacheKey);
  if (cached) {
    return cached;
  }

  if (!isCompleteCanadianPostalCode(normalizedPostalCode)) {
    throw new SearchAssistError(
      'INVALID_POSTAL_CODE',
      'Code postal invalide. Utilisez un format comme H2X 1Y4.'
    );
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    postalcode: normalizedPostalCode,
    countrycodes: PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.defaultCountryCode,
    addressdetails: '1',
    limit: '1',
    'accept-language': PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.locale,
  });

  const results = await fetchJson<NominatimResult[]>(
    `${PRIX_ESSENCE_CONFIG.NOMINATIM.url}/search?${params.toString()}`
  );

  if (!results.length) {
    throw new SearchAssistError(
      'INVALID_POSTAL_CODE',
      'Code postal invalide ou introuvable.'
    );
  }

  return writeCache(geocodeCache, cacheKey, mapNominatimResult(results[0], 'postalCode'));
}

async function geocodeCity(query: string): Promise<ResolvedSearchLocation> {
  const normalizedQuery = normalizeSearchQuery(query);
  const cacheKey = `city:${buildSearchQueryKey(normalizedQuery)}`;
  const cached = readCache(geocodeCache, cacheKey);
  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    format: 'jsonv2',
    city: normalizedQuery,
    state: PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.defaultState,
    country: PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.defaultCountry,
    addressdetails: '1',
    limit: '1',
    'accept-language': PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.locale,
  });

  const results = await fetchJson<NominatimResult[]>(
    `${PRIX_ESSENCE_CONFIG.NOMINATIM.url}/search?${params.toString()}`
  );

  if (results.length) {
    return writeCache(geocodeCache, cacheKey, mapNominatimResult(results[0], 'city'));
  }

  const suggestions = await fetchAutocompleteSuggestions(normalizedQuery);
  const citySuggestion = suggestions.find((suggestion) => suggestion.inputType === 'city');

  if (citySuggestion) {
    return writeCache(geocodeCache, cacheKey, {
      latitude: citySuggestion.latitude,
      longitude: citySuggestion.longitude,
      displayName: citySuggestion.label,
      city: citySuggestion.city,
      postalCode: citySuggestion.postalCode,
      inputType: 'city',
      provider: 'photon',
    });
  }

  return geocodeViaExistingApi(normalizedQuery, 'city');
}

async function geocodeAddress(query: string): Promise<ResolvedSearchLocation> {
  const normalizedQuery = normalizeSearchQuery(query);
  const cacheKey = `address:${buildSearchQueryKey(normalizedQuery)}`;
  const cached = readCache(geocodeCache, cacheKey);
  if (cached) {
    return cached;
  }

  const suggestions = await fetchAutocompleteSuggestions(normalizedQuery);
  const addressSuggestion = suggestions.find((suggestion) => suggestion.inputType === 'address');

  if (addressSuggestion) {
    return writeCache(geocodeCache, cacheKey, {
      latitude: addressSuggestion.latitude,
      longitude: addressSuggestion.longitude,
      displayName: addressSuggestion.label,
      city: addressSuggestion.city,
      postalCode: addressSuggestion.postalCode,
      inputType: 'address',
      provider: 'photon',
    });
  }

  return geocodeViaExistingApi(normalizedQuery, 'address');
}

async function geocodeViaExistingApi(
  query: string,
  inputType: SearchInputType
): Promise<ResolvedSearchLocation> {
  const params = new URLSearchParams({ query });
  const response = await fetchJson<{
    error: boolean;
    data?: {
      latitude: number;
      longitude: number;
      displayName: string;
      city: string;
      postalCode?: string;
    };
    message?: string;
  }>(`${API_ENDPOINTS.geocode}?${params.toString()}`);

  if (response.error || !response.data) {
    throw new SearchAssistError(
      'GEOCODING_FAILED',
      response.message || 'Adresse invalide ou introuvable.'
    );
  }

  return {
    ...response.data,
    inputType,
    provider: 'backend',
  };
}

export function matchesSelectedSuggestion(
  query: string,
  suggestion: AutocompleteSuggestion | null
): boolean {
  if (!suggestion) {
    return false;
  }

  return suggestion.queryKey === buildSearchQueryKey(query);
}

export async function resolveSearchLocation(
  query: string
): Promise<ResolvedSearchLocation> {
  const normalizedQuery = normalizeSearchQuery(query);
  const inputType = detectSearchInputType(normalizedQuery);

  switch (inputType) {
    case 'postalCode':
      return geocodePostalCode(normalizedQuery);
    case 'city':
      return geocodeCity(normalizedQuery);
    case 'address':
    default:
      return geocodeAddress(normalizedQuery);
  }
}
