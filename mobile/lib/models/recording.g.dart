// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recording.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$RecordingImpl _$$RecordingImplFromJson(Map<String, dynamic> json) =>
    _$RecordingImpl(
      id: json['id'] as String,
      taskId: json['taskId'] as String,
      url: json['url'] as String,
      expiresAt: json['expiresAt'] as String,
      createdAt: json['createdAt'] as String,
    );

Map<String, dynamic> _$$RecordingImplToJson(_$RecordingImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'taskId': instance.taskId,
      'url': instance.url,
      'expiresAt': instance.expiresAt,
      'createdAt': instance.createdAt,
    };
