// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'task.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$TaskImpl _$$TaskImplFromJson(Map<String, dynamic> json) => _$TaskImpl(
      taskId: json['taskId'] as String,
      userId: json['userId'] as String,
      toDeviceId: json['toDeviceId'] as String,
      envelope: TaskEnvelope.fromJson(json['envelope'] as Map<String, dynamic>),
      status: json['status'] as String? ?? 'pending',
      result: json['result'] as String?,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String?,
      messages: (json['messages'] as List<dynamic>?)
          ?.map((e) => TaskMessage.fromJson(e as Map<String, dynamic>))
          .toList(),
      cost: (json['cost'] as num?)?.toDouble(),
      checkpointIndex: (json['checkpointIndex'] as num?)?.toInt(),
    );

Map<String, dynamic> _$$TaskImplToJson(_$TaskImpl instance) =>
    <String, dynamic>{
      'taskId': instance.taskId,
      'userId': instance.userId,
      'toDeviceId': instance.toDeviceId,
      'envelope': instance.envelope,
      'status': instance.status,
      'result': instance.result,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      'messages': instance.messages,
      'cost': instance.cost,
      'checkpointIndex': instance.checkpointIndex,
    };

_$TaskEnvelopeImpl _$$TaskEnvelopeImplFromJson(Map<String, dynamic> json) =>
    _$TaskEnvelopeImpl(
      prompt: json['prompt'] as String,
      model: json['model'] as String,
      provider: json['provider'] as String?,
      permission: json['permission'] as String?,
      customProvider: json['customProvider'] as Map<String, dynamic>?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$TaskEnvelopeImplToJson(_$TaskEnvelopeImpl instance) =>
    <String, dynamic>{
      'prompt': instance.prompt,
      'model': instance.model,
      'provider': instance.provider,
      'permission': instance.permission,
      'customProvider': instance.customProvider,
      'metadata': instance.metadata,
    };

_$TaskMessageImpl _$$TaskMessageImplFromJson(Map<String, dynamic> json) =>
    _$TaskMessageImpl(
      id: json['id'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      agentName: json['agentName'] as String?,
      type: json['type'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      timestamp: json['timestamp'] as String,
    );

Map<String, dynamic> _$$TaskMessageImplToJson(_$TaskMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'role': instance.role,
      'content': instance.content,
      'agentName': instance.agentName,
      'type': instance.type,
      'metadata': instance.metadata,
      'timestamp': instance.timestamp,
    };
