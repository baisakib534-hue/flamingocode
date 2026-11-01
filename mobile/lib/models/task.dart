import 'package:freezed_annotation/freezed_annotation.dart';

part 'task.freezed.dart';
part 'task.g.dart';

@freezed
class Task with _$Task {
  const factory Task({
    required String taskId,
    required String userId,
    required String toDeviceId,
    required TaskEnvelope envelope,
    @Default('pending') String status, // pending, queued, running, needs-help, done, failed
    String? result,
    required String createdAt,
    String? updatedAt,
    List<TaskMessage>? messages,
    double? cost,
    int? checkpointIndex,
  }) = _Task;

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
}

@freezed
class TaskEnvelope with _$TaskEnvelope {
  const factory TaskEnvelope({
    required String prompt,
    required String model,
    String? provider,
    String? permission, // 'ask', 'auto', 'full'
    Map<String, dynamic>? customProvider,
    Map<String, dynamic>? metadata,
  }) = _TaskEnvelope;

  factory TaskEnvelope.fromJson(Map<String, dynamic> json) => _$TaskEnvelopeFromJson(json);
}

@freezed
class TaskMessage with _$TaskMessage {
  const factory TaskMessage({
    required String id,
    required String role, // 'user', 'assistant', 'system', 'agent'
    required String content,
    String? agentName,
    String? type, // 'text', 'tool_call', 'tool_result', 'checkpoint'
    Map<String, dynamic>? metadata,
    required String timestamp,
  }) = _TaskMessage;

  factory TaskMessage.fromJson(Map<String, dynamic> json) => _$TaskMessageFromJson(json);
}