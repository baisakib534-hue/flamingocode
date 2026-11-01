import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../models/task.dart';
import '../models/checkpoint.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _notifications = FlutterLocalNotificationsPlugin();
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;

    // Initialize timezone
    tz.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('UTC'));

    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _notifications.initialize(
      settings,
      onDidReceiveNotificationResponse: _onNotificationTap,
    );

    // Create notification channels for Android
    const AndroidNotificationChannel taskChannel = AndroidNotificationChannel(
      'task_channel',
      'Task Notifications',
      description: 'Notifications for task completion, failures, and checkpoints',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    const AndroidNotificationChannel checkpointChannel = AndroidNotificationChannel(
      'checkpoint_channel',
      'Checkpoint Notifications',
      description: 'Urgent notifications when a task needs human approval',
      importance: Importance.max,
      playSound: true,
      enableVibration: true,
    );

    await _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(taskChannel);
    await _notifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(checkpointChannel);

    _initialized = true;
  }

  void _onNotificationTap(NotificationResponse response) {
    // Handle notification tap - could navigate to specific screen
    // Payload format: "type:id" e.g., "task:task_abc123" or "checkpoint:task_abc123:0"
  }

  Future<void> showTaskDoneNotification(Task task) async {
    await _notifications.show(
      task.taskId.hashCode,
      'Task Completed',
      'Task "${task.envelope.prompt.length > 30 ? task.envelope.prompt.substring(0, 30) : task.envelope.prompt}..." finished',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'task_channel',
          'Task Notifications',
          channelDescription: 'Notifications for task completion, failures, and checkpoints',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'task:${task.taskId}',
    );
  }

  Future<void> showTaskFailedNotification(Task task, String error) async {
    await _notifications.show(
      task.taskId.hashCode + 10000,
      'Task Failed',
      'Task failed: $error',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'task_channel',
          'Task Notifications',
          channelDescription: 'Notifications for task completion, failures, and checkpoints',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'task:${task.taskId}',
    );
  }

  Future<void> showCheckpointNotification(Checkpoint checkpoint, String taskPrompt) async {
    await _notifications.show(
      checkpoint.id.hashCode,
      'Checkpoint: Approval Needed',
      'Task needs your decision: ${checkpoint.question}',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'checkpoint_channel',
          'Checkpoint Notifications',
          channelDescription: 'Urgent notifications when a task needs human approval',
          importance: Importance.max,
          priority: Priority.max,
          playSound: true,
          enableVibration: true,
          ongoing: true,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'checkpoint:${checkpoint.taskId}:${checkpoint.index}',
    );
  }

  Future<void> showTaskNeedsHelpNotification(Task task) async {
    await _notifications.show(
      task.taskId.hashCode + 20000,
      'Task Needs Help',
      'Task is waiting for input',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'task_channel',
          'Task Notifications',
          channelDescription: 'Notifications for task completion, failures, and checkpoints',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'task:${task.taskId}',
    );
  }

  Future<void> cancelNotification(int id) async {
    await _notifications.cancel(id);
  }

  Future<void> cancelAllNotifications() async {
    await _notifications.cancelAll();
  }
}