import 'dart:async';
import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:apple_maps_flutter/apple_maps_flutter.dart' as apple;
import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart' show LatLng;

import '../../../../core/config/app_config.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/launchers.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../models/search_location.dart';
import '../../../../models/station.dart';

enum _PanelMode { maps, text }

class MapPanel extends StatefulWidget {
  const MapPanel({
    super.key,
    required this.mapProvider,
    required this.tileUrlTemplate,
    required this.tileSubdomains,
    required this.attributionLabel,
    required this.attributionUrl,
    required this.stations,
    required this.origin,
    required this.selectedStationId,
    required this.onStationTap,
    required this.effectiveRadiusKm,
  });

  final MapProviderType mapProvider;
  final String tileUrlTemplate;
  final List<String> tileSubdomains;
  final String attributionLabel;
  final String attributionUrl;
  final List<Station> stations;
  final SearchLocation? origin;
  final String? selectedStationId;
  final ValueChanged<String> onStationTap;
  final int effectiveRadiusKm;

  @override
  State<MapPanel> createState() => _MapPanelState();
}

class _MapPanelState extends State<MapPanel> {
  late final MapController _mapController;
  apple.AppleMapController? _appleMapController;
  final Map<String, apple.BitmapDescriptor> _applePriceIcons = {};
  _PanelMode _mode = _PanelMode.maps;
  bool _mapReady = false;
  int _tileErrorCount = 0;
  String? _lastTileError;
  double _appleDevicePixelRatio = 3;

  bool get _usesAppleMap =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.iOS;

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final nextRatio = MediaQuery.of(context).devicePixelRatio;
    if ((_appleDevicePixelRatio - nextRatio).abs() > 0.01) {
      _appleDevicePixelRatio = nextRatio;
      _applePriceIcons.clear();
    }
    _primeApplePriceIcons();
  }

  @override
  void didUpdateWidget(covariant MapPanel oldWidget) {
    super.didUpdateWidget(oldWidget);

    final previousIds = oldWidget.stations
        .map((station) => station.id)
        .toList();
    final currentIds = widget.stations.map((station) => station.id).toList();
    final stationIdsChanged = !listEquals(previousIds, currentIds);
    final originChanged =
        oldWidget.origin?.latitude != widget.origin?.latitude ||
        oldWidget.origin?.longitude != widget.origin?.longitude;
    final selectionChanged =
        oldWidget.selectedStationId != widget.selectedStationId;

    if (stationIdsChanged || originChanged) {
      _tileErrorCount = 0;
      _lastTileError = null;
    }

    if (_usesAppleMap &&
        (stationIdsChanged || selectionChanged || originChanged)) {
      _primeApplePriceIcons();
    }

    if (_mode == _PanelMode.maps &&
        (stationIdsChanged || originChanged || selectionChanged)) {
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => _syncCamera(forceBounds: stationIdsChanged || originChanged),
      );
    }
  }

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sectors = _buildSectors(widget.stations);
    final selectedStation = _resolveSelectedStation(
      widget.stations,
      widget.selectedStationId,
    );

    final title = _mode == _PanelMode.maps
        ? 'Carte complète du secteur'
        : 'Secteurs proches';
    final subtitle = widget.stations.isEmpty
        ? 'Aucun résultat à afficher pour le moment.'
        : _mode == _PanelMode.maps
        ? '${widget.stations.length} stations affichées dans ${widget.effectiveRadiusKm} km.'
        : '${sectors.length} secteurs repérés dans ${widget.effectiveRadiusKm} km.';
    final badgeCount = _mode == _PanelMode.maps
        ? widget.stations.length
        : sectors.length;

    return SectionCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF5F7480),
                      ),
                    ),
                  ],
                ),
              ),
              CircleAvatar(
                radius: 22,
                backgroundColor: const Color(0xFFE2EFF5),
                child: Text(
                  '$badgeCount',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: const Color(0xFF1C4F6B),
                  ),
                ),
              ),
            ],
          ),
          if (widget.origin != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F0E7),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.near_me_rounded, color: Color(0xFF1C4F6B)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Autour de ${widget.origin!.label}',
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          if (widget.stations.isNotEmpty) ...[
            const SizedBox(height: 14),
            SegmentedButton<_PanelMode>(
              showSelectedIcon: false,
              segments: const [
                ButtonSegment<_PanelMode>(
                  value: _PanelMode.maps,
                  icon: Icon(Icons.map_outlined),
                  label: Text('Maps'),
                ),
                ButtonSegment<_PanelMode>(
                  value: _PanelMode.text,
                  icon: Icon(Icons.list_alt_rounded),
                  label: Text('Texte'),
                ),
              ],
              selected: <_PanelMode>{_mode},
              onSelectionChanged: (selection) {
                final mode = selection.first;
                setState(() {
                  _mode = mode;
                });

                if (mode == _PanelMode.maps) {
                  WidgetsBinding.instance.addPostFrameCallback(
                    (_) => _syncCamera(forceBounds: true),
                  );
                }
              },
            ),
          ],
          const SizedBox(height: 14),
          if (widget.stations.isEmpty)
            const SizedBox(
              height: 220,
              child: Center(
                child: Text(
                  'La recherche n’a retourné aucun lieu proche.',
                  textAlign: TextAlign.center,
                ),
              ),
            )
          else if (_mode == _PanelMode.maps)
            _usesAppleMap
                ? _buildAppleMap(context, selectedStation)
                : _buildEmbeddedMap(context, selectedStation)
          else
            Column(
              children: [
                for (final sector in sectors.take(6)) ...[
                  _SectorCard(
                    sector: sector,
                    isSelected: sector.stationId == widget.selectedStationId,
                    onTap: () => widget.onStationTap(sector.stationId),
                  ),
                  if (sector != sectors.take(6).last)
                    const SizedBox(height: 12),
                ],
              ],
            ),
          if (widget.stations.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text(
              _mode == _PanelMode.maps
                  ? _usesAppleMap
                        ? 'Carte Apple Maps intégrée sur iPhone, avec ouverture native Maps en complément.'
                        : 'Carte OSM intégrée dans l’app, avec ouverture native Maps en complément.'
                  : 'Vue texte pour lire rapidement les secteurs les plus proches.',
              style: Theme.of(
                context,
              ).textTheme.bodySmall?.copyWith(color: const Color(0xFF5F7480)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmbeddedMap(BuildContext context, Station? selectedStation) {
    final markers = <Marker>[
      if (widget.origin != null)
        Marker(
          point: LatLng(widget.origin!.latitude, widget.origin!.longitude),
          width: 26,
          height: 26,
          alignment: Alignment.center,
          child: const _OriginMarker(),
        ),
      ...widget.stations.map(
        (station) => Marker(
          key: ValueKey(station.id),
          point: LatLng(station.latitude, station.longitude),
          width: station.id == widget.selectedStationId ? 108 : 92,
          height: station.id == widget.selectedStationId ? 74 : 68,
          alignment: Alignment.topCenter,
          child: GestureDetector(
            onTap: () => widget.onStationTap(station.id),
            child: _PriceMarker(
              station: station,
              isSelected: station.id == widget.selectedStationId,
            ),
          ),
        ),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 430,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(
                    initialCenter: const LatLng(46.8139, -71.2080),
                    initialZoom: 10,
                    interactionOptions: const InteractionOptions(
                      flags: InteractiveFlag.all,
                    ),
                    onMapReady: () {
                      _mapReady = true;
                      debugPrint(
                        'MapPanel ready with tiles ${widget.tileUrlTemplate} '
                        'and subdomains ${widget.tileSubdomains.join(",")}',
                      );
                      _syncCamera(forceBounds: true);
                    },
                  ),
                  children: [
                    TileLayer(
                      urlTemplate: widget.tileUrlTemplate,
                      subdomains: widget.tileSubdomains,
                      userAgentPackageName: 'com.yannheppell.prixEssenceQuebec',
                      tileProvider: NetworkTileProvider(
                        abortObsoleteRequests: false,
                        cachingProvider:
                            defaultTargetPlatform == TargetPlatform.iOS
                            ? const _DisabledTileCacheProvider()
                            : null,
                      ),
                      tileDisplay: const TileDisplay.instantaneous(),
                      errorTileCallback: (tile, error, stackTrace) {
                        if (!mounted) {
                          return;
                        }
                        debugPrint(
                          'Tile error z=${tile.coordinates.z} x=${tile.coordinates.x} '
                          'y=${tile.coordinates.y}: $error',
                        );
                        setState(() {
                          _tileErrorCount += 1;
                          _lastTileError = error.toString();
                        });
                      },
                    ),
                    MarkerLayer(
                      markers: markers,
                      alignment: Alignment.topCenter,
                    ),
                  ],
                ),
                Positioned(
                  left: 14,
                  top: 14,
                  child: _ZoomControls(onZoomIn: _zoomIn, onZoomOut: _zoomOut),
                ),
                if (selectedStation != null)
                  Positioned(
                    right: 14,
                    top: 14,
                    child: _SelectedMarkerBadge(
                      label: _markerPrice(selectedStation.selectedPrice),
                    ),
                  ),
                Positioned(
                  right: 10,
                  bottom: 10,
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(10),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: () => openExternalUrlString(widget.attributionUrl),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 5,
                        ),
                        child: Text(
                          '© ${widget.attributionLabel}',
                          style: const TextStyle(
                            color: Color(0xFF425B68),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                if (_tileErrorCount > 0)
                  Positioned(
                    left: 14,
                    right: 14,
                    bottom: 44,
                    child: _TileErrorBanner(
                      errorCount: _tileErrorCount,
                      lastError: _lastTileError,
                    ),
                  ),
              ],
            ),
          ),
        ),
        if (selectedStation != null) ...[
          const SizedBox(height: 12),
          _SelectedStationCard(station: selectedStation, origin: widget.origin),
        ],
      ],
    );
  }

  Widget _buildAppleMap(BuildContext context, Station? selectedStation) {
    final readyStations = widget.stations
        .where(_hasAppleAnnotationIcon)
        .toList(growable: false);
    final waitingForPriceBubbles =
        readyStations.length != widget.stations.length;
    final annotations = <apple.Annotation>{
      if (widget.origin != null)
        apple.Annotation(
          annotationId: apple.AnnotationId('origin'),
          position: apple.LatLng(
            widget.origin!.latitude,
            widget.origin!.longitude,
          ),
          icon: apple.BitmapDescriptor.defaultAnnotationWithHue(
            apple.BitmapDescriptor.hueGreen,
          ),
          infoWindow: apple.InfoWindow(title: widget.origin!.label),
        ),
      ...readyStations.map(
        (station) => apple.Annotation(
          annotationId: apple.AnnotationId(station.id),
          position: apple.LatLng(station.latitude, station.longitude),
          icon: _appleAnnotationIconFor(station),
          infoWindow: apple.InfoWindow(
            title: station.stationName,
            snippet:
                '${_markerPrice(station.selectedPrice)} • ${formatDistance(station.distanceKm)}',
          ),
          onTap: () => widget.onStationTap(station.id),
          zIndex: station.id == widget.selectedStationId ? 20 : 10,
        ),
      ),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 430,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: Stack(
              children: [
                apple.AppleMap(
                  initialCameraPosition: apple.CameraPosition(
                    target: const apple.LatLng(46.8139, -71.2080),
                    zoom: 10,
                  ),
                  mapType: apple.MapType.standard,
                  compassEnabled: true,
                  rotateGesturesEnabled: true,
                  scrollGesturesEnabled: true,
                  zoomGesturesEnabled: true,
                  pitchGesturesEnabled: false,
                  gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                    Factory<OneSequenceGestureRecognizer>(
                      () => EagerGestureRecognizer(),
                    ),
                  },
                  annotations: annotations,
                  onMapCreated: (controller) {
                    _appleMapController = controller;
                    _mapReady = true;
                    _syncCamera(forceBounds: true);
                  },
                ),
                Positioned(
                  left: 14,
                  top: 14,
                  child: _ZoomControls(onZoomIn: _zoomIn, onZoomOut: _zoomOut),
                ),
                if (selectedStation != null)
                  Positioned(
                    right: 14,
                    top: 14,
                    child: _SelectedMarkerBadge(
                      label: _markerPrice(selectedStation.selectedPrice),
                    ),
                  ),
                Positioned(
                  right: 10,
                  bottom: 10,
                  child: Material(
                    color: Colors.white.withValues(alpha: 0.92),
                    borderRadius: BorderRadius.circular(10),
                    clipBehavior: Clip.antiAlias,
                    child: InkWell(
                      onTap: () =>
                          openExternalUrlString('https://www.apple.com/maps/'),
                      child: const Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 5,
                        ),
                        child: Text(
                          'Apple Maps',
                          style: TextStyle(
                            color: Color(0xFF425B68),
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                if (waitingForPriceBubbles)
                  Positioned(
                    left: 14,
                    right: 14,
                    bottom: 44,
                    child: _AppleMapLoadingBanner(
                      loadedCount: readyStations.length,
                      totalCount: widget.stations.length,
                    ),
                  ),
              ],
            ),
          ),
        ),
        if (selectedStation != null) ...[
          const SizedBox(height: 12),
          _SelectedStationCard(station: selectedStation, origin: widget.origin),
        ],
      ],
    );
  }

  void _primeApplePriceIcons() {
    if (!_usesAppleMap || !mounted) {
      return;
    }

    final missingSpecs = _appleIconSpecs()
        .where((spec) => !_applePriceIcons.containsKey(spec.cacheKey))
        .toList(growable: false);

    if (missingSpecs.isEmpty) {
      return;
    }

    unawaited(_buildApplePriceIcons(missingSpecs));
  }

  List<_ApplePriceIconSpec> _appleIconSpecs() {
    final byKey = <String, _ApplePriceIconSpec>{};
    for (final station in widget.stations) {
      final spec = _ApplePriceIconSpec(
        label: _markerPrice(station.selectedPrice),
        isSelected: station.id == widget.selectedStationId,
      );
      byKey[spec.cacheKey] = spec;
    }
    return byKey.values.toList(growable: false);
  }

  Future<void> _buildApplePriceIcons(List<_ApplePriceIconSpec> specs) async {
    final builtIcons = <String, apple.BitmapDescriptor>{};

    for (final spec in specs) {
      if (_applePriceIcons.containsKey(spec.cacheKey)) {
        continue;
      }
      builtIcons[spec.cacheKey] = await _createApplePriceIcon(spec);
    }

    if (!mounted || builtIcons.isEmpty) {
      return;
    }

    setState(() {
      _applePriceIcons.addAll(builtIcons);
    });
  }

  apple.BitmapDescriptor _appleAnnotationIconFor(Station station) {
    final spec = _ApplePriceIconSpec(
      label: _markerPrice(station.selectedPrice),
      isSelected: station.id == widget.selectedStationId,
    );

    return _applePriceIcons[spec.cacheKey] ??
        (spec.isSelected
            ? apple.BitmapDescriptor.defaultAnnotationWithHue(
                apple.BitmapDescriptor.hueOrange,
              )
            : apple.BitmapDescriptor.markerAnnotationWithHue(
                apple.BitmapDescriptor.hueAzure,
              ));
  }

  bool _hasAppleAnnotationIcon(Station station) {
    final spec = _ApplePriceIconSpec(
      label: _markerPrice(station.selectedPrice),
      isSelected: station.id == widget.selectedStationId,
    );
    return _applePriceIcons.containsKey(spec.cacheKey);
  }

  Future<apple.BitmapDescriptor> _createApplePriceIcon(
    _ApplePriceIconSpec spec,
  ) async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final ratio = _appleDevicePixelRatio <= 0 ? 3.0 : _appleDevicePixelRatio;
    canvas.scale(ratio, ratio);

    final fillColor = spec.isSelected ? const Color(0xFFD97442) : Colors.white;
    final textColor = spec.isSelected ? Colors.white : const Color(0xFF1C4F6B);
    final borderColor = spec.isSelected
        ? const Color(0xFFD97442)
        : const Color(0xFFBDD7E5);
    final pointerColor = spec.isSelected
        ? const Color(0xFFD97442)
        : const Color(0xFF1C4F6B);

    final textPainter = TextPainter(
      text: TextSpan(
        text: spec.label,
        style: TextStyle(
          color: textColor,
          fontSize: spec.isSelected ? 17 : 15,
          fontWeight: FontWeight.w900,
        ),
      ),
      textDirection: TextDirection.ltr,
      maxLines: 1,
    )..layout();

    const horizontalPadding = 14.0;
    const bubbleHeight = 38.0;
    const pointerWidth = 24.0;
    const pointerHeight = 18.0;
    const radius = 18.0;
    const strokeWidth = 1.6;

    final bubbleWidth = math.max(
      spec.isSelected ? 92.0 : 84.0,
      textPainter.width + horizontalPadding * 2,
    );
    final width = bubbleWidth;
    final height = bubbleHeight + pointerHeight;

    final bubbleRect = Rect.fromLTWH(0, 0, bubbleWidth, bubbleHeight);
    final bubbleRRect = RRect.fromRectAndRadius(
      bubbleRect,
      const Radius.circular(radius),
    );

    canvas.drawRRect(bubbleRRect, Paint()..color = fillColor);
    canvas.drawRRect(
      bubbleRRect,
      Paint()
        ..color = borderColor
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth,
    );

    final pointerPath = Path()
      ..moveTo((width - pointerWidth) / 2, bubbleHeight - 1)
      ..lineTo(width / 2, height)
      ..lineTo((width + pointerWidth) / 2, bubbleHeight - 1)
      ..close();
    canvas.drawPath(pointerPath, Paint()..color = pointerColor);

    textPainter.paint(
      canvas,
      Offset(
        (bubbleWidth - textPainter.width) / 2,
        (bubbleHeight - textPainter.height) / 2 - 1,
      ),
    );

    final image = await recorder.endRecording().toImage(
      (width * ratio).ceil(),
      (height * ratio).ceil(),
    );
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);

    return apple.BitmapDescriptor.fromBytes(bytes!.buffer.asUint8List());
  }

  void _syncCamera({required bool forceBounds}) {
    if (!mounted || _mode != _PanelMode.maps || !_mapReady) {
      return;
    }

    final selectedStation = _resolveSelectedStation(
      widget.stations,
      widget.selectedStationId,
    );

    if (selectedStation != null && !forceBounds) {
      if (_usesAppleMap) {
        _appleMapController?.moveCamera(
          apple.CameraUpdate.newLatLngZoom(
            apple.LatLng(selectedStation.latitude, selectedStation.longitude),
            14.4,
          ),
        );
      } else {
        _mapController.move(
          LatLng(selectedStation.latitude, selectedStation.longitude),
          math.max(_mapController.camera.zoom, 14.4),
        );
      }
      return;
    }

    final mapPoints = <({double latitude, double longitude})>[
      if (widget.origin != null)
        (
          latitude: widget.origin!.latitude,
          longitude: widget.origin!.longitude,
        ),
      ...widget.stations.map(
        (station) => (latitude: station.latitude, longitude: station.longitude),
      ),
    ];

    if (mapPoints.isEmpty) {
      return;
    }

    if (mapPoints.length == 1) {
      final point = mapPoints.first;
      if (_usesAppleMap) {
        _appleMapController?.moveCamera(
          apple.CameraUpdate.newLatLngZoom(
            apple.LatLng(point.latitude, point.longitude),
            14.5,
          ),
        );
      } else {
        _mapController.move(LatLng(point.latitude, point.longitude), 14.5);
      }
      return;
    }

    final minLatitude = mapPoints
        .map((point) => point.latitude)
        .reduce(math.min);
    final maxLatitude = mapPoints
        .map((point) => point.latitude)
        .reduce(math.max);
    final minLongitude = mapPoints
        .map((point) => point.longitude)
        .reduce(math.min);
    final maxLongitude = mapPoints
        .map((point) => point.longitude)
        .reduce(math.max);

    if (_usesAppleMap) {
      _appleMapController?.moveCamera(
        apple.CameraUpdate.newLatLngBounds(
          apple.LatLngBounds(
            southwest: apple.LatLng(minLatitude, minLongitude),
            northeast: apple.LatLng(maxLatitude, maxLongitude),
          ),
          42,
        ),
      );
      return;
    }

    final points = mapPoints
        .map((point) => LatLng(point.latitude, point.longitude))
        .toList(growable: false);
    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: LatLngBounds.fromPoints(points),
        padding: const EdgeInsets.all(42),
        maxZoom: 15.5,
      ),
    );
  }

  void _zoomIn() {
    if (!_mapReady) {
      return;
    }

    if (_usesAppleMap) {
      _appleMapController?.moveCamera(apple.CameraUpdate.zoomIn());
      return;
    }

    final camera = _mapController.camera;
    _mapController.move(camera.center, (camera.zoom + 1).clamp(4.0, 18.0));
  }

  void _zoomOut() {
    if (!_mapReady) {
      return;
    }

    if (_usesAppleMap) {
      _appleMapController?.moveCamera(apple.CameraUpdate.zoomOut());
      return;
    }

    final camera = _mapController.camera;
    _mapController.move(camera.center, (camera.zoom - 1).clamp(4.0, 18.0));
  }

  static List<_SectorSummary> _buildSectors(List<Station> stations) {
    final bySector = <String, List<Station>>{};

    for (final station in stations) {
      final key =
          '${station.city.trim().toLowerCase()}|${station.region.trim().toLowerCase()}';
      bySector.putIfAbsent(key, () => <Station>[]).add(station);
    }

    final sectors = bySector.values.map((entries) {
      final sorted = [...entries]
        ..sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
      final nearest = sorted.first;
      final city = nearest.city.trim().isEmpty
          ? 'Secteur inconnu'
          : nearest.city;
      final region = nearest.region.trim();

      return _SectorSummary(
        title: region.isEmpty ? city : '$city, $region',
        subtitle: nearest.address1.isEmpty
            ? nearest.stationName
            : nearest.address1,
        stationCount: entries.length,
        bestDistanceKm: nearest.distanceKm,
        stationId: nearest.id,
        stationName: nearest.stationName,
        price: nearest.selectedPrice,
        latitude: nearest.latitude,
        longitude: nearest.longitude,
      );
    }).toList()..sort((a, b) => a.bestDistanceKm.compareTo(b.bestDistanceKm));

    return sectors;
  }

  static Station? _resolveSelectedStation(
    List<Station> stations,
    String? selectedStationId,
  ) {
    if (stations.isEmpty) {
      return null;
    }

    if (selectedStationId != null) {
      for (final station in stations) {
        if (station.id == selectedStationId) {
          return station;
        }
      }
    }

    return stations.first;
  }

  static String _markerPrice(double value) => (value * 100).toStringAsFixed(1);
}

class _SelectedStationCard extends StatelessWidget {
  const _SelectedStationCard({required this.station, required this.origin});

  final Station station;
  final SearchLocation? origin;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FBFD),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0x1F1C4F6B)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            station.stationName,
            style: Theme.of(
              context,
            ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          Text(
            station.address1,
            style: Theme.of(
              context,
            ).textTheme.bodyMedium?.copyWith(color: const Color(0xFF5F7480)),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _InfoChip(label: 'Prix ${formatPrice(station.selectedPrice)}'),
              _InfoChip(
                label: 'Distance ${formatDistance(station.distanceKm)}',
              ),
              _InfoChip(label: station.city),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              FilledButton.icon(
                onPressed: () => openCoordinatesInNativeMap(
                  latitude: station.latitude,
                  longitude: station.longitude,
                  label: station.stationName,
                ),
                icon: const Icon(Icons.map_outlined),
                label: const Text('Ouvrir dans Maps'),
              ),
              OutlinedButton.icon(
                onPressed: () =>
                    openDirections(station: station, origin: origin),
                icon: const Icon(Icons.route_outlined),
                label: const Text('Itinéraire'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ZoomControls extends StatelessWidget {
  const _ZoomControls({required this.onZoomIn, required this.onZoomOut});

  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24173549),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          IconButton(onPressed: onZoomIn, icon: const Icon(Icons.add_rounded)),
          const Divider(height: 1),
          IconButton(
            onPressed: onZoomOut,
            icon: const Icon(Icons.remove_rounded),
          ),
        ],
      ),
    );
  }
}

class _SelectedMarkerBadge extends StatelessWidget {
  const _SelectedMarkerBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24173549),
            blurRadius: 20,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Text(
          label,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w900,
            color: const Color(0xFF1C4F6B),
          ),
        ),
      ),
    );
  }
}

class _TileErrorBanner extends StatelessWidget {
  const _TileErrorBanner({required this.errorCount, required this.lastError});

  final int errorCount;
  final String? lastError;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24173549),
            blurRadius: 18,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            const Icon(Icons.cloud_off_outlined, color: Color(0xFF1C4F6B)),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                lastError == null
                    ? '$errorCount tuile(s) en retard.'
                    : 'Certaines tuiles sont en retard. $lastError',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF425B68),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppleMapLoadingBanner extends StatelessWidget {
  const _AppleMapLoadingBanner({
    required this.loadedCount,
    required this.totalCount,
  });

  final int loadedCount;
  final int totalCount;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.94),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24173549),
            blurRadius: 18,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2.2),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Préparation des bulles de prix... $loadedCount/$totalCount',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF425B68),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DisabledTileCacheProvider with DisabledMapCachingProvider {
  const _DisabledTileCacheProvider();
}

class _ApplePriceIconSpec {
  const _ApplePriceIconSpec({required this.label, required this.isSelected});

  final String label;
  final bool isSelected;

  String get cacheKey => '$label|${isSelected ? "selected" : "default"}';
}

class _OriginMarker extends StatelessWidget {
  const _OriginMarker();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        border: Border.all(color: const Color(0xFF1C4F6B), width: 3),
        boxShadow: const [
          BoxShadow(
            color: Color(0x24173549),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: const Center(
        child: SizedBox(
          width: 8,
          height: 8,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: Color(0xFF1C4F6B),
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    );
  }
}

class _PriceMarker extends StatelessWidget {
  const _PriceMarker({required this.station, required this.isSelected});

  final Station station;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isSelected ? const Color(0xFFD97442) : Colors.white;
    final textColor = isSelected ? Colors.white : const Color(0xFF1C4F6B);
    final borderColor = isSelected
        ? const Color(0xFFD97442)
        : const Color(0xFFBDD7E5);
    final pointerColor = isSelected
        ? const Color(0xFFD97442)
        : const Color(0xFF1C4F6B);

    return Align(
      alignment: Alignment.topCenter,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: bubbleColor,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: borderColor, width: 1.6),
              boxShadow: [
                BoxShadow(
                  color: const Color(
                    0x24173549,
                  ).withValues(alpha: isSelected ? 0.22 : 0.14),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Text(
              _MapPanelState._markerPrice(station.selectedPrice),
              style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.w900,
                fontSize: isSelected ? 17 : 15,
              ),
            ),
          ),
          Transform.translate(
            offset: const Offset(0, -2),
            child: ClipPath(
              clipper: _MarkerPointerClipper(),
              child: Container(width: 20, height: 14, color: pointerColor),
            ),
          ),
        ],
      ),
    );
  }
}

class _MarkerPointerClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    return Path()
      ..moveTo(size.width / 2, size.height)
      ..lineTo(0, 0)
      ..lineTo(size.width, 0)
      ..close();
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

class _SectorCard extends StatelessWidget {
  const _SectorCard({
    required this.sector,
    required this.isSelected,
    required this.onTap,
  });

  final _SectorSummary sector;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFF8FBFD) : Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isSelected ? const Color(0x661C4F6B) : const Color(0x1F1C4F6B),
          width: isSelected ? 1.4 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          sector.title,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          sector.subtitle,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF5F7480),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF4F7F9),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Text(
                      formatDistance(sector.bestDistanceKm),
                      style: theme.textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF173549),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  _InfoChip(label: '${sector.stationCount} station(s)'),
                  _InfoChip(
                    label: 'Meilleur prix ${formatPrice(sector.price)}',
                  ),
                  _InfoChip(label: sector.stationName),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  FilledButton.icon(
                    onPressed: () => openCoordinatesInNativeMap(
                      latitude: sector.latitude,
                      longitude: sector.longitude,
                      label: sector.title,
                    ),
                    icon: const Icon(Icons.map_outlined),
                    label: const Text('Ouvrir dans Maps'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  const _InfoChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
          color: const Color(0xFF173549),
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _SectorSummary {
  const _SectorSummary({
    required this.title,
    required this.subtitle,
    required this.stationCount,
    required this.bestDistanceKm,
    required this.stationId,
    required this.stationName,
    required this.price,
    required this.latitude,
    required this.longitude,
  });

  final String title;
  final String subtitle;
  final int stationCount;
  final double bestDistanceKm;
  final String stationId;
  final String stationName;
  final double price;
  final double latitude;
  final double longitude;
}
