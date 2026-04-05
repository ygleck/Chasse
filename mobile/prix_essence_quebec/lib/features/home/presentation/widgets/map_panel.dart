import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../models/search_location.dart';
import '../../../../models/station.dart';

class MapPanel extends StatefulWidget {
  const MapPanel({
    super.key,
    required this.mapProvider,
    required this.stations,
    required this.origin,
    required this.selectedStationId,
    required this.onStationTap,
    required this.effectiveRadiusKm,
  });

  final MapProviderType mapProvider;
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

  @override
  void initState() {
    super.initState();
    _mapController = MapController();
    WidgetsBinding.instance.addPostFrameCallback((_) => _syncCamera(forceBounds: true));
  }

  @override
  void didUpdateWidget(covariant MapPanel oldWidget) {
    super.didUpdateWidget(oldWidget);

    final stationIdsChanged = !listEquals(
      oldWidget.stations.map((station) => station.id).toList(),
      widget.stations.map((station) => station.id).toList(),
    );

    final originChanged =
        oldWidget.origin?.latitude != widget.origin?.latitude ||
            oldWidget.origin?.longitude != widget.origin?.longitude;

    final selectedChanged = oldWidget.selectedStationId != widget.selectedStationId;

    if (stationIdsChanged || originChanged || selectedChanged) {
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => _syncCamera(forceBounds: stationIdsChanged || originChanged),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.mapProvider == MapProviderType.googleMaps) {
      return const SectionCard(
        child: SizedBox(
          height: 320,
          child: Center(
            child: Text(
              'Le provider Google Maps est prévu plus tard. OpenStreetMap est actif par défaut.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    final markers = <Marker>[
      if (widget.origin != null)
        Marker(
          point: LatLng(widget.origin!.latitude, widget.origin!.longitude),
          width: 26,
          height: 26,
          child: const _OriginMarker(),
        ),
      ...widget.stations.map(
        (station) => Marker(
          point: LatLng(station.latitude, station.longitude),
          width: station.id == widget.selectedStationId ? 96 : 82,
          height: station.id == widget.selectedStationId ? 78 : 70,
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
                      'Carte du secteur',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${widget.stations.length} stations affichées dans ${widget.effectiveRadiusKm} km.',
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
                  '${widget.stations.length}',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFF1C4F6B),
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          SizedBox(
            height: 360,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: FlutterMap(
                mapController: _mapController,
                options: MapOptions(
                  initialCenter: const LatLng(46.8139, -71.208),
                  initialZoom: 6,
                  interactionOptions: const InteractionOptions(
                    flags: InteractiveFlag.all,
                  ),
                ),
                children: [
                  TileLayer(
                    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.yannheppell.prix_essence_quebec',
                  ),
                  MarkerLayer(markers: markers),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _syncCamera({required bool forceBounds}) {
    if (!mounted) {
      return;
    }

    final selectedStation = widget.selectedStationId == null
        ? null
        : widget.stations
            .where((station) => station.id == widget.selectedStationId)
            .firstOrNull;

    if (selectedStation != null && !forceBounds) {
      _mapController.move(
        LatLng(selectedStation.latitude, selectedStation.longitude),
        14.8,
      );
      return;
    }

    final points = <LatLng>[
      if (widget.origin != null)
        LatLng(widget.origin!.latitude, widget.origin!.longitude),
      ...widget.stations.map((station) => LatLng(station.latitude, station.longitude)),
    ];

    if (points.isEmpty) {
      return;
    }

    if (points.length == 1) {
      _mapController.move(points.first, 13.5);
      return;
    }

    _mapController.fitCamera(
      CameraFit.bounds(
        bounds: LatLngBounds.fromPoints(points),
        padding: const EdgeInsets.all(48),
      ),
    );
  }
}

class _OriginMarker extends StatelessWidget {
  const _OriginMarker();

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white,
        border: Border.all(
          color: const Color(0xFF1C4F6B),
          width: 3,
        ),
      ),
    );
  }
}

class _PriceMarker extends StatelessWidget {
  const _PriceMarker({
    required this.station,
    required this.isSelected,
  });

  final Station station;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final accent = isSelected ? const Color(0xFFD97442) : const Color(0xFF1C4F6B);
    final foreground = Colors.white;

    return Align(
      alignment: Alignment.topCenter,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: accent,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: accent.withValues(alpha: 0.28),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Text(
              station.selectedPrice.toStringAsFixed(3),
              style: TextStyle(
                color: foreground,
                fontWeight: FontWeight.w800,
                fontSize: 13,
              ),
            ),
          ),
          Container(
            width: 14,
            height: 14,
            margin: const EdgeInsets.only(top: 2),
            decoration: BoxDecoration(
              color: accent,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(10),
                bottomRight: Radius.circular(10),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

extension on Iterable<Station> {
  Station? get firstOrNull {
    final iterator = this.iterator;
    if (!iterator.moveNext()) {
      return null;
    }
    return iterator.current;
  }
}
