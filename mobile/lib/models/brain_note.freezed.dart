// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'brain_note.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

BrainNote _$BrainNoteFromJson(Map<String, dynamic> json) {
  return _BrainNote.fromJson(json);
}

/// @nodoc
mixin _$BrainNote {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  String get projectPath => throw _privateConstructorUsedError;
  String get createdAt => throw _privateConstructorUsedError;
  String get updatedAt => throw _privateConstructorUsedError;
  List<String>? get tags => throw _privateConstructorUsedError;

  /// Serializes this BrainNote to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of BrainNote
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $BrainNoteCopyWith<BrainNote> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $BrainNoteCopyWith<$Res> {
  factory $BrainNoteCopyWith(BrainNote value, $Res Function(BrainNote) then) =
      _$BrainNoteCopyWithImpl<$Res, BrainNote>;
  @useResult
  $Res call(
      {String id,
      String title,
      String content,
      String projectPath,
      String createdAt,
      String updatedAt,
      List<String>? tags});
}

/// @nodoc
class _$BrainNoteCopyWithImpl<$Res, $Val extends BrainNote>
    implements $BrainNoteCopyWith<$Res> {
  _$BrainNoteCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of BrainNote
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? content = null,
    Object? projectPath = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? tags = freezed,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      projectPath: null == projectPath
          ? _value.projectPath
          : projectPath // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String,
      tags: freezed == tags
          ? _value.tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$BrainNoteImplCopyWith<$Res>
    implements $BrainNoteCopyWith<$Res> {
  factory _$$BrainNoteImplCopyWith(
          _$BrainNoteImpl value, $Res Function(_$BrainNoteImpl) then) =
      __$$BrainNoteImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String id,
      String title,
      String content,
      String projectPath,
      String createdAt,
      String updatedAt,
      List<String>? tags});
}

/// @nodoc
class __$$BrainNoteImplCopyWithImpl<$Res>
    extends _$BrainNoteCopyWithImpl<$Res, _$BrainNoteImpl>
    implements _$$BrainNoteImplCopyWith<$Res> {
  __$$BrainNoteImplCopyWithImpl(
      _$BrainNoteImpl _value, $Res Function(_$BrainNoteImpl) _then)
      : super(_value, _then);

  /// Create a copy of BrainNote
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? title = null,
    Object? content = null,
    Object? projectPath = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? tags = freezed,
  }) {
    return _then(_$BrainNoteImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      content: null == content
          ? _value.content
          : content // ignore: cast_nullable_to_non_nullable
              as String,
      projectPath: null == projectPath
          ? _value.projectPath
          : projectPath // ignore: cast_nullable_to_non_nullable
              as String,
      createdAt: null == createdAt
          ? _value.createdAt
          : createdAt // ignore: cast_nullable_to_non_nullable
              as String,
      updatedAt: null == updatedAt
          ? _value.updatedAt
          : updatedAt // ignore: cast_nullable_to_non_nullable
              as String,
      tags: freezed == tags
          ? _value._tags
          : tags // ignore: cast_nullable_to_non_nullable
              as List<String>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$BrainNoteImpl implements _BrainNote {
  const _$BrainNoteImpl(
      {required this.id,
      required this.title,
      required this.content,
      required this.projectPath,
      required this.createdAt,
      required this.updatedAt,
      final List<String>? tags})
      : _tags = tags;

  factory _$BrainNoteImpl.fromJson(Map<String, dynamic> json) =>
      _$$BrainNoteImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final String content;
  @override
  final String projectPath;
  @override
  final String createdAt;
  @override
  final String updatedAt;
  final List<String>? _tags;
  @override
  List<String>? get tags {
    final value = _tags;
    if (value == null) return null;
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  String toString() {
    return 'BrainNote(id: $id, title: $title, content: $content, projectPath: $projectPath, createdAt: $createdAt, updatedAt: $updatedAt, tags: $tags)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$BrainNoteImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.projectPath, projectPath) ||
                other.projectPath == projectPath) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            const DeepCollectionEquality().equals(other._tags, _tags));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, title, content, projectPath,
      createdAt, updatedAt, const DeepCollectionEquality().hash(_tags));

  /// Create a copy of BrainNote
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$BrainNoteImplCopyWith<_$BrainNoteImpl> get copyWith =>
      __$$BrainNoteImplCopyWithImpl<_$BrainNoteImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$BrainNoteImplToJson(
      this,
    );
  }
}

abstract class _BrainNote implements BrainNote {
  const factory _BrainNote(
      {required final String id,
      required final String title,
      required final String content,
      required final String projectPath,
      required final String createdAt,
      required final String updatedAt,
      final List<String>? tags}) = _$BrainNoteImpl;

  factory _BrainNote.fromJson(Map<String, dynamic> json) =
      _$BrainNoteImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  String get content;
  @override
  String get projectPath;
  @override
  String get createdAt;
  @override
  String get updatedAt;
  @override
  List<String>? get tags;

  /// Create a copy of BrainNote
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$BrainNoteImplCopyWith<_$BrainNoteImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
