import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../widgets/flamingo_logo.dart';
import '../../state/providers.dart';
import '../../models/device.dart';
import '../../models/permission_mode.dart';
import '../../models/app_settings.dart';

class DesktopPickerScreen extends ConsumerWidget {
  const DesktopPickerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final devicesAsync = ref.watch(devicesProvider);
    final selectedDesktop = ref.watch(selectedDesktopProvider);
    final settings = ref.watch(appSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Desktop'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: devicesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 16),
              Text('Failed to load desktops: $e'),
              const SizedBox(height: 16),
              PrimaryButton(
                text: 'Retry',
                icon: Icons.refresh,
                onPressed: () => ref.read(devicesProvider.notifier).refresh(),
              ),
            ],
          ),
        ),
        data: (devices) {
          final desktops = devices.where((d) => d.isDesktop).toList();
          
          if (desktops.isEmpty) {
            return _EmptyState(
              icon: Icons.desktop_mac_outlined,
              title: 'No Desktops Paired',
              subtitle: 'Sign in to the FlamingoCode desktop app with the same Google account to pair automatically.',
              actionText: 'Refresh',
              onAction: () => ref.read(devicesProvider.notifier).refresh(),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: desktops.length,
            itemBuilder: (context, index) {
              final desktop = desktops[index];
              final isSelected = selectedDesktop?.deviceId == desktop.deviceId;
              final permissionMode = settings.getPermissionMode(desktop.deviceId);
              
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                color: isSelected 
                    ? Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3)
                    : null,
                child: InkWell(
                  onTap: () {
                    ref.read(selectedDesktopProvider.notifier).select(desktop);
                    context.pop();
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(
                                color: isSelected 
                                    ? Theme.of(context).colorScheme.primary
                                    : Theme.of(context).colorScheme.primaryContainer,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Icon(
                                Icons.desktop_mac,
                                color: isSelected 
                                    ? Theme.of(context).colorScheme.onPrimary
                                    : Theme.of(context).colorScheme.onPrimaryContainer,
                                size: 28,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(
                                        desktop.name,
                                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      if (isSelected) ...[
                                        const SizedBox(width: 8),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                          decoration: BoxDecoration(
                                            color: Theme.of(context).colorScheme.primary,
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Text(
                                            'Active',
                                            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                              color: Theme.of(context).colorScheme.onPrimary,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Last seen: ${_formatLastSeen(desktop.lastSeen)}',
                                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                                    ),
                                  ),
                                  if (desktop.lanUrl != null) ...[
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.wifi,
                                          size: 12,
                                          color: Theme.of(context).colorScheme.primary,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          'LAN: ${desktop.lanUrl}',
                                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                            color: Theme.of(context).colorScheme.primary,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(
                                Icons.check_circle,
                                color: Theme.of(context).colorScheme.primary,
                                size: 28,
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Permission mode selector
                        Row(
                          children: [
                            Text(
                              'Permission: ',
                              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                                color: Theme.of(context).colorScheme.onSurfaceVariant,
                              ),
                            ),
                            const SizedBox(width: 8),
                            SegmentedButton<PermissionMode>(
                              segments: PermissionMode.values.map((mode) => ButtonSegment(
                                value: mode,
                                label: Text(mode.label, style: const TextStyle(fontSize: 11)),
                                icon: _permissionIcon(mode),
                              )).toList(),
                              selected: {permissionMode},
                              onSelectionChanged: (modes) {
                                if (modes.isNotEmpty) {
                                  ref.read(appSettingsProvider.notifier).setPermissionMode(
                                    desktop.deviceId, modes.first);
                                }
                              },
                              style: SegmentedButton.styleFrom(
                                visualDensity: VisualDensity.compact,
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              ),
                            ),
                          ],
                        ),
                        if (isSelected) ...[
                          const SizedBox(height: 8),
                          Text(
                            permissionMode.description,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Icon _permissionIcon(PermissionMode mode) {
    switch (mode) {
      case PermissionMode.ask:
        return const Icon(Icons.help_outline, size: 14);
      case PermissionMode.autoApprove:
        return const Icon(Icons.check_circle_outline, size: 14);
      case PermissionMode.fullAccess:
        return const Icon(Icons.lock_open, size: 14);
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

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String actionText;
  final VoidCallback onAction;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.actionText,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 64, color: Theme.of(context).colorScheme.onSurfaceVariant),
            const SizedBox(height: 24),
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Theme.of(context).colorScheme.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              text: actionText,
              icon: Icons.refresh,
              onPressed: onAction,
            ),
          ],
        ),
      ),
    );
  }
}