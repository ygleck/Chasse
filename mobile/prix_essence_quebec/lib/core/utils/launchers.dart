import 'dart:io' show Platform;

import 'package:url_launcher/url_launcher.dart';

import '../../models/search_location.dart';
import '../../models/station.dart';

Future<void> openExternalUrlString(String url) async {
  final uri = Uri.parse(url);
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

Future<void> openCoordinatesInMap({
  required double latitude,
  required double longitude,
}) async {
  final uri = Uri.parse(
    'https://www.openstreetmap.org/?mlat=$latitude&mlon=$longitude#map=15/$latitude/$longitude',
  );
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

Future<void> openCoordinatesInNativeMap({
  required double latitude,
  required double longitude,
  String? label,
}) async {
  final uri = Platform.isIOS
      ? Uri.https('maps.apple.com', '/', {
          'll': '$latitude,$longitude',
          if (label != null && label.isNotEmpty) 'q': label,
        })
      : Uri.parse('geo:$latitude,$longitude?q=$latitude,$longitude');

  final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
  if (!launched) {
    await openCoordinatesInMap(latitude: latitude, longitude: longitude);
  }
}

Future<void> openStationInMap(Station station) async {
  await openCoordinatesInNativeMap(
    latitude: station.latitude,
    longitude: station.longitude,
    label: station.stationName,
  );
}

Future<void> openDirectionsToCoordinates({
  required double latitude,
  required double longitude,
  SearchLocation? origin,
  String? label,
}) async {
  if (Platform.isIOS) {
    final uri = Uri.https('maps.apple.com', '/', {
      'daddr': '$latitude,$longitude',
      if (origin != null) 'saddr': '${origin.latitude},${origin.longitude}',
      if (label != null && label.isNotEmpty) 'q': label,
      'dirflg': 'd',
    });

    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (launched) {
      return;
    }
  }

  if (origin == null) {
    await openCoordinatesInNativeMap(
      latitude: latitude,
      longitude: longitude,
      label: label,
    );
    return;
  }

  final uri = Uri.parse(
    'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin.latitude},${origin.longitude};$latitude,$longitude',
  );

  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

Future<void> openDirections({
  required Station station,
  SearchLocation? origin,
}) async {
  await openDirectionsToCoordinates(
    latitude: station.latitude,
    longitude: station.longitude,
    origin: origin,
    label: station.stationName,
  );
}
