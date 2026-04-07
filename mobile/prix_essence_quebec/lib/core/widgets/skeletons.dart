import 'package:flutter/material.dart';

import 'section_card.dart';

class SearchSkeletonView extends StatelessWidget {
  const SearchSkeletonView({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionCard(
          child: Row(
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2.6),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Recherche en cours. Les secteurs proches vont apparaître ici dès que le serveur répond.',
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Préparation des résultats',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 14),
              const _LoadingStep(
                icon: Icons.near_me_rounded,
                title: 'Position ou adresse',
                message: 'On vérifie le point de départ de la recherche.',
              ),
              const SizedBox(height: 12),
              const _LoadingStep(
                icon: Icons.local_gas_station_outlined,
                title: 'Stations proches',
                message: 'On récupère les stations autour de vous.',
              ),
              const SizedBox(height: 12),
              const _LoadingStep(
                icon: Icons.map_outlined,
                title: 'Liste des secteurs',
                message: 'La liste remplace la carte intégrée sur iPhone.',
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        const SectionCard(
          child: Text(
            'Si cela prend trop de temps, un message d’erreur clair sera affiché automatiquement.',
          ),
        ),
      ],
    );
  }
}

class _LoadingStep extends StatelessWidget {
  const _LoadingStep({
    required this.icon,
    required this.title,
    required this.message,
  });

  final IconData icon;
  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F9),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF1C4F6B)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  message,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF5F7480),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
