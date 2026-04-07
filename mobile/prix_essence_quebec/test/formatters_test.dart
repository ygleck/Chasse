import 'package:flutter_test/flutter_test.dart';
import 'package:prix_essence_quebec/core/utils/formatters.dart';

void main() {
  test('formatDate returns a value without locale initialization', () {
    final value = formatDate(DateTime.parse('2026-04-05T14:30:00Z'));

    expect(value, isNotEmpty);
    expect(value, isNot('Date inconnue'));
  });
}
