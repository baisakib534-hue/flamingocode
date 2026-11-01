// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'queued_message.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$QueuedMessageImpl _$$QueuedMessageImplFromJson(Map<String, dynamic> json) =>
    _$QueuedMessageImpl(
      id: json['id'] as String,
      prompt: json['prompt'] as String,
      model: json['model'] as String,
      provider: json['provider'] as String?,
      permission: json['permission'] as String?,
      customProvider: json['customProvider'] as Map<String, dynamic>?,
      order: (json['order'] as num).toInt(),
      status: json['status'] as String? ?? 'pending',
      createdAt: json['createdAt'] as String,
      sentAt: json['sentAt'] as String?,
    );

Map<String, dynamic> _$$QueuedMessageImplToJson(_$QueuedMessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'prompt': instance.prompt,
      'model': instance.model,
      'provider': instance.provider,
      'permission': instance.permission,
      'customProvider': instance.customProvider,
      'order': instance.order,
      'status': instance.status,
      'createdAt': instance.createdAt,
      'sentAt': instance.sentAt,
    };
