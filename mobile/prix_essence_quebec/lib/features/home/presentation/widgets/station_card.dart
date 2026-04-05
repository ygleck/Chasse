import 'package:flutter/material.dart';

import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/launchers.dart';
import '../../../../models/search_location.dart';
import '../../../../models/station.dart';

class StationCard extends StatelessWidget {
  const StationCard({
    super.key,
    required this.station,
    required this.isSelected,
    required this.isFavorite,
    required this.origin,
    required this.onTap,
    required this.onToggleFavorite,
  });

  final Station station;
  final bool isSelected;
  final bool isFavorite;
  final SearchLocation? origin;
  final VoidCallback onTap;
  final VoidCallback onToggleFavorite;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: isSelected ? const Color(0xFFF8FBFD) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isSelected
              ? theme.colorScheme.primary.withValues(alpha: 0.42)
              : const Color(0x1F1C4F6B),
          width: isSelected ? 1.4 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(24),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(18),
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
                          station.stationName,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${station.banner.isEmpty ? 'Sans bannière' : station.banner} · ${station.city}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: const Color(0xFF5F7480),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton.filledTonal(
                    onPressed: onToggleFavorite,
                    icon: Icon(
                      isFavorite ? Icons.star_rounded : Icons.star_border_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _Metric(
                    label: 'Prix retenu',
                    value: formatPrice(station.selectedPrice),
                    note: station.selectedPriceLabel,
                  ),
                  _Metric(
                    label: 'Distance',
                    value: formatDistance(station.distanceKm),
                    note: 'Score ${station.score.toStringAsFixed(1)}/100',
                  ),
                  _Metric(
                    label: 'Mise à jour',
                    value: formatDate(station.updatedAt),
                    note: station.postalCode.isEmpty
                        ? 'Code postal inconnu'
                        : station.postalCode,
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                children: [
                  _PriceChip(label: 'Ordinaire', value: formatPrice(station.regularPrice)),
                  _PriceChip(label: 'Diesel', value: formatPrice(station.dieselPrice)),
                  _PriceChip(label: 'Premium', value: formatPrice(station.premiumPrice)),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                station.address1,
                style: theme.textTheme.bodyLarge,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  TextButton(
                    onPressed: () => openStationInMap(station),
                    child: const Text('Carte'),
                  ),
                  TextButton(
                    onPressed: () => openDirections(
                      station: station,
                      origin: origin,
                    ),
                    child: const Text('Itinéraire'),
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

class _Metric extends StatelessWidget {
  const _Metric({
    required this.label,
    required this.value,
    required this.note,
  });

  final String label;
  final String value;
  final String note;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 132),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: theme.textTheme.labelMedium?.copyWith(
              color: const Color(0xFF5F7480),
              fontWeight: FontWeight.w700,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            note,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: const Color(0xFF5F7480),
            ),
          ),
        ],
      ),
    );
  }
}

class _PriceChip extends StatelessWidget {
  const _PriceChip({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F9),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: '$label ',
              style: const TextStyle(
                color: Color(0xFF5F7480),
                fontWeight: FontWeight.w700,
              ),
            ),
            TextSpan(
              text: value,
              style: const TextStyle(
                color: Color(0xFF173549),
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
