import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/recommendation.dart';

class RecommendationsScreen extends ConsumerStatefulWidget {
  const RecommendationsScreen({super.key});

  @override
  ConsumerState<RecommendationsScreen> createState() => _RecommendationsScreenState();
}

class _RecommendationsScreenState extends ConsumerState<RecommendationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(recommendationsProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final recommendationsAsync = ref.watch(recommendationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Recommendations'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(recommendationsProvider.notifier).refresh(),
          ),
        ],
      ),
      body: recommendationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 16),
              Text('Failed to load recommendations: $e'),
              const SizedBox(height: 16),
              PrimaryButton(
                text: 'Retry',
                onPressed: () => ref.read(recommendationsProvider.notifier).refresh(),
              ),
            ],
          ),
        ),
        data: (recommendations) {
          if (recommendations.isEmpty) {
            return _EmptyRecommendations();
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: recommendations.length,
            itemBuilder: (context, index) {
              final rec = recommendations[index];
              return _RecommendationCard(
                recommendation: rec,
                onInstall: () => _handleInstall(ref, rec),
                onDismiss: () => _handleDismiss(ref, rec),
                onDontSuggest: () => _handleDontSuggest(ref, rec),
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _handleInstall(WidgetRef ref, Recommendation rec) async {
    if (rec.configSchema != null && rec.configSchema!.isNotEmpty) {
      // Show config dialog
      final configValues = await _showConfigDialog(rec);
      if (configValues != null) {
        await ref.read(recommendationsProvider.notifier).submitAction(
          RecommendationAction(
            recommendationId: rec.id,
            action: 'install',
            configValues: configValues,
            timestamp: DateTime.now().toIso8601String(),
          ),
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Installing ${rec.name}...')),
          );
        }
      }
    } else {
      await ref.read(recommendationsProvider.notifier).submitAction(
        RecommendationAction(
          recommendationId: rec.id,
          action: 'install',
          timestamp: DateTime.now().toIso8601String(),
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Installing ${rec.name}...')),
        );
      }
    }
  }

  Future<Map<String, dynamic>?> _showConfigDialog(Recommendation rec) async {
    final controllers = <String, TextEditingController>{};
    for (final entry in rec.configSchema!.entries) {
      controllers[entry.key] = TextEditingController(
        text: rec.configValues?[entry.key] ?? '',
      );
    }

    return await showDialog<Map<String, dynamic>>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Configure ${rec.name}'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: rec.configSchema!.entries.map((entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: TextField(
                  controller: controllers[entry.key],
                  decoration: InputDecoration(
                    labelText: entry.value,
                    border: const OutlineInputBorder(),
                    hintText: 'Enter ${entry.value}',
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          PrimaryButton(
            text: 'Install',
            onPressed: () {
              final values = <String, dynamic>{};
              for (final entry in controllers.entries) {
                values[entry.key] = entry.value.text;
              }
              Navigator.pop(context, values);
            },
          ),
        ],
      ),
    );
  }

  Future<void> _handleDismiss(WidgetRef ref, Recommendation rec) async {
    await ref.read(recommendationsProvider.notifier).submitAction(
      RecommendationAction(
        recommendationId: rec.id,
        action: 'dismiss',
        timestamp: DateTime.now().toIso8601String(),
      ),
    );
  }

  Future<void> _handleDontSuggest(WidgetRef ref, Recommendation rec) async {
    await ref.read(recommendationsProvider.notifier).submitAction(
      RecommendationAction(
        recommendationId: rec.id,
        action: 'dont_suggest',
        timestamp: DateTime.now().toIso8601String(),
      ),
    );
  }
}

class _EmptyRecommendations extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.recommend_outlined,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              'No Recommendations',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Tool recommendations from the desktop will appear here.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecommendationCard extends StatelessWidget {
  final Recommendation recommendation;
  final VoidCallback onInstall;
  final VoidCallback onDismiss;
  final VoidCallback onDontSuggest;

  const _RecommendationCard({
    required this.recommendation,
    required this.onInstall,
    required this.onDismiss,
    required this.onDontSuggest,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    Icons.extension,
                    color: theme.colorScheme.onPrimaryContainer,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        recommendation.name,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        recommendation.description,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                if (recommendation.configSchema != null && recommendation.configSchema!.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.secondaryContainer,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'Config Required',
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSecondaryContainer,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            if (recommendation.configValues != null && recommendation.configValues!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Configured Values:',
                      style: theme.textTheme.labelMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    ...recommendation.configValues!.entries.map((entry) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        '${entry.key}: ${entry.value}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontFamily: 'monospace',
                        ),
                      ),
                    )),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onDismiss,
                    icon: const Icon(Icons.visibility_off),
                    label: const Text('Dismiss'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onDontSuggest,
                    icon: const Icon(Icons.block),
                    label: const Text("Don't Suggest"),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: theme.colorScheme.error,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  flex: 2,
                  child: PrimaryButton(
                    text: 'Install',
                    icon: Icons.download,
                    onPressed: onInstall,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}