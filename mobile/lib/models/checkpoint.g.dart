// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'checkpoint.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$CheckpointImpl _$$CheckpointImplFromJson(Map<String, dynamic> json) =>
    _$CheckpointImpl(
      id: json['id'] as String,
      taskId: json['taskId'] as String,
      index: (json['index'] as num).toInt(),
      question: json['question'] as String,
      context: json['context'] as String?,
      status: json['status'] as String? ?? 'pending',
      response: json['response'] as String?,
      respondedAt: json['respondedAt'] as String?,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$CheckpointImplToJson(_$CheckpointImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'taskId': instance.taskId,
      'index': instance.index,
      'question': instance.question,
      'context': instance.context,
      'status': instance.status,
      'response': instance.response,
      'respondedAt': instance.respondedAt,
      'createdAt': instance.createdAt,
    };
