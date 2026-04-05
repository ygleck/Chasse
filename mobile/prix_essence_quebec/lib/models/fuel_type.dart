enum FuelType {
  regular('regular', 'Ordinaire'),
  diesel('diesel', 'Diesel'),
  premium('premium', 'Premium'),
  all('all', 'Toutes');

  const FuelType(this.apiValue, this.label);

  final String apiValue;
  final String label;

  static FuelType fromApi(String? value) {
    return FuelType.values.firstWhere(
      (item) => item.apiValue == value,
      orElse: () => FuelType.all,
    );
  }
}
