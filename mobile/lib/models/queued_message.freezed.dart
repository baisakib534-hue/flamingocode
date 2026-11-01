// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'queued_message.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

QueuedMessage _$QueuedMessageFromJson(Map<String, dynamic> json) {
  return _QueuedMessage.fromJson(json);
}

/// @nodoc
mixin _$QueuedMessage {
  String get id => throw _privateConstructorUsedError;
  String get prompt => throw _privateConstructorUsedError;
  String get model => throw _privateConstructorUsedError;
  String? get provider => throw _privateConstructorUsedError;
  String? get permission => throw _privateConstructorUsedError;
  Map<String, dynamic>? get customProvider =>
      throw _privateConstructorUsedError;
  int get order => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // pending, sending, sent, failed
  String get createdAt => throw _privateConstructorUsedError;
  String? get sentAt => throw _privateConstructorUsedError;

  /// Serializes this QueuedMessage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of QueuedMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $QueuedMessageCopyWith<QueuedMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $QueuedMessageCopyWith<$Res> {
  factory $QueuedMessageCopyWith(
          QueuedMessage value, $Res Function(QueuedMessage) then) =
      _$QueuedMessageCopyWithImpl<$Res, QueuedMessage>;
  @useResult
  $Res call(
      {String id,
      String prompt,
      String model,
      String? provider,
      String? permission,
      Map<String, dynamic>? customProvider,
      int order,
      String status,
      String createdAt,
      String? sentAt});
}

/// @nodoc
class _$QueuedMessageCopyWithImpl<$Res, $Val extends QueuedMessage>
    implements $QueuedMessageCopyWith<$Res> {
  _$QueuedMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of QueuedMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? prompt = null,
    Object? model = null,
    Object? provider = freezed,
    Object? permission = freezed,
    Object? customProvider = freezed,
    Object? order = null,
    Object? status = null,
    Object? createdAt = null,
    Object? sentAt = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      prompt: null == prompt
          ? _value.prompt
          : prompt // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      provider: freezed == provider
          ? _value.provider
          : provider // ignore: cast_nullable_to_non_nullable
              as String?,
      permission: freezed == permission
          ? _value.permission
          : permission // ignore: cast_nullable_to_non_nullable
              as String?,
      customProvider: freezed == customProvider
          ? _value.customProvider
          : customProvider // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      sentAt: freezed == sentAt
          ? _value.sentAt
          : sentAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$QueuedMessageImplCopyWith<$Res>
    implements $QueuedMessageCopyWith<$Res> {
  factory _$$QueuedMessageImplCopyWith(
          _$QueuedMessageImpl value, $Res Function(_$QueuedMessageImpl) then) =
      __$$QueuedMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String prompt,
      String model,
      String? provider,
      String? permission,
      Map<String, dynamic>? customProvider,
      int order,
      String status,
      String createdAt,
      String? sentAt});
}

/// @nodoc
class __$$QueuedMessageImplCopyWithImpl<$Res>
    extends _$QueuedMessageCopyWithImpl<$Res, _$QueuedMessageImpl>
    implements _$$QueuedMessageImplCopyWith<$Res> {
  __$$QueuedMessageImplCopyWithImpl(
      _$QueuedMessageImpl _value, $Res Function(_$QueuedMessageImpl) _then)
      : super(_value, _then);

  /// Create a copy of QueuedMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? prompt = null,
    Object? model = null,
    Object? provider = freezed,
    Object? permission = freezed,
    Object? customProvider = freezed,
    Object? order = null,
    Object? status = null,
    Object? createdAt = null,
    Object? sentAt = freezed,
  }) {
    return _then(_$QueuedMessageImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      prompt: null == prompt
          ? _value.prompt
          : prompt // ignore: cast_nullable_to_non_nullable
              as String,
      model: null == model
          ? _value.model
          : model // ignore: cast_nullable_to_non_nullable
              as String,
      provider: freezed == provider
          ? _value.provider
          : provider // ignore: cast_nullable_to_non_nullable
              as String?,
      permission: freezed == permission
          ? _value.permission
          : permission // ignore: cast_nullable_to_non_nullable
              as String?,
      customProvider: freezed == customProvider
          ? _value._customProvider
          : customProvider // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      order: null == order
          ? _value.order
          : order // ignore: cast_nullable_to_non_nullable
              as int,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      sentAt: freezed == sentAt
          ? _value.sentAt
          : sentAt // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$QueuedMessageImpl implements _QueuedMessage {
  const _$QueuedMessageImpl(
      {required this.id,
      required this.prompt,
      required this.model,
      this.provider,
      this.permission,
      final Map<String, dynamic>? customProvider,
      required this.order,
      this.status = 'pending',
      required this.createdAt,
      this.sentAt})
      : _customProvider = customProvider;

  factory _$QueuedMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$QueuedMessageImplFromJson(json);

  @override
  final String id;
  @override
  final String prompt;
  @override
  final String model;
  @override
  final String? provider;
  @override
  final String? permission;
  final Map<String, dynamic>? _customProvider;
  @override
  Map<String, dynamic>? get customProvider {
    final value = _customProvider;
    if (value == null) return null;
    if (_customProvider is EqualUnmodifiableMapView) return _customProvider;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final int order;
  @override
  @JsonKey()
  final String status;
// pending, sending, sent, failed
  @override
  final String createdAt;
  @override
  final String? sentAt;

  @override
  String toString() {
    return 'QueuedMessage(id: $id, prompt: $prompt, model: $model, provider: $provider, permission: $permission, customProvider: $customProvider, order: $order, status: $status, createdAt: $createdAt, sentAt: $sentAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$QueuedMessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.prompt, prompt) || other.prompt == prompt) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.provider, provider) ||
                other.provider == provider) &&
            (identical(other.permission, permission) ||
                other.permission == permission) &&
            const DeepCollectionEquality()
                .equals(other._customProvider, _customProvider) &&
            (identical(other.order, order) || other.order == order) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.sentAt, sentAt) || other.sentAt == sentAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      id,
      prompt,
      model,
      provider,
      permission,
      const DeepCollectionEquality().hash(_customProvider),
      order,
      status,
      createdAt,
      sentAt);

  /// Create a copy of QueuedMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$QueuedMessageImplCopyWith<_$QueuedMessageImpl> get copyWith =>
      __$$QueuedMessageImplCopyWithImpl<_$QueuedMessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$QueuedMessageImplToJson(
      this,
    );
  }
}

abstract class _QueuedMessage implements QueuedMessage {
  const factory _QueuedMessage(
      {required final String id,
      required final String prompt,
      required final String model,
      final String? provider,
      final String? permission,
      final Map<String, dynamic>? customProvider,
      required final int order,
      final String status,
      required final String createdAt,
      final String? sentAt}) = _$QueuedMessageImpl;

  factory _QueuedMessage.fromJson(Map<String, dynamic> json) =
      _$QueuedMessageImpl.fromJson;

  @override
  String get id;
  @override
  String get prompt;
  @override
  String get model;
  @override
  String? get provider;
  @override
  String? get permission;
  @override
  Map<String, dynamic>? get customProvider;
  @override
  int get order;
  @override
  String get status; // pending, sending, sent, failed
  @override
  String get createdAt;
  @override
  String? get sentAt;

  /// Create a copy of QueuedMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$QueuedMessageImplCopyWith<_$QueuedMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
