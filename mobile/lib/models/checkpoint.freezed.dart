// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'checkpoint.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Checkpoint _$CheckpointFromJson(Map<String, dynamic> json) {
  return _Checkpoint.fromJson(json);
}

/// @nodoc
mixin _$Checkpoint {
  String get id => throw _privateConstructorUsedError;
  String get taskId => throw _privateConstructorUsedError;
  int get index => throw _privateConstructorUsedError;
  String get question => throw _privateConstructorUsedError;
  String? get context => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // pending, approved, rejected
  String? get response => throw _privateConstructorUsedError;
  String? get respondedAt => throw _privateConstructorUsedError;
  String get createdAt => throw _privateConstructorUsedError;

  /// Serializes this Checkpoint to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Checkpoint
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CheckpointCopyWith<Checkpoint> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CheckpointCopyWith<$Res> {
  factory $CheckpointCopyWith(
          Checkpoint value, $Res Function(Checkpoint) then) =
      _$CheckpointCopyWithImpl<$Res, Checkpoint>;
  @useResult
  $Res call(
      {String id,
      String taskId,
      int index,
      String question,
      String? context,
      String status,
      String? response,
      String? respondedAt,
      String createdAt});
}

/// @nodoc
class _$CheckpointCopyWithImpl<$Res, $Val extends Checkpoint>
    implements $CheckpointCopyWith<$Res> {
  _$CheckpointCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Checkpoint
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? taskId = null,
    Object? index = null,
    Object? question = null,
    Object? context = freezed,
    Object? status = null,
    Object? response = freezed,
    Object? respondedAt = freezed,
    Object? createdAt = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      index: null == index
          ? _value.index
          : index // ignore: cast_nullable_to_non_nullable
              as int,
      question: null == question
          ? _value.question
          : question // ignore: cast_nullable_to_non_nullable
              as String,
      context: freezed == context
          ? _value.context
          : context // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      response: freezed == response
          ? _value.response
          : response // ignore: cast_nullable_to_non_nullable
              as String?,
      respondedAt: freezed == respondedAt
          ? _value.respondedAt
          : respondedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$CheckpointImplCopyWith<$Res>
    implements $CheckpointCopyWith<$Res> {
  factory _$$CheckpointImplCopyWith(
          _$CheckpointImpl value, $Res Function(_$CheckpointImpl) then) =
      __$$CheckpointImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String taskId,
      int index,
      String question,
      String? context,
      String status,
      String? response,
      String? respondedAt,
      String createdAt});
}

/// @nodoc
class __$$CheckpointImplCopyWithImpl<$Res>
    extends _$CheckpointCopyWithImpl<$Res, _$CheckpointImpl>
    implements _$$CheckpointImplCopyWith<$Res> {
  __$$CheckpointImplCopyWithImpl(
      _$CheckpointImpl _value, $Res Function(_$CheckpointImpl) _then)
      : super(_value, _then);

  /// Create a copy of Checkpoint
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? taskId = null,
    Object? index = null,
    Object? question = null,
    Object? context = freezed,
    Object? status = null,
    Object? response = freezed,
    Object? respondedAt = freezed,
    Object? createdAt = null,
  }) {
    return _then(_$CheckpointImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      index: null == index
          ? _value.index
          : index // ignore: cast_nullable_to_non_nullable
              as int,
      question: null == question
          ? _value.question
          : question // ignore: cast_nullable_to_non_nullable
              as String,
      context: freezed == context
          ? _value.context
          : context // ignore: cast_nullable_to_non_nullable
              as String?,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      response: freezed == response
          ? _value.response
          : response // ignore: cast_nullable_to_non_nullable
              as String?,
      respondedAt: freezed == respondedAt
          ? _value.respondedAt
          : respondedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$CheckpointImpl implements _Checkpoint {
  const _$CheckpointImpl(
      {required this.id,
      required this.taskId,
      required this.index,
      required this.question,
      this.context,
      this.status = 'pending',
      this.response,
      this.respondedAt,
      required this.createdAt});

  factory _$CheckpointImpl.fromJson(Map<String, dynamic> json) =>
      _$$CheckpointImplFromJson(json);

  @override
  final String id;
  @override
  final String taskId;
  @override
  final int index;
  @override
  final String question;
  @override
  final String? context;
  @override
  @JsonKey()
  final String status;
// pending, approved, rejected
  @override
  final String? response;
  @override
  final String? respondedAt;
  @override
  final String createdAt;

  @override
  String toString() {
    return 'Checkpoint(id: $id, taskId: $taskId, index: $index, question: $question, context: $context, status: $status, response: $response, respondedAt: $respondedAt, createdAt: $createdAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CheckpointImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.taskId, taskId) || other.taskId == taskId) &&
            (identical(other.index, index) || other.index == index) &&
            (identical(other.question, question) ||
                other.question == question) &&
            (identical(other.context, context) || other.context == context) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.response, response) ||
                other.response == response) &&
            (identical(other.respondedAt, respondedAt) ||
                other.respondedAt == respondedAt) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, taskId, index, question,
      context, status, response, respondedAt, createdAt);

  /// Create a copy of Checkpoint
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CheckpointImplCopyWith<_$CheckpointImpl> get copyWith =>
      __$$CheckpointImplCopyWithImpl<_$CheckpointImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CheckpointImplToJson(
      this,
    );
  }
}

abstract class _Checkpoint implements Checkpoint {
  const factory _Checkpoint(
      {required final String id,
      required final String taskId,
      required final int index,
      required final String question,
      final String? context,
      final String status,
      final String? response,
      final String? respondedAt,
      required final String createdAt}) = _$CheckpointImpl;

  factory _Checkpoint.fromJson(Map<String, dynamic> json) =
      _$CheckpointImpl.fromJson;

  @override
  String get id;
  @override
  String get taskId;
  @override
  int get index;
  @override
  String get question;
  @override
  String? get context;
  @override
  String get status; // pending, approved, rejected
  @override
  String? get response;
  @override
  String? get respondedAt;
  @override
  String get createdAt;

  /// Create a copy of Checkpoint
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CheckpointImplCopyWith<_$CheckpointImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
