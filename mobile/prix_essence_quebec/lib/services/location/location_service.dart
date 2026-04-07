import 'package:geolocator/geolocator.dart';

import '../../models/search_location.dart';

class LocationService {
  Future<SearchLocation> getCurrentLocation() async {
    final isServiceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!isServiceEnabled) {
      throw const LocationServiceException(
        code: LocationServiceErrorCode.serviceDisabled,
        message: 'La localisation de l’appareil est désactivée.',
      );
    }

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      throw const LocationServiceException(
        code: LocationServiceErrorCode.permissionPermanentlyDenied,
        message:
            'La permission de localisation a été refusée de façon permanente. Active-la dans les réglages.',
      );
    }

    if (permission == LocationPermission.denied ||
        permission == LocationPermission.unableToDetermine) {
      throw const LocationServiceException(
        code: LocationServiceErrorCode.permissionDenied,
        message: 'La permission de localisation a été refusée.',
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

  Future<void> openRelevantSettings() async {
    final openedAppSettings = await Geolocator.openAppSettings();
    if (!openedAppSettings) {
      await Geolocator.openLocationSettings();
    }
  }
}

enum LocationServiceErrorCode {
  serviceDisabled,
  permissionDenied,
  permissionPermanentlyDenied,
}

class LocationServiceException implements Exception {
  const LocationServiceException({
    required this.code,
    required this.message,
  });

  final LocationServiceErrorCode code;
  final String message;

  @override
  String toString() => message;
}
