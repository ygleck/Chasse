import 'package:intl/intl.dart';

import '../../models/fuel_type.dart';

final _currencyFormatter = NumberFormat.currency(
  locale: 'fr_CA',
  symbol: r'$',
  decimalDigits: 3,
);

String formatPrice(double? value) {
  if (value == null) {
    return 'N/D';
  }

  return _currencyFormatter.format(value);
}

String formatDistance(double kilometers) {
  if (kilometers < 1) {
    return '${(kilometers * 1000).round()} m';
  }

  return '${kilometers.toStringAsFixed(1)} km';
}

String formatDate(DateTime? value) {
  if (value == null) {
    return 'Date inconnue';
  }

  try {
    return DateFormat('d MMM yyyy, HH:mm', 'fr_CA').format(value);
  } catch (_) {
    return DateFormat('yyyy-MM-dd HH:mm').format(value.toLocal());
  }
}

String fuelLabel(FuelType fuelType) => fuelType.label;
