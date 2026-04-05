import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:prix_essence_quebec/app.dart';
import 'package:prix_essence_quebec/models/status_models.dart';
import 'package:prix_essence_quebec/providers/app_providers.dart';
import 'package:prix_essence_quebec/services/api/api_client.dart';
import 'package:prix_essence_quebec/services/api/prix_essence_api_service.dart';

class _FakePrixEssenceApiService extends PrixEssenceApiService {
  _FakePrixEssenceApiService() : super(ApiClient(baseUrl: 'https://example.com'));

  @override
  Future<StatusModel> fetchStatus() async {
    return const StatusModel(
      ready: true,
      stale: false,
      cacheBackend: 'memory',
      metadata: DatasetMetadata(
        sourceUrl: 'https://example.com/stations.xlsx',
        detectionStrategy: 'manual',
        detectedAt: null,
        fetchedAt: null,
        generatedAt: null,
        stationCount: 1234,
      ),
    );
  }
}

void main() {
  testWidgets('affiche l’écran principal mobile', (tester) async {
    SharedPreferences.setMockInitialValues({});
    final sharedPreferences = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
          prixEssenceApiServiceProvider.overrideWithValue(_FakePrixEssenceApiService()),
        ],
        child: const PrixEssenceMobileApp(),
      ),
    );

    await tester.pump();

    expect(find.text('Prix essence Québec'), findsOneWidget);
    expect(find.text('Rechercher'), findsOneWidget);
    expect(find.text('Favoris'), findsOneWidget);
  });
}
