import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/provider_model.dart';
import '../../models/permission_mode.dart';
import '../../models/task.dart';
import '../../services/voice_service.dart';

class PromptScreen extends ConsumerStatefulWidget {
  const PromptScreen({super.key});

  @override
  ConsumerState<PromptScreen> createState() => _PromptScreenState();
}

class _PromptScreenState extends ConsumerState<PromptScreen> {
  final _promptController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String _selectedModel = '';
  String? _selectedProvider;
  Map<String, dynamic>? _customProviderConfig;
  PermissionMode _permissionMode = PermissionMode.ask;
  bool _isSending = false;
  bool _isVoiceListening = false;
  String _voiceInterimText = '';
  String _voiceLanguage = 'en-US';

  @override
  void initState() {
    super.initState();
    _loadModels();
    _initVoice();
  }

  void _loadModels() {
    // Load models from assets/models.json
    // For now, set a default
    _selectedModel = '9router/auto';
  }

  Future<void> _initVoice() async {
    final voiceService = ref.read(voiceServiceProvider);
    await voiceService.init();
    voiceService.onInterimResult = (text) {
      setState(() => _voiceInterimText = text);
    };
    voiceService.onFinalResult = (text) {
      setState(() {
        _voiceInterimText = '';
        _promptController.text = text;
      });
    };
    voiceService.onListeningChanged = (listening) {
      setState(() => _isVoiceListening = listening);
    };
    voiceService.onError = (error) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Voice error: $error')),
      );
    };
  }

  Future<void> _sendTask() async {
    if (!_formKey.currentState!.validate()) return;
    if (_promptController.text.trim().isEmpty) return;

    final selectedDesktop = ref.read(selectedDesktopProvider);
    if (selectedDesktop == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No desktop selected')),
      );
      return;
    }

    setState(() => _isSending = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      final taskId = await apiService.sendTask(
        toDeviceId: selectedDesktop.deviceId,
        envelope: TaskEnvelope(
          prompt: _promptController.text.trim(),
          model: _selectedModel,
          provider: _selectedProvider,
          permission: _permissionMode.name,
          customProvider: _customProviderConfig,
        ),
      );

      _promptController.clear();
      setState(() => _isSending = false);

      if (mounted) {
        context.push('/task/$taskId');
      }
    } catch (e) {
      setState(() => _isSending = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send task: $e')),
        );
      }
    }
  }

  void _toggleVoice() {
    final voiceService = ref.read(voiceServiceProvider);
    if (_isVoiceListening) {
      voiceService.stopListening();
    } else {
      voiceService.startListening(locale: _voiceLanguage);
    }
  }

  void _toggleLanguage() {
    setState(() {
      _voiceLanguage = _voiceLanguage == 'en-US' ? 'bn-BD' : 'en-US';
    });
  }

  @override
  void dispose() {
    _promptController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final devicesAsync = ref.watch(devicesProvider);
    final settings = ref.watch(appSettingsProvider);
    final selectedDesktop = ref.watch(selectedDesktopProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('New Task'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Desktop indicator
              if (selectedDesktop != null)
                Card(
                  color: theme.colorScheme.primaryContainer.withOpacity(0.3),
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Icon(
                          Icons.desktop_mac,
                          color: theme.colorScheme.primary,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Sending to: ${selectedDesktop.name}',
                            style: theme.textTheme.bodyMedium?.copyWith(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push('/desktop-picker'),
                          child: const Text('Change'),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Card(
                  color: theme.colorScheme.errorContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: Row(
                      children: [
                        Icon(Icons.warning, color: theme.colorScheme.onErrorContainer),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'No desktop selected. Choose one first.',
                            style: TextStyle(color: theme.colorScheme.onErrorContainer),
                          ),
                        ),
                        TextButton(
                          onPressed: () => context.push('/desktop-picker'),
                          child: Text(
                            'Select Desktop',
                            style: TextStyle(color: theme.colorScheme.onErrorContainer),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              const SizedBox(height: 24),

              // Prompt input
              Text(
                'Prompt',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _promptController,
                maxLines: 5,
                minLines: 3,
                decoration: InputDecoration(
                  hintText: 'Describe what you want to build...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  suffixIcon: _isVoiceListening
                      ? IconButton(
                          icon: const Icon(Icons.mic, color: Colors.red),
                          onPressed: _toggleVoice,
                          tooltip: 'Stop voice input',
                        )
                      : IconButton(
                          icon: Icon(
                            Icons.mic,
                            color: _voiceInterimText.isNotEmpty 
                                ? theme.colorScheme.primary 
                                : theme.colorScheme.onSurfaceVariant,
                          ),
                          onPressed: _toggleVoice,
                          tooltip: 'Voice input (${_voiceLanguage == 'en-US' ? 'English' : 'Bangla'})',
                        ),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a prompt';
                  }
                  return null;
                },
              ),
              if (_voiceInterimText.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: Text(
                    'Listening: $_voiceInterimText',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.primary,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),

              const SizedBox(height: 16),

              // Language toggle for voice
              Row(
                children: [
                  Icon(Icons.language, size: 20, color: theme.colorScheme.onSurfaceVariant),
                  const SizedBox(width: 8),
                  Text('Voice language: ', style: theme.textTheme.bodyMedium),
                  SegmentedButton<String>(
                    segments: const [
                      ButtonSegment(value: 'en-US', label: Text('English')),
                      ButtonSegment(value: 'bn-BD', label: Text('Bangla')),
                    ],
                    selected: {_voiceLanguage},
                    onSelectionChanged: (langs) {
                      if (langs.isNotEmpty) _toggleLanguage();
                    },
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Model selection
              Text(
                'Model',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              _ModelSelector(
                selectedModel: _selectedModel,
                onChanged: (model) => setState(() => _selectedModel = model),
                selectedProvider: _selectedProvider,
                onProviderChanged: (provider) => setState(() => _selectedProvider = provider),
                customProviderConfig: _customProviderConfig,
                onCustomProviderChanged: (config) => setState(() => _customProviderConfig = config),
                onAddCustomProvider: () => context.push('/custom-provider'),
              ),

              const SizedBox(height: 24),

              // Permission mode
              Text(
                'Permission Mode',
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'How should the desktop handle permission requests?',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 12),
                      SegmentedButton<PermissionMode>(
                        segments: PermissionMode.values.map((mode) => ButtonSegment(
                          value: mode,
                          label: Text(mode.label),
                          icon: _permissionIcon(mode),
                        )).toList(),
                        selected: {_permissionMode},
                        onSelectionChanged: (modes) {
                          if (modes.isNotEmpty) {
                            setState(() => _permissionMode = modes.first);
                          }
                        },
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _permissionMode.description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Send button
              SizedBox(
                width: double.infinity,
                child: PrimaryButton(
                  text: 'Send Task',
                  icon: Icons.send,
                  onPressed: _isSending ? null : _sendTask,
                  isLoading: _isSending,
                ),
              ),

              const SizedBox(height: 16),

              // Queue button
              OutlinedButton.icon(
                onPressed: () => context.push('/queue'),
                icon: const Icon(Icons.queue_music),
                label: const Text('View Message Queue'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Icon _permissionIcon(PermissionMode mode) {
    switch (mode) {
      case PermissionMode.ask:
        return const Icon(Icons.help_outline, size: 18);
      case PermissionMode.autoApprove:
        return const Icon(Icons.check_circle_outline, size: 18);
      case PermissionMode.fullAccess:
        return const Icon(Icons.lock_open, size: 18);
    }
  }
}

class _ModelSelector extends ConsumerWidget {
  final String selectedModel;
  final ValueChanged<String> onChanged;
  final String? selectedProvider;
  final ValueChanged<String?> onProviderChanged;
  final Map<String, dynamic>? customProviderConfig;
  final ValueChanged<Map<String, dynamic>?> onCustomProviderChanged;
  final VoidCallback onAddCustomProvider;

  const _ModelSelector({
    required this.selectedModel,
    required this.onChanged,
    required this.selectedProvider,
    required this.onProviderChanged,
    required this.customProviderConfig,
    required this.onCustomProviderChanged,
    required this.onAddCustomProvider,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Load models from assets
    // For now, use hardcoded list matching models.json
    final providers = [
      {'name': '9router', 'models': ['9router/auto', '9router/claude-3.5-sonnet', '9router/gpt-4o', '9router/gemini-1.5-pro']},
      {'name': 'DuckDuckGo (Free)', 'models': ['duckduckgo/claude-3-haiku', 'duckduckgo/gpt-4o-mini', 'duckduckgo/llama-3.1-70b', 'duckduckgo/mixtral-8x7b']},
      {'name': 'OpenAI', 'models': ['openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/gpt-4-turbo']},
      {'name': 'Anthropic', 'models': ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3.5-haiku', 'anthropic/claude-3-opus']},
      {'name': 'Google', 'models': ['google/gemini-1.5-pro', 'google/gemini-1.5-flash']},
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DropdownButtonFormField<String>(
              value: selectedModel,
              decoration: const InputDecoration(
                labelText: 'Select Model',
                prefixIcon: Icon(Icons.smart_toy),
              ),
              items: providers.expand((p) => (p['models'] as List<String>).map((m) => DropdownMenuItem(
                value: m,
                child: Text(m),
              ))).toList(),
              onChanged: (value) => onChanged(value!),
            ),
            if (customProviderConfig != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Icon(Icons.settings, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Custom Provider: ${customProviderConfig!['name']} (${customProviderConfig!['model']})',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () => onCustomProviderChanged(null),
                      child: const Text('Remove'),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: onAddCustomProvider,
              icon: const Icon(Icons.add),
              label: const Text('Add Custom Provider'),
            ),
          ],
        ),
      ),
    );
  }
}