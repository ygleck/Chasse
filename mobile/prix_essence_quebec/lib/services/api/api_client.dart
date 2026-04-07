import 'dart:convert';

import 'package:dio/dio.dart';

import 'api_exception.dart';

class ApiClient {
  static const int _maxAttempts = 7;

  ApiClient({
    required String baseUrl,
  }) : _dio = Dio(
         BaseOptions(
           baseUrl: baseUrl,
           connectTimeout: const Duration(seconds: 15),
           receiveTimeout: const Duration(seconds: 20),
           responseType: ResponseType.json,
           headers: const {
             'accept': 'application/json',
             'content-type': 'application/json',
           },
         ),
       );

  final Dio _dio;

  Future<Map<String, dynamic>> getJson(String path) async {
    return _requestJson(() => _dio.get(path));
  }

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> payload,
  ) async {
    return _requestJson(
      () => _dio.post(
        path,
        data: payload,
      ),
    );
  }

  Future<Map<String, dynamic>> _requestJson(
    Future<Response<dynamic>> Function() request,
  ) async {
    DioException? lastError;

    for (var attempt = 1; attempt <= _maxAttempts; attempt++) {
      try {
        final response = await request();
        return _normalizeJsonObject(response.data);
      } on DioException catch (error) {
        lastError = error;

        if (!_shouldRetry(error, attempt)) {
          throw ApiException.fromDio(error);
        }

        await Future<void>.delayed(_retryDelay(attempt));
      }
    }

    throw ApiException.fromDio(lastError!);
  }

  bool _shouldRetry(DioException error, int attempt) {
    if (attempt >= _maxAttempts) {
      return false;
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.connectionError:
      case DioExceptionType.receiveTimeout:
        return true;
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        return statusCode == 429 ||
            statusCode == 502 ||
            statusCode == 503 ||
            statusCode == 504;
      case DioExceptionType.badCertificate:
      case DioExceptionType.cancel:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.unknown:
        return false;
    }
  }

  Duration _retryDelay(int attempt) {
    switch (attempt) {
      case 1:
        return const Duration(milliseconds: 500);
      case 2:
        return const Duration(milliseconds: 1200);
      case 3:
        return const Duration(milliseconds: 2000);
      case 4:
        return const Duration(milliseconds: 3500);
      case 5:
        return const Duration(seconds: 5);
      case 6:
        return const Duration(seconds: 7);
      default:
        return const Duration(seconds: 9);
    }
  }

  Map<String, dynamic> _normalizeJsonObject(dynamic raw) {
    if (raw == null) {
      return <String, dynamic>{};
    }

    if (raw is String) {
      final decoded = jsonDecode(raw);
      return _normalizeJsonObject(decoded);
    }

    if (raw is Map<String, dynamic>) {
      return raw;
    }

    if (raw is Map) {
      return raw.map(
        (key, value) => MapEntry(key.toString(), _normalizeJsonValue(value)),
      );
    }

    throw const ApiException(
      message: 'Le format de réponse du serveur est invalide.',
    );
  }

  dynamic _normalizeJsonValue(dynamic value) {
    if (value is Map<String, dynamic>) {
      return value;
    }

    if (value is Map) {
      return value.map(
        (key, nestedValue) =>
            MapEntry(key.toString(), _normalizeJsonValue(nestedValue)),
      );
    }

    if (value is List) {
      return value.map(_normalizeJsonValue).toList(growable: false);
    }

    return value;
  }
}
