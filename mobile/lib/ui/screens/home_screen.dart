import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../widgets/flamingo_logo.dart';
import '../../state/providers.dart';
import '../../models/device.dart';
import '../../models/permission_mode.dart';
import '../../models/app_settings.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final devicesAsync = ref.watch(devicesProvider);
    final selectedDesktop = ref.watch(selectedDesktopProvider);
    final settings = ref.watch(appSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const FlamingoLogo(size: 32, showText: true),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push('/settings'),
            tooltip: 'Settings',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await ref.read(authStateProvider.notifier).signOut();
            },
            tooltip: 'Sign out',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User greeting
            if (user != null)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
                        backgroundImage: user.picture != null ? NetworkImage(user.picture!) : null,
                        child: user.picture == null
                            ? Text(
                                user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                ),
                              )
                            : null,
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back, ${user.name}',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            Text(
                              user.email,
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 24),

            // Desktop selection
            Text(
              'Connected Desktop',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            devicesAsync.when(
              loading: () => _DesktopPickerSkeleton(),
              error: (e, _) => _DesktopError(error: e.toString()),
              data: (devices) {
                final desktops = devices.where((d) => d.isDesktop).toList();
                
                if (desktops.isEmpty) {
                  return _NoDesktopsCard(onAddDesktop: () {
                    context.push('/desktop-picker');
                  });
                }

                final currentDesktop = selectedDesktop ?? desktops.first;
                final permissionMode = settings.getPermissionMode(currentDesktop.deviceId);

                return Column(
                  children: [
                    _DesktopCard(
                      desktop: currentDesktop,
                      permissionMode: permissionMode,
                      onTap: () => context.push('/desktop-picker'),
                      onPermissionChanged: (mode) {
                        ref.read(appSettingsProvider.notifier).setPermissionMode(
                          currentDesktop.deviceId, mode);
                      },
                    ),
                    const SizedBox(height: 16),
                    if (desktops.length > 1)
                      TextButton.icon(
                        onPressed: () => context.push('/desktop-picker'),
                        icon: const Icon(Icons.swap_horiz),
                        label: const Text('Switch Desktop'),
                      ),
                  ],
                );
              },
            ),

            const SizedBox(height: 24),

            // Quick actions
            Text(
              'Quick Actions',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                _ActionCard(
                  icon: Icons.mic,
                  label: 'Voice Prompt',
                  subtitle: 'Bangla + English',
                  onTap: () => context.push('/prompt'),
                ),
                _ActionCard(
                  icon: Icons.history,
                  label: 'Task History',
                  subtitle: 'Past tasks & results',
                  onTap: () => context.push('/history'),
                ),
                _ActionCard(
                  icon: Icons.queue_music,
                  label: 'Message Queue',
                  subtitle: 'Queued follow-ups',
                  onTap: () => context.push('/queue'),
                ),
                _ActionCard(
                  icon: Icons.recommend,
                  label: 'Recommendations',
                  subtitle: 'Tools to install',
                  onTap: () => context.push('/recommendations'),
                ),
                _ActionCard(
                  icon: Icons.psychology,
                  label: 'Brain Notes',
                  subtitle: 'Project memory',
                  onTap: () => context.push('/brain-notes'),
                ),
                _ActionCard(
                  icon: Icons.video_library,
                  label: 'Recordings',
                  subtitle: 'Task videos & reports',
                  onTap: () {
                    // Navigate to recordings - would need a task ID
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Select a task from history first')),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/prompt'),
        icon: const Icon(Icons.add),
        label: const Text('New Task'),
      ),
    );
  }
}

class _DesktopPickerSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 120,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    width: 80,
                    height: 12,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DesktopError extends StatelessWidget {
  final String error;
  const _DesktopError({required this.error});

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Theme.of(context).colorScheme.errorContainer,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Icon(Icons.error_outline, color: Theme.of(context).colorScheme.onErrorContainer),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Failed to load desktops: $error',
                style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NoDesktopsCard extends StatelessWidget {
  final VoidCallback onAddDesktop;
  const _NoDesktopsCard({required this.onAddDesktop});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            Icon(
              Icons.desktop_mac_outlined,
              size: 48,
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 16),
            Text(
              'No Desktop Connected',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Sign in to the FlamingoCode desktop app with the same Google account to pair automatically.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              text: 'Refresh',
              icon: Icons.refresh,
              onPressed: onAddDesktop,
            ),
          ],
        ),
      ),
    );
  }
}

class _DesktopCard extends StatelessWidget {
  final Device desktop;
  final PermissionMode permissionMode;
  final VoidCallback onTap;
  final ValueChanged<PermissionMode> onPermissionChanged;

  const _DesktopCard({
    required this.desktop,
    required this.permissionMode,
    required this.onTap,
    required this.onPermissionChanged,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primaryContainer,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Icon(
                      Icons.desktop_mac,
                      color: theme.colorScheme.onPrimaryContainer,
                      size: 28,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          desktop.name,
                          style: theme.textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Last seen: ${_formatLastSeen(desktop.lastSeen)}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    Icons.chevron_right,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Permission mode selector
              Text(
                'Permission Mode',
                style: theme.textTheme.labelMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 8),
              SegmentedButton<PermissionMode>(
                segments: PermissionMode.values.map((mode) => ButtonSegment(
                  value: mode,
                  label: Text(mode.label),
                  icon: _permissionIcon(mode),
                )).toList(),
                selected: {permissionMode},
                onSelectionChanged: (modes) {
                  if (modes.isNotEmpty) {
                    onPermissionChanged(modes.first);
                  }
                },
                style: SegmentedButton.styleFrom(
                  visualDensity: VisualDensity.compact,
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
        return const Icon(Icons.help_outline, size: 16);
      case PermissionMode.autoApprove:
        return const Icon(Icons.check_circle_outline, size: 16);
      case PermissionMode.fullAccess:
        return const Icon(Icons.lock_open, size: 16);
    }
  }

  String _formatLastSeen(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);
      
      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inHours < 1) return '${diff.inMinutes}m ago';
      if (diff.inDays < 1) return '${diff.inHours}h ago';
      return '${diff.inDays}d ago';
    } catch (_) {
      return 'Unknown';
    }
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: theme.colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: theme.colorScheme.onPrimaryContainer,
                  size: 24,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                label,
                textAlign: TextAlign.center,
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}