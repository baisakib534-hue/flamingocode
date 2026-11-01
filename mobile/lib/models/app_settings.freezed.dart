// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_settings.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

AppSettings _$AppSettingsFromJson(Map<String, dynamic> json) {
  return _AppSettings.fromJson(json);
}

/// @nodoc
mixin _$AppSettings {
  String get lastSelectedDesktopId => throw _privateConstructorUsedError;
  PermissionMode get defaultPermissionMode =>
      throw _privateConstructorUsedError;
  Map<String, PermissionMode>? get desktopPermissionModes =>
      throw _privateConstructorUsedError; // deviceId -> mode
  String get desktopLanUrl => throw _privateConstructorUsedError;
  bool get notificationsEnabled => throw _privateConstructorUsedError;
  bool get vibrationEnabled => throw _privateConstructorUsedError;
  String get voiceLanguage =>
      throw _privateConstructorUsedError; // 'en-US' or 'bn-BD'
  String get relayBaseUrl => throw _privateConstructorUsedError;

  /// Serializes this AppSettings to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AppSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppSettingsCopyWith<AppSettings> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppSettingsCopyWith<$Res> {
  factory $AppSettingsCopyWith(
          AppSettings value, $Res Function(AppSettings) then) =
      _$AppSettingsCopyWithImpl<$Res, AppSettings>;
  @useResult
  $Res call(
      {String lastSelectedDesktopId,
      PermissionMode defaultPermissionMode,
      Map<String, PermissionMode>? desktopPermissionModes,
      String desktopLanUrl,
      bool notificationsEnabled,
      bool vibrationEnabled,
      String voiceLanguage,
      String relayBaseUrl});
}

/// @nodoc
class _$AppSettingsCopyWithImpl<$Res, $Val extends AppSettings>
    implements $AppSettingsCopyWith<$Res> {
  _$AppSettingsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lastSelectedDesktopId = null,
    Object? defaultPermissionMode = null,
    Object? desktopPermissionModes = freezed,
    Object? desktopLanUrl = null,
    Object? notificationsEnabled = null,
    Object? vibrationEnabled = null,
    Object? voiceLanguage = null,
    Object? relayBaseUrl = null,
  }) {
    return _then(_value.copyWith(
      lastSelectedDesktopId: null == lastSelectedDesktopId
          ? _value.lastSelectedDesktopId
          : lastSelectedDesktopId // ignore: cast_nullable_to_non_nullable
              as String,
      defaultPermissionMode: null == defaultPermissionMode
          ? _value.defaultPermissionMode
          : defaultPermissionMode // ignore: cast_nullable_to_non_nullable
              as PermissionMode,
      desktopPermissionModes: freezed == desktopPermissionModes
          ? _value.desktopPermissionModes
          : desktopPermissionModes // ignore: cast_nullable_to_non_nullable
              as Map<String, PermissionMode>?,
      desktopLanUrl: null == desktopLanUrl
          ? _value.desktopLanUrl
          : desktopLanUrl // ignore: cast_nullable_to_non_nullable
              as String,
      notificationsEnabled: null == notificationsEnabled
          ? _value.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      vibrationEnabled: null == vibrationEnabled
          ? _value.vibrationEnabled
          : vibrationEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      voiceLanguage: null == voiceLanguage
          ? _value.voiceLanguage
          : voiceLanguage // ignore: cast_nullable_to_non_nullable
              as String,
      relayBaseUrl: null == relayBaseUrl
          ? _value.relayBaseUrl
          : relayBaseUrl // ignore: cast_nullable_to_non_nullable
              as String,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$AppSettingsImplCopyWith<$Res>
    implements $AppSettingsCopyWith<$Res> {
  factory _$$AppSettingsImplCopyWith(
          _$AppSettingsImpl value, $Res Function(_$AppSettingsImpl) then) =
      __$$AppSettingsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String lastSelectedDesktopId,
      PermissionMode defaultPermissionMode,
      Map<String, PermissionMode>? desktopPermissionModes,
      String desktopLanUrl,
      bool notificationsEnabled,
      bool vibrationEnabled,
      String voiceLanguage,
      String relayBaseUrl});
}

/// @nodoc
class __$$AppSettingsImplCopyWithImpl<$Res>
    extends _$AppSettingsCopyWithImpl<$Res, _$AppSettingsImpl>
    implements _$$AppSettingsImplCopyWith<$Res> {
  __$$AppSettingsImplCopyWithImpl(
      _$AppSettingsImpl _value, $Res Function(_$AppSettingsImpl) _then)
      : super(_value, _then);

  /// Create a copy of AppSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? lastSelectedDesktopId = null,
    Object? defaultPermissionMode = null,
    Object? desktopPermissionModes = freezed,
    Object? desktopLanUrl = null,
    Object? notificationsEnabled = null,
    Object? vibrationEnabled = null,
    Object? voiceLanguage = null,
    Object? relayBaseUrl = null,
  }) {
    return _then(_$AppSettingsImpl(
      lastSelectedDesktopId: null == lastSelectedDesktopId
          ? _value.lastSelectedDesktopId
          : lastSelectedDesktopId // ignore: cast_nullable_to_non_nullable
              as String,
      defaultPermissionMode: null == defaultPermissionMode
          ? _value.defaultPermissionMode
          : defaultPermissionMode // ignore: cast_nullable_to_non_nullable
              as PermissionMode,
      desktopPermissionModes: freezed == desktopPermissionModes
          ? _value._desktopPermissionModes
          : desktopPermissionModes // ignore: cast_nullable_to_non_nullable
              as Map<String, PermissionMode>?,
      desktopLanUrl: null == desktopLanUrl
          ? _value.desktopLanUrl
          : desktopLanUrl // ignore: cast_nullable_to_non_nullable
              as String,
      notificationsEnabled: null == notificationsEnabled
          ? _value.notificationsEnabled
          : notificationsEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      vibrationEnabled: null == vibrationEnabled
          ? _value.vibrationEnabled
          : vibrationEnabled // ignore: cast_nullable_to_non_nullable
              as bool,
      voiceLanguage: null == voiceLanguage
          ? _value.voiceLanguage
          : voiceLanguage // ignore: cast_nullable_to_non_nullable
              as String,
      relayBaseUrl: null == relayBaseUrl
          ? _value.relayBaseUrl
          : relayBaseUrl // ignore: cast_nullable_to_non_nullable
              as String,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$AppSettingsImpl implements _AppSettings {
  const _$AppSettingsImpl(
      {this.lastSelectedDesktopId = '',
      this.defaultPermissionMode = PermissionMode.ask,
      final Map<String, PermissionMode>? desktopPermissionModes,
      this.desktopLanUrl = '',
      this.notificationsEnabled = true,
      this.vibrationEnabled = true,
      this.voiceLanguage = 'en-US',
      this.relayBaseUrl = 'https://flamingocode-eta.vercel.app'})
      : _desktopPermissionModes = desktopPermissionModes;

  factory _$AppSettingsImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppSettingsImplFromJson(json);

  @override
  @JsonKey()
  final String lastSelectedDesktopId;
  @override
  @JsonKey()
  final PermissionMode defaultPermissionMode;
  final Map<String, PermissionMode>? _desktopPermissionModes;
  @override
  Map<String, PermissionMode>? get desktopPermissionModes {
    final value = _desktopPermissionModes;
    if (value == null) return null;
    if (_desktopPermissionModes is EqualUnmodifiableMapView)
      return _desktopPermissionModes;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// deviceId -> mode
  @override
  @JsonKey()
  final String desktopLanUrl;
  @override
  @JsonKey()
  final bool notificationsEnabled;
  @override
  @JsonKey()
  final bool vibrationEnabled;
  @override
  @JsonKey()
  final String voiceLanguage;
// 'en-US' or 'bn-BD'
  @override
  @JsonKey()
  final String relayBaseUrl;

  @override
  String toString() {
    return 'AppSettings(lastSelectedDesktopId: $lastSelectedDesktopId, defaultPermissionMode: $defaultPermissionMode, desktopPermissionModes: $desktopPermissionModes, desktopLanUrl: $desktopLanUrl, notificationsEnabled: $notificationsEnabled, vibrationEnabled: $vibrationEnabled, voiceLanguage: $voiceLanguage, relayBaseUrl: $relayBaseUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppSettingsImpl &&
            (identical(other.lastSelectedDesktopId, lastSelectedDesktopId) ||
                other.lastSelectedDesktopId == lastSelectedDesktopId) &&
            (identical(other.defaultPermissionMode, defaultPermissionMode) ||
                other.defaultPermissionMode == defaultPermissionMode) &&
            const DeepCollectionEquality().equals(
                other._desktopPermissionModes, _desktopPermissionModes) &&
            (identical(other.desktopLanUrl, desktopLanUrl) ||
                other.desktopLanUrl == desktopLanUrl) &&
            (identical(other.notificationsEnabled, notificationsEnabled) ||
                other.notificationsEnabled == notificationsEnabled) &&
            (identical(other.vibrationEnabled, vibrationEnabled) ||
                other.vibrationEnabled == vibrationEnabled) &&
            (identical(other.voiceLanguage, voiceLanguage) ||
                other.voiceLanguage == voiceLanguage) &&
            (identical(other.relayBaseUrl, relayBaseUrl) ||
                other.relayBaseUrl == relayBaseUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      lastSelectedDesktopId,
      defaultPermissionMode,
      const DeepCollectionEquality().hash(_desktopPermissionModes),
      desktopLanUrl,
      notificationsEnabled,
      vibrationEnabled,
      voiceLanguage,
      relayBaseUrl);

  /// Create a copy of AppSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppSettingsImplCopyWith<_$AppSettingsImpl> get copyWith =>
      __$$AppSettingsImplCopyWithImpl<_$AppSettingsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AppSettingsImplToJson(
      this,
    );
  }
}

abstract class _AppSettings implements AppSettings {
  const factory _AppSettings(
      {final String lastSelectedDesktopId,
      final PermissionMode defaultPermissionMode,
      final Map<String, PermissionMode>? desktopPermissionModes,
      final String desktopLanUrl,
      final bool notificationsEnabled,
      final bool vibrationEnabled,
      final String voiceLanguage,
      final String relayBaseUrl}) = _$AppSettingsImpl;

  factory _AppSettings.fromJson(Map<String, dynamic> json) =
      _$AppSettingsImpl.fromJson;

  @override
  String get lastSelectedDesktopId;
  @override
  PermissionMode get defaultPermissionMode;
  @override
  Map<String, PermissionMode>? get desktopPermissionModes; // deviceId -> mode
  @override
  String get desktopLanUrl;
  @override
  bool get notificationsEnabled;
  @override
  bool get vibrationEnabled;
  @override
  String get voiceLanguage; // 'en-US' or 'bn-BD'
  @override
  String get relayBaseUrl;

  /// Create a copy of AppSettings
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppSettingsImplCopyWith<_$AppSettingsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
