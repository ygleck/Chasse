import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../models/favorite_station.dart';
import '../../../models/fuel_type.dart';
import '../../../models/recent_search.dart';
import '../../../models/search_location.dart';
import '../../../models/search_preferences.dart';
import '../../../models/search_request.dart';
import '../../../models/station.dart';
import '../../../providers/app_providers.dart';
import '../../../services/api/api_exception.dart';
import '../../../services/location/location_service.dart';
import 'home_state.dart';

class HomeController extends Notifier<HomeState> {
  bool _statusRequested = false;

  @override
  HomeState build() {
    final storage = ref.read(localStorageServiceProvider);
    final appConfig = ref.read(appConfigProvider);
    final preferences = storage.readPreferences(
      defaultRadiusKm: appConfig.defaultRadiusKm,
    );

    final initialState = HomeState.initial(
      fuelType: preferences.fuelType,
      radiusKm: preferences.radiusKm,
      recentSearches: storage.readRecentSearches(),
      favorites: storage.readFavorites(),
    );

    if (!_statusRequested) {
      _statusRequested = true;
      Future<void>.microtask(_loadStatus);
    }

    return initialState;
  }

  Future<void> _loadStatus() async {
    try {
      final status = await ref.read(prixEssenceApiServiceProvider).fetchStatus();
      state = state.copyWith(status: status);
    } catch (_) {
      // Le statut sert surtout à enrichir l'UI. On garde l'app utilisable même s'il échoue.
    }
  }

  void setQuery(String value) {
    state = state.copyWith(
      query: value,
      errorMessage: null,
    );
  }

  Future<void> setFuelType(FuelType value) async {
    state = state.copyWith(
      fuelType: value,
      errorMessage: null,
    );
    await _persistPreferences();
    await _rerunCurrentSearch();
  }

  Future<void> setRadiusKm(int value) async {
    state = state.copyWith(
      radiusKm: value,
      errorMessage: null,
    );
    await _persistPreferences();
    await _rerunCurrentSearch();
  }

  Future<void> searchFromQuery([String? rawQuery]) async {
    final query = (rawQuery ?? state.query).trim();
    if (query.isEmpty) {
      state = state.copyWith(
        errorMessage:
            'Entre une adresse, un code postal ou une ville pour lancer la recherche.',
      );
      return;
    }

    state = state.copyWith(query: query);

    await _executeSearch(
      SearchRequest(
        query: query,
        fuelType: state.fuelType,
        radiusKm: state.radiusKm,
      ),
    );
  }

  Future<void> searchFromCurrentLocation() async {
    state = state.copyWith(
      isLocating: true,
      errorMessage: null,
    );

    try {
      final location = await ref.read(locationServiceProvider).getCurrentLocation();
      await _executeSearch(
        SearchRequest(
          location: location,
          fuelType: state.fuelType,
          radiusKm: state.radiusKm,
        ),
      );
    } on LocationServiceException catch (error) {
      state = state.copyWith(errorMessage: error.message);
    } finally {
      state = state.copyWith(isLocating: false);
    }
  }

  Future<void> applyRecentSearch(RecentSearch recentSearch) async {
    state = state.copyWith(
      query: recentSearch.query ?? '',
      fuelType: recentSearch.fuelType,
      radiusKm: recentSearch.radiusKm,
      errorMessage: null,
    );

    await _persistPreferences();

    final request = recentSearch.query != null
        ? SearchRequest(
            query: recentSearch.query,
            fuelType: recentSearch.fuelType,
            radiusKm: recentSearch.radiusKm,
          )
        : SearchRequest(
            location: recentSearch.toSearchLocation(),
            fuelType: recentSearch.fuelType,
            radiusKm: recentSearch.radiusKm,
          );

    await _executeSearch(request);
  }

  Future<void> toggleFavorite(Station station) async {
    final favorites = await ref.read(localStorageServiceProvider).toggleFavorite(station);
    state = state.copyWith(favorites: favorites);
  }

  Future<void> removeFavorite(String stationId) async {
    final favorites =
        await ref.read(localStorageServiceProvider).removeFavorite(stationId);
    state = state.copyWith(favorites: favorites);
  }

  void selectStation(String stationId) {
    state = state.copyWith(selectedStationId: stationId);
  }

  Station? findFavoriteLiveStation(FavoriteStation favorite) {
    final result = state.result;
    if (result == null) {
      return null;
    }

    return result.stationsInRadius.where((station) => station.id == favorite.stationId).firstOrNull;
  }

  Future<void> _executeSearch(SearchRequest request) async {
    state = state.copyWith(
      isSearching: true,
      errorMessage: null,
    );

    try {
      final result = await ref.read(prixEssenceApiServiceProvider).search(request);
      final recentSearches = await ref.read(localStorageServiceProvider).saveRecentSearch(
            RecentSearch.fromSearch(
              request: request,
              result: result,
            ),
          );

      final favorites = await ref
          .read(localStorageServiceProvider)
          .refreshFavoritesFromStations(result.stationsInRadius);

      state = state.copyWith(
        result: result,
        recentSearches: recentSearches,
        favorites: favorites,
        selectedStationId: result.bestOption?.id ??
            (result.topStations.isNotEmpty ? result.topStations.first.id : null),
        isSearching: false,
        errorMessage: null,
        lastRequest: request,
      );
    } on ApiException catch (error) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: error.message,
      );
    } catch (_) {
      state = state.copyWith(
        isSearching: false,
        errorMessage: 'Une erreur inattendue est survenue.',
      );
    }
  }

  Future<void> _persistPreferences() {
    return ref.read(localStorageServiceProvider).writePreferences(
          SearchPreferences(
            fuelType: state.fuelType,
            radiusKm: state.radiusKm,
          ),
        );
  }

  Future<void> _rerunCurrentSearch() async {
    final lastRequest = state.lastRequest;
    if (lastRequest == null || state.isSearching) {
      return;
    }

    await _executeSearch(
      lastRequest.copyWith(
        fuelType: state.fuelType,
        radiusKm: state.radiusKm,
      ),
    );
  }
}

extension on RecentSearch {
  SearchLocation toSearchLocation() {
    return SearchLocation(
      latitude: latitude,
      longitude: longitude,
      label: label,
      source: 'recent',
    );
  }
}

extension on Iterable<Station> {
  Station? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) {
      return null;
    }
    return iterator.current;
  }
}
