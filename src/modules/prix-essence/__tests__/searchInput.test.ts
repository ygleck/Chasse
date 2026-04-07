/// <reference path="../../../../vitest.d.ts" />

import { describe, expect, it } from 'vitest';

import {
  detectSearchInputType,
  isCompleteCanadianPostalCode,
  normalizePostalCode,
  normalizeSearchQuery,
} from '../lib/utils/searchInput';

describe('Search Input Helpers', () => {
  it('normalise correctement les codes postaux canadiens', () => {
    expect(normalizePostalCode('j6a1l3')).toBe('J6A 1L3');
    expect(normalizePostalCode('J6A1L3')).toBe('J6A 1L3');
    expect(normalizePostalCode('j6a 1l3')).toBe('J6A 1L3');
  });

  it('reconnait un code postal complet valide', () => {
    expect(isCompleteCanadianPostalCode('J6A 1L3')).toBe(true);
    expect(isCompleteCanadianPostalCode('J6A1L3')).toBe(true);
    expect(isCompleteCanadianPostalCode('J6A 1L')).toBe(false);
  });

  it('normalise la recherche avant détection', () => {
    expect(normalizeSearchQuery('  j6a1l3  ')).toBe('J6A 1L3');
    expect(normalizeSearchQuery('  123   rue Notre-Dame  ')).toBe(
      '123 rue Notre-Dame'
    );
  });

  it('détecte correctement code postal, adresse et ville', () => {
    expect(detectSearchInputType('J6A1L3')).toBe('postalCode');
    expect(detectSearchInputType('123 rue Notre-Dame, Repentigny')).toBe(
      'address'
    );
    expect(detectSearchInputType('Repentigny')).toBe('city');
  });
});
