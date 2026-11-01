import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/task.dart';
import '../../models/checkpoint.dart';
import '../../services/api_service.dart';
import '../../services/notification_service.dart';

class CheckpointScreen extends ConsumerStatefulWidget {
  final String taskId;
  final int checkpointIndex;

  const CheckpointScreen({
    super.key,
    required this.taskId,
    required this.checkpointIndex,
  });

  @override
  ConsumerState<CheckpointScreen> createState() => _CheckpointScreenState();
}

class _CheckpointScreenState extends ConsumerState<CheckpointScreen> {
  Checkpoint? _checkpoint;
  Task? _task;
  bool _isLoading = true;
  bool _isResponding = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final task = await apiService.getTask(widget.taskId);
      
      if (task.checkpointIndex != null && task.checkpointIndex == widget.checkpointIndex) {
        // In a real implementation, we'd fetch the checkpoint from the task
        // For now, create a mock checkpoint from task data
        final messages = task.messages ?? [];
        final checkpointMsg = messages.firstWhere(
          (m) => m.type == 'checkpoint' && m.metadata?['index'] == widget.checkpointIndex,
          orElse: () => TaskMessage(
            id: 'checkpoint_${widget.checkpointIndex}',
            role: 'system',
            content: 'Checkpoint needed',
            type: 'checkpoint',
            metadata: {'index': widget.checkpointIndex},
            timestamp: DateTime.now().toIso8601String(),
          ),
        );
        
        setState(() {
          _task = task;
          _checkpoint = Checkpoint(
            id: checkpointMsg.id,
            taskId: widget.taskId,
            index: widget.checkpointIndex,
            question: checkpointMsg.metadata?['question'] ?? 'The agent needs your approval to proceed.',
            context: checkpointMsg.metadata?['context'],
            status: 'pending',
            createdAt: checkpointMsg.timestamp,
          );
          _isLoading = false;
        });
      } else {
        setState(() {
          _task = task;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _respond(bool approved) async {
    if (_checkpoint == null || _isResponding) return;
    
    setState(() => _isResponding = true);

    try {
      final apiService = ref.read(apiServiceProvider);
      await apiService.sendTaskResult(widget.taskId, {
        'checkpoint_response': {
          'checkpoint_index': widget.checkpointIndex,
          'approved': approved,
        },
      });

      if (mounted) {
        ref.read(notificationServiceProvider).cancelNotification(_checkpoint!.id.hashCode);
        context.go('/task/${widget.taskId}');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isResponding = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to respond: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkpoint: Approval Needed'),
        backgroundColor: theme.colorScheme.errorContainer,
        foregroundColor: theme.colorScheme.onErrorContainer,
        automaticallyImplyLeading: false,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _checkpoint == null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check_circle, size: 64, color: theme.colorScheme.primary),
                      const SizedBox(height: 16),
                      Text(
                        'No checkpoint found',
                        style: theme.textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'This task may have moved past the checkpoint.',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                      const SizedBox(height: 24),
                      PrimaryButton(
                        text: 'Back to Task',
                        onPressed: () => context.go('/task/${widget.taskId}'),
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Warning header
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.errorContainer,
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.warning_amber_rounded,
                              size: 48,
                              color: theme.colorScheme.onErrorContainer,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Action Required',
                              style: theme.textTheme.headlineSmall?.copyWith(
                                color: theme.colorScheme.onErrorContainer,
                                fontWeight: FontWeight.w700,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'The agent is waiting for your decision before proceeding.',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: theme.colorScheme.onErrorContainer.withOpacity(0.8),
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Question card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Icon(
                                    Icons.help_outline,
                                    color: theme.colorScheme.primary,
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'Question',
                                    style: theme.textTheme.titleMedium?.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _checkpoint!.question,
                                style: theme.textTheme.bodyLarge?.copyWith(
                                  height: 1.5,
                                ),
                              ),
                              if (_checkpoint!.context != null) ...[
                                const SizedBox(height: 16),
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
                                        'Context',
                                        style: theme.textTheme.labelMedium?.copyWith(
                                          color: theme.colorScheme.onSurfaceVariant,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        _checkpoint!.context!,
                                        style: theme.textTheme.bodyMedium?.copyWith(
                                          color: theme.colorScheme.onSurfaceVariant,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Task info
                      if (_task != null)
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Task Details',
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                _InfoRow(label: 'Model', value: _task!.envelope.model),
                                if (_task!.envelope.provider != null)
                                  _InfoRow(label: 'Provider', value: _task!.envelope.provider!),
                                _InfoRow(
                                  label: 'Permission Mode',
                                  value: _task!.envelope.permission ?? 'ask',
                                ),
                                if (_task!.cost != null)
                                  _InfoRow(
                                    label: 'Cost So Far',
                                    value: '\$${_task!.cost!.toStringAsFixed(4)}',
                                  ),
                              ],
                            ),
                          ),
                        ),

                      const SizedBox(height: 32),

                      // Action buttons
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: _isResponding ? null : () => _respond(false),
                              icon: const Icon(Icons.close),
                              label: const Text('Reject'),
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                foregroundColor: theme.colorScheme.error,
                                side: BorderSide(color: theme.colorScheme.error),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: PrimaryButton(
                              text: 'Approve',
                              icon: Icons.check,
                              onPressed: _isResponding ? null : () => _respond(true),
                              isLoading: _isResponding,
                              backgroundColor: theme.colorScheme.primary,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      Text(
                        'Approving continues the task. Rejecting stops it and marks as failed.',
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final String label;
  final String value;

  const _InfoRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}