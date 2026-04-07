import 'fuel_type.dart';
import 'search_request.dart';
import 'search_result.dart';

class RecentSearch {
  const RecentSearch({
    required this.id,
    required this.label,
    required this.query,
    required this.latitude,
    required this.longitude,
    required this.fuelType,
    required this.radiusKm,
  });

  final String id;
  final String label;
  final String? query;
  final double latitude;
  final double longitude;
  final FuelType fuelType;
  final int radiusKm;

  String get deduplicationKey {
    final normalizedQuery = _normalizeSearchKey(query);
    if (normalizedQuery.isNotEmpty) {
      return 'query:$normalizedQuery';
    }

    final normalizedLabel = _normalizeSearchKey(label);
    if (normalizedLabel.isNotEmpty) {
      return 'label:$normalizedLabel';
    }

    return 'coords:${latitude.toStringAsFixed(4)},${longitude.toStringAsFixed(4)}';
  }

  factory RecentSearch.fromJson(Map<String, dynamic> json) {
    return RecentSearch(
      id: json['id'] as String,
      label: json['label'] as String? ?? '',
      query: json['query'] as String?,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      fuelType: FuelType.fromApi(json['fuelType'] as String?),
      radiusKm: (json['radiusKm'] as num?)?.toInt() ?? 20,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'query': query,
      'latitude': latitude,
      'longitude': longitude,
      'fuelType': fuelType.apiValue,
      'radiusKm': radiusKm,
    };
  }

  factory RecentSearch.fromSearch({
    required SearchRequest request,
    required SearchResultModel result,
  }) {
    final label = result.resolvedLocation.label;
    final query = request.query;

    return RecentSearch(
      id: _buildDeduplicationKey(
        label: label,
        query: query,
        latitude: result.resolvedLocation.latitude,
        longitude: result.resolvedLocation.longitude,
      ),
      label: label,
      query: query,
      latitude: result.resolvedLocation.latitude,
      longitude: result.resolvedLocation.longitude,
      fuelType: request.fuelType,
      radiusKm: request.radiusKm,
    );
  }

  static String _buildDeduplicationKey({
    required String label,
    required String? query,
    required double latitude,
    required double longitude,
  }) {
    final normalizedQuery = _normalizeSearchKey(query);
    if (normalizedQuery.isNotEmpty) {
      return 'query:$normalizedQuery';
    }

    final normalizedLabel = _normalizeSearchKey(label);
    if (normalizedLabel.isNotEmpty) {
      return 'label:$normalizedLabel';
    }

    return 'coords:${latitude.toStringAsFixed(4)},${longitude.toStringAsFixed(4)}';
  }

  static String _normalizeSearchKey(String? value) {
    return (value ?? '').trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
  }
}
