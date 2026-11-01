import 'package:freezed_annotation/freezed_annotation.dart';

part 'checkpoint.freezed.dart';
part 'checkpoint.g.dart';

@freezed
class Checkpoint with _$Checkpoint {
  const factory Checkpoint({
    required String id,
    required String taskId,
    required int index,
    required String question,
    String? context,
    @Default('pending') String status, // pending, approved, rejected
    String? response,
    String? respondedAt,
    required String createdAt,
  }) = _Checkpoint;

  factory Checkpoint.fromJson(Map<String, dynamic> json) => _$CheckpointFromJson(json);
}