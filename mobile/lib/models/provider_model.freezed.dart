// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'provider_model.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

ProviderModel _$ProviderModelFromJson(Map<String, dynamic> json) {
  return _ProviderModel.fromJson(json);
}

/// @nodoc
mixin _$ProviderModel {
  String get name => throw _privateConstructorUsedError;
  List<ModelInfo> get models => throw _privateConstructorUsedError;

  /// Serializes this ProviderModel to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProviderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProviderModelCopyWith<ProviderModel> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProviderModelCopyWith<$Res> {
  factory $ProviderModelCopyWith(
          ProviderModel value, $Res Function(ProviderModel) then) =
      _$ProviderModelCopyWithImpl<$Res, ProviderModel>;
  @useResult
  $Res call({String name, List<ModelInfo> models});
}

/// @nodoc
class _$ProviderModelCopyWithImpl<$Res, $Val extends ProviderModel>
    implements $ProviderModelCopyWith<$Res> {
  _$ProviderModelCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProviderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? models = null,
  }) {
    return _then(_value.copyWith(
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      models: null == models
          ? _value.models
          : models // ignore: cast_nullable_to_non_nullable
              as List<ModelInfo>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ProviderModelImplCopyWith<$Res>
    implements $ProviderModelCopyWith<$Res> {
  factory _$$ProviderModelImplCopyWith(
          _$ProviderModelImpl value, $Res Function(_$ProviderModelImpl) then) =
      __$$ProviderModelImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String name, List<ModelInfo> models});
}

/// @nodoc
class __$$ProviderModelImplCopyWithImpl<$Res>
    extends _$ProviderModelCopyWithImpl<$Res, _$ProviderModelImpl>
    implements _$$ProviderModelImplCopyWith<$Res> {
  __$$ProviderModelImplCopyWithImpl(
      _$ProviderModelImpl _value, $Res Function(_$ProviderModelImpl) _then)
      : super(_value, _then);

  /// Create a copy of ProviderModel
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? name = null,
    Object? models = null,
  }) {
    return _then(_$ProviderModelImpl(
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      models: null == models
          ? _value._models
          : models // ignore: cast_nullable_to_non_nullable
              as List<ModelInfo>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ProviderModelImpl implements _ProviderModel {
  const _$ProviderModelImpl(
      {required this.name, required final List<ModelInfo> models})
      : _models = models;

  factory _$ProviderModelImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProviderModelImplFromJson(json);

  @override
  final String name;
  final List<ModelInfo> _models;
  @override
  List<ModelInfo> get models {
    if (_models is EqualUnmodifiableListView) return _models;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_models);
  }

  @override
  String toString() {
    return 'ProviderModel(name: $name, models: $models)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProviderModelImpl &&
            (identical(other.name, name) || other.name == name) &&
            const DeepCollectionEquality().equals(other._models, _models));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, name, const DeepCollectionEquality().hash(_models));

  /// Create a copy of ProviderModel
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProviderModelImplCopyWith<_$ProviderModelImpl> get copyWith =>
      __$$ProviderModelImplCopyWithImpl<_$ProviderModelImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProviderModelImplToJson(
      this,
    );
  }
}

abstract class _ProviderModel implements ProviderModel {
  const factory _ProviderModel(
      {required final String name,
      required final List<ModelInfo> models}) = _$ProviderModelImpl;

  factory _ProviderModel.fromJson(Map<String, dynamic> json) =
      _$ProviderModelImpl.fromJson;

  @override
  String get name;
  @override
  List<ModelInfo> get models;

  /// Create a copy of ProviderModel
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProviderModelImplCopyWith<_$ProviderModelImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ModelInfo _$ModelInfoFromJson(Map<String, dynamic> json) {
  return _ModelInfo.fromJson(json);
}

/// @nodoc
mixin _$ModelInfo {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;

  /// Serializes this ModelInfo to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ModelInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ModelInfoCopyWith<ModelInfo> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ModelInfoCopyWith<$Res> {
  factory $ModelInfoCopyWith(ModelInfo value, $Res Function(ModelInfo) then) =
      _$ModelInfoCopyWithImpl<$Res, ModelInfo>;
  @useResult
  $Res call({String id, String name, String description});
}

/// @nodoc
class _$ModelInfoCopyWithImpl<$Res, $Val extends ModelInfo>
    implements $ModelInfoCopyWith<$Res> {
  _$ModelInfoCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ModelInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ModelInfoImplCopyWith<$Res>
    implements $ModelInfoCopyWith<$Res> {
  factory _$$ModelInfoImplCopyWith(
          _$ModelInfoImpl value, $Res Function(_$ModelInfoImpl) then) =
      __$$ModelInfoImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String name, String description});
}

/// @nodoc
class __$$ModelInfoImplCopyWithImpl<$Res>
    extends _$ModelInfoCopyWithImpl<$Res, _$ModelInfoImpl>
    implements _$$ModelInfoImplCopyWith<$Res> {
  __$$ModelInfoImplCopyWithImpl(
      _$ModelInfoImpl _value, $Res Function(_$ModelInfoImpl) _then)
      : super(_value, _then);

  /// Create a copy of ModelInfo
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
  }) {
    return _then(_$ModelInfoImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ModelInfoImpl implements _ModelInfo {
  const _$ModelInfoImpl(
      {required this.id, required this.name, required this.description});

  factory _$ModelInfoImpl.fromJson(Map<String, dynamic> json) =>
      _$$ModelInfoImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String description;

  @override
  String toString() {
    return 'ModelInfo(id: $id, name: $name, description: $description)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ModelInfoImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, name, description);

  /// Create a copy of ModelInfo
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ModelInfoImplCopyWith<_$ModelInfoImpl> get copyWith =>
      __$$ModelInfoImplCopyWithImpl<_$ModelInfoImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ModelInfoImplToJson(
      this,
    );
  }
}

abstract class _ModelInfo implements ModelInfo {
  const factory _ModelInfo(
      {required final String id,
      required final String name,
      required final String description}) = _$ModelInfoImpl;

  factory _ModelInfo.fromJson(Map<String, dynamic> json) =
      _$ModelInfoImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get description;

  /// Create a copy of ModelInfo
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ModelInfoImplCopyWith<_$ModelInfoImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ProvidersList _$ProvidersListFromJson(Map<String, dynamic> json) {
  return _ProvidersList.fromJson(json);
}

/// @nodoc
mixin _$ProvidersList {
  List<ProviderModel> get providers => throw _privateConstructorUsedError;

  /// Serializes this ProvidersList to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ProvidersList
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ProvidersListCopyWith<ProvidersList> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ProvidersListCopyWith<$Res> {
  factory $ProvidersListCopyWith(
          ProvidersList value, $Res Function(ProvidersList) then) =
      _$ProvidersListCopyWithImpl<$Res, ProvidersList>;
  @useResult
  $Res call({List<ProviderModel> providers});
}

/// @nodoc
class _$ProvidersListCopyWithImpl<$Res, $Val extends ProvidersList>
    implements $ProvidersListCopyWith<$Res> {
  _$ProvidersListCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ProvidersList
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? providers = null,
  }) {
    return _then(_value.copyWith(
      providers: null == providers
          ? _value.providers
          : providers // ignore: cast_nullable_to_non_nullable
              as List<ProviderModel>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$ProvidersListImplCopyWith<$Res>
    implements $ProvidersListCopyWith<$Res> {
  factory _$$ProvidersListImplCopyWith(
          _$ProvidersListImpl value, $Res Function(_$ProvidersListImpl) then) =
      __$$ProvidersListImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<ProviderModel> providers});
}

/// @nodoc
class __$$ProvidersListImplCopyWithImpl<$Res>
    extends _$ProvidersListCopyWithImpl<$Res, _$ProvidersListImpl>
    implements _$$ProvidersListImplCopyWith<$Res> {
  __$$ProvidersListImplCopyWithImpl(
      _$ProvidersListImpl _value, $Res Function(_$ProvidersListImpl) _then)
      : super(_value, _then);

  /// Create a copy of ProvidersList
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? providers = null,
  }) {
    return _then(_$ProvidersListImpl(
      providers: null == providers
          ? _value._providers
          : providers // ignore: cast_nullable_to_non_nullable
              as List<ProviderModel>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$ProvidersListImpl implements _ProvidersList {
  const _$ProvidersListImpl({required final List<ProviderModel> providers})
      : _providers = providers;

  factory _$ProvidersListImpl.fromJson(Map<String, dynamic> json) =>
      _$$ProvidersListImplFromJson(json);

  final List<ProviderModel> _providers;
  @override
  List<ProviderModel> get providers {
    if (_providers is EqualUnmodifiableListView) return _providers;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_providers);
  }

  @override
  String toString() {
    return 'ProvidersList(providers: $providers)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ProvidersListImpl &&
            const DeepCollectionEquality()
                .equals(other._providers, _providers));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, const DeepCollectionEquality().hash(_providers));

  /// Create a copy of ProvidersList
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ProvidersListImplCopyWith<_$ProvidersListImpl> get copyWith =>
      __$$ProvidersListImplCopyWithImpl<_$ProvidersListImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ProvidersListImplToJson(
      this,
    );
  }
}

abstract class _ProvidersList implements ProvidersList {
  const factory _ProvidersList({required final List<ProviderModel> providers}) =
      _$ProvidersListImpl;

  factory _ProvidersList.fromJson(Map<String, dynamic> json) =
      _$ProvidersListImpl.fromJson;

  @override
  List<ProviderModel> get providers;

  /// Create a copy of ProvidersList
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ProvidersListImplCopyWith<_$ProvidersListImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CustomProvider _$CustomProviderFromJson(Map<String, dynamic> json) {
  return _CustomProvider.fromJson(json);
}

/// @nodoc
mixin _$CustomProvider {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get baseUrl => throw _privateConstructorUsedError;
  String get apiKey => throw _privateConstructorUsedError;
  String get model => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get createdAt => throw _privateConstructorUsedError;

  /// Serializes this CustomProvider to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CustomProvider
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CustomProviderCopyWith<CustomProvider> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CustomProviderCopyWith<$Res> {
  factory $CustomProviderCopyWith(
          CustomProvider value, $Res Function(CustomProvider) then) =
      _$CustomProviderCopyWithImpl<$Res, CustomProvider>;
  @useResult
  $Res call(
      {String id,
      String name,
      String baseUrl,
      String apiKey,
      String model,
      String userId,
      String createdAt});
}

/// @nodoc
class _$CustomProviderCopyWithImpl<$Res, $Val extends CustomProvider>
    implements $CustomProviderCopyWith<$Res> {
  _$CustomProviderCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CustomProvider
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? baseUrl = null,
    Object? apiKey = null,
    Object? model = null,
    Object? userId = null,
    Object? createdAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CustomProviderImplCopyWith<$Res>
    implements $CustomProviderCopyWith<$Res> {
  factory _$$CustomProviderImplCopyWith(_$CustomProviderImpl value,
          $Res Function(_$CustomProviderImpl) then) =
      __$$CustomProviderImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String baseUrl,
      String apiKey,
      String model,
      String userId,
      String createdAt});
}

/// @nodoc
class __$$CustomProviderImplCopyWithImpl<$Res>
    extends _$CustomProviderCopyWithImpl<$Res, _$CustomProviderImpl>
    implements _$$CustomProviderImplCopyWith<$Res> {
  __$$CustomProviderImplCopyWithImpl(
      _$CustomProviderImpl _value, $Res Function(_$CustomProviderImpl) _then)
      : super(_value, _then);

  /// Create a copy of CustomProvider
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? baseUrl = null,
    Object? apiKey = null,
    Object? model = null,
    Object? userId = null,
    Object? createdAt = null,
  }) {
    return _then(_$CustomProviderImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      name: null == name
          ? _value.name
          : name // ignore: cast_nullable_to_non_nullable
              as String,
      baseUrl: null == baseUrl
          ? _value.baseUrl
          : baseUrl // ignore: cast_nullable_to_non_nullable
              as String,
      apiKey: null == apiKey
          ? _value.apiKey
          : apiKey // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CustomProviderImpl implements _CustomProvider {
  const _$CustomProviderImpl(
      {required this.id,
      required this.name,
      required this.baseUrl,
      required this.apiKey,
      required this.model,
      required this.userId,
      required this.createdAt});

  factory _$CustomProviderImpl.fromJson(Map<String, dynamic> json) =>
      _$$CustomProviderImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String baseUrl;
  @override
  final String apiKey;
  @override
  final String model;
  @override
  final String userId;
  @override
  final String createdAt;

  @override
  String toString() {
    return 'CustomProvider(id: $id, name: $name, baseUrl: $baseUrl, apiKey: $apiKey, model: $model, userId: $userId, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CustomProviderImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.baseUrl, baseUrl) || other.baseUrl == baseUrl) &&
            (identical(other.apiKey, apiKey) || other.apiKey == apiKey) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType, id, name, baseUrl, apiKey, model, userId, createdAt);

  /// Create a copy of CustomProvider
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CustomProviderImplCopyWith<_$CustomProviderImpl> get copyWith =>
      __$$CustomProviderImplCopyWithImpl<_$CustomProviderImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CustomProviderImplToJson(
      this,
    );
  }
}

abstract class _CustomProvider implements CustomProvider {
  const factory _CustomProvider(
      {required final String id,
      required final String name,
      required final String baseUrl,
      required final String apiKey,
      required final String model,
      required final String userId,
      required final String createdAt}) = _$CustomProviderImpl;

  factory _CustomProvider.fromJson(Map<String, dynamic> json) =
      _$CustomProviderImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get baseUrl;
  @override
  String get apiKey;
  @override
  String get model;
  @override
  String get userId;
  @override
  String get createdAt;

  /// Create a copy of CustomProvider
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CustomProviderImplCopyWith<_$CustomProviderImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
