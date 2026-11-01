// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'task.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

Task _$TaskFromJson(Map<String, dynamic> json) {
  return _Task.fromJson(json);
}

/// @nodoc
mixin _$Task {
  String get taskId => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get toDeviceId => throw _privateConstructorUsedError;
  TaskEnvelope get envelope => throw _privateConstructorUsedError;
  String get status =>
      throw _privateConstructorUsedError; // pending, queued, running, needs-help, done, failed
  String? get result => throw _privateConstructorUsedError;
  String get createdAt => throw _privateConstructorUsedError;
  String? get updatedAt => throw _privateConstructorUsedError;
  List<TaskMessage>? get messages => throw _privateConstructorUsedError;
  double? get cost => throw _privateConstructorUsedError;
  int? get checkpointIndex => throw _privateConstructorUsedError;

  /// Serializes this Task to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TaskCopyWith<Task> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskCopyWith<$Res> {
  factory $TaskCopyWith(Task value, $Res Function(Task) then) =
      _$TaskCopyWithImpl<$Res, Task>;
  @useResult
  $Res call(
      {String taskId,
      String userId,
      String toDeviceId,
      TaskEnvelope envelope,
      String status,
      String? result,
      String createdAt,
      String? updatedAt,
      List<TaskMessage>? messages,
      double? cost,
      int? checkpointIndex});

  $TaskEnvelopeCopyWith<$Res> get envelope;
}

/// @nodoc
class _$TaskCopyWithImpl<$Res, $Val extends Task>
    implements $TaskCopyWith<$Res> {
  _$TaskCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? taskId = null,
    Object? userId = null,
    Object? toDeviceId = null,
    Object? envelope = null,
    Object? status = null,
    Object? result = freezed,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? messages = freezed,
    Object? cost = freezed,
    Object? checkpointIndex = freezed,
  }) {
    return _then(_value.copyWith(
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      toDeviceId: null == toDeviceId
          ? _value.toDeviceId
          : toDeviceId // ignore: cast_nullable_to_non_nullable
              as String,
      envelope: null == envelope
          ? _value.envelope
          : envelope // ignore: cast_nullable_to_non_nullable
              as TaskEnvelope,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      result: freezed == result
          ? _value.result
          : result // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      messages: freezed == messages
          ? _value.messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<TaskMessage>?,
      cost: freezed == cost
          ? _value.cost
          : cost // ignore: cast_nullable_to_non_nullable
              as double?,
      checkpointIndex: freezed == checkpointIndex
          ? _value.checkpointIndex
          : checkpointIndex // ignore: cast_nullable_to_non_nullable
              as int?,
    ) as $Val);
  }

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $TaskEnvelopeCopyWith<$Res> get envelope {
    return $TaskEnvelopeCopyWith<$Res>(_value.envelope, (value) {
      return _then(_value.copyWith(envelope: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$TaskImplCopyWith<$Res> implements $TaskCopyWith<$Res> {
  factory _$$TaskImplCopyWith(
          _$TaskImpl value, $Res Function(_$TaskImpl) then) =
      __$$TaskImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String taskId,
      String userId,
      String toDeviceId,
      TaskEnvelope envelope,
      String status,
      String? result,
      String createdAt,
      String? updatedAt,
      List<TaskMessage>? messages,
      double? cost,
      int? checkpointIndex});

  @override
  $TaskEnvelopeCopyWith<$Res> get envelope;
}

/// @nodoc
class __$$TaskImplCopyWithImpl<$Res>
    extends _$TaskCopyWithImpl<$Res, _$TaskImpl>
    implements _$$TaskImplCopyWith<$Res> {
  __$$TaskImplCopyWithImpl(_$TaskImpl _value, $Res Function(_$TaskImpl) _then)
      : super(_value, _then);

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? taskId = null,
    Object? userId = null,
    Object? toDeviceId = null,
    Object? envelope = null,
    Object? status = null,
    Object? result = freezed,
    Object? createdAt = null,
    Object? updatedAt = freezed,
    Object? messages = freezed,
    Object? cost = freezed,
    Object? checkpointIndex = freezed,
  }) {
    return _then(_$TaskImpl(
      taskId: null == taskId
          ? _value.taskId
          : taskId // ignore: cast_nullable_to_non_nullable
              as String,
      userId: null == userId
          ? _value.userId
          : userId // ignore: cast_nullable_to_non_nullable
              as String,
      toDeviceId: null == toDeviceId
          ? _value.toDeviceId
          : toDeviceId // ignore: cast_nullable_to_non_nullable
              as String,
      envelope: null == envelope
          ? _value.envelope
          : envelope // ignore: cast_nullable_to_non_nullable
              as TaskEnvelope,
      status: null == status
          ? _value.status
          : status // ignore: cast_nullable_to_non_nullable
              as String,
      result: freezed == result
          ? _value.result
          : result // ignore: cast_nullable_to_non_nullable
              as String?,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: freezed == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String?,
      messages: freezed == messages
          ? _value._messages
          : messages // ignore: cast_nullable_to_non_nullable
              as List<TaskMessage>?,
      cost: freezed == cost
          ? _value.cost
          : cost // ignore: cast_nullable_to_non_nullable
              as double?,
      checkpointIndex: freezed == checkpointIndex
          ? _value.checkpointIndex
          : checkpointIndex // ignore: cast_nullable_to_non_nullable
              as int?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TaskImpl implements _Task {
  const _$TaskImpl(
      {required this.taskId,
      required this.userId,
      required this.toDeviceId,
      required this.envelope,
      this.status = 'pending',
      this.result,
      required this.createdAt,
      this.updatedAt,
      final List<TaskMessage>? messages,
      this.cost,
      this.checkpointIndex})
      : _messages = messages;

  factory _$TaskImpl.fromJson(Map<String, dynamic> json) =>
      _$$TaskImplFromJson(json);

  @override
  final String taskId;
  @override
  final String userId;
  @override
  final String toDeviceId;
  @override
  final TaskEnvelope envelope;
  @override
  @JsonKey()
  final String status;
// pending, queued, running, needs-help, done, failed
  @override
  final String? result;
  @override
  final String createdAt;
  @override
  final String? updatedAt;
  final List<TaskMessage>? _messages;
  @override
  List<TaskMessage>? get messages {
    final value = _messages;
    if (value == null) return null;
    if (_messages is EqualUnmodifiableListView) return _messages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final double? cost;
  @override
  final int? checkpointIndex;

  @override
  String toString() {
    return 'Task(taskId: $taskId, userId: $userId, toDeviceId: $toDeviceId, envelope: $envelope, status: $status, result: $result, createdAt: $createdAt, updatedAt: $updatedAt, messages: $messages, cost: $cost, checkpointIndex: $checkpointIndex)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TaskImpl &&
            (identical(other.taskId, taskId) || other.taskId == taskId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.toDeviceId, toDeviceId) ||
                other.toDeviceId == toDeviceId) &&
            (identical(other.envelope, envelope) ||
                other.envelope == envelope) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.result, result) || other.result == result) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(other._messages, _messages) &&
            (identical(other.cost, cost) || other.cost == cost) &&
            (identical(other.checkpointIndex, checkpointIndex) ||
                other.checkpointIndex == checkpointIndex));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      taskId,
      userId,
      toDeviceId,
      envelope,
      status,
      result,
      createdAt,
      updatedAt,
      const DeepCollectionEquality().hash(_messages),
      cost,
      checkpointIndex);

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TaskImplCopyWith<_$TaskImpl> get copyWith =>
      __$$TaskImplCopyWithImpl<_$TaskImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TaskImplToJson(
      this,
    );
  }
}

abstract class _Task implements Task {
  const factory _Task(
      {required final String taskId,
      required final String userId,
      required final String toDeviceId,
      required final TaskEnvelope envelope,
      final String status,
      final String? result,
      required final String createdAt,
      final String? updatedAt,
      final List<TaskMessage>? messages,
      final double? cost,
      final int? checkpointIndex}) = _$TaskImpl;

  factory _Task.fromJson(Map<String, dynamic> json) = _$TaskImpl.fromJson;

  @override
  String get taskId;
  @override
  String get userId;
  @override
  String get toDeviceId;
  @override
  TaskEnvelope get envelope;
  @override
  String get status; // pending, queued, running, needs-help, done, failed
  @override
  String? get result;
  @override
  String get createdAt;
  @override
  String? get updatedAt;
  @override
  List<TaskMessage>? get messages;
  @override
  double? get cost;
  @override
  int? get checkpointIndex;

  /// Create a copy of Task
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TaskImplCopyWith<_$TaskImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskEnvelope _$TaskEnvelopeFromJson(Map<String, dynamic> json) {
  return _TaskEnvelope.fromJson(json);
}

/// @nodoc
mixin _$TaskEnvelope {
  String get prompt => throw _privateConstructorUsedError;
  String get model => throw _privateConstructorUsedError;
  String? get provider => throw _privateConstructorUsedError;
  String? get permission =>
      throw _privateConstructorUsedError; // 'ask', 'auto', 'full'
  Map<String, dynamic>? get customProvider =>
      throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this TaskEnvelope to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TaskEnvelope
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TaskEnvelopeCopyWith<TaskEnvelope> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskEnvelopeCopyWith<$Res> {
  factory $TaskEnvelopeCopyWith(
          TaskEnvelope value, $Res Function(TaskEnvelope) then) =
      _$TaskEnvelopeCopyWithImpl<$Res, TaskEnvelope>;
  @useResult
  $Res call(
      {String prompt,
      String model,
      String? provider,
      String? permission,
      Map<String, dynamic>? customProvider,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class _$TaskEnvelopeCopyWithImpl<$Res, $Val extends TaskEnvelope>
    implements $TaskEnvelopeCopyWith<$Res> {
  _$TaskEnvelopeCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TaskEnvelope
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? prompt = null,
    Object? model = null,
    Object? provider = freezed,
    Object? permission = freezed,
    Object? customProvider = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_value.copyWith(
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
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TaskEnvelopeImplCopyWith<$Res>
    implements $TaskEnvelopeCopyWith<$Res> {
  factory _$$TaskEnvelopeImplCopyWith(
          _$TaskEnvelopeImpl value, $Res Function(_$TaskEnvelopeImpl) then) =
      __$$TaskEnvelopeImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String prompt,
      String model,
      String? provider,
      String? permission,
      Map<String, dynamic>? customProvider,
      Map<String, dynamic>? metadata});
}

/// @nodoc
class __$$TaskEnvelopeImplCopyWithImpl<$Res>
    extends _$TaskEnvelopeCopyWithImpl<$Res, _$TaskEnvelopeImpl>
    implements _$$TaskEnvelopeImplCopyWith<$Res> {
  __$$TaskEnvelopeImplCopyWithImpl(
      _$TaskEnvelopeImpl _value, $Res Function(_$TaskEnvelopeImpl) _then)
      : super(_value, _then);

  /// Create a copy of TaskEnvelope
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? prompt = null,
    Object? model = null,
    Object? provider = freezed,
    Object? permission = freezed,
    Object? customProvider = freezed,
    Object? metadata = freezed,
  }) {
    return _then(_$TaskEnvelopeImpl(
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
      metadata: freezed == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$TaskEnvelopeImpl implements _TaskEnvelope {
  const _$TaskEnvelopeImpl(
      {required this.prompt,
      required this.model,
      this.provider,
      this.permission,
      final Map<String, dynamic>? customProvider,
      final Map<String, dynamic>? metadata})
      : _customProvider = customProvider,
        _metadata = metadata;

  factory _$TaskEnvelopeImpl.fromJson(Map<String, dynamic> json) =>
      _$$TaskEnvelopeImplFromJson(json);

  @override
  final String prompt;
  @override
  final String model;
  @override
  final String? provider;
  @override
  final String? permission;
// 'ask', 'auto', 'full'
  final Map<String, dynamic>? _customProvider;
// 'ask', 'auto', 'full'
  @override
  Map<String, dynamic>? get customProvider {
    final value = _customProvider;
    if (value == null) return null;
    if (_customProvider is EqualUnmodifiableMapView) return _customProvider;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'TaskEnvelope(prompt: $prompt, model: $model, provider: $provider, permission: $permission, customProvider: $customProvider, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TaskEnvelopeImpl &&
            (identical(other.prompt, prompt) || other.prompt == prompt) &&
            (identical(other.model, model) || other.model == model) &&
            (identical(other.provider, provider) ||
                other.provider == provider) &&
            (identical(other.permission, permission) ||
                other.permission == permission) &&
            const DeepCollectionEquality()
                .equals(other._customProvider, _customProvider) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      prompt,
      model,
      provider,
      permission,
      const DeepCollectionEquality().hash(_customProvider),
      const DeepCollectionEquality().hash(_metadata));

  /// Create a copy of TaskEnvelope
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TaskEnvelopeImplCopyWith<_$TaskEnvelopeImpl> get copyWith =>
      __$$TaskEnvelopeImplCopyWithImpl<_$TaskEnvelopeImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TaskEnvelopeImplToJson(
      this,
    );
  }
}

abstract class _TaskEnvelope implements TaskEnvelope {
  const factory _TaskEnvelope(
      {required final String prompt,
      required final String model,
      final String? provider,
      final String? permission,
      final Map<String, dynamic>? customProvider,
      final Map<String, dynamic>? metadata}) = _$TaskEnvelopeImpl;

  factory _TaskEnvelope.fromJson(Map<String, dynamic> json) =
      _$TaskEnvelopeImpl.fromJson;

  @override
  String get prompt;
  @override
  String get model;
  @override
  String? get provider;
  @override
  String? get permission; // 'ask', 'auto', 'full'
  @override
  Map<String, dynamic>? get customProvider;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of TaskEnvelope
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TaskEnvelopeImplCopyWith<_$TaskEnvelopeImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

TaskMessage _$TaskMessageFromJson(Map<String, dynamic> json) {
  return _TaskMessage.fromJson(json);
}

/// @nodoc
mixin _$TaskMessage {
  String get id => throw _privateConstructorUsedError;
  String get role =>
      throw _privateConstructorUsedError; // 'user', 'assistant', 'system', 'agent'
  String get content => throw _privateConstructorUsedError;
  String? get agentName => throw _privateConstructorUsedError;
  String? get type =>
      throw _privateConstructorUsedError; // 'text', 'tool_call', 'tool_result', 'checkpoint'
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;
  String get timestamp => throw _privateConstructorUsedError;

  /// Serializes this TaskMessage to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TaskMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TaskMessageCopyWith<TaskMessage> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TaskMessageCopyWith<$Res> {
  factory $TaskMessageCopyWith(
          TaskMessage value, $Res Function(TaskMessage) then) =
      _$TaskMessageCopyWithImpl<$Res, TaskMessage>;
  @useResult
  $Res call(
      {String id,
      String role,
      String content,
      String? agentName,
      String? type,
      Map<String, dynamic>? metadata,
      String timestamp});
}

/// @nodoc
class _$TaskMessageCopyWithImpl<$Res, $Val extends TaskMessage>
    implements $TaskMessageCopyWith<$Res> {
  _$TaskMessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TaskMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? role = null,
    Object? content = null,
    Object? agentName = freezed,
    Object? type = freezed,
    Object? metadata = freezed,
    Object? timestamp = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      agentName: freezed == agentName
          ? _value.agentName
          : agentName // ignore: cast_nullable_to_non_nullable
              as String?,
      type: freezed == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      timestamp: null == timestamp
          ? _value.timestamp
          : timestamp // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$TaskMessageImplCopyWith<$Res>
    implements $TaskMessageCopyWith<$Res> {
  factory _$$TaskMessageImplCopyWith(
          _$TaskMessageImpl value, $Res Function(_$TaskMessageImpl) then) =
      __$$TaskMessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String role,
      String content,
      String? agentName,
      String? type,
      Map<String, dynamic>? metadata,
      String timestamp});
}

/// @nodoc
class __$$TaskMessageImplCopyWithImpl<$Res>
    extends _$TaskMessageCopyWithImpl<$Res, _$TaskMessageImpl>
    implements _$$TaskMessageImplCopyWith<$Res> {
  __$$TaskMessageImplCopyWithImpl(
      _$TaskMessageImpl _value, $Res Function(_$TaskMessageImpl) _then)
      : super(_value, _then);

  /// Create a copy of TaskMessage
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? role = null,
    Object? content = null,
    Object? agentName = freezed,
    Object? type = freezed,
    Object? metadata = freezed,
    Object? timestamp = null,
  }) {
    return _then(_$TaskMessageImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      role: null == role
          ? _value.role
          : role // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      agentName: freezed == agentName
          ? _value.agentName
          : agentName // ignore: cast_nullable_to_non_nullable
              as String?,
      type: freezed == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String?,
      metadata: freezed == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
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
class _$TaskMessageImpl implements _TaskMessage {
  const _$TaskMessageImpl(
      {required this.id,
      required this.role,
      required this.content,
      this.agentName,
      this.type,
      final Map<String, dynamic>? metadata,
      required this.timestamp})
      : _metadata = metadata;

  factory _$TaskMessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$TaskMessageImplFromJson(json);

  @override
  final String id;
  @override
  final String role;
// 'user', 'assistant', 'system', 'agent'
  @override
  final String content;
  @override
  final String? agentName;
  @override
  final String? type;
// 'text', 'tool_call', 'tool_result', 'checkpoint'
  final Map<String, dynamic>? _metadata;
// 'text', 'tool_call', 'tool_result', 'checkpoint'
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  final String timestamp;

  @override
  String toString() {
    return 'TaskMessage(id: $id, role: $role, content: $content, agentName: $agentName, type: $type, metadata: $metadata, timestamp: $timestamp)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TaskMessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.agentName, agentName) ||
                other.agentName == agentName) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, role, content, agentName,
      type, const DeepCollectionEquality().hash(_metadata), timestamp);

  /// Create a copy of TaskMessage
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TaskMessageImplCopyWith<_$TaskMessageImpl> get copyWith =>
      __$$TaskMessageImplCopyWithImpl<_$TaskMessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TaskMessageImplToJson(
      this,
    );
  }
}

abstract class _TaskMessage implements TaskMessage {
  const factory _TaskMessage(
      {required final String id,
      required final String role,
      required final String content,
      final String? agentName,
      final String? type,
      final Map<String, dynamic>? metadata,
      required final String timestamp}) = _$TaskMessageImpl;

  factory _TaskMessage.fromJson(Map<String, dynamic> json) =
      _$TaskMessageImpl.fromJson;

  @override
  String get id;
  @override
  String get role; // 'user', 'assistant', 'system', 'agent'
  @override
  String get content;
  @override
  String? get agentName;
  @override
  String? get type; // 'text', 'tool_call', 'tool_result', 'checkpoint'
  @override
  Map<String, dynamic>? get metadata;
  @override
  String get timestamp;

  /// Create a copy of TaskMessage
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TaskMessageImplCopyWith<_$TaskMessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
