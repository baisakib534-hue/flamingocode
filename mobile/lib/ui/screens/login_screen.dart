import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../widgets/primary_button.dart';
import '../widgets/flamingo_logo.dart';
import '../../state/providers.dart';
import '../../services/api_service.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  String? _error;
  MobileScannerController? _scannerController;
  bool _qrScanned = false;

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _scannerController = MobileScannerController(
      detectionSpeed: DetectionSpeed.normal,
      facing: CameraFacing.back,
      torchEnabled: false,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _scannerController?.dispose();
    super.dispose();
  }

  Future<void> _handleEmailLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() => _error = 'Please enter both email and password');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = ref.read(apiServiceProvider);
      await apiService.login(email, password);
      if (mounted) {
        context.go('/home');
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleQrScan(BarcodeCapture capture) async {
    if (_qrScanned) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode?.rawValue == null) return;

    setState(() => _qrScanned = true);

    try {
      final payload = jsonDecode(barcode!.rawValue!) as Map<String, dynamic>;
      if (payload['v'] != 1) throw Exception('Invalid QR version');
      if (payload['exp'] != null) {
        final exp = DateTime.fromMillisecondsSinceEpoch((payload['exp'] as int) * 1000);
        if (exp.isBefore(DateTime.now())) throw Exception('QR code expired');
      }

      final relay = payload['relay'] as String?;
      final deviceId = payload['deviceId'] as String?;
      final pairCode = payload['pairCode'] as String?;

      if (relay == null || deviceId == null || pairCode == null) {
        throw Exception('Invalid QR payload');
      }

      final apiService = ref.read(apiServiceProvider);
      await apiService.pairWithCode(relay, deviceId, pairCode);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Connected ✅'), backgroundColor: Colors.green),
        );
        context.go('/home');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString().replaceFirst('Exception: ', '');
          _qrScanned = false;
        });
        Future.delayed(const Duration(seconds: 3), () {
          if (mounted) setState(() => _error = null);
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colorScheme = theme.colorScheme;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            // Tab Bar
            Container(
              color: colorScheme.surface,
              child: TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(icon: Icon(Icons.qr_code_scanner), text: 'Scan QR'),
                  Tab(icon: Icon(Icons.email_outlined), text: 'Login'),
                ],
                indicatorColor: colorScheme.primary,
                labelColor: colorScheme.primary,
                unselectedLabelColor: colorScheme.onSurfaceVariant,
              ),
            ),

            // Tab Content
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildQrScannerTab(theme),
                  _buildLoginTab(theme),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQrScannerTab(ThemeData theme) {
    final colorScheme = theme.colorScheme;
    return Stack(
      children: [
        MobileScanner(
          controller: _scannerController!,
          onDetect: _handleQrScan,
          errorBuilder: (context, error, child) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.camera_alt_outlined, size: 64, color: colorScheme.onSurfaceVariant),
                  const SizedBox(height: 16),
                  Text('Camera permission required', style: theme.textTheme.titleMedium),
                  const SizedBox(height: 8),
                  Text('Please grant camera access to scan QR codes', style: theme.textTheme.bodyMedium?.copyWith(color: colorScheme.onSurfaceVariant)),
                ],
              ),
            );
          },
        ),
        // Overlay with instructions
        Positioned.fill(
          child: Column(
            children: [
              const Spacer(flex: 1),
              Container(
                margin: const EdgeInsets.all(24),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: colorScheme.surfaceContainerHighest.withOpacity(0.9),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.qr_code_2, size: 32, color: Colors.white),
                    const SizedBox(height: 8),
                    Text(
                      'Point camera at desktop QR code',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Desktop app → Pair Phone → Scan this code',
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodySmall?.copyWith(color: colorScheme.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              const Spacer(flex: 1),
            ],
          ),
        ),
        if (_error != null)
          Positioned(
            bottom: 100,
            left: 24,
            right: 24,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      _error!,
                      style: TextStyle(color: colorScheme.onErrorContainer),
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.close, color: colorScheme.onErrorContainer),
                    onPressed: () => setState(() => _error = null),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildLoginTab(ThemeData theme) {
    final colorScheme = theme.colorScheme;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 24),
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
            'Sign in with email and password to connect your phone.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 48),
          TextField(
            controller: _emailController,
            decoration: const InputDecoration(
              labelText: 'Email',
              hintText: 'you@example.com',
              prefixIcon: Icon(Icons.email_outlined),
            ),
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            onSubmitted: (_) => FocusScope.of(context).nextFocus(),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _passwordController,
            decoration: const InputDecoration(
              labelText: 'Password',
              hintText: '••••••••',
              prefixIcon: Icon(Icons.lock_outline),
            ),
            obscureText: true,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _handleEmailLogin(),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            text: 'Sign In',
            onPressed: _isLoading ? null : _handleEmailLogin,
            isLoading: _isLoading,
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
          const SizedBox(height: 24),
          Text(
            'By continuing, you agree to our Terms of Service and Privacy Policy.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant.withOpacity(0.7),
            ),
          ),
        ],
      ),
    );
  }
}