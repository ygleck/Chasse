import 'station.dart';

class FavoriteStation {
  const FavoriteStation({
    required this.stationId,
    required this.stationName,
    required this.banner,
    required this.address1,
    required this.city,
    required this.postalCode,
    required this.latitude,
    required this.longitude,
    required this.regularPrice,
    required this.dieselPrice,
    required this.premiumPrice,
  });

  final String stationId;
  final String stationName;
  final String banner;
  final String address1;
  final String city;
  final String postalCode;
  final double latitude;
  final double longitude;
  final double? regularPrice;
  final double? dieselPrice;
  final double? premiumPrice;

  factory FavoriteStation.fromStation(Station station) {
    return FavoriteStation(
      stationId: station.id,
      stationName: station.stationName,
      banner: station.banner,
      address1: station.address1,
      city: station.city,
      postalCode: station.postalCode,
      latitude: station.latitude,
      longitude: station.longitude,
      regularPrice: station.regularPrice,
      dieselPrice: station.dieselPrice,
      premiumPrice: station.premiumPrice,
    );
  }

  FavoriteStation mergeStation(Station station) {
    return FavoriteStation.fromStation(station);
  }

  factory FavoriteStation.fromJson(Map<String, dynamic> json) {
    return FavoriteStation(
      stationId: json['stationId'] as String,
      stationName: json['stationName'] as String? ?? '',
      banner: json['banner'] as String? ?? '',
      address1: json['address1'] as String? ?? '',
      city: json['city'] as String? ?? '',
      postalCode: json['postalCode'] as String? ?? '',
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      regularPrice: (json['regularPrice'] as num?)?.toDouble(),
      dieselPrice: (json['dieselPrice'] as num?)?.toDouble(),
      premiumPrice: (json['premiumPrice'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'stationId': stationId,
      'stationName': stationName,
      'banner': banner,
      'address1': address1,
      'city': city,
      'postalCode': postalCode,
      'latitude': latitude,
      'longitude': longitude,
      'regularPrice': regularPrice,
      'dieselPrice': dieselPrice,
      'premiumPrice': premiumPrice,
    };
  }
}
