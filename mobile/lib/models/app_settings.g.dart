// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_settings.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AppSettingsImpl _$$AppSettingsImplFromJson(Map<String, dynamic> json) =>
    _$AppSettingsImpl(
      lastSelectedDesktopId: json['lastSelectedDesktopId'] as String? ?? '',
      defaultPermissionMode: $enumDecodeNullable(
              _$PermissionModeEnumMap, json['defaultPermissionMode']) ??
          PermissionMode.ask,
      desktopPermissionModes:
          (json['desktopPermissionModes'] as Map<String, dynamic>?)?.map(
        (k, e) => MapEntry(k, $enumDecode(_$PermissionModeEnumMap, e)),
      ),
      desktopLanUrl: json['desktopLanUrl'] as String? ?? '',
      notificationsEnabled: json['notificationsEnabled'] as bool? ?? true,
      vibrationEnabled: json['vibrationEnabled'] as bool? ?? true,
      voiceLanguage: json['voiceLanguage'] as String? ?? 'en-US',
      relayBaseUrl: json['relayBaseUrl'] as String? ??
          'https://flamingocode-eta.vercel.app',
    );

Map<String, dynamic> _$$AppSettingsImplToJson(_$AppSettingsImpl instance) =>
    <String, dynamic>{
      'lastSelectedDesktopId': instance.lastSelectedDesktopId,
      'defaultPermissionMode':
          _$PermissionModeEnumMap[instance.defaultPermissionMode]!,
      'desktopPermissionModes': instance.desktopPermissionModes
          ?.map((k, e) => MapEntry(k, _$PermissionModeEnumMap[e]!)),
      'desktopLanUrl': instance.desktopLanUrl,
      'notificationsEnabled': instance.notificationsEnabled,
      'vibrationEnabled': instance.vibrationEnabled,
      'voiceLanguage': instance.voiceLanguage,
      'relayBaseUrl': instance.relayBaseUrl,
    };

const _$PermissionModeEnumMap = {
  PermissionMode.ask: 'ask',
  PermissionMode.autoApprove: 'auto',
  PermissionMode.fullAccess: 'full',
};
