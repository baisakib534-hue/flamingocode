import 'package:freezed_annotation/freezed_annotation.dart';

part 'recommendation.freezed.dart';
part 'recommendation.g.dart';

@freezed
class Recommendation with _$Recommendation {
  const factory Recommendation({
    required String id,
    required String name,
    required String description,
    required String category,
    @Default(false) bool installed,
    @Default(false) bool dismissed,
    @Default(false) bool dontSuggestAgain,
    Map<String, String>? configSchema, // key -> label for config boxes
    Map<String, dynamic>? configValues, // user-filled values
    required String createdAt,
  }) = _Recommendation;

  factory Recommendation.fromJson(Map<String, dynamic> json) => _$RecommendationFromJson(json);
}

@freezed
class RecommendationAction with _$RecommendationAction {
  const factory RecommendationAction({
    required String recommendationId,
    required String action, // 'install', 'dismiss', 'dont_suggest'
    Map<String, dynamic>? configValues,
    required String timestamp,
  }) = _RecommendationAction;

  factory RecommendationAction.fromJson(Map<String, dynamic> json) => _$RecommendationActionFromJson(json);
}