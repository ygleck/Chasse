/**
 * Composant Principal: PrixEssenceApp
 * Gère l'interface complète de recherche de prix essence
 * 100% autonome et portable
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { PRIX_ESSENCE_CONFIG, API_ENDPOINTS } from '../config';
import { FuelType, FUEL_TYPE_LABELS, RADIUS_LABELS } from '../types';
import { formatPrice, formatDistance, formatLocation } from '../lib/utils/formatting';
import {
  detectSearchInputType,
  isCompleteCanadianPostalCode,
  normalizeSearchQuery,
} from '../lib/utils/searchInput';
import {
  fetchAutocompleteSuggestions,
  matchesSelectedSuggestion,
  resolveSearchLocation,
  SearchAssistError,
} from '../lib/geo/searchAssist';
import {
  addToHistory,
  getPreferences,
  updatePreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '../lib/utils/storage';

const MAP_PROVIDER_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export default function PrixEssenceApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuel, setSelectedFuel] = useState(FuelType.ALL);
  const [selectedRadius, setSelectedRadius] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [suggestionMessage, setSuggestionMessage] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const mapRef = useRef(null);
  const searchBoxRef = useRef(null);
  const searchInputRef = useRef(null);
  const autocompleteRequestRef = useRef(0);
  const [activeStationId, setActiveStationId] = useState(null);

  // Charger les préférences au montage
  useEffect(() => {
    const prefs = getPreferences();
    setSelectedFuel(prefs.preferredFuel);
    setSelectedRadius(prefs.preferredRadius);
  }, []);

  // Initialiser la carte
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current && document.getElementById('map')) {
        const script = document.createElement('script');
        script.src = MAP_PROVIDER_URL;
        script.async = true;
        script.onload = () => {
          const L = window.L;
          const map = L.map('map').setView([45.5017, -73.5673], 13);

          L.tileLayer(PRIX_ESSENCE_CONFIG.MAP.osmTile, {
            attribution: PRIX_ESSENCE_CONFIG.MAP.osmAttribution,
            maxZoom: PRIX_ESSENCE_CONFIG.MAP.maxZoom,
          }).addTo(map);

          mapRef.current = {
            L,
            map,
            markers: [],
          };
        };
        document.head.appendChild(script);
      }
    };

    initMap();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    const inputType = detectSearchInputType(normalizedQuery);

    if (
      !normalizedQuery ||
      matchesSelectedSuggestion(normalizedQuery, selectedSuggestion) ||
      inputType === 'postalCode' ||
      normalizedQuery.length < PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.minAutocompleteChars
    ) {
      setSuggestions([]);
      setSuggestionMessage('');
      setIsSuggesting(false);
      setIsSuggestionOpen(false);
      setActiveSuggestionIndex(-1);
      return undefined;
    }

    const requestId = autocompleteRequestRef.current + 1;
    autocompleteRequestRef.current = requestId;
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setIsSuggesting(true);
      setSuggestionMessage('');

      try {
        const nextSuggestions = await fetchAutocompleteSuggestions(normalizedQuery, {
          signal: controller.signal,
        });

        if (autocompleteRequestRef.current !== requestId || controller.signal.aborted) {
          return;
        }

        setSuggestions(nextSuggestions);
        setSuggestionMessage(
          nextSuggestions.length === 0 ? 'Aucune suggestion trouvée.' : ''
        );
        setIsSuggestionOpen(true);
        setActiveSuggestionIndex(nextSuggestions.length > 0 ? 0 : -1);
      } catch (err) {
        if (controller.signal.aborted || autocompleteRequestRef.current !== requestId) {
          return;
        }

        setSuggestions([]);
        setSuggestionMessage(
          'Service de suggestions temporairement indisponible.'
        );
        setIsSuggestionOpen(true);
        setActiveSuggestionIndex(-1);
      } finally {
        if (autocompleteRequestRef.current === requestId && !controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, PRIX_ESSENCE_CONFIG.SEARCH_ASSIST.debounceMs);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, selectedSuggestion]);

  const handleSuggestionSelect = useCallback((suggestion) => {
    setSearchQuery(suggestion.label);
    setSelectedSuggestion(suggestion);
    setSuggestions([]);
    setSuggestionMessage('');
    setIsSuggestionOpen(false);
    setActiveSuggestionIndex(-1);
    setError(null);
  }, []);

  const handleSearchInputChange = useCallback(
    (event) => {
      const rawValue = event.target.value;
      const nextValue =
        detectSearchInputType(rawValue) === 'postalCode'
          ? normalizeSearchQuery(rawValue)
          : rawValue;

      setSearchQuery(nextValue);
      setError(null);

      if (!selectedSuggestion || nextValue === selectedSuggestion.label) {
        return;
      }

      setSelectedSuggestion(null);
    },
    [selectedSuggestion]
  );

  const searchStations = useCallback(async (lat, lon, fuel, radius) => {
    const response = await fetch(
      `${API_ENDPOINTS.search}?latitude=${lat}&longitude=${lon}&radius=${radius}&fuelType=${fuel}`
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || 'Recherche échouée');
    }

    const { data } = await response.json();
    return data;
  }, []);

  /**
   * Recherche par adresse
   */
  const handleSearch = useCallback(async () => {
    const normalizedQuery = normalizeSearchQuery(searchQuery);
    const inputType = detectSearchInputType(normalizedQuery);

    if (!normalizedQuery) {
      setError('Veuillez entrer une adresse, une ville ou un code postal.');
      return;
    }

    if (inputType === 'postalCode' && !isCompleteCanadianPostalCode(normalizedQuery)) {
      setSearchQuery(normalizedQuery);
      setError('Code postal invalide. Utilisez un format comme H2X 1Y4.');
      return;
    }

    setSearchQuery(normalizedQuery);
    setIsLoading(true);
    setError(null);
    setIsSuggestionOpen(false);

    try {
      const location = matchesSelectedSuggestion(normalizedQuery, selectedSuggestion)
        ? {
            latitude: selectedSuggestion.latitude,
            longitude: selectedSuggestion.longitude,
            displayName: selectedSuggestion.label,
            city: selectedSuggestion.city,
            postalCode: selectedSuggestion.postalCode,
          }
        : await resolveSearchLocation(normalizedQuery);

      const data = await searchStations(
        location.latitude,
        location.longitude,
        selectedFuel,
        selectedRadius
      );

      setResults(data);
      setActiveStationId(data.bestOption?.id || data.topStations?.[0]?.id || null);

      // Ajouter à l'historique
      addToHistory({
        query:
          matchesSelectedSuggestion(normalizedQuery, selectedSuggestion)
            ? selectedSuggestion.label
            : normalizedQuery,
        latitude: location.latitude,
        longitude: location.longitude,
        fuelType: selectedFuel,
        radius: selectedRadius,
      });

      // Mettre à jour la carte
      if (mapRef.current) {
        updateMap(location.latitude, location.longitude, data.topStations);
      }
    } catch (err) {
      if (err instanceof SearchAssistError) {
        setError(err.message);
        return;
      }

      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchStations, selectedFuel, selectedRadius, selectedSuggestion]);

  /**
   * Géolocalisation
   */
  const handleGeolocate = useCallback(() => {
    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        try {
          const data = await searchStations(
            latitude,
            longitude,
            selectedFuel,
            selectedRadius
          );

          setResults(data);
          setActiveStationId(data.bestOption?.id || data.topStations?.[0]?.id || null);

          if (mapRef.current) {
            updateMap(latitude, longitude, data.topStations);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Erreur recherche');
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        setIsLoading(false);
        const messages = {
          '1': 'Accès à votre position refusé',
          '2': 'Géolocalisation indisponible',
          '3': 'Délai d\'attente dépassé',
        };
        setError(messages[String(err.code)] || 'Erreur géolocalisation');
      }
    );
  }, [searchStations, selectedFuel, selectedRadius]);

  const handleSearchInputKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        setIsSuggestionOpen(false);
        setActiveSuggestionIndex(-1);
        return;
      }

      if (isSuggestionOpen && suggestions.length > 0) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActiveSuggestionIndex((currentIndex) =>
            currentIndex >= suggestions.length - 1 ? 0 : currentIndex + 1
          );
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActiveSuggestionIndex((currentIndex) =>
            currentIndex <= 0 ? suggestions.length - 1 : currentIndex - 1
          );
          return;
        }

        if (event.key === 'Enter' && activeSuggestionIndex >= 0) {
          event.preventDefault();
          handleSuggestionSelect(suggestions[activeSuggestionIndex]);
          return;
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        handleSearch();
      }
    },
    [
      activeSuggestionIndex,
      handleSearch,
      handleSuggestionSelect,
      isSuggestionOpen,
      suggestions,
    ]
  );

  /**
   * Met à jour la carte avec marqueurs
   */
  const updateMap = (lat, lon, stations) => {
    if (!mapRef.current) return;

    const { L, map, markers } = mapRef.current;

    // Effacer les anciens marqueurs
    markers.forEach((m) => map.removeLayer(m));
    mapRef.current.markers = [];

    // Ajouter marqueur pour l'utilisateur
    L.circleMarker([lat, lon], {
      radius: 8,
      fillColor: '#ff6b35',
      color: '#fff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8,
    })
      .addTo(map)
      .bindPopup('Votre position');

    // Ajouter marqueurs pour les stations
    stations.forEach((station) => {
      const marker = L.marker([station.latitude, station.longitude])
        .addTo(map)
        .bindPopup(
          `<div style="font-weight: bold">${station.stationName}</div><div>${formatPrice(station.priceForFuel)}</div>`
        );

      marker.on('click', () => {
        setActiveStationId(station.id);
      });

      mapRef.current.markers.push(marker);
    });

    // Centrer la vue
    const bounds = L.latLngBounds([[lat, lon], ...stations.map((s) => [s.latitude, s.longitude])]);
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  /**
   * Ajouter/retirer des favoris
   */
  const toggleFavorite = (station) => {
    if (isFavorite(station.id)) {
      removeFavorite(station.id);
    } else {
      addFavorite({
        stationId: station.id,
        stationName: station.stationName,
      });
    }
    // Force re-render
    setActiveStationId(station.id);
  };

  const normalizedQueryPreview = normalizeSearchQuery(searchQuery);
  const currentInputType = normalizedQueryPreview
    ? detectSearchInputType(normalizedQueryPreview)
    : null;
  const searchHint =
    currentInputType === 'postalCode'
      ? 'Code postal détecté. Il sera automatiquement reformatté avant la recherche.'
      : currentInputType === 'address'
      ? 'Adresse détectée. Sélectionnez une suggestion pour utiliser ses coordonnées exactes.'
      : currentInputType === 'city'
      ? 'Ville détectée. Vous pouvez choisir une suggestion ou lancer la recherche.'
      : '';

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>📍 Prix Essence Québec</h1>
        <p>Trouvez les meilleures stations près de chez vous</p>
      </div>

      {/* Main Layout */}
      <div className="container">
        {/* Search Panel */}
        <div className="search-panel">
          <div className="search-box" ref={searchBoxRef}>
            <label>Adresse ou Code Postal</label>
            <div className="search-input-shell">
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Ex: 123 Rue principale, H1H 1H1, Montréal"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchInputKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0 || suggestionMessage) {
                    setIsSuggestionOpen(true);
                  }
                }}
                autoComplete="off"
                spellCheck="false"
                aria-expanded={isSuggestionOpen}
                aria-autocomplete="list"
                aria-controls="prix-essence-suggestions"
              />
              {(isSuggesting || isLoading) && <span className="search-input-loader" />}
            </div>

            {searchHint && <div className="search-hint">{searchHint}</div>}

            {isSuggestionOpen && (
              <div className="suggestions-dropdown" id="prix-essence-suggestions">
                {suggestions.length > 0 ? (
                  <ul className="suggestions-list" role="listbox">
                    {suggestions.map((suggestion, index) => (
                      <li key={suggestion.id}>
                        <button
                          type="button"
                          className={`suggestion-item ${
                            index === activeSuggestionIndex ? 'is-active' : ''
                          }`}
                          aria-selected={index === activeSuggestionIndex}
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <span className="suggestion-copy">
                            <span className="suggestion-primary">
                              {suggestion.primaryText}
                            </span>
                            {suggestion.secondaryText && (
                              <span className="suggestion-secondary">
                                {suggestion.secondaryText}
                              </span>
                            )}
                          </span>
                          <span className="suggestion-badge">
                            {suggestion.inputType === 'address' ? 'Adresse' : 'Lieu'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="suggestions-empty">
                    {isSuggesting ? 'Recherche de suggestions…' : suggestionMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="button-group">
            <button className="button button-primary" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <span className="loader" /> : '🔍 Rechercher'}
            </button>
            <button className="button button-secondary" onClick={handleGeolocate} disabled={isLoading}>
              📍 {isLoading ? 'Localisation...' : 'Ma Position'}
            </button>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <label>Type de Carburant</label>
              <select
                className="select"
                value={selectedFuel}
                onChange={(e) => {
                  const fuel = e.target.value;
                  setSelectedFuel(fuel);
                  updatePreferences(fuel, selectedRadius);
                }}
              >
                {Object.entries(FUEL_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Rayon de Recherche</label>
              <select
                className="select"
                value={selectedRadius}
                onChange={(e) => {
                  const radius = parseInt(e.target.value, 10);
                  setSelectedRadius(radius);
                  updatePreferences(selectedFuel, radius);
                }}
              >
                {Object.entries(RADIUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">⚠️ {error}</div>}
        </div>

        {/* Map */}
        <div className="map-container">
          <div id="map"></div>
        </div>
      </div>

      {/* Results Panel */}
      {results && (
        <div className="results-panel">
          {/* Best Option */}
          {results.bestOption && (
            <div className="best-option">
              <h3>🏆 Meilleure Option</h3>
              <p><strong>{results.bestOption.stationName}</strong></p>
              <p>{results.bestOption.banner}</p>
              <p>{formatDistance(results.bestOption.distance || 0)}</p>
              <div className="price-badge">{formatPrice(results.bestOption.priceForFuel)}</div>
            </div>
          )}

          {/* Top 10 Stations */}
          <div className="station-list">
            <h3 style={{ padding: '0 0.5rem', marginTop: '1rem' }}>🔝 Top 10 Stations</h3>
            {results.topStations.map((station, idx) => (
              <div
                key={station.id}
                className={`station-card ${activeStationId === station.id ? 'active' : ''}`}
                onClick={() => setActiveStationId(station.id)}
              >
                <div className="station-name">
                  #{idx + 1} {station.stationName}
                </div>
                <div className="station-details">
                  <div className="detail-item">
                    <span className="detail-label">Prix:</span>
                    <span>{formatPrice(station.priceForFuel)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Distance:</span>
                    <span>{formatDistance(station.distance || 0)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Score:</span>
                    <span>{Math.round(station.score)}/100</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Économie:</span>
                    <span>{formatPrice((station.savingsVsAverage / 100) || 0)}</span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-label">Adresse:</span>
                    <span>{station.address1}</span>
                  </div>
                  <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="detail-label">Ville:</span>
                    <span>{formatLocation(station.city, station.postalCode)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !isLoading && !error && (
        <div className="empty-state">
          <p>👉 Entrez une adresse ou utilisez votre géolocalisation pour commencer</p>
        </div>
      )}

      {/* Attribution */}
      <div className="attribution">
        <p>📊 Données issues de la Régie de l'énergie du Québec. Prix et disponibilité peuvent varier.</p>
      </div>
    </div>
  );
}
