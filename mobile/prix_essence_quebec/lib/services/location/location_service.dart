import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../models/search_location.dart';

class LocationService {
  Future<SearchLocation> getCurrentLocation() async {
    final isServiceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!isServiceEnabled) {
      throw const LocationServiceException(
        'La localisation de l’appareil est désactivée.',
      );
    }

    final permission = await Permission.locationWhenInUse.request();
    if (permission.isPermanentlyDenied) {
      throw const LocationServiceException(
        'La permission de localisation a été refusée de façon permanente. Active-la dans les réglages.',
      );
    }

    if (!permission.isGranted) {
      throw const LocationServiceException(
        'La permission de localisation a été refusée.',
      );
    }

    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );

    return SearchLocation(
      latitude: position.latitude,
      longitude: position.longitude,
      label: 'Ma position',
      source: 'geolocation',
    );
  }
}

class LocationServiceException implements Exception {
  const LocationServiceException(this.message);

  final String message;

  @override
  String toString() => message;
}
