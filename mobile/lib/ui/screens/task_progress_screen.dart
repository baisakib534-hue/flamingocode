import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/task.dart';
import '../../models/checkpoint.dart';
import '../../services/notification_service.dart';

class TaskProgressScreen extends ConsumerStatefulWidget {
  final String taskId;

  const TaskProgressScreen({super.key, required this.taskId});

  @override
  ConsumerState<TaskProgressScreen> createState() => _TaskProgressScreenState();
}

class _TaskProgressScreenState extends ConsumerState<TaskProgressScreen> {
  late Timer _pollTimer;
  Task? _task;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTask();
    _startPolling();
  }

  @override
  void dispose() {
    _pollTimer.cancel();
    super.dispose();
  }

  Future<void> _loadTask() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final task = await apiService.getTask(widget.taskId);
      if (mounted) {
        setState(() {
          _task = task;
          _isLoading = false;
        });
        _handleTaskStatus(task);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _loadTask();
    });
  }

  void _handleTaskStatus(Task task) {
    if (task.status == 'needs-help' && task.checkpointIndex != null) {
      // Check if we're already on checkpoint screen
      final currentRoute = GoRouterState.of(context).uri.toString();
      if (!currentRoute.contains('/checkpoint/')) {
        context.push('/checkpoint/${task.taskId}/${task.checkpointIndex}');
      }
    } else if (task.status == 'done' || task.status == 'failed') {
      _pollTimer.cancel();
      _showCompletionNotification(task);
    }
  }

  void _showCompletionNotification(Task task) {
    final notificationService = ref.read(notificationServiceProvider);
    if (task.status == 'done') {
      notificationService.showTaskDoneNotification(task);
    } else if (task.status == 'failed') {
      notificationService.showTaskFailedNotification(task, task.result ?? 'Unknown error');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text((_task?.envelope.prompt.length ?? 0) > 30
            ? '${_task!.envelope.prompt.substring(0, 30)}...'
            : _task?.envelope.prompt ?? 'Task'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTask,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.queue_music),
            onPressed: () => context.push('/queue'),
            tooltip: 'Message Queue',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _task == null
              ? const Center(child: Text('Task not found'))
              : _buildTaskView(context, _task!),
    );
  }

  Widget _buildTaskView(BuildContext context, Task task) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // Status header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: _statusColor(task.status).withOpacity(0.1),
            border: Border(
              bottom: BorderSide(color: _statusColor(task.status), width: 2),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _StatusChip(status: task.status),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      task.envelope.prompt,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    'Model: ${task.envelope.model}',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                  if (task.envelope.provider != null) ...[
                    const SizedBox(width: 16),
                    Text(
                      'Provider: ${task.envelope.provider}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                  if (task.cost != null) ...[
                    const SizedBox(width: 16),
                    Text(
                      'Cost: \$${task.cost!.toStringAsFixed(4)}',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: theme.colorScheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),

        // Messages timeline
        Expanded(
          child: task.messages?.isNotEmpty == true
              ? ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: task.messages!.length,
                  itemBuilder: (context, index) {
                    final message = task.messages![index];
                    return _MessageBubble(message: message);
                  },
                )
              : Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.chat_bubble_outline,
                        size: 64,
                        color: theme.colorScheme.onSurfaceVariant.withOpacity(0.5),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Waiting for messages...',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
        ),

        // Bottom actions
        if (task.status == 'running' || task.status == 'queued')
          _buildRunningActions(context, task)
        else if (task.status == 'done')
          _buildDoneActions(context, task)
        else if (task.status == 'failed')
          _buildFailedActions(context, task),
      ],
    );
  }

  Widget _buildRunningActions(BuildContext context, Task task) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => context.push('/queue'),
              icon: const Icon(Icons.queue_music),
              label: const Text('Queue'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: PrimaryButton(
              text: 'View Recordings',
              icon: Icons.video_library,
              onPressed: () => context.push('/recordings/${task.taskId}'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDoneActions(BuildContext context, Task task) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => context.push('/recordings/${task.taskId}'),
              icon: const Icon(Icons.video_library),
              label: const Text('Recordings'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: PrimaryButton(
              text: 'New Task',
              icon: Icons.add,
              onPressed: () => context.go('/prompt'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFailedActions(BuildContext context, Task task) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(color: Theme.of(context).colorScheme.outlineVariant),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: () => context.push('/recordings/${task.taskId}'),
              icon: const Icon(Icons.video_library),
              label: const Text('Recordings'),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: PrimaryButton(
              text: 'Retry',
              icon: Icons.refresh,
              onPressed: () => context.go('/prompt'),
            ),
          ),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pending':
      case 'queued':
        return Colors.orange;
      case 'running':
        return Colors.blue;
      case 'needs-help':
        return Colors.deepOrange;
      case 'done':
        return Colors.green;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
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
      avatar: Icon(icon, size: 16, color: color),
      label: Text(
        label,
        style: TextStyle(color: color, fontWeight: FontWeight.w600),
      ),
      backgroundColor: color.withOpacity(0.1),
      side: BorderSide(color: color),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final TaskMessage message;

  const _MessageBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isUser = message.role == 'user';
    final isAgent = message.role == 'agent' || message.agentName != null;

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(
              radius: 16,
              backgroundColor: isAgent
                  ? theme.colorScheme.primaryContainer
                  : theme.colorScheme.secondaryContainer,
              child: Icon(
                isAgent ? Icons.smart_toy : Icons.computer,
                size: 16,
                color: isAgent
                    ? theme.colorScheme.onPrimaryContainer
                    : theme.colorScheme.onSecondaryContainer,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width * 0.75,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser
                    ? theme.colorScheme.primary
                    : isAgent
                        ? theme.colorScheme.primaryContainer
                        : theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(16).copyWith(
                  bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
                  bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (message.agentName != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        message.agentName!,
                        style: theme.textTheme.labelSmall?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: isUser
                              ? theme.colorScheme.onPrimary.withOpacity(0.8)
                              : theme.colorScheme.onPrimaryContainer,
                        ),
                      ),
                    ),
                  Text(
                    message.content,
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: isUser
                          ? theme.colorScheme.onPrimary
                          : theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(message.timestamp),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isUser
                          ? theme.colorScheme.onPrimary.withOpacity(0.6)
                          : theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 16,
              backgroundColor: theme.colorScheme.primary,
              child: const Icon(Icons.person, size: 16, color: Colors.white),
            ),
          ],
        ],
      ),
    );
  }

  String _formatTime(String isoString) {
    try {
      final date = DateTime.parse(isoString);
      return DateFormat('HH:mm').format(date);
    } catch (_) {
      return '';
    }
  }
}