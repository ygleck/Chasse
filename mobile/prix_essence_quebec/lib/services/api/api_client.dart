import 'package:dio/dio.dart';

import 'api_exception.dart';

class ApiClient {
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
    try {
      final response = await _dio.get<Map<String, dynamic>>(path);
      return response.data ?? <String, dynamic>{};
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }

  Future<Map<String, dynamic>> postJson(
    String path,
    Map<String, dynamic> payload,
  ) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        path,
        data: payload,
      );
      return response.data ?? <String, dynamic>{};
    } on DioException catch (error) {
      throw ApiException.fromDio(error);
    }
  }
}
