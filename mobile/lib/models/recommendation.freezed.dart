// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'recommendation.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Recommendation _$RecommendationFromJson(Map<String, dynamic> json) {
  return _Recommendation.fromJson(json);
}

/// @nodoc
mixin _$Recommendation {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get category => throw _privateConstructorUsedError;
  bool get installed => throw _privateConstructorUsedError;
  bool get dismissed => throw _privateConstructorUsedError;
  bool get dontSuggestAgain => throw _privateConstructorUsedError;
  Map<String, String>? get configSchema =>
      throw _privateConstructorUsedError; // key -> label for config boxes
  Map<String, dynamic>? get configValues =>
      throw _privateConstructorUsedError; // user-filled values
  String get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Recommendation to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Recommendation
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecommendationCopyWith<Recommendation> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecommendationCopyWith<$Res> {
  factory $RecommendationCopyWith(
          Recommendation value, $Res Function(Recommendation) then) =
      _$RecommendationCopyWithImpl<$Res, Recommendation>;
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      String category,
      bool installed,
      bool dismissed,
      bool dontSuggestAgain,
      Map<String, String>? configSchema,
      Map<String, dynamic>? configValues,
      String createdAt});
}

/// @nodoc
class _$RecommendationCopyWithImpl<$Res, $Val extends Recommendation>
    implements $RecommendationCopyWith<$Res> {
  _$RecommendationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Recommendation
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? category = null,
    Object? installed = null,
    Object? dismissed = null,
    Object? dontSuggestAgain = null,
    Object? configSchema = freezed,
    Object? configValues = freezed,
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
      description: null == description
          ? _value.description
          : description // ignore: cast_nullable_to_non_nullable
              as String,
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      installed: null == installed
          ? _value.installed
          : installed // ignore: cast_nullable_to_non_nullable
              as bool,
      dismissed: null == dismissed
          ? _value.dismissed
          : dismissed // ignore: cast_nullable_to_non_nullable
              as bool,
      dontSuggestAgain: null == dontSuggestAgain
          ? _value.dontSuggestAgain
          : dontSuggestAgain // ignore: cast_nullable_to_non_nullable
              as bool,
      configSchema: freezed == configSchema
          ? _value.configSchema
          : configSchema // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      configValues: freezed == configValues
          ? _value.configValues
          : configValues // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RecommendationImplCopyWith<$Res>
    implements $RecommendationCopyWith<$Res> {
  factory _$$RecommendationImplCopyWith(_$RecommendationImpl value,
          $Res Function(_$RecommendationImpl) then) =
      __$$RecommendationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String name,
      String description,
      String category,
      bool installed,
      bool dismissed,
      bool dontSuggestAgain,
      Map<String, String>? configSchema,
      Map<String, dynamic>? configValues,
      String createdAt});
}

/// @nodoc
class __$$RecommendationImplCopyWithImpl<$Res>
    extends _$RecommendationCopyWithImpl<$Res, _$RecommendationImpl>
    implements _$$RecommendationImplCopyWith<$Res> {
  __$$RecommendationImplCopyWithImpl(
      _$RecommendationImpl _value, $Res Function(_$RecommendationImpl) _then)
      : super(_value, _then);

  /// Create a copy of Recommendation
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? category = null,
    Object? installed = null,
    Object? dismissed = null,
    Object? dontSuggestAgain = null,
    Object? configSchema = freezed,
    Object? configValues = freezed,
    Object? createdAt = null,
  }) {
    return _then(_$RecommendationImpl(
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
      category: null == category
          ? _value.category
          : category // ignore: cast_nullable_to_non_nullable
              as String,
      installed: null == installed
          ? _value.installed
          : installed // ignore: cast_nullable_to_non_nullable
              as bool,
      dismissed: null == dismissed
          ? _value.dismissed
          : dismissed // ignore: cast_nullable_to_non_nullable
              as bool,
      dontSuggestAgain: null == dontSuggestAgain
          ? _value.dontSuggestAgain
          : dontSuggestAgain // ignore: cast_nullable_to_non_nullable
              as bool,
      configSchema: freezed == configSchema
          ? _value._configSchema
          : configSchema // ignore: cast_nullable_to_non_nullable
              as Map<String, String>?,
      configValues: freezed == configValues
          ? _value._configValues
          : configValues // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RecommendationImpl implements _Recommendation {
  const _$RecommendationImpl(
      {required this.id,
      required this.name,
      required this.description,
      required this.category,
      this.installed = false,
      this.dismissed = false,
      this.dontSuggestAgain = false,
      final Map<String, String>? configSchema,
      final Map<String, dynamic>? configValues,
      required this.createdAt})
      : _configSchema = configSchema,
        _configValues = configValues;

  factory _$RecommendationImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecommendationImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String description;
  @override
  final String category;
  @override
  @JsonKey()
  final bool installed;
  @override
  @JsonKey()
  final bool dismissed;
  @override
  @JsonKey()
  final bool dontSuggestAgain;
  final Map<String, String>? _configSchema;
  @override
  Map<String, String>? get configSchema {
    final value = _configSchema;
    if (value == null) return null;
    if (_configSchema is EqualUnmodifiableMapView) return _configSchema;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// key -> label for config boxes
  final Map<String, dynamic>? _configValues;
// key -> label for config boxes
  @override
  Map<String, dynamic>? get configValues {
    final value = _configValues;
    if (value == null) return null;
    if (_configValues is EqualUnmodifiableMapView) return _configValues;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// user-filled values
  @override
  final String createdAt;

  @override
  String toString() {
    return 'Recommendation(id: $id, name: $name, description: $description, category: $category, installed: $installed, dismissed: $dismissed, dontSuggestAgain: $dontSuggestAgain, configSchema: $configSchema, configValues: $configValues, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecommendationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.category, category) ||
                other.category == category) &&
            (identical(other.installed, installed) ||
                other.installed == installed) &&
            (identical(other.dismissed, dismissed) ||
                other.dismissed == dismissed) &&
            (identical(other.dontSuggestAgain, dontSuggestAgain) ||
                other.dontSuggestAgain == dontSuggestAgain) &&
            const DeepCollectionEquality()
                .equals(other._configSchema, _configSchema) &&
            const DeepCollectionEquality()
                .equals(other._configValues, _configValues) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      name,
      description,
      category,
      installed,
      dismissed,
      dontSuggestAgain,
      const DeepCollectionEquality().hash(_configSchema),
      const DeepCollectionEquality().hash(_configValues),
      createdAt);

  /// Create a copy of Recommendation
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecommendationImplCopyWith<_$RecommendationImpl> get copyWith =>
      __$$RecommendationImplCopyWithImpl<_$RecommendationImpl>(
          this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RecommendationImplToJson(
      this,
    );
  }
}

abstract class _Recommendation implements Recommendation {
  const factory _Recommendation(
      {required final String id,
      required final String name,
      required final String description,
      required final String category,
      final bool installed,
      final bool dismissed,
      final bool dontSuggestAgain,
      final Map<String, String>? configSchema,
      final Map<String, dynamic>? configValues,
      required final String createdAt}) = _$RecommendationImpl;

  factory _Recommendation.fromJson(Map<String, dynamic> json) =
      _$RecommendationImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get description;
  @override
  String get category;
  @override
  bool get installed;
  @override
  bool get dismissed;
  @override
  bool get dontSuggestAgain;
  @override
  Map<String, String>? get configSchema; // key -> label for config boxes
  @override
  Map<String, dynamic>? get configValues; // user-filled values
  @override
  String get createdAt;

  /// Create a copy of Recommendation
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecommendationImplCopyWith<_$RecommendationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RecommendationAction _$RecommendationActionFromJson(Map<String, dynamic> json) {
  return _RecommendationAction.fromJson(json);
}

/// @nodoc
mixin _$RecommendationAction {
  String get recommendationId => throw _privateConstructorUsedError;
  String get action =>
      throw _privateConstructorUsedError; // 'install', 'dismiss', 'dont_suggest'
  Map<String, dynamic>? get configValues => throw _privateConstructorUsedError;
  String get timestamp => throw _privateConstructorUsedError;

  /// Serializes this RecommendationAction to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RecommendationAction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecommendationActionCopyWith<RecommendationAction> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecommendationActionCopyWith<$Res> {
  factory $RecommendationActionCopyWith(RecommendationAction value,
          $Res Function(RecommendationAction) then) =
      _$RecommendationActionCopyWithImpl<$Res, RecommendationAction>;
  @useResult
  $Res call(
      {String recommendationId,
      String action,
      Map<String, dynamic>? configValues,
      String timestamp});
}

/// @nodoc
class _$RecommendationActionCopyWithImpl<$Res,
        $Val extends RecommendationAction>
    implements $RecommendationActionCopyWith<$Res> {
  _$RecommendationActionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecommendationAction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? recommendationId = null,
    Object? action = null,
    Object? configValues = freezed,
    Object? timestamp = null,
  }) {
    return _then(_value.copyWith(
      recommendationId: null == recommendationId
          ? _value.recommendationId
          : recommendationId // ignore: cast_nullable_to_non_nullable
              as String,
      action: null == action
          ? _value.action
          : action // ignore: cast_nullable_to_non_nullable
              as String,
      configValues: freezed == configValues
          ? _value.configValues
          : configValues // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      timestamp: null == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$RecommendationActionImplCopyWith<$Res>
    implements $RecommendationActionCopyWith<$Res> {
  factory _$$RecommendationActionImplCopyWith(_$RecommendationActionImpl value,
          $Res Function(_$RecommendationActionImpl) then) =
      __$$RecommendationActionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String recommendationId,
      String action,
      Map<String, dynamic>? configValues,
      String timestamp});
}

/// @nodoc
class __$$RecommendationActionImplCopyWithImpl<$Res>
    extends _$RecommendationActionCopyWithImpl<$Res, _$RecommendationActionImpl>
    implements _$$RecommendationActionImplCopyWith<$Res> {
  __$$RecommendationActionImplCopyWithImpl(_$RecommendationActionImpl _value,
      $Res Function(_$RecommendationActionImpl) _then)
      : super(_value, _then);

  /// Create a copy of RecommendationAction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? recommendationId = null,
    Object? action = null,
    Object? configValues = freezed,
    Object? timestamp = null,
  }) {
    return _then(_$RecommendationActionImpl(
      recommendationId: null == recommendationId
          ? _value.recommendationId
          : recommendationId // ignore: cast_nullable_to_non_nullable
              as String,
      action: null == action
          ? _value.action
          : action // ignore: cast_nullable_to_non_nullable
              as String,
      configValues: freezed == configValues
          ? _value._configValues
          : configValues // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      timestamp: null == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$RecommendationActionImpl implements _RecommendationAction {
  const _$RecommendationActionImpl(
      {required this.recommendationId,
      required this.action,
      final Map<String, dynamic>? configValues,
      required this.timestamp})
      : _configValues = configValues;

  factory _$RecommendationActionImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecommendationActionImplFromJson(json);

  @override
  final String recommendationId;
  @override
  final String action;
// 'install', 'dismiss', 'dont_suggest'
  final Map<String, dynamic>? _configValues;
// 'install', 'dismiss', 'dont_suggest'
  @override
  Map<String, dynamic>? get configValues {
    final value = _configValues;
    if (value == null) return null;
    if (_configValues is EqualUnmodifiableMapView) return _configValues;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final String timestamp;

  @override
  String toString() {
    return 'RecommendationAction(recommendationId: $recommendationId, action: $action, configValues: $configValues, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecommendationActionImpl &&
            (identical(other.recommendationId, recommendationId) ||
                other.recommendationId == recommendationId) &&
            (identical(other.action, action) || other.action == action) &&
            const DeepCollectionEquality()
                .equals(other._configValues, _configValues) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, recommendationId, action,
      const DeepCollectionEquality().hash(_configValues), timestamp);

  /// Create a copy of RecommendationAction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecommendationActionImplCopyWith<_$RecommendationActionImpl>
      get copyWith =>
          __$$RecommendationActionImplCopyWithImpl<_$RecommendationActionImpl>(
              this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RecommendationActionImplToJson(
      this,
    );
  }
}

abstract class _RecommendationAction implements RecommendationAction {
  const factory _RecommendationAction(
      {required final String recommendationId,
      required final String action,
      final Map<String, dynamic>? configValues,
      required final String timestamp}) = _$RecommendationActionImpl;

  factory _RecommendationAction.fromJson(Map<String, dynamic> json) =
      _$RecommendationActionImpl.fromJson;

  @override
  String get recommendationId;
  @override
  String get action; // 'install', 'dismiss', 'dont_suggest'
  @override
  Map<String, dynamic>? get configValues;
  @override
  String get timestamp;

  /// Create a copy of RecommendationAction
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecommendationActionImplCopyWith<_$RecommendationActionImpl>
      get copyWith => throw _privateConstructorUsedError;
}
