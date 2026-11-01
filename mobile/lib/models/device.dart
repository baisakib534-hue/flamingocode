import 'package:freezed_annotation/freezed_annotation.dart';

part 'device.freezed.dart';
part 'device.g.dart';

@freezed
class Device with _$Device {
  const factory Device({
    required String deviceId,
    required String name,
    required String type, // 'desktop' | 'phone'
    required String lastSeen,
    String? pushToken,
    String? pairCode,
    String? lanUrl, // For LAN mode
  }) = _Device;

  factory Device.fromJson(Map<String, dynamic> json) => _$DeviceFromJson(json);
}

extension DeviceExtension on Device {
  bool get isDesktop => type == 'desktop';
  bool get isPhone => type == 'phone';
}