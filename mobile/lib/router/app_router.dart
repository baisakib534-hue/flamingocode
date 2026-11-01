import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../ui/screens/splash_screen.dart';
import '../ui/screens/login_screen.dart';
import '../ui/screens/home_screen.dart';
import '../ui/screens/desktop_picker_screen.dart';
import '../ui/screens/prompt_screen.dart';
import '../ui/screens/task_progress_screen.dart';
import '../ui/screens/checkpoint_screen.dart';
import '../ui/screens/recordings_screen.dart';
import '../ui/screens/task_history_screen.dart';
import '../ui/screens/message_queue_screen.dart';
import '../ui/screens/recommendations_screen.dart';
import '../ui/screens/brain_notes_screen.dart';
import '../ui/screens/settings_screen.dart';
import '../ui/screens/custom_provider_screen.dart';
import '../state/providers.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isLoggedIn = authState.value != null;
      final isAuthRoute = state.matchedLocation == '/login';
      final isSplashRoute = state.matchedLocation == '/splash';
      
      if (isSplashRoute) return null; // Let splash handle its own logic
      
      if (!isLoggedIn && !isAuthRoute) {
        return '/login';
      }
      
      if (isLoggedIn && isAuthRoute) {
        return '/home';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/desktop-picker',
        builder: (context, state) => const DesktopPickerScreen(),
      ),
      GoRoute(
        path: '/prompt',
        builder: (context, state) => const PromptScreen(),
      ),
      GoRoute(
        path: '/task/:taskId',
        builder: (context, state) => TaskProgressScreen(taskId: state.pathParameters['taskId']!),
      ),
      GoRoute(
        path: '/checkpoint/:taskId/:index',
        builder: (context, state) => CheckpointScreen(
          taskId: state.pathParameters['taskId']!,
          checkpointIndex: int.parse(state.pathParameters['index']!),
        ),
      ),
      GoRoute(
        path: '/recordings/:taskId',
        builder: (context, state) => RecordingsScreen(taskId: state.pathParameters['taskId']!),
      ),
      GoRoute(
        path: '/history',
        builder: (context, state) => const TaskHistoryScreen(),
      ),
      GoRoute(
        path: '/queue',
        builder: (context, state) => const MessageQueueScreen(),
      ),
      GoRoute(
        path: '/recommendations',
        builder: (context, state) => const RecommendationsScreen(),
      ),
      GoRoute(
        path: '/brain-notes',
        builder: (context, state) => const BrainNotesScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: '/custom-provider',
        builder: (context, state) => const CustomProviderScreen(),
      ),
    ],
  );
});