import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/app_settings.dart';
import '../../models/permission_mode.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(appSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account section
          _SectionHeader(title: 'Account'),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.person,
                  title: 'Account',
                  subtitle: 'Manage your Google account',
                  onTap: () {},
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.logout,
                  title: 'Sign Out',
                  subtitle: 'Disconnect from all devices',
                  onTap: _confirmSignOut,
                  iconColor: Theme.of(context).colorScheme.error,
                  textColor: Theme.of(context).colorScheme.error,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Relay section
          _SectionHeader(title: 'Relay Server'),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.cloud,
                  title: 'Relay URL',
                  subtitle: settings.relayBaseUrl,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _editRelayUrl,
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.wifi,
                  title: 'Desktop LAN URL',
                  subtitle: settings.desktopLanUrl.isEmpty ? 'Not configured' : settings.desktopLanUrl,
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _editLanUrl,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Notifications section
          _SectionHeader(title: 'Notifications'),
          Card(
            child: Column(
              children: [
                SwitchListTile(
                  secondary: Icon(Icons.notifications, color: Theme.of(context).colorScheme.primary),
                  title: const Text('Enable Notifications'),
                  subtitle: const Text('Receive task completion and checkpoint alerts'),
                  value: settings.notificationsEnabled,
                  onChanged: (value) => _updateSettings(settings.copyWith(notificationsEnabled: value)),
                ),
                const Divider(height: 1, indent: 56),
                SwitchListTile(
                  secondary: Icon(Icons.vibration, color: Theme.of(context).colorScheme.primary),
                  title: const Text('Vibration'),
                  subtitle: const Text('Vibrate on notifications'),
                  value: settings.vibrationEnabled,
                  onChanged: (value) => _updateSettings(settings.copyWith(vibrationEnabled: value)),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Voice section
          _SectionHeader(title: 'Voice Input'),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.language,
                  title: 'Voice Language',
                  subtitle: settings.voiceLanguage == 'en-US' ? 'English (US)' : 'Bangla (Bangladesh)',
                  trailing: const Icon(Icons.chevron_right),
                  onTap: _changeVoiceLanguage,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Default permission mode
          _SectionHeader(title: 'Default Permission Mode'),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Default mode for new desktop connections',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SegmentedButton<PermissionMode>(
                    segments: PermissionMode.values.map((mode) => ButtonSegment(
                      value: mode,
                      label: Text(mode.label),
                      icon: _permissionIcon(mode),
                    )).toList(),
                    selected: {settings.defaultPermissionMode},
                    onSelectionChanged: (modes) {
                      if (modes.isNotEmpty) {
                        _updateSettings(settings.copyWith(defaultPermissionMode: modes.first));
                      }
                    },
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 24),

          // About section
          _SectionHeader(title: 'About'),
          Card(
            child: Column(
              children: [
                _SettingsTile(
                  icon: Icons.info,
                  title: 'Version',
                  subtitle: '1.0.0',
                  onTap: () {},
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.article,
                  title: 'Documentation',
                  subtitle: 'Read the docs at flamingocode.com',
                  onTap: () {},
                ),
                const Divider(height: 1),
                _SettingsTile(
                  icon: Icons.bug_report,
                  title: 'Report Issue',
                  subtitle: 'GitHub Issues',
                  onTap: () {},
                ),
              ],
            ),
          ),
        ],
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

  Future<void> _updateSettings(AppSettings newSettings) async {
    await ref.read(appSettingsProvider.notifier).updateSettings(newSettings);
  }

  Future<void> _confirmSignOut() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text('Are you sure you want to sign out? You will need to sign in again to use the app.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ref.read(authStateProvider.notifier).signOut();
      if (mounted) context.go('/login');
    }
  }

  Future<void> _editRelayUrl() async {
    final settings = ref.read(appSettingsProvider);
    final controller = TextEditingController(text: settings.relayBaseUrl);
    
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Relay Server URL'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Base URL',
            hintText: 'https://flamingocode-eta.vercel.app',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          PrimaryButton(
            text: 'Save',
            onPressed: () {
              _updateSettings(settings.copyWith(relayBaseUrl: controller.text));
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }

  Future<void> _editLanUrl() async {
    final settings = ref.read(appSettingsProvider);
    final controller = TextEditingController(text: settings.desktopLanUrl);
    
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Desktop LAN URL'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'LAN URL (optional)',
            hintText: 'http://192.168.1.xxx:8080',
            border: OutlineInputBorder(),
            helperText: 'Local network address for direct phone-desktop communication',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          PrimaryButton(
            text: 'Save',
            onPressed: () {
              _updateSettings(settings.copyWith(desktopLanUrl: controller.text));
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }

  Future<void> _changeVoiceLanguage() async {
    final settings = ref.read(appSettingsProvider);
    final selected = await showDialog<String>(
      context: context,
      builder: (context) => SimpleDialog(
        title: const Text('Select Voice Language'),
        children: [
          RadioListTile<String>(
            title: const Text('English (US)'),
            value: 'en-US',
            groupValue: settings.voiceLanguage,
            onChanged: (value) => Navigator.pop(context, value),
          ),
          RadioListTile<String>(
            title: const Text('Bangla (Bangladesh)'),
            value: 'bn-BD',
            groupValue: settings.voiceLanguage,
            onChanged: (value) => Navigator.pop(context, value),
          ),
        ],
      ),
    );

    if (selected != null) {
      _updateSettings(settings.copyWith(voiceLanguage: selected));
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: Theme.of(context).colorScheme.primary,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Widget? trailing;
  final VoidCallback? onTap;
  final Color? iconColor;
  final Color? textColor;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.onTap,
    this.iconColor,
    this.textColor,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return ListTile(
      leading: Icon(icon, color: iconColor ?? theme.colorScheme.primary),
      title: Text(
        title,
        style: theme.textTheme.bodyLarge?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: theme.textTheme.bodySmall?.copyWith(
          color: textColor ?? theme.colorScheme.onSurfaceVariant,
        ),
      ),
      trailing: trailing ?? (onTap != null ? Icon(Icons.chevron_right, color: theme.colorScheme.onSurfaceVariant) : null),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }
}