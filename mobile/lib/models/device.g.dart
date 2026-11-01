// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'device.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$DeviceImpl _$$DeviceImplFromJson(Map<String, dynamic> json) => _$DeviceImpl(
      deviceId: json['deviceId'] as String,
      name: json['name'] as String,
      type: json['type'] as String,
      lastSeen: json['lastSeen'] as String,
      pushToken: json['pushToken'] as String?,
      pairCode: json['pairCode'] as String?,
      lanUrl: json['lanUrl'] as String?,
    );

Map<String, dynamic> _$$DeviceImplToJson(_$DeviceImpl instance) =>
    <String, dynamic>{
      'deviceId': instance.deviceId,
      'name': instance.name,
      'type': instance.type,
      'lastSeen': instance.lastSeen,
      'pushToken': instance.pushToken,
      'pairCode': instance.pairCode,
      'lanUrl': instance.lanUrl,
    };
