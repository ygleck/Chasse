import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/config/app_config.dart';
import '../features/home/application/home_controller.dart';
import '../features/home/application/home_state.dart';
import '../services/api/api_client.dart';
import '../services/api/prix_essence_api_service.dart';
import '../services/location/location_service.dart';
import '../services/storage/local_storage_service.dart';

final appConfigProvider = Provider<AppConfig>((ref) {
  return AppConfig.fromEnvironment();
});

final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences n’a pas été surchargé.');
});

final localStorageServiceProvider = Provider<LocalStorageService>((ref) {
  return LocalStorageService(ref.watch(sharedPreferencesProvider));
});

final apiClientProvider = Provider<ApiClient>((ref) {
  final appConfig = ref.watch(appConfigProvider);
  return ApiClient(baseUrl: appConfig.apiBaseUrl);
});

final prixEssenceApiServiceProvider = Provider<PrixEssenceApiService>((ref) {
  return PrixEssenceApiService(ref.watch(apiClientProvider));
});

final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService();
});

final homeControllerProvider = NotifierProvider<HomeController, HomeState>(
  HomeController.new,
);
