import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../widgets/primary_button.dart';
import '../../state/providers.dart';
import '../../models/queued_message.dart';

class MessageQueueScreen extends ConsumerStatefulWidget {
  const MessageQueueScreen({super.key});

  @override
  ConsumerState<MessageQueueScreen> createState() => _MessageQueueScreenState();
}

class _MessageQueueScreenState extends ConsumerState<MessageQueueScreen> {
  @override
  Widget build(BuildContext context) {
    final queue = ref.watch(messageQueueProvider);
    final activeTask = ref.watch(activeTaskProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Message Queue'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: [
          if (queue.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.clear_all),
              onPressed: () => _confirmClearQueue(ref),
              tooltip: 'Clear Queue',
            ),
        ],
      ),
      body: queue.isEmpty
          ? _EmptyQueue()
          : ReorderableListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: queue.length,
              onReorder: (oldIndex, newIndex) {
                ref.read(messageQueueProvider.notifier).reorder(oldIndex, newIndex);
              },
              itemBuilder: (context, index) {
                final message = queue[index];
                return _QueuedMessageCard(
                  key: ValueKey(message.id),
                  message: message,
                  index: index,
                  isNext: index == 0 && activeTask.value?.status == 'running',
                  onEdit: () => _editMessage(ref, message),
                  onDelete: () => _deleteMessage(ref, message.id),
                  onSendNow: () => _sendNow(ref, message),
                );
              },
            ),
    );
  }

  Future<void> _editMessage(WidgetRef ref, QueuedMessage message) async {
    final controller = TextEditingController(text: message.prompt);
    
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Queued Message'),
        content: TextField(
          controller: controller,
          maxLines: 5,
          minLines: 3,
          decoration: const InputDecoration(
            hintText: 'Enter your prompt...',
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
              ref.read(messageQueueProvider.notifier).update(
                message.copyWith(prompt: controller.text),
              );
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }

  Future<void> _deleteMessage(WidgetRef ref, String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Message'),
        content: const Text('Are you sure you want to delete this queued message?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      ref.read(messageQueueProvider.notifier).remove(id);
    }
  }

  void _sendNow(WidgetRef ref, QueuedMessage message) {
    // Move to front of queue and mark as sending
    ref.read(messageQueueProvider.notifier).update(
      message.copyWith(status: 'sending', order: -1),
    );
    // In a real implementation, this would trigger sending to the API
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Message sent to desktop')),
    );
  }

  Future<void> _confirmClearQueue(WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear Queue'),
        content: const Text('Are you sure you want to clear all queued messages?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Clear', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      ref.read(messageQueueProvider.notifier).clear();
    }
  }
}

class _EmptyQueue extends StatelessWidget {
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
              Icons.queue_music_outlined,
              size: 64,
              color: theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(height: 24),
            Text(
              'Queue is Empty',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Messages you send while a task is running will appear here.',
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

class _QueuedMessageCard extends StatelessWidget {
  final QueuedMessage message;
  final int index;
  final bool isNext;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback onSendNow;

  const _QueuedMessageCard({
    super.key,
    required this.message,
    required this.index,
    required this.isNext,
    required this.onEdit,
    required this.onDelete,
    required this.onSendNow,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Drag handle
                ReorderableDragStartListener(
                  index: index,
                  child: Icon(
                    Icons.drag_indicator,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
                const SizedBox(width: 8),
                // Order number
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: isNext
                        ? theme.colorScheme.primary
                        : theme.colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      isNext ? '⚡' : '${index + 1}',
                      style: TextStyle(
                        color: isNext
                            ? theme.colorScheme.onPrimary
                            : theme.colorScheme.onSurfaceVariant,
                        fontWeight: FontWeight.w600,
                        fontSize: isNext ? 14 : 12,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Status
                if (message.status == 'sending')
                  Chip(
                    label: const Text('Sending...', style: TextStyle(fontSize: 11)),
                    backgroundColor: theme.colorScheme.primaryContainer,
                    visualDensity: VisualDensity.compact,
                  )
                else if (message.status == 'sent')
                  Chip(
                    label: const Text('Sent', style: TextStyle(fontSize: 11)),
                    backgroundColor: Colors.green.withOpacity(0.1),
                    labelStyle: TextStyle(color: Colors.green, fontSize: 11),
                    visualDensity: VisualDensity.compact,
                  ),
                const Spacer(),
                // Actions
                PopupMenuButton<String>(
                  onSelected: (value) {
                    switch (value) {
                      case 'edit': onEdit(); break;
                      case 'send_now': onSendNow(); break;
                      case 'delete': onDelete(); break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'edit', child: Row(children: [Icon(Icons.edit), SizedBox(width: 8), Text('Edit')])),
                    const PopupMenuItem(value: 'send_now', child: Row(children: [Icon(Icons.send), SizedBox(width: 8), Text('Send Now')])),
                    const PopupMenuItem(value: 'delete', child: Row(children: [Icon(Icons.delete, color: Colors.red), SizedBox(width: 8), Text('Delete', style: TextStyle(color: Colors.red))])),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              message.prompt,
              style: theme.textTheme.bodyMedium,
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _InfoTag(label: 'Model', value: message.model),
                if (message.provider != null) ...[
                  const SizedBox(width: 8),
                  _InfoTag(label: 'Provider', value: message.provider!),
                ],
                if (message.permission != null) ...[
                  const SizedBox(width: 8),
                  _InfoTag(label: 'Permission', value: message.permission!),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTag extends StatelessWidget {
  final String label;
  final String value;

  const _InfoTag({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        '$label: $value',
        style: theme.textTheme.labelSmall?.copyWith(
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }
}