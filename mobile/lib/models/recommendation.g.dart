// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recommendation.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecommendationImpl _$$RecommendationImplFromJson(Map<String, dynamic> json) =>
    _$RecommendationImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      category: json['category'] as String,
      installed: json['installed'] as bool? ?? false,
      dismissed: json['dismissed'] as bool? ?? false,
      dontSuggestAgain: json['dontSuggestAgain'] as bool? ?? false,
      configSchema: (json['configSchema'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, e as String),
      ),
      configValues: json['configValues'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$RecommendationImplToJson(
        _$RecommendationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
      'category': instance.category,
      'installed': instance.installed,
      'dismissed': instance.dismissed,
      'dontSuggestAgain': instance.dontSuggestAgain,
      'configSchema': instance.configSchema,
      'configValues': instance.configValues,
      'createdAt': instance.createdAt,
    };

_$RecommendationActionImpl _$$RecommendationActionImplFromJson(
        Map<String, dynamic> json) =>
    _$RecommendationActionImpl(
      recommendationId: json['recommendationId'] as String,
      action: json['action'] as String,
      configValues: json['configValues'] as Map<String, dynamic>?,
      timestamp: json['timestamp'] as String,
    );

Map<String, dynamic> _$$RecommendationActionImplToJson(
        _$RecommendationActionImpl instance) =>
    <String, dynamic>{
      'recommendationId': instance.recommendationId,
      'action': instance.action,
      'configValues': instance.configValues,
      'timestamp': instance.timestamp,
    };
