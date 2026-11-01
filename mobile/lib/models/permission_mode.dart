import 'package:freezed_annotation/freezed_annotation.dart';

part 'permission_mode.freezed.dart';
part 'permission_mode.g.dart';

enum PermissionMode {
  @JsonValue('ask')
  ask,
  @JsonValue('auto')
  autoApprove,
  @JsonValue('full')
  fullAccess;

  String get label {
    switch (this) {
      case PermissionMode.ask:
        return 'Ask';
      case PermissionMode.autoApprove:
        return 'Auto Approve';
      case PermissionMode.fullAccess:
        return 'Full Access';
    }
  }

  String get description {
    switch (this) {
      case PermissionMode.ask:
        return 'Every step asks on phone first';
      case PermissionMode.autoApprove:
        return 'Routine auto-approved; dangerous steps still ask';
      case PermissionMode.fullAccess:
        return 'Everything auto-approved, desktop never waits';
    }
  }

  static PermissionMode fromString(String value) {
    switch (value) {
      case 'auto':
        return PermissionMode.autoApprove;
      case 'full':
        return PermissionMode.fullAccess;
      default:
        return PermissionMode.ask;
    }
  }
}

@freezed
class DesktopPermissionSettings with _$DesktopPermissionSettings {
  const factory DesktopPermissionSettings({
    required String deviceId,
    @Default(PermissionMode.ask) PermissionMode mode,
    required String updatedAt,
  }) = _DesktopPermissionSettings;

  factory DesktopPermissionSettings.fromJson(Map<String, dynamic> json) => _$DesktopPermissionSettingsFromJson(json);
}