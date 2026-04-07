import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:prix_essence_quebec/models/fuel_type.dart';
import 'package:prix_essence_quebec/models/recent_search.dart';
import 'package:prix_essence_quebec/services/storage/local_storage_service.dart';

void main() {
  setUp(() {
    SharedPreferences.setMockInitialValues({});
  });

  test(
    'readRecentSearches deduplicates repeated Ma position entries',
    () async {
      SharedPreferences.setMockInitialValues({
        'recent_searches': jsonEncode([
          {
            'id': 'ma-position-2',
            'label': 'Ma position',
            'query': null,
            'latitude': 45.5020,
            'longitude': -73.5700,
            'fuelType': 'regular',
            'radiusKm': 5,
          },
          {
            'id': 'ma-position-1',
            'label': 'Ma position',
            'query': null,
            'latitude': 45.5010,
            'longitude': -73.5690,
            'fuelType': 'regular',
            'radiusKm': 20,
          },
          {
            'id': 'montreal',
            'label': 'Montréal',
            'query': 'Montreal',
            'latitude': 45.5019,
            'longitude': -73.5674,
            'fuelType': 'regular',
            'radiusKm': 10,
          },
        ]),
      });

      final preferences = await SharedPreferences.getInstance();
      final storage = LocalStorageService(preferences);

      final recentSearches = storage.readRecentSearches();

      expect(recentSearches, hasLength(2));
      expect(recentSearches.first.label, 'Ma position');
      expect(recentSearches.first.latitude, 45.5020);
      expect(recentSearches.first.radiusKm, 5);
    },
  );

  test(
    'saveRecentSearch keeps only the latest version of the same query',
    () async {
      final preferences = await SharedPreferences.getInstance();
      final storage = LocalStorageService(preferences);

      await storage.saveRecentSearch(
        const RecentSearch(
          id: 'old',
          label: 'Montréal',
          query: 'Montreal',
          latitude: 45.5017,
          longitude: -73.5673,
          fuelType: FuelType.regular,
          radiusKm: 20,
        ),
      );

      final recentSearches = await storage.saveRecentSearch(
        const RecentSearch(
          id: 'new',
          label: 'Montréal',
          query: '  montreal  ',
          latitude: 45.5025,
          longitude: -73.5681,
          fuelType: FuelType.diesel,
          radiusKm: 10,
        ),
      );

      expect(recentSearches, hasLength(1));
      expect(recentSearches.single.id, 'new');
      expect(recentSearches.single.fuelType, FuelType.diesel);
      expect(recentSearches.single.radiusKm, 10);
    },
  );
}
