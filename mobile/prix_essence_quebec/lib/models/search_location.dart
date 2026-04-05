class SearchLocation {
  const SearchLocation({
    required this.latitude,
    required this.longitude,
    required this.label,
    this.source,
  });

  final double latitude;
  final double longitude;
  final String label;
  final String? source;

  factory SearchLocation.fromJson(Map<String, dynamic> json) {
    return SearchLocation(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      label: json['label'] as String? ?? 'Position inconnue',
      source: json['source'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'label': label,
      if (source != null) 'source': source,
    };
  }
}
