/**
 * Géocodage - Module autonome
 * Support multi-provider (Nominatim par défaut, Google Maps optionnel)
 */

import type { GeocodeResult } from '../types';
import { PRIX_ESSENCE_CONFIG } from '../config';

export interface GeocodingProvider {
  geocode(query: string): Promise<GeocodeResult>;
  reverseGeocode(lat: number, lon: number): Promise<GeocodeResult>;
}

/**
 * Provider Nominatim (gratuit, OpenStreetMap)
 */
export class NominatimProvider implements GeocodingProvider {
  private baseUrl: string;
  private userAgent: string;

  constructor() {
    this.baseUrl = PRIX_ESSENCE_CONFIG.NOMINATIM.url;
    this.userAgent = PRIX_ESSENCE_CONFIG.NOMINATIM.userAgent;
  }

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
        `${this.baseUrl}/search?${params}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
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
        throw new Error('Adresse introuvable');
      }

      const result = results[0];
      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || '',
        postalCode: result.address?.postcode || '',
      };
    } catch (error) {
      throw new Error(
        `Géocodage échoué: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
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
        `${this.baseUrl}/reverse?${params}`,
        {
          headers: {
            'User-Agent': this.userAgent,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
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

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        displayName: result.display_name,
        city: result.address?.city || result.address?.town || '',
        postalCode: result.address?.postcode || '',
      };
    } catch (error) {
      throw new Error(
        `Géocodage inversé échoué: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }
}

/**
 * Factory pour obtenir le provider
 */
export function getGeocodingProvider(): GeocodingProvider {
  // À l'avenir : déterminer provider selon env vars
  return new NominatimProvider();
}

export async function geocodeAddress(query: string): Promise<GeocodeResult> {
  const provider = getGeocodingProvider();
  return provider.geocode(query);
}

export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number
): Promise<GeocodeResult> {
  const provider = getGeocodingProvider();
  return provider.reverseGeocode(lat, lon);
}
