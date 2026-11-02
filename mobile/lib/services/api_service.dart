import 'dart:convert';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../models/device.dart';
import '../models/task.dart';
import '../models/recording.dart';
import '../models/recommendation.dart';
import '../models/checkpoint.dart';
import '../models/brain_note.dart';
import '../models/provider_model.dart';

class ApiService {
  static const String defaultBaseUrl = 'https://flamingocode-eta.vercel.app';
  final String baseUrl;
  final Dio _dio;
  final FlutterSecureStorage _secureStorage;

  ApiService({
    String? baseUrl,
    Dio? dio,
    FlutterSecureStorage? secureStorage,
  })  : baseUrl = baseUrl ?? defaultBaseUrl,
        _dio = dio ?? Dio(),
        _secureStorage = secureStorage ?? const FlutterSecureStorage() {
    _dio.options.baseUrl = this.baseUrl;
    _dio.options.headers['Content-Type'] = 'application/json';
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _secureStorage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 - token expired
        if (error.response?.statusCode == 401) {
          await _secureStorage.delete(key: 'auth_token');
          await _secureStorage.delete(key: 'user_data');
        }
        handler.next(error);
      },
    ));
  }

  String _hashToken(String token) {
    final bytes = utf8.encode(token);
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // Auth
  Future<AuthResult> login(String email, String password) async {
    try {
      final response = await _dio.post('/api/auth/login', data: {'email': email, 'password': password});
      final token = response.data['token'] as String;
      final userData = response.data['user'] as Map<String, dynamic>;
      final user = User.fromJson(userData);

      await _secureStorage.write(key: 'auth_token', value: token);
      await _secureStorage.write(key: 'user_data', value: jsonEncode(userData));

      return AuthResult.success(user, token);
    } on DioException catch (e) {
      return AuthResult.failure(e.response?.data['error'] ?? e.message ?? 'Login failed');
    }
  }

  Future<AuthResult> pairWithCode(String relay, String deviceId, String pairCode) async {
    try {
      // Use the relay URL from QR code for the pairing request
      final pairingDio = Dio();
      pairingDio.options.baseUrl = relay;
      pairingDio.options.headers['Content-Type'] = 'application/json';
      
      final response = await pairingDio.post('/api/devices/pair', data: {
        'deviceId': deviceId,
        'pairCode': pairCode,
      });
      
      final token = response.data['token'] as String;
      final userData = response.data['user'] as Map<String, dynamic>;
      final user = User.fromJson(userData);

      await _secureStorage.write(key: 'auth_token', value: token);
      await _secureStorage.write(key: 'user_data', value: jsonEncode(userData));

      return AuthResult.success(user, token);
    } on DioException catch (e) {
      return AuthResult.failure(e.response?.data['error'] ?? e.message ?? 'Pairing failed');
    }
  }

  Future<bool> validateToken() async {
    try {
      final token = await _secureStorage.read(key: 'auth_token');
      if (token == null) return false;
      final response = await _dio.get('/api/auth/validate');
      return response.data['valid'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<void> signOut() async {
    await _secureStorage.delete(key: 'auth_token');
    await _secureStorage.delete(key: 'user_data');
  }

  Future<User?> getCurrentUser() async {
    final userData = await _secureStorage.read(key: 'user_data');
    if (userData == null) return null;
    return User.fromJson(jsonDecode(userData));
  }

  Future<String?> getToken() async {
    return _secureStorage.read(key: 'auth_token');
  }

  // Devices
  Future<DeviceRegistrationResult> registerDevice({
    required String name,
    required String type,
    String? pushToken,
  }) async {
    try {
      final response = await _dio.post('/api/devices/register', data: {
        'name': name,
        'type': type,
        if (pushToken != null) 'pushToken': pushToken,
      });
      final deviceId = response.data['deviceId'] as String;
      final pairCode = response.data['pairCode'] as String;
      return DeviceRegistrationResult.success(deviceId, pairCode);
    } on DioException catch (e) {
      return DeviceRegistrationResult.failure(e.response?.data['error'] ?? e.message ?? 'Registration failed');
    }
  }

  Future<List<Device>> getDevices() async {
    try {
      final response = await _dio.get('/api/devices');
      final List<dynamic> data = response.data;
      return data.map((json) => Device.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to fetch devices');
    }
  }

  Future<void> deleteDevice(String deviceId) async {
    try {
      await _dio.delete('/api/devices/$deviceId');
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to delete device');
    }
  }

  // Tasks
  Future<String> sendTask({
    required String toDeviceId,
    required TaskEnvelope envelope,
  }) async {
    try {
      final response = await _dio.post('/api/tasks', data: {
        'toDeviceId': toDeviceId,
        'envelope': envelope.toJson(),
      });
      return response.data['taskId'] as String;
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to send task');
    }
  }

  Future<Task> getTask(String taskId) async {
    try {
      final response = await _dio.get('/api/tasks/$taskId');
      return Task.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to fetch task');
    }
  }

  Future<List<Task>> getTaskHistory() async {
    try {
      final response = await _dio.get('/api/tasks/history');
      final List<dynamic> data = response.data;
      return data.map((json) => Task.fromJson(json as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to fetch task history');
    }
  }

  Future<void> sendTaskResult(String taskId, dynamic result) async {
    try {
      await _dio.post('/api/tasks/$taskId/result', data: {'result': result});
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to send result');
    }
  }

  // Recordings
  Future<Recording> getRecording(String id) async {
    try {
      final response = await _dio.get('/api/recordings/$id');
      return Recording.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to fetch recording');
    }
  }

  Future<String> registerRecording({required String url, int expiresIn = 3600}) async {
    try {
      final response = await _dio.post('/api/recordings/register', data: {
        'url': url,
        'expiresIn': expiresIn,
      });
      return response.data['id'] as String;
    } on DioException catch (e) {
      throw Exception(e.response?.data['error'] ?? e.message ?? 'Failed to register recording');
    }
  }

  // Recommendations (would need backend endpoints - stubbed for now)
  Future<List<Recommendation>> getRecommendations() async {
    // TODO: Implement when backend endpoints exist
    return [];
  }

  Future<void> submitRecommendationAction(RecommendationAction action) async {
    // TODO: Implement when backend endpoints exist
  }

  // Brain notes (would need backend endpoints - stubbed for now)
  Future<List<BrainNote>> getBrainNotes() async {
    // TODO: Implement when backend endpoints exist
    return [];
  }

  // Custom providers (would need backend endpoints - stubbed for now)
  Future<List<CustomProvider>> getCustomProviders() async {
    // TODO: Implement when backend endpoints exist
    return [];
  }

  Future<void> saveCustomProvider(CustomProvider provider) async {
    // TODO: Implement when backend endpoints exist
  }
}

class AuthResult {
  final bool success;
  final User? user;
  final String? token;
  final String? error;

  AuthResult._({required this.success, this.user, this.token, this.error});

  factory AuthResult.success(User user, String token) => AuthResult._(success: true, user: user, token: token);
  factory AuthResult.failure(String error) => AuthResult._(success: false, error: error);
}

class DeviceRegistrationResult {
  final bool success;
  final String? deviceId;
  final String? pairCode;
  final String? error;

  DeviceRegistrationResult._({required this.success, this.deviceId, this.pairCode, this.error});

  factory DeviceRegistrationResult.success(String deviceId, String pairCode) => DeviceRegistrationResult._(success: true, deviceId: deviceId, pairCode: pairCode);
  factory DeviceRegistrationResult.failure(String error) => DeviceRegistrationResult._(success: false, error: error);
}