import 'package:freezed_annotation/freezed_annotation.dart';

part 'queued_message.freezed.dart';
part 'queued_message.g.dart';

@freezed
class QueuedMessage with _$QueuedMessage {
  const factory QueuedMessage({
    required String id,
    required String prompt,
    required String model,
    String? provider,
    String? permission,
    Map<String, dynamic>? customProvider,
    required int order,
    @Default('pending') String status, // pending, sending, sent, failed
    required String createdAt,
    String? sentAt,
  }) = _QueuedMessage;

  factory QueuedMessage.fromJson(Map<String, dynamic> json) => _$QueuedMessageFromJson(json);
}