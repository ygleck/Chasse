/**
 * Types centralisés pour le module Prix Essence
 * AUTONOME - Module 100% indépendant
 */

export interface GasStation {
  id: string;
  stationName: string;
  banner: string;
  address1: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  regularPrice: number | null;
  dieselPrice: number | null;
  premiumPrice: number | null;
  updatedAt: string;
  distance?: number;
  score?: number;
}

export interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  fuelType: FuelType;
}

export interface SearchResult {
  bestOption: GasStationWithScore | null;
  topStations: GasStationWithScore[];
  averagePrice: number;
  expandedRadius?: number;
  message?: string;
}

export interface GasStationWithScore extends GasStation {
  score: number;
  priceForFuel: number | null;
  savingsVsAverage: number;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  displayName: string;
  city: string;
  postalCode?: string;
}

export interface XLSXRawData {
  [key: string]: unknown;
}

export interface CacheMetadata {
  xlsxUrl: string;
  downloadedAt: string;
  parsedAt: string;
  stationCount: number;
  version: string;
}

export interface HistoryEntry {
  id: string;
  query: string;
  latitude: number;
  longitude: number;
  fuelType: FuelType;
  radius: number;
  timestamp: string;
}

export interface FavoriteStation {
  stationId: string;
  stationName: string;
  addedAt: string;
}

export interface LocalStorageData {
  history: HistoryEntry[];
  favorites: FavoriteStation[];
  preferences: {
    preferredFuel: FuelType;
    preferredRadius: number;
  };
}

export interface ApiError {
  error: true;
  message: string;
  code: string;
  statusCode: number;
}

export interface ApiSuccess<T> {
  error: false;
  data: T;
}

export enum FuelType {
  REGULAR = 'regular',
  DIESEL = 'diesel',
  PREMIUM = 'premium',
  ALL = 'all',
}

export enum RadiusOption {
  FIVE = 5,
  TEN = 10,
  TWENTY = 20,
  THIRTY = 30,
}

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  [FuelType.REGULAR]: 'Ordinaire',
  [FuelType.DIESEL]: 'Diesel',
  [FuelType.PREMIUM]: 'Premium',
  [FuelType.ALL]: 'Tous les carburants',
};

export const RADIUS_LABELS: Record<RadiusOption, string> = {
  [RadiusOption.FIVE]: '5 km',
  [RadiusOption.TEN]: '10 km',
  [RadiusOption.TWENTY]: '20 km',
  [RadiusOption.THIRTY]: '30 km',
};
