import 'fuel_type.dart';

class SearchPreferences {
  const SearchPreferences({
    required this.fuelType,
    required this.radiusKm,
  });

  final FuelType fuelType;
  final int radiusKm;

  SearchPreferences copyWith({
    FuelType? fuelType,
    int? radiusKm,
  }) {
    return SearchPreferences(
      fuelType: fuelType ?? this.fuelType,
      radiusKm: radiusKm ?? this.radiusKm,
    );
  }
}
