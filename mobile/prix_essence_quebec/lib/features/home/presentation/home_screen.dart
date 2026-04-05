import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/formatters.dart';
import '../../../core/widgets/async_error_view.dart';
import '../../../core/widgets/empty_state_card.dart';
import '../../../core/widgets/section_card.dart';
import '../../../core/widgets/skeletons.dart';
import '../../../models/search_location.dart';
import '../../../models/status_models.dart';
import '../../../models/station.dart';
import '../../../providers/app_providers.dart';
import '../application/home_controller.dart';
import '../application/home_state.dart';
import 'widgets/favorite_station_card.dart';
import 'widgets/map_panel.dart';
import 'widgets/search_controls.dart';
import 'widgets/station_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  late final TextEditingController _queryController;

  @override
  void initState() {
    super.initState();
    _queryController = TextEditingController();
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(homeControllerProvider);
    final controller = ref.read(homeControllerProvider.notifier);
    final appConfig = ref.watch(appConfigProvider);
    final result = state.result;
    final selectedStation = _selectedStation(state);

    if (_queryController.text != state.query) {
      _queryController.value = TextEditingValue(
        text: state.query,
        selection: TextSelection.collapsed(offset: state.query.length),
      );
    }

    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFF8F5EE),
              Color(0xFFF1ECE3),
            ],
          ),
        ),
        child: SafeArea(
          child: LayoutBuilder(
            builder: (context, constraints) {
              final isTablet = constraints.maxWidth >= 1000;

              return SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(
                  16,
                  16,
                  16,
                  MediaQuery.of(context).padding.bottom + 24,
                ),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1280),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _HeroBanner(status: state.status),
                        const SizedBox(height: 16),
                        SectionCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SearchControls(
                                queryController: _queryController,
                                onQueryChanged: controller.setQuery,
                                onSubmit: controller.searchFromQuery,
                                onLocate: controller.searchFromCurrentLocation,
                                onFuelChanged: controller.setFuelType,
                                onRadiusChanged: controller.setRadiusKm,
                                selectedFuel: state.fuelType,
                                selectedRadiusKm: state.radiusKm,
                                availableRadiusKm: appConfig.availableRadiusKm,
                                isSearching: state.isSearching,
                                isLocating: state.isLocating,
                              ),
                              const SizedBox(height: 18),
                              _StatusStrip(
                                cacheBackend: state.status?.cacheBackend,
                                isStale: state.status?.stale ?? false,
                                stationCount: state.status?.metadata?.stationCount,
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        _buildUtilityArea(
                          state: state,
                          controller: controller,
                          isTablet: isTablet,
                        ),
                        if (state.errorMessage != null) ...[
                          const SizedBox(height: 16),
                          AsyncErrorView(
                            message: state.errorMessage!,
                            onRetry: state.lastRequest == null
                                ? null
                                : () => _retry(controller, state),
                          ),
                        ],
                        if (state.isRefreshing) ...[
                          const SizedBox(height: 16),
                          const SectionCard(
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2.5),
                                ),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Text('Mise à jour des résultats en cours…'),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),
                        if (state.isSearching && result == null)
                          const SearchSkeletonView()
                        else if (result == null)
                          const EmptyStateCard(
                            title: 'Prêt à comparer les stations du Québec',
                            message:
                                'Entre une adresse ou utilise ta position pour trouver la meilleure option autour de toi.',
                          )
                        else ...[
                          if (result.message != null) ...[
                            SectionCard(
                              child: Row(
                                children: [
                                  const Icon(Icons.info_outline_rounded),
                                  const SizedBox(width: 12),
                                  Expanded(child: Text(result.message!)),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          _BestOptionCard(
                            station: selectedStation,
                            resolvedLabel: result.resolvedLocation.label,
                            isBestOption: selectedStation?.id == result.bestOption?.id,
                          ),
                          const SizedBox(height: 16),
                          if (isTablet)
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  flex: 14,
                                  child: MapPanel(
                                    mapProvider: appConfig.mapProvider,
                                    stations: result.topStations,
                                    origin: result.resolvedLocation,
                                    selectedStationId: state.selectedStationId,
                                    onStationTap: controller.selectStation,
                                    effectiveRadiusKm: result.effectiveRadiusKm,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  flex: 11,
                                  child: _TopStationsPanel(
                                    stations: result.topStations,
                                    selectedStationId: state.selectedStationId,
                                    favoriteIds: state.favorites
                                        .map((favorite) => favorite.stationId)
                                        .toSet(),
                                    origin: result.resolvedLocation,
                                    onSelectStation: controller.selectStation,
                                    onToggleFavorite: controller.toggleFavorite,
                                  ),
                                ),
                              ],
                            )
                          else ...[
                            MapPanel(
                              mapProvider: appConfig.mapProvider,
                              stations: result.topStations,
                              origin: result.resolvedLocation,
                              selectedStationId: state.selectedStationId,
                              onStationTap: controller.selectStation,
                              effectiveRadiusKm: result.effectiveRadiusKm,
                            ),
                            const SizedBox(height: 16),
                            _TopStationsPanel(
                              stations: result.topStations,
                              selectedStationId: state.selectedStationId,
                              favoriteIds: state.favorites
                                  .map((favorite) => favorite.stationId)
                                  .toSet(),
                              origin: result.resolvedLocation,
                              onSelectStation: controller.selectStation,
                              onToggleFavorite: controller.toggleFavorite,
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildUtilityArea({
    required HomeState state,
    required HomeController controller,
    required bool isTablet,
  }) {
    final recentCard = SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: 'Recherches récentes',
            trailing: '${state.recentSearches.length}/8',
          ),
          const SizedBox(height: 12),
          if (state.recentSearches.isEmpty)
            const Text('Aucune recherche récente.')
          else
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: state.recentSearches
                  .map(
                    (search) => ActionChip(
                      label: Text(search.label),
                      onPressed: () => controller.applyRecentSearch(search),
                    ),
                  )
                  .toList(growable: false),
            ),
        ],
      ),
    );

    final favoritesCard = SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: 'Favoris',
            trailing: '${state.favorites.length}',
          ),
          const SizedBox(height: 12),
          if (state.favorites.isEmpty)
            const Text('Ajoute une station depuis les résultats pour la retrouver ici.')
          else
            Column(
              children: state.favorites
                  .map(
                    (favorite) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: FavoriteStationCard(
                        favorite: favorite,
                        selectedFuel: state.fuelType,
                        origin: state.result?.resolvedLocation,
                        liveStation: controller.findFavoriteLiveStation(favorite),
                        onRemove: () => controller.removeFavorite(favorite.stationId),
                      ),
                    ),
                  )
                  .toList(growable: false),
            ),
        ],
      ),
    );

    if (!isTablet) {
      return Column(
        children: [
          recentCard,
          const SizedBox(height: 16),
          favoritesCard,
        ],
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 11, child: recentCard),
        const SizedBox(width: 16),
        Expanded(flex: 9, child: favoritesCard),
      ],
    );
  }

  void _retry(HomeController controller, HomeState state) {
    final lastRequest = state.lastRequest;
    if (lastRequest == null) {
      return;
    }

    if (lastRequest.query != null) {
      controller.searchFromQuery(lastRequest.query);
    } else {
      controller.searchFromCurrentLocation();
    }
  }

  Station? _selectedStation(HomeState state) {
    final result = state.result;
    if (result == null) {
      return null;
    }

    if (state.selectedStationId != null) {
      for (final station in result.stationsInRadius) {
        if (station.id == state.selectedStationId) {
          return station;
        }
      }
    }

    return result.bestOption ??
        (result.topStations.isNotEmpty ? result.topStations.first : null);
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({
    required this.status,
  });

  final StatusModel? status;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(30),
        gradient: const LinearGradient(
          colors: [
            Color(0xFF1C4F6B),
            Color(0xFF255F7D),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1C4F6B).withValues(alpha: 0.24),
            blurRadius: 32,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: const Text(
              'Prix essence Québec',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            'Trouver vite la station qui vaut vraiment le détour.',
            style: theme.textTheme.headlineSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            status?.metadata != null
                ? 'Source officielle détectée · ${status!.metadata!.stationCount} stations dans le dataset actuel.'
                : 'Recherche par adresse ou géolocalisation, carte OSM et top 10 selon prix + proximité.',
            style: theme.textTheme.bodyLarge?.copyWith(
              color: Colors.white.withValues(alpha: 0.88),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusStrip extends StatelessWidget {
  const _StatusStrip({
    required this.cacheBackend,
    required this.isStale,
    required this.stationCount,
  });

  final String? cacheBackend;
  final bool isStale;
  final int? stationCount;

  @override
  Widget build(BuildContext context) {
    final items = [
      ('Cache', cacheBackend == 'kv' ? 'Workers KV' : 'Mémoire locale'),
      ('Fraîcheur', isStale ? 'Cache de secours' : 'Vérifié à l’ouverture'),
      ('Stations', stationCount?.toString() ?? 'En attente'),
    ];

    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: items
          .map(
            (item) => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF4F7F9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text.rich(
                TextSpan(
                  children: [
                    TextSpan(
                      text: '${item.$1}: ',
                      style: const TextStyle(
                        color: Color(0xFF5F7480),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    TextSpan(
                      text: item.$2,
                      style: const TextStyle(
                        color: Color(0xFF173549),
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(growable: false),
    );
  }
}

class _BestOptionCard extends StatelessWidget {
  const _BestOptionCard({
    required this.station,
    required this.resolvedLabel,
    required this.isBestOption,
  });

  final Station? station;
  final String resolvedLabel;
  final bool isBestOption;

  @override
  Widget build(BuildContext context) {
    if (station == null) {
      return const SizedBox.shrink();
    }

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: isBestOption
                ? 'Meilleure option près de vous'
                : 'Station sélectionnée',
            trailing: '${station!.score.toStringAsFixed(1)}/100',
          ),
          const SizedBox(height: 12),
          Text(
            station!.stationName,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            runSpacing: 12,
            children: [
              _KeyFigure(
                label: 'Prix',
                value: formatPrice(station!.selectedPrice),
                note: station!.selectedPriceLabel,
              ),
              _KeyFigure(
                label: 'Distance',
                value: formatDistance(station!.distanceKm),
                note: resolvedLabel,
              ),
              _KeyFigure(
                label: 'Mise à jour',
                value: formatDate(station!.updatedAt),
                note: station!.banner.isEmpty ? 'Bannière non fournie' : station!.banner,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(station!.address1),
        ],
      ),
    );
  }
}

class _TopStationsPanel extends StatelessWidget {
  const _TopStationsPanel({
    required this.stations,
    required this.selectedStationId,
    required this.favoriteIds,
    required this.origin,
    required this.onSelectStation,
    required this.onToggleFavorite,
  });

  final List<Station> stations;
  final String? selectedStationId;
  final Set<String> favoriteIds;
  final SearchLocation? origin;
  final ValueChanged<String> onSelectStation;
  final Future<void> Function(Station) onToggleFavorite;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            title: 'Top 10 des stations',
            trailing: '${stations.length}',
          ),
          const SizedBox(height: 8),
          Text(
            'Classement selon le meilleur compromis prix + proximité.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF5F7480),
                ),
          ),
          const SizedBox(height: 16),
          ...stations.map(
            (station) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: StationCard(
                station: station,
                isSelected: station.id == selectedStationId,
                isFavorite: favoriteIds.contains(station.id),
                origin: origin,
                onTap: () => onSelectStation(station.id),
                onToggleFavorite: () => onToggleFavorite(station),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    required this.trailing,
  });

  final String title;
  final String trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xFFE2EFF5),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            trailing,
            style: const TextStyle(
              color: Color(0xFF1C4F6B),
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }
}

class _KeyFigure extends StatelessWidget {
  const _KeyFigure({
    required this.label,
    required this.value,
    required this.note,
  });

  final String label;
  final String value;
  final String note;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(minWidth: 150),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: const Color(0xFF5F7480),
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
          ),
          const SizedBox(height: 2),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                ),
          ),
          const SizedBox(height: 2),
          Text(
            note,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF5F7480),
                ),
          ),
        ],
      ),
    );
  }
}
