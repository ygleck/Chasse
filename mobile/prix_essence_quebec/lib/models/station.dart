class Station {
  const Station({
    required this.id,
    required this.stationName,
    required this.banner,
    required this.address1,
    required this.city,
    required this.region,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    required this.regularPrice,
    required this.dieselPrice,
    required this.premiumPrice,
    required this.updatedAt,
    required this.distanceKm,
    required this.score,
    required this.selectedPrice,
    required this.selectedPriceLabel,
    required this.savingsVsAverage,
    required this.allPricesAvailable,
  });

  final String id;
  final String stationName;
  final String banner;
  final String address1;
  final String city;
  final String region;
  final String postalCode;
  final double latitude;
  final double longitude;
  final double? regularPrice;
  final double? dieselPrice;
  final double? premiumPrice;
  final DateTime? updatedAt;
  final double distanceKm;
  final double score;
  final double selectedPrice;
  final String selectedPriceLabel;
  final double savingsVsAverage;
  final bool allPricesAvailable;

  factory Station.fromJson(Map<String, dynamic> json) {
    double? readNullableDouble(String key) {
      final value = json[key];
      if (value == null) {
        return null;
      }
      return (value as num).toDouble();
    }

    return Station(
      id: json['id'] as String,
      stationName: json['stationName'] as String? ?? 'Station inconnue',
      banner: json['banner'] as String? ?? '',
      address1: json['address1'] as String? ?? '',
      city: json['city'] as String? ?? '',
      region: json['region'] as String? ?? '',
      postalCode: json['postalCode'] as String? ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      regularPrice: readNullableDouble('regularPrice'),
      dieselPrice: readNullableDouble('dieselPrice'),
      premiumPrice: readNullableDouble('premiumPrice'),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? ''),
      distanceKm: (json['distanceKm'] as num).toDouble(),
      score: (json['score'] as num).toDouble(),
      selectedPrice: (json['selectedPrice'] as num).toDouble(),
      selectedPriceLabel: json['selectedPriceLabel'] as String? ?? 'Prix retenu',
      savingsVsAverage: (json['savingsVsAverage'] as num).toDouble(),
      allPricesAvailable: json['allPricesAvailable'] as bool? ?? false,
    );
  }
}
