// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'permission_mode.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

DesktopPermissionSettings _$DesktopPermissionSettingsFromJson(
    Map<String, dynamic> json) {
  return _DesktopPermissionSettings.fromJson(json);
}

/// @nodoc
mixin _$DesktopPermissionSettings {
  String get deviceId => throw _privateConstructorUsedError;
  PermissionMode get mode => throw _privateConstructorUsedError;
  String get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this DesktopPermissionSettings to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of DesktopPermissionSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $DesktopPermissionSettingsCopyWith<DesktopPermissionSettings> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $DesktopPermissionSettingsCopyWith<$Res> {
  factory $DesktopPermissionSettingsCopyWith(DesktopPermissionSettings value,
          $Res Function(DesktopPermissionSettings) then) =
      _$DesktopPermissionSettingsCopyWithImpl<$Res, DesktopPermissionSettings>;
  @useResult
  $Res call({String deviceId, PermissionMode mode, String updatedAt});
}

/// @nodoc
class _$DesktopPermissionSettingsCopyWithImpl<$Res,
        $Val extends DesktopPermissionSettings>
    implements $DesktopPermissionSettingsCopyWith<$Res> {
  _$DesktopPermissionSettingsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of DesktopPermissionSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? deviceId = null,
    Object? mode = null,
    Object? updatedAt = null,
  }) {
    return _then(_value.copyWith(
      deviceId: null == deviceId
          ? _value.deviceId
          : deviceId // ignore: cast_nullable_to_non_nullable
              as String,
      mode: null == mode
          ? _value.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as PermissionMode,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$DesktopPermissionSettingsImplCopyWith<$Res>
    implements $DesktopPermissionSettingsCopyWith<$Res> {
  factory _$$DesktopPermissionSettingsImplCopyWith(
          _$DesktopPermissionSettingsImpl value,
          $Res Function(_$DesktopPermissionSettingsImpl) then) =
      __$$DesktopPermissionSettingsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String deviceId, PermissionMode mode, String updatedAt});
}

/// @nodoc
class __$$DesktopPermissionSettingsImplCopyWithImpl<$Res>
    extends _$DesktopPermissionSettingsCopyWithImpl<$Res,
        _$DesktopPermissionSettingsImpl>
    implements _$$DesktopPermissionSettingsImplCopyWith<$Res> {
  __$$DesktopPermissionSettingsImplCopyWithImpl(
      _$DesktopPermissionSettingsImpl _value,
      $Res Function(_$DesktopPermissionSettingsImpl) _then)
      : super(_value, _then);

  /// Create a copy of DesktopPermissionSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? deviceId = null,
    Object? mode = null,
    Object? updatedAt = null,
  }) {
    return _then(_$DesktopPermissionSettingsImpl(
      deviceId: null == deviceId
          ? _value.deviceId
          : deviceId // ignore: cast_nullable_to_non_nullable
              as String,
      mode: null == mode
          ? _value.mode
          : mode // ignore: cast_nullable_to_non_nullable
              as PermissionMode,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$DesktopPermissionSettingsImpl implements _DesktopPermissionSettings {
  const _$DesktopPermissionSettingsImpl(
      {required this.deviceId,
      this.mode = PermissionMode.ask,
      required this.updatedAt});

  factory _$DesktopPermissionSettingsImpl.fromJson(Map<String, dynamic> json) =>
      _$$DesktopPermissionSettingsImplFromJson(json);

  @override
  final String deviceId;
  @override
  @JsonKey()
  final PermissionMode mode;
  @override
  final String updatedAt;

  @override
  String toString() {
    return 'DesktopPermissionSettings(deviceId: $deviceId, mode: $mode, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$DesktopPermissionSettingsImpl &&
            (identical(other.deviceId, deviceId) ||
                other.deviceId == deviceId) &&
            (identical(other.mode, mode) || other.mode == mode) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, deviceId, mode, updatedAt);

  /// Create a copy of DesktopPermissionSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$DesktopPermissionSettingsImplCopyWith<_$DesktopPermissionSettingsImpl>
      get copyWith => __$$DesktopPermissionSettingsImplCopyWithImpl<
          _$DesktopPermissionSettingsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$DesktopPermissionSettingsImplToJson(
      this,
    );
  }
}

abstract class _DesktopPermissionSettings implements DesktopPermissionSettings {
  const factory _DesktopPermissionSettings(
      {required final String deviceId,
      final PermissionMode mode,
      required final String updatedAt}) = _$DesktopPermissionSettingsImpl;

  factory _DesktopPermissionSettings.fromJson(Map<String, dynamic> json) =
      _$DesktopPermissionSettingsImpl.fromJson;

  @override
  String get deviceId;
  @override
  PermissionMode get mode;
  @override
  String get updatedAt;

  /// Create a copy of DesktopPermissionSettings
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$DesktopPermissionSettingsImplCopyWith<_$DesktopPermissionSettingsImpl>
      get copyWith => throw _privateConstructorUsedError;
}
