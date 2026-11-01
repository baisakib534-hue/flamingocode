// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'permission_mode.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DesktopPermissionSettingsImpl _$$DesktopPermissionSettingsImplFromJson(
        Map<String, dynamic> json) =>
    _$DesktopPermissionSettingsImpl(
      deviceId: json['deviceId'] as String,
      mode: $enumDecodeNullable(_$PermissionModeEnumMap, json['mode']) ??
          PermissionMode.ask,
      updatedAt: json['updatedAt'] as String,
    );

Map<String, dynamic> _$$DesktopPermissionSettingsImplToJson(
        _$DesktopPermissionSettingsImpl instance) =>
    <String, dynamic>{
      'deviceId': instance.deviceId,
      'mode': _$PermissionModeEnumMap[instance.mode]!,
      'updatedAt': instance.updatedAt,
    };

const _$PermissionModeEnumMap = {
  PermissionMode.ask: 'ask',
  PermissionMode.autoApprove: 'auto',
  PermissionMode.fullAccess: 'full',
};
