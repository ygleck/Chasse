enum MapProviderType { openStreetMap, googleMaps }

class AppConfig {
  const AppConfig({
    required this.appName,
    required this.apiBaseUrl,
    required this.mapProvider,
    required this.mapTileTemplate,
    required this.mapTileSubdomains,
    required this.mapAttributionLabel,
    required this.mapAttributionUrl,
    required this.defaultRadiusKm,
    required this.availableRadiusKm,
  });

  final String appName;
  final String apiBaseUrl;
  final MapProviderType mapProvider;
  final String mapTileTemplate;
  final List<String> mapTileSubdomains;
  final String mapAttributionLabel;
  final String mapAttributionUrl;
  final int defaultRadiusKm;
  final List<int> availableRadiusKm;

  static AppConfig fromEnvironment() {
    const rawMapProvider = String.fromEnvironment(
      'MAP_PROVIDER',
      defaultValue: 'osm',
    );
    const rawApiBaseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'https://prix-essence-codex.ygleck.workers.dev',
    );
    const rawMapTileTemplate = String.fromEnvironment(
      'MAP_TILE_TEMPLATE',
      defaultValue: '',
    );
    const rawMapTileSubdomains = String.fromEnvironment(
      'MAP_TILE_SUBDOMAINS',
      defaultValue: 'a,b,c',
    );
    final apiBaseUrl = _trimTrailingSlash(rawApiBaseUrl);

    return AppConfig(
      appName: 'Prix essence Québec',
      apiBaseUrl: apiBaseUrl,
      mapProvider: rawMapProvider == 'google'
          ? MapProviderType.googleMaps
          : MapProviderType.openStreetMap,
      mapTileTemplate: rawMapTileTemplate.trim().isEmpty
          ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          : rawMapTileTemplate.trim(),
      mapTileSubdomains: _splitCsv(rawMapTileSubdomains),
      mapAttributionLabel: const String.fromEnvironment(
        'MAP_ATTRIBUTION_LABEL',
        defaultValue: 'OpenStreetMap contributors',
      ),
      mapAttributionUrl: const String.fromEnvironment(
        'MAP_ATTRIBUTION_URL',
        defaultValue: 'https://www.openstreetmap.org/copyright',
      ),
      defaultRadiusKm: const int.fromEnvironment(
        'DEFAULT_RADIUS_KM',
        defaultValue: 20,
      ),
      availableRadiusKm: const [5, 10, 20, 30],
    );
  }

  static String _trimTrailingSlash(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }

  static List<String> _splitCsv(String value) {
    return value
        .split(',')
        .map((entry) => entry.trim())
        .where((entry) => entry.isNotEmpty)
        .toList(growable: false);
  }
}
