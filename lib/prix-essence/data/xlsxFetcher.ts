/**
 * Détection et téléchargement du fichier XLSX
 * Scraping légal et robuste de la source officielle
 */

// import { PRIX_ESSENCE_CONFIG } from '../config';

const OFFICIAL_SITE_URL = 'https://regieessencequebec.ca';

/**
 * Détecte le XLSX le plus récent sur le site officiel
 * Parse la page HTML pour extraire les liens /data/stations-*.xlsx
 * Sélectionne le plus récent par timestamp dans le nom
 */
export async function detectLatestXLSXUrl(): Promise<string> {
  try {
    // D'abord, vérifier env var
    const overrideUrl = process.env.PRIX_ESSENCE_XLSX_URL;
    if (overrideUrl) {
      console.log(`[PrixEssence] Using override XLSX URL: ${overrideUrl}`);
      return overrideUrl;
    }

    // Scraper la page officielle
    const response = await fetch(`${OFFICIAL_SITE_URL}/data/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'PrixEssenceQC/1.0 (+https://prixessencequebec.example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch official page: ${response.status}`);
    }

    const html = await response.text();

    // Regex pour trouver tous les liens /data/stations-*.xlsx
    const xlsxRegex = /\/data\/(stations-[\d]{14,}\.xlsx)/g;
    const matches = [...html.matchAll(xlsxRegex)];

    if (matches.length === 0) {
      throw new Error('No XLSX files found on official page');
    }

    // Extraire les timestamps des noms (déjà fourni dans le regex)
    const files = matches.map((m) => ({
      filename: m[1],
      url: `${OFFICIAL_SITE_URL}/data/${m[1]}`,
      // Essayer extraire timestamp du nom : stations-20260404015005.xlsx
      timestamp: extractTimestamp(m[1]),
    }));

    // Trier par timestamp (les plus récents en premier)
    files.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const latest = files[0];
    console.log(`[PrixEssence] Latest XLSX detected: ${latest.filename}`);

    return latest.url;
  } catch (error) {
    console.error(
      `[PrixEssence] Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    // Fallback: si il y a un env de secours, l'utiliser
    const fallbackUrl = process.env.PRIX_ESSENCE_XLSX_URL_FALLBACK;
    if (fallbackUrl) {
      console.log(`[PrixEssence] Using fallback URL: ${fallbackUrl}`);
      return fallbackUrl;
    }

    throw new Error(
      'Could not detect latest XLSX URL and no fallback provided. Set PRIX_ESSENCE_XLSX_URL_FALLBACK env var.'
    );
  }
}

/**
 * Extrait timestamp du nom du fichier
 * Format : stations-20260404015005.xlsx => 20260404015005
 */
function extractTimestamp(filename: string): number {
  const match = filename.match(/stations-(\d{14})/);
  if (!match) return 0;
  return parseInt(match[1], 10);
}

/**
 * Télécharge le fichier XLSX
 * Retourne le buffer des données
 */
export async function downloadXLSXFile(url: string): Promise<ArrayBuffer> {
  try {
    console.log(`[PrixEssence] Downloading XLSX from: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'PrixEssenceQC/1.0 (+https://prixessencequebec.example.com)',
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    console.log(`[PrixEssence] Downloaded ${buffer.byteLength} bytes`);

    return buffer;
  } catch (error) {
    throw new Error(
      `XLSX download failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Valide que le URL ressemble à un XLSX valide
 */
export function isValidXLSXUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.endsWith('.xlsx');
  } catch {
    return false;
  }
}

/**
 * Fonction combinée: Détecte et télécharge le dernier XLSX
 */
export async function fetchLatestXLSX(): Promise<ArrayBuffer> {
  const url = await detectLatestXLSXUrl();
  return downloadXLSXFile(url);
}
