/**
 * Couche géocodage - Support pour Nominatim (gratuit) et Google Maps (optionnel)
 */

import type { GeocodeResult } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Interface pour les providers de géocodage
 */
export interface GeocodingProvider {
  geocode(query: string): Promise<GeocodeResult>;
  reverseGeocode(lat: number, lon: number): Promise<GeocodeResult>;
}

/**
 * Provider Nominatim (gratuit, OpenStreetMap)
 */
class NominatimProvider implements GeocodingProvider {
  private userAgent = 'PrixEssenceQC/1.0 (+https://prix-essence.example.com)';

  async geocode(query: string): Promise<GeocodeResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: '1',
        countrycodes: 'ca',
        extratags: '1',
      });

      const response = await fetch(
        `${NOMINATIM_URL}?${params}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const results = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
        address?: {
          postcode?: string;
          city?: string;
          town?: string;
        };
      }>;

      if (!results.length) {
        throw new Error('Address not found');
      }

      const result = results[0];
      const postalCode = result.address?.postcode || '';
      const city = result.address?.city || result.address?.town || '';

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city,
        postalCode,
      };
    } catch (error) {
      throw new Error(
        `Geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json',
        extratags: '1',
      });

      const response = await fetch(
        `${NOMINATIM_REVERSE_URL}?${params}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const result = (await response.json()) as {
        lat: string;
        lon: string;
        display_name: string;
        address?: {
          postcode?: string;
          city?: string;
          town?: string;
        };
      };

      const postalCode = result.address?.postcode || '';
      const city = result.address?.city || result.address?.town || '';

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city,
        postalCode,
      };
    } catch (error) {
      throw new Error(
        `Reverse geocoding failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Provider Google Maps (optionnel, si configuré via env var)
 * IMPLÉMENTATION FUTURE : adapter selon vos besoins Google Maps
 */
class GoogleMapsProvider implements GeocodingProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async geocode(query: string): Promise<GeocodeResult> {
    // Implémentation future
    throw new Error('Google Maps geocoding not yet implemented');
  }

  async reverseGeocode(lat: number, lon: number): Promise<GeocodeResult> {
    // Implémentation future
    throw new Error('Google Maps reverse geocoding not yet implemented');
  }
}

/**
 * Factory pour obtenir le provider approprié
 */
export function getGeocodingProvider(): GeocodingProvider {
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (googleApiKey) {
    return new GoogleMapsProvider(googleApiKey);
  }

  // Nominatim par défaut
  return new NominatimProvider();
}

/**
 * Fonction convenience pour géocoder une adresse
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const provider = getGeocodingProvider();
  return provider.geocode(query);
}

/**
 * Fonction convenience pour géocoder inversement (lat/lon -> adresse)
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<GeocodeResult> {
  const provider = getGeocodingProvider();
  return provider.reverseGeocode(lat, lon);
}
