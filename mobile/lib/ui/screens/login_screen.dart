import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../widgets/flamingo_logo.dart';
import '../../state/providers.dart';
import '../../services/api_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  bool _isSigningIn = false;
  String? _error;

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isSigningIn = true;
      _error = null;
    });

    try {
      // In a real app, this would use google_sign_in package
      // For now, we'll simulate with a mock credential
      // The actual implementation would use GoogleSignIn().signIn() and get the idToken
      
      // TODO: Implement actual Google Sign-In
      // For demo purposes, we'll show an error explaining this needs the google_sign_in package
      throw UnimplementedError('Google Sign-In requires google_sign_in package and proper OAuth configuration');
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isSigningIn = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(flex: 2),
              const FlamingoLogo(size: 100),
              const SizedBox(height: 32),
              Text(
                'Welcome to FlamingoCode',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.w700,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Sign in with your Google account to connect your phone to the desktop app.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 48),
              PrimaryButton(
                text: 'Continue with Google',
                icon: Icons.g_mobiledata,
                onPressed: _isSigningIn ? null : _handleGoogleSignIn,
                isLoading: _isSigningIn,
              ),
              const SizedBox(height: 16),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: colorScheme.errorContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: colorScheme.onErrorContainer),
                  ),
                ),
              const Spacer(flex: 3),
              Text(
                'By continuing, you agree to our Terms of Service and Privacy Policy.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: colorScheme.onSurfaceVariant.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}