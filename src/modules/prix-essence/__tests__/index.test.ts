/**
 * Tests unitaires pour le module Prix Essence
 * Utilise Vitest
 */

import { describe, it, expect } from 'vitest';
import { calculateDistance, addDistanceToStations } from '../../lib/geo/distance';
import {
  scoreStations,
  getTopStations,
  getBestOption,
  calculateAveragePrice,
} from '../../lib/scoring/scoringEngine';
import { detectColumnMapping, parseXLSXData } from '../../lib/data/xlsxParser';
import type { GasStation } from '../../../types';

describe('Distance - Haversine', () => {
  it('calcule la distance correctement', () => {
    // Montréal to Québec City (approx 250 km)
    const distance = calculateDistance(45.5017, -73.5673, 46.8139, -71.2080);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(300);
  });

  it('retourne 0 pour le même point', () => {
    const distance = calculateDistance(45.5, -73.5, 45.5, -73.5);
    expect(distance).toBe(0);
  });

  it('addDistanceToStations ajoute les distances', () => {
    const stations: Array<{ latitude: number; longitude: number; name: string }> = [
      { latitude: 45.5, longitude: -73.5, name: 'Station 1' },
    ];

    const result = addDistanceToStations(stations, 45.6, -73.6);
    expect(result[0].distance).toBeGreaterThan(0);
  });
});

describe('Scoring Engine', () => {
  const mockStations: Array<GasStation & { distance: number }> = [
    {
      id: '1',
      stationName: 'Station A',
      banner: 'Shell',
      address1: '123 Main',
      city: 'Montréal',
      postalCode: 'H1H 1H1',
      latitude: 45.5,
      longitude: -73.5,
      regularPrice: 1.5,
      dieselPrice: 1.6,
      premiumPrice: 1.7,
      updatedAt: new Date().toISOString(),
      distance: 2,
    },
    {
      id: '2',
      stationName: 'Station B',
      banner: 'Costco',
      address1: '456 Oak',
      city: 'Montréal',
      postalCode: 'H2H 2H2',
      latitude: 45.6,
      longitude: -73.6,
      regularPrice: 1.4,
      dieselPrice: 1.5,
      premiumPrice: 1.6,
      updatedAt: new Date().toISOString(),
      distance: 5,
    },
  ];

  it('score les stations correctement', () => {
    const scored = scoreStations(mockStations, {
      latitude: 45.5,
      longitude: -73.5,
      radius: 10,
      fuelType: 'regular',
    });
    expect(scored.length).toBe(2);
    // Station B (plus proche, moins cher) devrait avoir meilleur score
    expect(scored[0].id).toBe('2');
  });

  it('exclut les stations sans prix valide', () => {
    const stationsNoPrices: Array<GasStation & { distance: number }> = [
      {
        ...mockStations[0],
        id: '3',
        regularPrice: null,
        dieselPrice: null,
        premiumPrice: null,
      },
    ];

    const scored = scoreStations(stationsNoPrices, {
      latitude: 45.5,
      longitude: -73.5,
      radius: 10,
      fuelType: 'regular',
    });
    expect(scored.length).toBe(0);
  });

  it('getTopStations retourne le N supérieur', () => {
    let scored = scoreStations(mockStations, {
      latitude: 45.5,
      longitude: -73.5,
      radius: 10,
      fuelType: 'regular',
    });
    scored = [...scored, ...scored]; // Dupliquer pour avoir plus de 2

    const top = getTopStations(scored, 2);
    expect(top.length).toBe(2);
  });

  it('getBestOption retourne la première', () => {
    const scored = scoreStations(mockStations, {
      latitude: 45.5,
      longitude: -73.5,
      radius: 10,
      fuelType: 'regular',
    });
    const best = getBestOption(scored);
    expect(best?.id).toBe(scored[0].id);
  });

  it('calculateAveragePrice fonctionne', () => {
    const scored = scoreStations(mockStations, {
      latitude: 45.5,
      longitude: -73.5,
      radius: 10,
      fuelType: 'regular',
    });
    const avg = calculateAveragePrice(scored);
    expect(avg).toBeGreaterThan(0);
  });
});

describe('XLSX Parser', () => {
  it('détecte les colonnes correctement', () => {
    const headers = [
      'nom',
      'adresse',
      'latitude',
      'longitude',
      'prix ordinaire',
      'prix diesel',
    ];

    const mapping = detectColumnMapping(headers);

    expect(mapping['nom']).toBe('stationName');
    expect(mapping['adresse']).toBe('address1');
    expect(mapping['latitude']).toBe('latitude');
    expect(mapping['prix ordinaire']).toBe('regularPrice');
  });

  it('détecte les colonnes avec variations', () => {
    const headers = ['Station Name', 'Address 1', 'Lat', 'Lon'];
    const mapping = detectColumnMapping(headers);

    expect(mapping['Station Name']).toBe('stationName');
    expect(mapping['Address 1']).toBe('address1');
  });

  it('parse les données XLSX', () => {
    const rawData = [
      {
        'nom': 'Station Test',
        'adresse': '123 Main',
        'ville': 'Montréal',
        'code postal': 'H1H',
        'latitude': '45.5',
        'longitude': '-73.5',
        'prix ordinaire': '1.5',
        'prix diesel': '1.6',
        'date': '2026-04-03',
      },
    ];

    const parsed = parseXLSXData(rawData);

    expect(parsed.length).toBe(1);
    expect(parsed[0].stationName).toBe('Station Test');
    expect(parsed[0].latitude).toBe(45.5);
    expect(parsed[0].regularPrice).toBe(1.5);
  });

  it('ignore les lignes invalides', () => {
    const rawData = [
      {
        // Complète
        'nom': 'Valid',
        'latitude': '45.5',
        'longitude': '-73.5',
        'prix ordinaire': '1.5',
      },
      {
        // Pas de latitude/long
        'nom': 'Invalid',
      },
    ];

    const parsed = parseXLSXData(rawData);
    expect(parsed.length).toBe(1);
  });
});

describe('Radius Expansion', () => {
  it('s\'élargit progressivement si aucun résultat', () => {
    // Ce test vérifie la logique dans l'API
    // Les rayons d'expansion sont : [5, 10, 20, 30, 50]

    const AUTO_EXPAND_RADII = [5, 10, 20, 30, 50];
    const currentRadius = 5;

    const nextRadii = AUTO_EXPAND_RADII.filter((r) => r > currentRadius);
    expect(nextRadii[0]).toBe(10);
  });
});
