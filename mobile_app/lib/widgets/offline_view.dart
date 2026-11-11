import 'package:flutter/material.dart';
import '../config/app_config.dart';

class OfflineView extends StatelessWidget {
  final VoidCallback onRetry;
  final VoidCallback? onOpenSettings;

  const OfflineView({
    super.key,
    required this.onRetry,
    this.onOpenSettings,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppConfig.backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: AppConfig.cardColor,
                shape: BoxShape.circle,
                border: Border.all(color: AppConfig.borderColor),
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                size: 64,
                color: AppConfig.textMuted,
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'No Internet Connection',
              style: TextStyle(
                color: AppConfig.textColor,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            const Text(
              'Please check your Wi-Fi or cellular network connection and try again to continue shopping fresh mushrooms and dairy.',
              style: TextStyle(
                color: AppConfig.textMuted,
                fontSize: 14,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh_rounded, color: Colors.black),
              label: const Text(
                'Retry Connection',
                style: TextStyle(
                  color: Colors.black,
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppConfig.primaryColor,
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 4,
              ),
            ),
            if (onOpenSettings != null) ...[
              const SizedBox(height: 16),
              TextButton.icon(
                onPressed: onOpenSettings,
                icon: const Icon(Icons.settings_outlined, size: 18, color: AppConfig.textMuted),
                label: const Text(
                  'Change Server URL',
                  style: TextStyle(color: AppConfig.textMuted, fontSize: 13),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

