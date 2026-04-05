import 'fuel_type.dart';
import 'search_location.dart';

class SearchRequest {
  const SearchRequest({
    this.query,
    this.location,
    required this.fuelType,
    required this.radiusKm,
  });

  final String? query;
  final SearchLocation? location;
  final FuelType fuelType;
  final int radiusKm;

  SearchRequest copyWith({
    String? query,
    SearchLocation? location,
    FuelType? fuelType,
    int? radiusKm,
  }) {
    return SearchRequest(
      query: query ?? this.query,
      location: location ?? this.location,
      fuelType: fuelType ?? this.fuelType,
      radiusKm: radiusKm ?? this.radiusKm,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (query != null && query!.trim().isNotEmpty) 'query': query!.trim(),
      if (location != null) 'location': location!.toJson(),
      'fuelType': fuelType.apiValue,
      'radiusKm': radiusKm,
    };
  }
}
