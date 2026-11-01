import 'package:freezed_annotation/freezed_annotation.dart';

part 'brain_note.freezed.dart';
part 'brain_note.g.dart';

@freezed
class BrainNote with _$BrainNote {
  const factory BrainNote({
    required String id,
    required String title,
    required String content,
    required String projectPath,
    required String createdAt,
    required String updatedAt,
    List<String>? tags,
  }) = _BrainNote;

  factory BrainNote.fromJson(Map<String, dynamic> json) => _$BrainNoteFromJson(json);
}