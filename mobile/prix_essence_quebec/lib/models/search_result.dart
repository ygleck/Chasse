import 'fuel_type.dart';
import 'search_location.dart';
import 'station.dart';

class SearchDatasetSnapshot {
  const SearchDatasetSnapshot({
    required this.sourceUrl,
    required this.detectionStrategy,
    required this.fetchedAt,
    required this.generatedAt,
    required this.stale,
    required this.cacheBackend,
  });

  final String sourceUrl;
  final String detectionStrategy;
  final DateTime? fetchedAt;
  final DateTime? generatedAt;
  final bool stale;
  final String cacheBackend;

  factory SearchDatasetSnapshot.fromJson(Map<String, dynamic> json) {
    return SearchDatasetSnapshot(
      sourceUrl: json['sourceUrl'] as String? ?? '',
      detectionStrategy: json['detectionStrategy'] as String? ?? 'unknown',
      fetchedAt: DateTime.tryParse(json['fetchedAt'] as String? ?? ''),
      generatedAt: DateTime.tryParse(json['generatedAt'] as String? ?? ''),
      stale: json['stale'] as bool? ?? false,
      cacheBackend: json['cacheBackend'] as String? ?? 'memory',
    );
  }
}

class SearchResultModel {
  const SearchResultModel({
    required this.bestOption,
    required this.stationsInRadius,
    required this.topStations,
    required this.averagePrice,
    required this.selectedFuel,
    required this.selectedFuelLabel,
    required this.requestedRadiusKm,
    required this.effectiveRadiusKm,
    required this.radiusExpanded,
    required this.message,
    required this.resolvedLocation,
    required this.dataset,
  });

  final Station? bestOption;
  final List<Station> stationsInRadius;
  final List<Station> topStations;
  final double? averagePrice;
  final FuelType selectedFuel;
  final String selectedFuelLabel;
  final int requestedRadiusKm;
  final int effectiveRadiusKm;
  final bool radiusExpanded;
  final String? message;
  final SearchLocation resolvedLocation;
  final SearchDatasetSnapshot dataset;

  factory SearchResultModel.fromJson(Map<String, dynamic> json) {
    List<Station> stationsFromKey(String key) {
      final raw = json[key] as List<dynamic>? ?? const [];
      return raw
          .map((item) => Station.fromJson(item as Map<String, dynamic>))
          .toList(growable: false);
    }

    return SearchResultModel(
      bestOption: json['bestOption'] == null
          ? null
          : Station.fromJson(json['bestOption'] as Map<String, dynamic>),
      stationsInRadius: stationsFromKey('stationsInRadius'),
      topStations: stationsFromKey('topStations'),
      averagePrice: (json['averagePrice'] as num?)?.toDouble(),
      selectedFuel: FuelType.fromApi(json['selectedFuel'] as String?),
      selectedFuelLabel: json['selectedFuelLabel'] as String? ?? 'Toutes',
      requestedRadiusKm: (json['requestedRadiusKm'] as num?)?.toInt() ?? 20,
      effectiveRadiusKm: (json['effectiveRadiusKm'] as num?)?.toInt() ?? 20,
      radiusExpanded: json['radiusExpanded'] as bool? ?? false,
      message: json['message'] as String?,
      resolvedLocation: SearchLocation.fromJson(
        json['resolvedLocation'] as Map<String, dynamic>,
      ),
      dataset: SearchDatasetSnapshot.fromJson(
        json['dataset'] as Map<String, dynamic>,
      ),
    );
  }
}
