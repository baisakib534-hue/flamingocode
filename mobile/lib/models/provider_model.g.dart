// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'provider_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ProviderModelImpl _$$ProviderModelImplFromJson(Map<String, dynamic> json) =>
    _$ProviderModelImpl(
      name: json['name'] as String,
      models: (json['models'] as List<dynamic>)
          .map((e) => ModelInfo.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$ProviderModelImplToJson(_$ProviderModelImpl instance) =>
    <String, dynamic>{
      'name': instance.name,
      'models': instance.models,
    };

_$ModelInfoImpl _$$ModelInfoImplFromJson(Map<String, dynamic> json) =>
    _$ModelInfoImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
    );

Map<String, dynamic> _$$ModelInfoImplToJson(_$ModelInfoImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'description': instance.description,
    };

_$ProvidersListImpl _$$ProvidersListImplFromJson(Map<String, dynamic> json) =>
    _$ProvidersListImpl(
      providers: (json['providers'] as List<dynamic>)
          .map((e) => ProviderModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$ProvidersListImplToJson(_$ProvidersListImpl instance) =>
    <String, dynamic>{
      'providers': instance.providers,
    };

_$CustomProviderImpl _$$CustomProviderImplFromJson(Map<String, dynamic> json) =>
    _$CustomProviderImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      baseUrl: json['baseUrl'] as String,
      apiKey: json['apiKey'] as String,
      model: json['model'] as String,
      userId: json['userId'] as String,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$CustomProviderImplToJson(
        _$CustomProviderImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'baseUrl': instance.baseUrl,
      'apiKey': instance.apiKey,
      'model': instance.model,
      'userId': instance.userId,
      'createdAt': instance.createdAt,
    };
