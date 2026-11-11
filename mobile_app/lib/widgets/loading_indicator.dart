import 'package:flutter/material.dart';
import '../config/app_config.dart';

class WebLoadingIndicator extends StatelessWidget {
  final int progress; // 0 to 100

  const WebLoadingIndicator({
    super.key,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    if (progress <= 0 || progress >= 100) {
      return const SizedBox.shrink();
    }

    return LinearProgressIndicator(
      value: progress / 100.0,
      backgroundColor: Colors.transparent,
      valueColor: const AlwaysStoppedAnimation<Color>(AppConfig.primaryColor),
      minHeight: 3.0,
    );
  }
}

class FullPageLoadingIndicator extends StatelessWidget {
  final String? message;

  const FullPageLoadingIndicator({
    super.key,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppConfig.backgroundColor,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppConfig.primaryColor, AppConfig.secondaryColor],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: AppConfig.primaryColor.withValues(alpha: 0.3),
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.eco,
                size: 36,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 24),
            const SizedBox(
              width: 32,
              height: 32,
              child: CircularProgressIndicator(
                strokeWidth: 3,
                valueColor: AlwaysStoppedAnimation<Color>(AppConfig.primaryColor),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              message ?? 'Loading Mushroom Mart...',
              style: const TextStyle(
                color: AppConfig.textColor,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.2,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Please wait while the store loads',
              style: TextStyle(
                color: AppConfig.textMuted,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
