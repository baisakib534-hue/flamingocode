// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'brain_note.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$BrainNoteImpl _$$BrainNoteImplFromJson(Map<String, dynamic> json) =>
    _$BrainNoteImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      projectPath: json['projectPath'] as String,
      createdAt: json['createdAt'] as String,
      updatedAt: json['updatedAt'] as String,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
    );

Map<String, dynamic> _$$BrainNoteImplToJson(_$BrainNoteImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'content': instance.content,
      'projectPath': instance.projectPath,
      'createdAt': instance.createdAt,
      'updatedAt': instance.updatedAt,
      'tags': instance.tags,
    };
