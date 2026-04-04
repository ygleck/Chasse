/**
 * Parser XLSX robuste et flexible
 * Détecte les colonnes même avec des variations de noms
 * Exporte les dépendances pour installation séparée
 */

import type { GasStation, XLSXRawData } from '../../types';

/**
 * Configuration pour la détection des colonnes
 * Clés : noms possibles dans le fichier XLSX (case-insensitive)
 * Valeurs : champ normalisé attendu
 */
const COLUMN_MAPPINGS: Record<string, string> = {
  // Noms de station
  'nom': 'stationName',
  'name': 'stationName',
  'station name': 'stationName',
  'station': 'stationName',

  // Bannière
  'banner': 'banner',
  'marque': 'banner',
  'brand': 'banner',

  // Adresse
  'address': 'address1',
  'address 1': 'address1',
  'adresse': 'address1',
  'rue': 'address1',
  'street': 'address1',

  // Ville
  'city': 'city',
  'ville': 'city',
  'town': 'city',

  // Code postal
  'postal code': 'postalCode',
  'postalcode': 'postalCode',
  'postal': 'postalCode',
  'code postal': 'postalCode',
  'postal code/zip': 'postalCode',

  // Latitude
  'latitude': 'latitude',
  'lat': 'latitude',

  // Longitude
  'longitude': 'longitude',
  'lon': 'longitude',
  'long': 'longitude',

  // Prix ordinaire
  'regular': 'regularPrice',
  'regular price': 'regularPrice',
  'price regular': 'regularPrice',
  'ordinaire': 'regularPrice',
  'prix ordinaire': 'regularPrice',

  // Prix diesel
  'diesel': 'dieselPrice',
  'diesel price': 'dieselPrice',
  'price diesel': 'dieselPrice',

  // Prix premium
  'premium': 'premiumPrice',
  'premium price': 'premiumPrice',
  'price premium': 'premiumPrice',

  // Date de mise à jour
  'updated': 'updatedAt',
  'updated at': 'updatedAt',
  'last updated': 'updatedAt',
  'update': 'updatedAt',
  'date': 'updatedAt',
};

/**
 * Normalise un nom de colonne pour la détection
 */
function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Détecte le mappingcolonnes depuis les headers du XLSX
 */
export function detectColumnMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};

  for (const header of headers) {
    const normalized = normalizeColumnName(header);

    // Essayer une correspondance exacte d'abord
    let found = COLUMN_MAPPINGS[normalized];

    // Si pas exacte, essayer un contains
    if (!found) {
      for (const [pattern, target] of Object.entries(COLUMN_MAPPINGS)) {
        if (normalized.includes(pattern) || pattern.includes(normalized)) {
          found = target;
          break;
        }
      }
    }

    if (found) {
      mapping[header] = found;
    }
  }

  return mapping;
}

/**
 * Normalise une ligne de données
 */
function normalizeRow(
  row: XLSXRawData,
  columnMapping: Record<string, string>
): Partial<GasStation> {
  const normalized: Partial<GasStation> = {
    id: '',
  };

  for (const [originalColumn, normalizedField] of Object.entries(columnMapping)) {
    let value = row[originalColumn];

    if (!value) continue;

    // Convertir selon le type attendu
    switch (normalizedField) {
      case 'latitude':
      case 'longitude':
        value = parseFloat(String(value));
        if (isNaN(value)) value = undefined;
        break;

      case 'regularPrice':
      case 'dieselPrice':
      case 'premiumPrice':
        // Nettoyer le prix (peut être "1.23" ou "1,23" en français)
        const priceStr = String(value).replace(',', '.');
        value = parseFloat(priceStr);
        if (isNaN(value) || value <= 0) value = null;
        break;

      case 'updatedAt':
        // Garder comme string, parse ISO ou date
        if (value instanceof Date) {
          value = value.toISOString();
        } else {
          value = String(value);
        }
        break;

      default:
        value = String(value).trim();
    }

    (normalized as any)[normalizedField] = value;
  }

  return normalized;
}

/**
 * Valide une station parsée
 */
function isValidStation(station: Partial<GasStation>): boolean {
  // Champs requis
  if (
    !station.stationName ||
    typeof station.latitude !== 'number' ||
    typeof station.longitude !== 'number'
  ) {
    return false;
  }

  // Au moins un prixy doit être présent et valide
  const hasPrice =
    (station.regularPrice && station.regularPrice > 0) ||
    (station.dieselPrice && station.dieselPrice > 0) ||
    (station.premiumPrice && station.premiumPrice > 0);

  return hasPrice;
}

/**
 * Génère un ID unique pour la station
 */
function generateStationId(station: Partial<GasStation>, index: number): string {
  const name = (station.stationName || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const lat = Math.round((station.latitude || 0) * 100);
  const lon = Math.round((station.longitude || 0) * 100);
  return `${name}-${lat}-${lon}-${index}`;
}

/**
 * Parse un tableau de données XLSX brutes
 * Attendu : tableau d'objets où chaque clé = nom de colonne
 */
export function parseXLSXData(rawRows: XLSXRawData[]): GasStation[] {
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    throw new Error('No data rows provided');
  }

  // Détecter les colonnes depuis les clés du premier objet
  const headers = Object.keys(rawRows[0]);
  const columnMapping = detectColumnMapping(headers);

  if (Object.keys(columnMapping).length === 0) {
    throw new Error('Could not detect any valid columns in XLSX');
  }

  console.log(`[PrixEssence] Detected columns:`, columnMapping);

  const stations: GasStation[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  for (let i = 0; i < rawRows.length; i++) {
    try {
      const row = rawRows[i];
      const normalized = normalizeRow(row, columnMapping);

      if (!isValidStation(normalized)) {
        errors.push({
          row: i + 1,
          error: 'Invalid or incomplete station data',
        });
        continue;
      }

      // Cast en GasStation complète
      const station: GasStation = {
        id: generateStationId(normalized, i),
        stationName: normalized.stationName || '',
        banner: normalized.banner || '',
        address1: normalized.address1 || '',
        city: normalized.city || '',
        postalCode: normalized.postalCode || '',
        latitude: normalized.latitude || 0,
        longitude: normalized.longitude || 0,
        regularPrice: normalized.regularPrice || null,
        dieselPrice: normalized.dieselPrice || null,
        premiumPrice: normalized.premiumPrice || null,
        updatedAt: normalized.updatedAt || new Date().toISOString(),
      };

      stations.push(station);
    } catch (error) {
      errors.push({
        row: i + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  if (errors.length > 0) {
    console.warn(`[PrixEssence] Parsing errors (${errors.length} rows):`, errors.slice(0, 5));
  }

  console.log(`[PrixEssence] Successfully parsed ${stations.length} stations`);

  return stations;
}
