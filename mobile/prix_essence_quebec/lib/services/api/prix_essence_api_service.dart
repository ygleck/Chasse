import '../../models/search_request.dart';
import '../../models/search_result.dart';
import '../../models/status_models.dart';
import 'api_client.dart';
import 'api_exception.dart';

class PrixEssenceApiService {
  const PrixEssenceApiService(this._apiClient);

  final ApiClient _apiClient;

  Future<StatusModel> fetchStatus() async {
    final payload = await _apiClient.getJson('/api/prix-essence/status');
    return _unwrap(payload, StatusModel.fromJson);
  }

  Future<SearchResultModel> search(SearchRequest request) async {
    final payload = await _apiClient.postJson(
      '/api/prix-essence/search',
      request.toJson(),
    );
    return _unwrap(payload, SearchResultModel.fromJson);
  }

  T _unwrap<T>(
    Map<String, dynamic> payload,
    T Function(Map<String, dynamic>) parser,
  ) {
    final ok = payload['ok'] as bool? ?? false;

    if (!ok) {
      final error = _asJsonMap(payload['error']) ?? const {};
      throw ApiException(
        message: error['message'] as String? ??
            'Le serveur a retourné une erreur inconnue.',
        code: error['code'] as String?,
      );
    }

    final data = _asJsonMap(payload['data']);
    if (data == null) {
      throw const ApiException(
        message: 'Le format de réponse du serveur est invalide.',
      );
    }

    return parser(data);
  }

  Map<String, dynamic>? _asJsonMap(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }

    if (value is Map) {
      return value.map(
        (key, nestedValue) => MapEntry(key.toString(), nestedValue),
      );
    }

    return null;
  }
}
