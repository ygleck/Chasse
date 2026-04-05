enum MapProviderType {
  openStreetMap,
  googleMaps,
}

class AppConfig {
  const AppConfig({
    required this.appName,
    required this.apiBaseUrl,
    required this.mapProvider,
    required this.defaultRadiusKm,
    required this.availableRadiusKm,
  });

  final String appName;
  final String apiBaseUrl;
  final MapProviderType mapProvider;
  final int defaultRadiusKm;
  final List<int> availableRadiusKm;

  static AppConfig fromEnvironment() {
    const rawMapProvider = String.fromEnvironment(
      'MAP_PROVIDER',
      defaultValue: 'osm',
    );

    return AppConfig(
      appName: 'Prix essence Québec',
      apiBaseUrl: const String.fromEnvironment(
        'API_BASE_URL',
        defaultValue: 'https://prix-essence-codex.ygleck.workers.dev',
      ),
      mapProvider: rawMapProvider == 'google'
          ? MapProviderType.googleMaps
          : MapProviderType.openStreetMap,
      defaultRadiusKm: const int.fromEnvironment(
        'DEFAULT_RADIUS_KM',
        defaultValue: 20,
      ),
      availableRadiusKm: const [5, 10, 20, 30],
    );
  }
}
