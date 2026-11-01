import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/task.dart';
import '../../services/api_service.dart';

class TaskHistoryScreen extends ConsumerStatefulWidget {
  const TaskHistoryScreen({super.key});

  @override
  ConsumerState<TaskHistoryScreen> createState() => _TaskHistoryScreenState();
}

class _TaskHistoryScreenState extends ConsumerState<TaskHistoryScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(taskHistoryProvider.notifier).refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final historyAsync = ref.watch(taskHistoryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task History'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(taskHistoryProvider.notifier).refresh(),
          ),
        ],
      ),
      body: historyAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, size: 48, color: Theme.of(context).colorScheme.error),
              const SizedBox(height: 16),
              Text('Failed to load history: $e'),
              const SizedBox(height: 16),
              PrimaryButton(
                text: 'Retry',
                onPressed: () => ref.read(taskHistoryProvider.notifier).refresh(),
              ),
            ],
          ),
        ),
        data: (tasks) {
          if (tasks.isEmpty) {
            return _EmptyHistory();
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: tasks.length,
            itemBuilder: (context, index) {
              final task = tasks[index];
              return _TaskHistoryCard(task: task);
            },
          );
        },
      ),
    );
  }
}

class _TaskHistoryCard extends StatelessWidget {
  final Task task;

  const _TaskHistoryCard({required this.task});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => context.push('/task/${task.taskId}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _StatusChip(status: task.status),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      task.envelope.prompt.length > 50
                          ? '${task.envelope.prompt.substring(0, 50)}...'
                          : task.envelope.prompt,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Text(
                    _formatDate(task.createdAt),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _InfoChip(label: 'Model', value: task.envelope.model),
                  if (task.envelope.provider != null) ...[
                    const SizedBox(width: 8),
                    _InfoChip(label: 'Provider', value: task.envelope.provider!),
                  ],
                  if (task.cost != null) ...[
                    const SizedBox(width: 8),
                    _InfoChip(
                      label: 'Cost',
                      value: '\$${task.cost!.toStringAsFixed(4)}',
                      color: theme.colorScheme.primary,
                    ),
                  ],
                ],
              ),
              if (task.result != null) ...[
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    task.result!.toString().length > 100
                        ? '${task.result!.toString().substring(0, 100)}...'
                        : task.result.toString(),
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      final now = DateTime.now();
      final diff = now.difference(date);
      
      if (diff.inDays == 0) {
        return '${date.hour}:${date.minute.toString().padLeft(2, '0')}';
      } else if (diff.inDays < 7) {
        return '${diff.inDays}d ago';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (_) {
      return '';
    }
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;
    IconData icon;

    switch (status) {
      case 'pending':
      case 'queued':
        color = Colors.orange;
        label = 'Queued';
        icon = Icons.schedule;
        break;
      case 'running':
        color = Colors.blue;
        label = 'Running';
        icon = Icons.play_circle;
        break;
      case 'needs-help':
        color = Colors.deepOrange;
        label = 'Needs Help';
        icon = Icons.help;
        break;
      case 'done':
        color = Colors.green;
        label = 'Done';
        icon = Icons.check_circle;
        break;
      case 'failed':
        color = Colors.red;
        label = 'Failed';
        icon = Icons.error;
        break;
      default:
        color = Colors.grey;
        label = status;
        icon = Icons.help_outline;
    }

    return Chip(
      avatar: Icon(icon, size: 14, color: color),
      label: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 11),
      ),
      backgroundColor: color.withOpacity(0.1),
      side: BorderSide(color: color),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;

  const _InfoChip({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final chipColor = color ?? theme.colorScheme.onSurfaceVariant;

    return Chip(
      label: Text(
        '$label: $value',
        style: TextStyle(
          color: chipColor,
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
      backgroundColor: chipColor.withOpacity(0.1),
      side: BorderSide(color: chipColor.withOpacity(0.3)),
      visualDensity: VisualDensity.compact,
    );
  }
}

class _EmptyHistory extends StatelessWidget {
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
              Icons.history_outlined,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              'No Task History',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Your completed tasks will appear here.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            PrimaryButton(
              text: 'Create Your First Task',
              icon: Icons.add,
              onPressed: () => context.go('/prompt'),
            ),
          ],
        ),
      ),
    );
  }
}