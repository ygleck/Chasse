/**
 * Cache avec Cloudflare Workers KV
 * Stockage des données stations et métadonnées
 */

import type { GasStation, CacheMetadata } from '../types';
import { PRIX_ESSENCE_CONFIG } from '../config';

/**
 * Clés KV namespace
 */
const CACHE_KEYS = {
  stations: 'prix_essence:stations',
  metadata: 'prix_essence:metadata',
  xlsxUrl: 'prix_essence:xlsx_url',
};

/**
 * Interface pour accès KV (injected by Astro/Cloudflare)
 */
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

/**
 * Obtient l'instance KV (depuis le contexte Astro)
 * À appeler côté serveur uniquement
 */
export function getKVNamespace(): KVNamespace | null {
  if (typeof globalThis !== 'undefined' && 'PRIX_ESSENCE_KV' in globalThis) {
    return (globalThis as any).PRIX_ESSENCE_KV;
  }
  return null;
}

/**
 * Stocke les stations en cache
 */
export async function cacheStations(stations: GasStation[], metadata: CacheMetadata): Promise<void> {
  const kv = getKVNamespace();
  if (!kv) {
    console.warn('[PrixEssence] KV not available, skipping cache');
    return;
  }

  try {
    const ttl = PRIX_ESSENCE_CONFIG.CACHE_TTL;

    // Stocker les stations (par chunks si nécessaire)
    const stationsJson = JSON.stringify(stations);
    await kv.put(CACHE_KEYS.stations, stationsJson, { expirationTtl: ttl });

    // Stocker les métadonnées
    const metadataJson = JSON.stringify(metadata);
    await kv.put(CACHE_KEYS.metadata, metadataJson, { expirationTtl: ttl });

    // Stocker l'URL du XLSX
    await kv.put(CACHE_KEYS.xlsxUrl, metadata.xlsxUrl, { expirationTtl: ttl });

    console.log(`[PrixEssence] Cached ${stations.length} stations for ${ttl}s`);
  } catch (error) {
    console.error(
      `[PrixEssence] Cache write failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 *Récupère les stations du cache
 */
export async function getCachedStations(): Promise<GasStation[] | null> {
  const kv = getKVNamespace();
  if (!kv) {
    return null;
  }

  try {
    const cached = await kv.get(CACHE_KEYS.stations);
    if (!cached) {
      return null;
    }

    const stations: GasStation[] = JSON.parse(cached);
    console.log(`[PrixEssence] Retrieved ${stations.length} stations from cache`);
    return stations;
  } catch (error) {
    console.error(
      `[PrixEssence] Cache read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return null;
  }
}

/**
 * Récupère les métadonnées du cache
 */
export async function getCachedMetadata(): Promise<CacheMetadata | null> {
  const kv = getKVNamespace();
  if (!kv) {
    return null;
  }

  try {
    const cached = await kv.get(CACHE_KEYS.metadata);
    if (!cached) {
      return null;
    }

    const metadata: CacheMetadata = JSON.parse(cached);
    return metadata;
  } catch (error) {
    console.error(
      `[PrixEssence] Metadata read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return null;
  }
}

/**
 * Vide le cache
 */
export async function clearCache(): Promise<void> {
  const kv = getKVNamespace();
  if (!kv) {
    return;
  }

  try {
    await Promise.all([
      kv.delete(CACHE_KEYS.stations),
      kv.delete(CACHE_KEYS.metadata),
      kv.delete(CACHE_KEYS.xlsxUrl),
    ]);
    console.log('[PrixEssence] Cache cleared');
  } catch (error) {
    console.error(
      `[PrixEssence] Cache clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Vérifie si le cache est frais
 */
export function isCacheFresh(metadata: CacheMetadata | null): boolean {
  if (!metadata) return false;

  const now = Date.now();
  const cachedTime = new Date(metadata.downloadedAt).getTime();
  const ageSec = (now - cachedTime) / 1000;

  return ageSec < PRIX_ESSENCE_CONFIG.CACHE_TTL;
}
