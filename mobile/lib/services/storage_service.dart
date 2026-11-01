import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/app_settings.dart';
import '../models/queued_message.dart';
import '../models/provider_model.dart';
import '../models/permission_mode.dart';

class StorageService {
  static const String _settingsKey = 'app_settings';
  static const String _queueKey = 'message_queue';
  static const String _customProvidersKey = 'custom_providers';
  static const String _lastSelectedDesktopKey = 'last_selected_desktop';
  static const String _desktopPermissionModesKey = 'desktop_permission_modes';

  late final SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Settings
  Future<void> saveSettings(AppSettings settings) async {
    await _prefs.setString(_settingsKey, jsonEncode(settings.toJson()));
  }

  AppSettings getSettings() {
    final jsonStr = _prefs.getString(_settingsKey);
    if (jsonStr == null) return const AppSettings();
    try {
      return AppSettings.fromJson(jsonDecode(jsonStr) as Map<String, dynamic>);
    } catch (_) {
      return const AppSettings();
    }
  }

  // Message Queue
  Future<void> saveQueue(List<QueuedMessage> queue) async {
    final jsonList = queue.map((m) => m.toJson()).toList();
    await _prefs.setString(_queueKey, jsonEncode(jsonList));
  }

  List<QueuedMessage> getQueue() {
    final jsonStr = _prefs.getString(_queueKey);
    if (jsonStr == null) return [];
    try {
      final List<dynamic> jsonList = jsonDecode(jsonStr);
      return jsonList.map((json) => QueuedMessage.fromJson(json as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> addToQueue(QueuedMessage message) async {
    final queue = getQueue();
    queue.add(message);
    await saveQueue(queue);
  }

  Future<void> removeFromQueue(String id) async {
    final queue = getQueue();
    queue.removeWhere((m) => m.id == id);
    await saveQueue(queue);
  }

  Future<void> updateQueueMessage(QueuedMessage message) async {
    final queue = getQueue();
    final index = queue.indexWhere((m) => m.id == message.id);
    if (index != -1) {
      queue[index] = message;
      await saveQueue(queue);
    }
  }

  Future<void> reorderQueue(int oldIndex, int newIndex) async {
    final queue = getQueue();
    if (oldIndex < 0 || oldIndex >= queue.length) return;
    if (newIndex < 0 || newIndex >= queue.length) return;
    final item = queue.removeAt(oldIndex);
    queue.insert(newIndex, item);
    // Update order numbers
    for (int i = 0; i < queue.length; i++) {
      queue[i] = queue[i].copyWith(order: i);
    }
    await saveQueue(queue);
  }

  Future<void> clearQueue() async {
    await _prefs.remove(_queueKey);
  }

  // Custom Providers
  Future<void> saveCustomProviders(List<CustomProvider> providers) async {
    final jsonList = providers.map((p) => p.toJson()).toList();
    await _prefs.setString(_customProvidersKey, jsonEncode(jsonList));
  }

  List<CustomProvider> getCustomProviders() {
    final jsonStr = _prefs.getString(_customProvidersKey);
    if (jsonStr == null) return [];
    try {
      final List<dynamic> jsonList = jsonDecode(jsonStr);
      return jsonList.map((json) => CustomProvider.fromJson(json as Map<String, dynamic>)).toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> addCustomProvider(CustomProvider provider) async {
    final providers = getCustomProviders();
    providers.add(provider);
    await saveCustomProviders(providers);
  }

  Future<void> removeCustomProvider(String id) async {
    final providers = getCustomProviders();
    providers.removeWhere((p) => p.id == id);
    await saveCustomProviders(providers);
  }

  // Last Selected Desktop
  Future<void> saveLastSelectedDesktop(String deviceId) async {
    await _prefs.setString(_lastSelectedDesktopKey, deviceId);
  }

  String? getLastSelectedDesktop() {
    return _prefs.getString(_lastSelectedDesktopKey);
  }

  // Desktop Permission Modes
  Future<void> saveDesktopPermissionMode(String deviceId, PermissionMode mode) async {
    final modes = getDesktopPermissionModes();
    modes[deviceId] = mode;
    await _prefs.setString(_desktopPermissionModesKey, jsonEncode(modes.map((k, v) => MapEntry(k, v.name))));
  }

  Map<String, PermissionMode> getDesktopPermissionModes() {
    final jsonStr = _prefs.getString(_desktopPermissionModesKey);
    if (jsonStr == null) return {};
    try {
      final Map<String, dynamic> jsonMap = jsonDecode(jsonStr);
      return jsonMap.map((k, v) => MapEntry(k, PermissionMode.values.byName(v as String)));
    } catch (_) {
      return {};
    }
  }

  PermissionMode getPermissionModeForDesktop(String deviceId) {
    final modes = getDesktopPermissionModes();
    return modes[deviceId] ?? PermissionMode.ask;
  }
}