import 'package:freezed_annotation/freezed_annotation.dart';

part 'recording.freezed.dart';
part 'recording.g.dart';

@freezed
class Recording with _$Recording {
  const factory Recording({
    required String id,
    required String taskId,
    required String url,
    required String expiresAt,
    required String createdAt,
  }) = _Recording;

  factory Recording.fromJson(Map<String, dynamic> json) => _$RecordingFromJson(json);
}