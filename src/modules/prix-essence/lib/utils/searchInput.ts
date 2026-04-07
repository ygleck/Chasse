import type { SearchInputType } from '../../types';

const COMPLETE_CANADIAN_POSTAL_CODE_REGEX =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

const ADDRESS_KEYWORD_REGEX =
  /\b(rue|avenue|av\.?|boulevard|boul\.?|chemin|ch\.?|route|rang|place|square|terrasse|impasse|allee|allée|autoroute|road|street|drive|lane|court)\b/i;

function compactPostalCode(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function normalizePostalCode(value: string): string {
  const compact = compactPostalCode(value);

  if (compact.length <= 3) {
    return compact;
  }

  return `${compact.slice(0, 3)} ${compact.slice(3, 6)}`.trim();
}

export function isCompleteCanadianPostalCode(value: string): boolean {
  return COMPLETE_CANADIAN_POSTAL_CODE_REGEX.test(value.trim());
}

export function looksLikePostalCodeCandidate(value: string): boolean {
  const compact = compactPostalCode(value);

  if (!compact || compact.length > 6) {
    return false;
  }

  for (let index = 0; index < compact.length; index += 1) {
    const character = compact[index];
    const expectsLetter = index % 2 === 0;

    if (expectsLetter && !/[A-Z]/.test(character)) {
      return false;
    }

    if (!expectsLetter && !/\d/.test(character)) {
      return false;
    }
  }

  return true;
}

export function normalizeSearchQuery(value: string): string {
  const collapsed = value.trim().replace(/\s+/g, ' ');

  if (!collapsed) {
    return '';
  }

  if (looksLikePostalCodeCandidate(collapsed)) {
    return normalizePostalCode(collapsed);
  }

  return collapsed;
}

export function detectSearchInputType(value: string): SearchInputType {
  const normalized = normalizeSearchQuery(value);

  if (looksLikePostalCodeCandidate(normalized)) {
    return 'postalCode';
  }

  if (/\d/.test(normalized) || ADDRESS_KEYWORD_REGEX.test(normalized) || normalized.includes(',')) {
    return 'address';
  }

  return 'city';
}

export function buildSearchQueryKey(value: string): string {
  return normalizeSearchQuery(value).toLowerCase();
}
