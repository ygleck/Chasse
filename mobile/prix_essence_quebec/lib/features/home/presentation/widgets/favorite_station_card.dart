import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/launchers.dart';
import '../../../../models/favorite_station.dart';
import '../../../../models/fuel_type.dart';
import '../../../../models/search_location.dart';
import '../../../../models/station.dart';

class FavoriteStationCard extends StatelessWidget {
  const FavoriteStationCard({
    super.key,
    required this.favorite,
    required this.selectedFuel,
    required this.origin,
    required this.onRemove,
    this.liveStation,
  });

  final FavoriteStation favorite;
  final FuelType selectedFuel;
  final SearchLocation? origin;
  final VoidCallback onRemove;
  final Station? liveStation;

  @override
  Widget build(BuildContext context) {
    final priceItems = _resolvePrices();

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0x1F1C4F6B)),
      ),
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
                      favorite.stationName,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${favorite.banner.isEmpty ? 'Station-service' : favorite.banner} · ${favorite.city}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF5F7480),
                          ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: onRemove,
                icon: const Icon(Icons.close_rounded),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: priceItems
                .map(
                  (item) => Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF4F7F9),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.$1,
                          style: const TextStyle(
                            color: Color(0xFF5F7480),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.$2,
                          style: const TextStyle(
                            color: Color(0xFF173549),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                .toList(growable: false),
          ),
          const SizedBox(height: 12),
          Text(favorite.address1),
          const SizedBox(height: 8),
          Row(
            children: [
              TextButton(
                onPressed: () => openCoordinatesInMap(
                  latitude: favorite.latitude,
                  longitude: favorite.longitude,
                ),
                child: const Text('Carte'),
              ),
              TextButton(
                onPressed: () => openDirectionsToCoordinates(
                  latitude: favorite.latitude,
                  longitude: favorite.longitude,
                  origin: origin,
                ),
                child: const Text('Itinéraire'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<(String, String)> _resolvePrices() {
    final regular = liveStation?.regularPrice ?? favorite.regularPrice;
    final diesel = liveStation?.dieselPrice ?? favorite.dieselPrice;
    final premium = liveStation?.premiumPrice ?? favorite.premiumPrice;

    switch (selectedFuel) {
      case FuelType.regular:
        return [('Ordinaire', formatPrice(regular))];
      case FuelType.diesel:
        return [('Diesel', formatPrice(diesel))];
      case FuelType.premium:
        return [('Premium', formatPrice(premium))];
      case FuelType.all:
        return [
          ('Ordinaire', formatPrice(regular)),
          ('Diesel', formatPrice(diesel)),
          ('Premium', formatPrice(premium)),
        ];
    }
  }
}
