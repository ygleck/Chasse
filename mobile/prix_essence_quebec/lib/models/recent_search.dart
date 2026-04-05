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
    return RecentSearch(
      id:
          '${request.query ?? result.resolvedLocation.label}-${result.resolvedLocation.latitude}-${result.resolvedLocation.longitude}-${request.fuelType.apiValue}-${request.radiusKm}',
      label: result.resolvedLocation.label,
      query: request.query,
      latitude: result.resolvedLocation.latitude,
      longitude: result.resolvedLocation.longitude,
      fuelType: request.fuelType,
      radiusKm: request.radiusKm,
    );
  }
}
