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
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const mapRef = useRef(null);
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

  /**
   * Recherche par adresse
   */
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setError('Veuillez entrer une adresse ou un code postal');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Géocoder l'adresse
      const geocodeRes = await fetch(
        `${API_ENDPOINTS.geocode}?query=${encodeURIComponent(searchQuery)}`
      );

      if (!geocodeRes.ok) {
        const errData = await geocodeRes.json();
        throw new Error(errData.message || 'Géocodage échoué');
      }

      const { data: location } = await geocodeRes.json();

      // Rechercher les stations
      const searchRes = await fetch(
        `${API_ENDPOINTS.search}?latitude=${location.latitude}&longitude=${location.longitude}&radius=${selectedRadius}&fuelType=${selectedFuel}`
      );

      if (!searchRes.ok) {
        const errData = await searchRes.json();
        throw new Error(errData.message || 'Recherche échouée');
      }

      const { data } = await searchRes.json();
      setResults(data);

      // Ajouter à l'historique
      addToHistory({
        query: searchQuery,
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
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedFuel, selectedRadius]);

  /**
   * Géolocalisation
   */
  const handleGeolocate = useCallback(() => {
    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });

        performSearch(latitude, longitude, selectedFuel, selectedRadius);
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
  }, [selectedFuel, selectedRadius]);

  /**
   * Effectue la recherche
   */
  const performSearch = useCallback(
    async (lat, lon, fuel, radius) => {
      try {
        const res = await fetch(
          `${API_ENDPOINTS.search}?latitude=${lat}&longitude=${lon}&radius=${radius}&fuelType=${fuel}`
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message);
        }

        const { data } = await res.json();
        setResults(data);

        if (mapRef.current) {
          updateMap(lat, lon, data.topStations);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur recherche');
      } finally {
        setIsLoading(false);
      }
    },
    []
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
          <div className="search-box">
            <label>Adresse ou Code Postal</label>
            <input
              type="text"
              className="search-input"
              placeholder="Ex: 123 Rue principale, H1H 1H1, Montréal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
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
