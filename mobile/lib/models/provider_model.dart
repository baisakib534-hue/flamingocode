import 'package:freezed_annotation/freezed_annotation.dart';

part 'provider_model.freezed.dart';
part 'provider_model.g.dart';

@freezed
class ProviderModel with _$ProviderModel {
  const factory ProviderModel({
    required String name,
    required List<ModelInfo> models,
  }) = _ProviderModel;

  factory ProviderModel.fromJson(Map<String, dynamic> json) => _$ProviderModelFromJson(json);
}

@freezed
class ModelInfo with _$ModelInfo {
  const factory ModelInfo({
    required String id,
    required String name,
    required String description,
  }) = _ModelInfo;

  factory ModelInfo.fromJson(Map<String, dynamic> json) => _$ModelInfoFromJson(json);
}

@freezed
class ProvidersList with _$ProvidersList {
  const factory ProvidersList({
    required List<ProviderModel> providers,
  }) = _ProvidersList;

  factory ProvidersList.fromJson(Map<String, dynamic> json) => _$ProvidersListFromJson(json);
}

@freezed
class CustomProvider with _$CustomProvider {
  const factory CustomProvider({
    required String id,
    required String name,
    required String baseUrl,
    required String apiKey,
    required String model,
    required String userId,
    required String createdAt,
  }) = _CustomProvider;

  factory CustomProvider.fromJson(Map<String, dynamic> json) => _$CustomProviderFromJson(json);
}