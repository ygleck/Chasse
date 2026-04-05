import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../models/favorite_station.dart';
import '../../models/fuel_type.dart';
import '../../models/recent_search.dart';
import '../../models/search_preferences.dart';
import '../../models/station.dart';

class LocalStorageService {
  const LocalStorageService(this._preferences);

  static const int recentSearchLimit = 8;

  static const _favoritesKey = 'favorites';
  static const _recentSearchesKey = 'recent_searches';
  static const _selectedFuelKey = 'selected_fuel';
  static const _selectedRadiusKey = 'selected_radius';

  final SharedPreferences _preferences;

  SearchPreferences readPreferences({required int defaultRadiusKm}) {
    return SearchPreferences(
      fuelType: FuelType.fromApi(_preferences.getString(_selectedFuelKey)),
      radiusKm: _preferences.getInt(_selectedRadiusKey) ?? defaultRadiusKm,
    );
  }

  Future<void> writePreferences(SearchPreferences preferences) async {
    await _preferences.setString(
      _selectedFuelKey,
      preferences.fuelType.apiValue,
    );
    await _preferences.setInt(_selectedRadiusKey, preferences.radiusKm);
  }

  List<FavoriteStation> readFavorites() {
    return _decodeList(
      _favoritesKey,
      FavoriteStation.fromJson,
    );
  }

  Future<List<FavoriteStation>> toggleFavorite(Station station) async {
    final current = readFavorites();
    final exists = current.any((item) => item.stationId == station.id);
    final next = exists
        ? current.where((item) => item.stationId != station.id).toList()
        : <FavoriteStation>[
            FavoriteStation.fromStation(station),
            ...current,
          ];

    await _writeList(
      _favoritesKey,
      next.map((item) => item.toJson()).toList(growable: false),
    );

    return next;
  }

  Future<List<FavoriteStation>> removeFavorite(String stationId) async {
    final next = readFavorites()
        .where((item) => item.stationId != stationId)
        .toList();

    await _writeList(
      _favoritesKey,
      next.map((item) => item.toJson()).toList(growable: false),
    );

    return next;
  }

  Future<List<FavoriteStation>> refreshFavoritesFromStations(
    Iterable<Station> stations,
  ) async {
    final current = readFavorites();
    if (current.isEmpty) {
      return current;
    }

    final stationMap = {
      for (final station in stations) station.id: station,
    };

    final next = current
        .map((favorite) {
          final live = stationMap[favorite.stationId];
          return live == null ? favorite : favorite.mergeStation(live);
        })
        .toList(growable: false);

    await _writeList(
      _favoritesKey,
      next.map((item) => item.toJson()).toList(growable: false),
    );

    return next;
  }

  List<RecentSearch> readRecentSearches() {
    return _decodeList(
      _recentSearchesKey,
      RecentSearch.fromJson,
    );
  }

  Future<List<RecentSearch>> saveRecentSearch(RecentSearch item) async {
    final current = readRecentSearches();
    final filtered = current.where((entry) => entry.id != item.id).toList();
    final next = <RecentSearch>[item, ...filtered]
        .take(recentSearchLimit)
        .toList(growable: false);

    await _writeList(
      _recentSearchesKey,
      next.map((entry) => entry.toJson()).toList(growable: false),
    );

    return next;
  }

  List<T> _decodeList<T>(
    String key,
    T Function(Map<String, dynamic>) parser,
  ) {
    final raw = _preferences.getString(key);
    if (raw == null || raw.isEmpty) {
      return const [];
    }

    final decoded = jsonDecode(raw);
    if (decoded is! List<dynamic>) {
      return const [];
    }

    return decoded
        .whereType<Map<String, dynamic>>()
        .map(parser)
        .toList(growable: false);
  }

  Future<void> _writeList(String key, List<Map<String, dynamic>> values) {
    return _preferences.setString(key, jsonEncode(values));
  }
}
