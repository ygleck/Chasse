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
    final responseData = exception.response?.data;
    if (responseData is Map<String, dynamic>) {
      final error = responseData['error'];
      if (error is Map<String, dynamic>) {
        return ApiException(
          message: error['message'] as String? ??
              'Une erreur réseau est survenue.',
          code: error['code'] as String?,
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
        DioExceptionType.badResponse =>
          'Le serveur a retourné une réponse invalide.',
        DioExceptionType.unknown => 'Une erreur réseau inattendue est survenue.',
      },
      statusCode: exception.response?.statusCode,
    );
  }

  @override
  String toString() => message;
}
