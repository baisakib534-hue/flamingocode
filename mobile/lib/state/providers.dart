import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';
import '../services/notification_service.dart';
import '../services/voice_service.dart';
import '../models/user.dart';
import '../models/device.dart';
import '../models/task.dart';
import '../models/app_settings.dart';
import '../models/queued_message.dart';
import '../models/provider_model.dart';
import '../models/permission_mode.dart';
import '../models/recommendation.dart';
import '../models/brain_note.dart';

// Core service providers
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final storageServiceProvider = Provider<StorageService>((ref) => StorageService());

final notificationServiceProvider = Provider<NotificationService>((ref) => NotificationService());

final voiceServiceProvider = Provider<VoiceService>((ref) => VoiceService());

// Auth state
final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  return AuthNotifier(ref.read(apiServiceProvider), ref.read(storageServiceProvider));
});

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final ApiService _apiService;
  final StorageService _storageService;

  AuthNotifier(this._apiService, this._storageService) : super(const AsyncValue.loading()) {
    _init();
  }

  Future<void> _init() async {
    await _storageService.init();
    final isValid = await _apiService.validateToken();
    if (isValid) {
      final user = await _apiService.getCurrentUser();
      state = AsyncValue.data(user);
    } else {
      state = const AsyncValue.data(null);
    }
  }

  Future<void> signInWithGoogle(String credential) async {
    state = const AsyncValue.loading();
    try {
      final result = await _apiService.signInWithGoogle(credential);
      if (result.success) {
        state = AsyncValue.data(result.user);
      } else {
        state = AsyncValue.error(result.error ?? 'Sign in failed', StackTrace.current);
      }
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> signOut() async {
    await _apiService.signOut();
    state = const AsyncValue.data(null);
  }
}

// Current user convenience provider
final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(authStateProvider).value;
});

// Devices state
final devicesProvider = StateNotifierProvider<DevicesNotifier, AsyncValue<List<Device>>>((ref) {
  return DevicesNotifier(ref.read(apiServiceProvider), ref.read(storageServiceProvider));
});

class DevicesNotifier extends StateNotifier<AsyncValue<List<Device>>> {
  final ApiService _apiService;
  final StorageService _storageService;

  DevicesNotifier(this._apiService, this._storageService) : super(const AsyncValue.loading()) {
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    try {
      final devices = await _apiService.getDevices();
      state = AsyncValue.data(devices);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _loadDevices();
  }

  Future<DeviceRegistrationResult> registerDevice({
    required String name,
    required String type,
    String? pushToken,
  }) async {
    final result = await _apiService.registerDevice(name: name, type: type, pushToken: pushToken);
    if (result.success) {
      await _loadDevices();
    }
    return result;
  }

  Future<void> deleteDevice(String deviceId) async {
    await _apiService.deleteDevice(deviceId);
    await _loadDevices();
  }

  List<Device> get desktops => state.value?.where((d) => d.isDesktop).toList() ?? [];
  List<Device> get phones => state.value?.where((d) => d.isPhone).toList() ?? [];
}

// Selected desktop
final selectedDesktopProvider = StateNotifierProvider<SelectedDesktopNotifier, Device?>((ref) {
  return SelectedDesktopNotifier(ref.read(storageServiceProvider));
});

class SelectedDesktopNotifier extends StateNotifier<Device?> {
  final StorageService _storageService;

  SelectedDesktopNotifier(this._storageService) : super(null) {
    _init();
  }

  Future<void> _init() async {
    final deviceId = _storageService.getLastSelectedDesktop();
    if (deviceId != null) {
      // We'll set this when devices are loaded
    }
  }

  void select(Device device) {
    state = device;
    _storageService.saveLastSelectedDesktop(device.deviceId);
  }
}

// App settings
final appSettingsProvider = StateNotifierProvider<AppSettingsNotifier, AppSettings>((ref) {
  return AppSettingsNotifier(ref.read(storageServiceProvider));
});

class AppSettingsNotifier extends StateNotifier<AppSettings> {
  final StorageService _storageService;

  AppSettingsNotifier(this._storageService) : super(const AppSettings()) {
    _load();
  }

  void _load() {
    state = _storageService.getSettings();
  }

  Future<void> updateSettings(AppSettings newSettings) async {
    state = newSettings;
    await _storageService.saveSettings(newSettings);
  }

  Future<void> setPermissionMode(String deviceId, PermissionMode mode) async {
    final newSettings = state.copyWith(
      desktopPermissionModes: {
        ...?state.desktopPermissionModes,
        deviceId: mode,
      },
    );
    await updateSettings(newSettings);
    await _storageService.saveDesktopPermissionMode(deviceId, mode);
  }

  PermissionMode getPermissionMode(String deviceId) {
    return state.desktopPermissionModes?[deviceId] ?? state.defaultPermissionMode;
  }
}

// Task state
final activeTaskProvider = StateNotifierProvider<ActiveTaskNotifier, AsyncValue<Task?>>((ref) {
  return ActiveTaskNotifier(ref.read(apiServiceProvider));
});

class ActiveTaskNotifier extends StateNotifier<AsyncValue<Task?>> {
  final ApiService _apiService;

  ActiveTaskNotifier(this._apiService) : super(const AsyncValue.data(null));

  void setTask(Task task) {
    state = AsyncValue.data(task);
  }

  void clearTask() {
    state = const AsyncValue.data(null);
  }

  Future<void> refreshTask(String taskId) async {
    try {
      final task = await _apiService.getTask(taskId);
      state = AsyncValue.data(task);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

// Task history
final taskHistoryProvider = StateNotifierProvider<TaskHistoryNotifier, AsyncValue<List<Task>>>((ref) {
  return TaskHistoryNotifier(ref.read(apiServiceProvider));
});

class TaskHistoryNotifier extends StateNotifier<AsyncValue<List<Task>>> {
  final ApiService _apiService;

  TaskHistoryNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final tasks = await _apiService.getTaskHistory();
      state = AsyncValue.data(tasks);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _load();
  }
}

// Message queue
final messageQueueProvider = StateNotifierProvider<MessageQueueNotifier, List<QueuedMessage>>((ref) {
  return MessageQueueNotifier(ref.read(storageServiceProvider));
});

class MessageQueueNotifier extends StateNotifier<List<QueuedMessage>> {
  final StorageService _storageService;

  MessageQueueNotifier(this._storageService) : super([]) {
    _load();
  }

  void _load() {
    state = _storageService.getQueue();
  }

  Future<void> add(QueuedMessage message) async {
    state = [...state, message];
    await _storageService.addToQueue(message);
  }

  Future<void> remove(String id) async {
    state = state.where((m) => m.id != id).toList();
    await _storageService.removeFromQueue(id);
  }

  Future<void> update(QueuedMessage message) async {
    state = state.map((m) => m.id == message.id ? message : m).toList();
    await _storageService.updateQueueMessage(message);
  }

  Future<void> reorder(int oldIndex, int newIndex) async {
    final queue = List<QueuedMessage>.from(state);
    if (oldIndex < 0 || oldIndex >= queue.length) return;
    if (newIndex < 0 || newIndex >= queue.length) return;
    final item = queue.removeAt(oldIndex);
    queue.insert(newIndex, item);
    for (int i = 0; i < queue.length; i++) {
      queue[i] = queue[i].copyWith(order: i);
    }
    state = queue;
    await _storageService.reorderQueue(oldIndex, newIndex);
  }

  Future<void> clear() async {
    state = [];
    await _storageService.clearQueue();
  }

  QueuedMessage? get nextPending {
    try {
      return state.where((m) => m.status == 'pending').reduce((a, b) => a.order < b.order ? a : b);
    } catch (_) {
      return null;
    }
  }
}

// Custom providers
final customProvidersProvider = StateNotifierProvider<CustomProvidersNotifier, List<CustomProvider>>((ref) {
  return CustomProvidersNotifier(ref.read(storageServiceProvider));
});

class CustomProvidersNotifier extends StateNotifier<List<CustomProvider>> {
  final StorageService _storageService;

  CustomProvidersNotifier(this._storageService) : super([]) {
    _load();
  }

  void _load() {
    state = _storageService.getCustomProviders();
  }

  Future<void> add(CustomProvider provider) async {
    state = [...state, provider];
    await _storageService.addCustomProvider(provider);
  }

  Future<void> remove(String id) async {
    state = state.where((p) => p.id != id).toList();
    await _storageService.removeCustomProvider(id);
  }
}

// Recommendations (stubbed)
final recommendationsProvider = StateNotifierProvider<RecommendationsNotifier, AsyncValue<List<Recommendation>>>((ref) {
  return RecommendationsNotifier(ref.read(apiServiceProvider));
});

class RecommendationsNotifier extends StateNotifier<AsyncValue<List<Recommendation>>> {
  final ApiService _apiService;

  RecommendationsNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final recommendations = await _apiService.getRecommendations();
      state = AsyncValue.data(recommendations);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _load();
  }

  Future<void> submitAction(RecommendationAction action) async {
    await _apiService.submitRecommendationAction(action);
    await _load();
  }
}

// Brain notes (stubbed)
final brainNotesProvider = StateNotifierProvider<BrainNotesNotifier, AsyncValue<List<BrainNote>>>((ref) {
  return BrainNotesNotifier(ref.read(apiServiceProvider));
});

class BrainNotesNotifier extends StateNotifier<AsyncValue<List<BrainNote>>> {
  final ApiService _apiService;

  BrainNotesNotifier(this._apiService) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    try {
      final notes = await _apiService.getBrainNotes();
      state = AsyncValue.data(notes);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    await _load();
  }
}