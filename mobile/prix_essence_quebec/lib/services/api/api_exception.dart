import 'package:dio/dio.dart';

class ApiException implements Exception {
  const ApiException({
    required this.message,
    this.code,
    this.statusCode,
  });

  final String message;
  final String? code;
  final int? statusCode;

  factory ApiException.fromDio(DioException exception) {
    final responseData = _normalizeResponseData(exception.response?.data);
    if (responseData != null) {
      final error = _normalizeResponseData(responseData['error']);
      if (error != null) {
        return ApiException(
          message: error['message'] as String? ??
              'Une erreur réseau est survenue.',
          code: error['code'] as String?,
          statusCode: exception.response?.statusCode,
        );
      }

      final errorCode = responseData['error_code']?.toString();
      final errorName = responseData['error_name']?.toString();
      if (exception.response?.statusCode == 503 &&
          (errorCode == '1102' || errorName == 'worker_exceeded_resources')) {
        return ApiException(
          message:
              'Le serveur est temporairement surchargé. Réessaie dans quelques secondes.',
          code: errorName ?? errorCode,
          statusCode: exception.response?.statusCode,
        );
      }

      final detail = responseData['detail'] as String?;
      final message = responseData['message'] as String?;
      final title = responseData['title'] as String?;
      if (detail != null || message != null || title != null) {
        return ApiException(
          message:
              detail ??
              message ??
              title ??
              'Une erreur réseau est survenue.',
          code: errorName ?? errorCode,
          statusCode: exception.response?.statusCode,
        );
      }
    }

    return ApiException(
      message: switch (exception.type) {
        DioExceptionType.connectionTimeout =>
          'La connexion a expiré. Vérifie ta connexion Internet.',
        DioExceptionType.connectionError =>
          'Impossible de joindre le serveur. Vérifie ta connexion Internet.',
        DioExceptionType.receiveTimeout =>
          'Le serveur a mis trop de temps à répondre.',
        DioExceptionType.badCertificate =>
          'Le certificat réseau du serveur a été refusé.',
        DioExceptionType.cancel => 'La requête a été annulée.',
        DioExceptionType.sendTimeout =>
          'L’envoi de la requête a expiré.',
        DioExceptionType.badResponse => exception.response?.statusCode == 503
            ? 'Le serveur est temporairement indisponible. Réessaie dans quelques secondes.'
            : 'Le serveur a retourné une réponse invalide.',
        DioExceptionType.unknown => 'Une erreur réseau inattendue est survenue.',
      },
      statusCode: exception.response?.statusCode,
    );
  }

  @override
  String toString() => message;

  static Map<String, dynamic>? _normalizeResponseData(dynamic value) {
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
