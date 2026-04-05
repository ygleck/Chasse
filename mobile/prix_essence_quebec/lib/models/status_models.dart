class DatasetMetadata {
  const DatasetMetadata({
    required this.sourceUrl,
    required this.detectionStrategy,
    required this.detectedAt,
    required this.fetchedAt,
    required this.generatedAt,
    required this.stationCount,
  });

  final String sourceUrl;
  final String detectionStrategy;
  final DateTime? detectedAt;
  final DateTime? fetchedAt;
  final DateTime? generatedAt;
  final int stationCount;

  factory DatasetMetadata.fromJson(Map<String, dynamic> json) {
    return DatasetMetadata(
      sourceUrl: json['sourceUrl'] as String? ?? '',
      detectionStrategy: json['detectionStrategy'] as String? ?? 'unknown',
      detectedAt: DateTime.tryParse(json['detectedAt'] as String? ?? ''),
      fetchedAt: DateTime.tryParse(json['fetchedAt'] as String? ?? ''),
      generatedAt: DateTime.tryParse(json['generatedAt'] as String? ?? ''),
      stationCount: (json['stationCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class StatusModel {
  const StatusModel({
    required this.ready,
    required this.stale,
    required this.cacheBackend,
    required this.metadata,
  });

  final bool ready;
  final bool stale;
  final String cacheBackend;
  final DatasetMetadata? metadata;

  factory StatusModel.fromJson(Map<String, dynamic> json) {
    return StatusModel(
      ready: json['ready'] as bool? ?? false,
      stale: json['stale'] as bool? ?? false,
      cacheBackend: json['cacheBackend'] as String? ?? 'memory',
      metadata: json['metadata'] == null
          ? null
          : DatasetMetadata.fromJson(json['metadata'] as Map<String, dynamic>),
    );
  }
}
