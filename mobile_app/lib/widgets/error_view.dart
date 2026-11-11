import 'package:flutter/material.dart';
import '../config/app_config.dart';

class WebErrorView extends StatelessWidget {
  final String? errorDescription;
  final String? failingUrl;
  final VoidCallback onRetry;
  final VoidCallback onOpenSettings;

  const WebErrorView({
    super.key,
    this.errorDescription,
    this.failingUrl,
    required this.onRetry,
    required this.onOpenSettings,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppConfig.backgroundColor,
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Center(
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: AppConfig.cardColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppConfig.errorColor.withValues(alpha: 0.3)),
                ),
                child: const Icon(
                  Icons.cloud_off_rounded,
                  size: 56,
                  color: AppConfig.errorColor,
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                'Unable to Connect to Store',
                style: TextStyle(
                  color: AppConfig.textColor,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 10),
              Text(
                errorDescription ?? 'Could not establish connection with the web server.',
                style: const TextStyle(
                  color: AppConfig.textMuted,
                  fontSize: 13,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
              if (failingUrl != null && failingUrl!.isNotEmpty) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppConfig.cardColor,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppConfig.borderColor),
                  ),
                  child: Text(
                    failingUrl!,
                    style: const TextStyle(
                      color: AppConfig.primaryColor,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'Make sure "npm run dev -- --host" is running on your PC and your phone is connected to the same Wi-Fi.',
                  style: TextStyle(
                    color: AppConfig.accentYellow,
                    fontSize: 12,
                    height: 1.3,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: onRetry,
                    icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.black),
                    label: const Text(
                      'Retry',
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppConfig.primaryColor,
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: onOpenSettings,
                    icon: const Icon(Icons.tune_rounded, size: 18, color: AppConfig.textColor),
                    label: const Text(
                      'Server Settings',
                      style: TextStyle(
                        color: AppConfig.textColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppConfig.borderColor),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
