/**
 * Gestion localStorage pour historique, favoris et préférences
 * Client-side uniquement
 */

import type { LocalStorageData, HistoryEntry, FavoriteStation } from '../types';
import { FuelType } from '../types';
import { PRIX_ESSENCE_CONFIG } from '../config';

/**
 * Obtient les données localStorage
 */
function getStorageData(): LocalStorageData {
  if (typeof window === 'undefined') {
    return { history: [], favorites: [], preferences: { preferredFuel: FuelType.ALL, preferredRadius: 20 } };
  }

  try {
    const stored = localStorage.getItem(PRIX_ESSENCE_CONFIG.STORAGE_KEYS.preferences);
    if (!stored) {
      return {
        history: [],
        favorites: [],
        preferences: {
          preferredFuel: FuelType.ALL,
          preferredRadius: PRIX_ESSENCE_CONFIG.DEFAULT_RADIUS,
        },
      };
    }

    return JSON.parse(stored) as LocalStorageData;
  } catch {
    console.warn('[PrixEssence] Failed to read localStorage');
    return {
      history: [],
      favorites: [],
      preferences: { preferredFuel: FuelType.ALL, preferredRadius: 20 },
    };
  }
}

/**
 * Sauvegarde les données localStorage
 */
function saveStorageData(data: LocalStorageData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PRIX_ESSENCE_CONFIG.STORAGE_KEYS.preferences, JSON.stringify(data));
  } catch {
    console.warn('[PrixEssence] Failed to write localStorage');
  }
}

/**
 * Ajoute une entrée à l'historique
 */
export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const data = getStorageData();

  const newEntry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  data.history.unshift(newEntry);
  data.history = data.history.slice(0, 20); // Garder les 20 dernières

  saveStorageData(data);
}

/**
 * Récupère l'historique
 */
export function getHistory(): HistoryEntry[] {
  return getStorageData().history;
}

/**
 * Ajoute un favori
 */
export function addFavorite(favorite: Omit<FavoriteStation, 'addedAt'>): void {
  const data = getStorageData();

  // Éviter les doublons
  if (data.favorites.some((f) => f.stationId === favorite.stationId)) {
    return;
  }

  const newFavorite: FavoriteStation = {
    ...favorite,
    addedAt: new Date().toISOString(),
  };

  data.favorites.push(newFavorite);
  saveStorageData(data);
}

/**
 * Retire un favori
 */
export function removeFavorite(stationId: string): void {
  const data = getStorageData();
  data.favorites = data.favorites.filter((f) => f.stationId !== stationId);
  saveStorageData(data);
}

/**
 * Récupère les favoris
 */
export function getFavorites(): FavoriteStation[] {
  return getStorageData().favorites;
}

/**
 * Vérifie si une station est favorite
 */
export function isFavorite(stationId: string): boolean {
  return getStorageData().favorites.some((f) => f.stationId === stationId);
}

/**
 * Met à jour les préférences
 */
export function updatePreferences(fuel: any, radius: number): void {
  const data = getStorageData();
  data.preferences = {
    preferredFuel: fuel,
    preferredRadius: radius,
  };
  saveStorageData(data);
}

/**
 * Récupère les préférences
 */
export function getPreferences() {
  return getStorageData().preferences;
}
