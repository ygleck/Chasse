import '../../../models/favorite_station.dart';
import '../../../models/fuel_type.dart';
import '../../../models/recent_search.dart';
import '../../../models/search_request.dart';
import '../../../models/search_result.dart';
import '../../../models/status_models.dart';

class HomeState {
  const HomeState({
    required this.query,
    required this.fuelType,
    required this.radiusKm,
    required this.result,
    required this.status,
    required this.recentSearches,
    required this.favorites,
    required this.selectedStationId,
    required this.isSearching,
    required this.isLocating,
    required this.errorMessage,
    required this.lastRequest,
  });

  static const _unset = Object();

  final String query;
  final FuelType fuelType;
  final int radiusKm;
  final SearchResultModel? result;
  final StatusModel? status;
  final List<RecentSearch> recentSearches;
  final List<FavoriteStation> favorites;
  final String? selectedStationId;
  final bool isSearching;
  final bool isLocating;
  final String? errorMessage;
  final SearchRequest? lastRequest;

  bool get isRefreshing => isSearching && result != null;

  HomeState copyWith({
    String? query,
    FuelType? fuelType,
    int? radiusKm,
    Object? result = _unset,
    Object? status = _unset,
    List<RecentSearch>? recentSearches,
    List<FavoriteStation>? favorites,
    Object? selectedStationId = _unset,
    bool? isSearching,
    bool? isLocating,
    Object? errorMessage = _unset,
    Object? lastRequest = _unset,
  }) {
    return HomeState(
      query: query ?? this.query,
      fuelType: fuelType ?? this.fuelType,
      radiusKm: radiusKm ?? this.radiusKm,
      result: identical(result, _unset)
          ? this.result
          : result as SearchResultModel?,
      status: identical(status, _unset) ? this.status : status as StatusModel?,
      recentSearches: recentSearches ?? this.recentSearches,
      favorites: favorites ?? this.favorites,
      selectedStationId: identical(selectedStationId, _unset)
          ? this.selectedStationId
          : selectedStationId as String?,
      isSearching: isSearching ?? this.isSearching,
      isLocating: isLocating ?? this.isLocating,
      errorMessage: identical(errorMessage, _unset)
          ? this.errorMessage
          : errorMessage as String?,
      lastRequest: identical(lastRequest, _unset)
          ? this.lastRequest
          : lastRequest as SearchRequest?,
    );
  }

  factory HomeState.initial({
    required FuelType fuelType,
    required int radiusKm,
    required List<RecentSearch> recentSearches,
    required List<FavoriteStation> favorites,
  }) {
    return HomeState(
      query: '',
      fuelType: fuelType,
      radiusKm: radiusKm,
      result: null,
      status: null,
      recentSearches: recentSearches,
      favorites: favorites,
      selectedStationId: null,
      isSearching: false,
      isLocating: false,
      errorMessage: null,
      lastRequest: null,
    );
  }
}
