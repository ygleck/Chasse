import 'package:flutter/material.dart';

import 'section_card.dart';

class AsyncErrorView extends StatelessWidget {
  const AsyncErrorView({
    super.key,
    required this.message,
    this.onRetry,
    this.onOpenSettings,
  });

  final String message;
  final VoidCallback? onRetry;
  final VoidCallback? onOpenSettings;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.error_outline_rounded,
                color: theme.colorScheme.error,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  message,
                  style: theme.textTheme.bodyLarge,
                ),
              ),
            ],
          ),
          if (onRetry != null || onOpenSettings != null) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                if (onOpenSettings != null)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onOpenSettings,
                      icon: const Icon(Icons.settings_rounded),
                      label: const Text('Ouvrir les réglages'),
                    ),
                  ),
                if (onOpenSettings != null && onRetry != null)
                  const SizedBox(width: 12),
                if (onRetry != null)
                  Expanded(
                    child: ElevatedButton(
                      onPressed: onRetry,
                      child: const Text('Réessayer'),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
