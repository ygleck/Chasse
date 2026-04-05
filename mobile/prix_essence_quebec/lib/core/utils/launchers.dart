import 'package:url_launcher/url_launcher.dart';

import '../../models/search_location.dart';
import '../../models/station.dart';

Future<void> openCoordinatesInMap({
  required double latitude,
  required double longitude,
}) async {
  final uri = Uri.parse(
    'https://www.openstreetmap.org/?mlat=$latitude&mlon=$longitude#map=15/$latitude/$longitude',
  );
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

Future<void> openStationInMap(Station station) async {
  await openCoordinatesInMap(
    latitude: station.latitude,
    longitude: station.longitude,
  );
}

Future<void> openDirectionsToCoordinates({
  required double latitude,
  required double longitude,
  SearchLocation? origin,
}) async {
  if (origin == null) {
    await openCoordinatesInMap(
      latitude: latitude,
      longitude: longitude,
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
  );
}
