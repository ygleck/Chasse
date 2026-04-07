import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:prix_essence_quebec/services/api/api_client.dart';
import 'package:prix_essence_quebec/services/api/api_exception.dart';

void main() {
  group('ApiClient', () {
    test('retries transient 503 responses and returns the eventual payload', () async {
      var requestCount = 0;
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);

      server.listen((request) async {
        requestCount += 1;
        request.response.headers.contentType = ContentType.json;

        if (requestCount == 1) {
          request.response.statusCode = 503;
          request.response.write(
            jsonEncode({
              'title': 'Error 1102: Worker exceeded resource limits',
              'detail':
                  'A Worker script configured by the website owner exceeded its resource limits.',
              'error_code': 1102,
              'error_name': 'worker_exceeded_resources',
            }),
          );
        } else {
          request.response.statusCode = 200;
          request.response.write(
            jsonEncode({
              'ok': true,
              'data': {
                'message': 'ok',
              },
            }),
          );
        }

        await request.response.close();
      });

      addTearDown(server.close);

      final client = ApiClient(
        baseUrl: 'http://${server.address.host}:${server.port}',
      );

      final payload = await client.postJson(
        '/api/prix-essence/search',
        const {'radiusKm': 20},
      );

      expect(requestCount, 2);
      expect(payload['ok'], true);
      expect(payload['data'], isA<Map<String, dynamic>>());
    });
  });

  group('ApiException.fromDio', () {
    test('maps Cloudflare worker resource errors to a clearer French message', () {
      final requestOptions = RequestOptions(path: '/api/prix-essence/search');
      final response = Response<dynamic>(
        requestOptions: requestOptions,
        statusCode: 503,
        data: {
          'title': 'Error 1102: Worker exceeded resource limits',
          'detail': 'worker exceeded resources',
          'error_code': 1102,
          'error_name': 'worker_exceeded_resources',
        },
      );

      final exception = DioException(
        requestOptions: requestOptions,
        response: response,
        type: DioExceptionType.badResponse,
      );

      final apiException = ApiException.fromDio(exception);

      expect(
        apiException.message,
        'Le serveur est temporairement surchargé. Réessaie dans quelques secondes.',
      );
      expect(apiException.code, 'worker_exceeded_resources');
      expect(apiException.statusCode, 503);
    });
  });
}
