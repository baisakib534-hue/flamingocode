import 'package:freezed_annotation/freezed_annotation.dart';
import 'permission_mode.dart';

part 'app_settings.freezed.dart';
part 'app_settings.g.dart';

@freezed
class AppSettings with _$AppSettings {
  const factory AppSettings({
    @Default('') String lastSelectedDesktopId,
    @Default(PermissionMode.ask) PermissionMode defaultPermissionMode,
    Map<String, PermissionMode>? desktopPermissionModes, // deviceId -> mode
    @Default('') String desktopLanUrl,
    @Default(true) bool notificationsEnabled,
    @Default(true) bool vibrationEnabled,
    @Default('en-US') String voiceLanguage, // 'en-US' or 'bn-BD'
    @Default('https://flamingocode-eta.vercel.app') String relayBaseUrl,
  }) = _AppSettings;

  factory AppSettings.fromJson(Map<String, dynamic> json) => _$AppSettingsFromJson(json);
}

extension AppSettingsExtension on AppSettings {
  PermissionMode getPermissionMode(String deviceId) {
    return desktopPermissionModes?[deviceId] ?? defaultPermissionMode;
  }
}