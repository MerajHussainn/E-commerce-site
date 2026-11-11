import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../services/local_asset_server.dart';

class ServerSettingsDialog extends StatefulWidget {
  final String currentUrl;
  final ValueChanged<String> onUrlChanged;

  const ServerSettingsDialog({
    super.key,
    required this.currentUrl,
    required this.onUrlChanged,
  });

  static Future<void> show(
    BuildContext context, {
    required String currentUrl,
    required ValueChanged<String> onUrlChanged,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) => ServerSettingsDialog(
        currentUrl: currentUrl,
        onUrlChanged: onUrlChanged,
      ),
    );
  }

  @override
  State<ServerSettingsDialog> createState() => _ServerSettingsDialogState();
}

class _ServerSettingsDialogState extends State<ServerSettingsDialog> {
  late TextEditingController _urlController;
  String _selectedPreset = '';

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: widget.currentUrl);
    _determinePreset(widget.currentUrl);
  }

  void _determinePreset(String url) {
    if (url.startsWith('http://127.0.0.1')) {
      _selectedPreset = 'standalone';
    } else if (url == AppConfig.defaultEmulatorUrl) {
      _selectedPreset = 'emulator';
    } else if (url == AppConfig.defaultLocalWifiUrl) {
      _selectedPreset = 'wifi';
    } else if (url == AppConfig.defaultLiveUrl) {
      _selectedPreset = 'live';
    } else {
      _selectedPreset = 'custom';
    }
  }

  void _applyPreset(String preset, String url) {
    setState(() {
      _selectedPreset = preset;
      _urlController.text = url;
    });
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppConfig.cardColor,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppConfig.borderColor),
      ),
      title: const Row(
        children: [
          Icon(Icons.hub_rounded, color: AppConfig.primaryColor, size: 24),
          SizedBox(width: 10),
          Text(
            'Target Server Settings',
            style: TextStyle(
              color: AppConfig.textColor,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select server environment or specify a custom URL:',
              style: TextStyle(color: AppConfig.textMuted, fontSize: 13),
            ),
            const SizedBox(height: 16),

            // Presets
            _buildPresetOption(
              id: 'standalone',
              title: 'Built-in Standalone Store',
              subtitle: 'Runs directly inside the phone (offline / no PC)',
              icon: Icons.offline_bolt_rounded,
              onTap: () => _applyPreset('standalone', LocalAssetServer.serverUrl),
            ),
            const SizedBox(height: 8),

            _buildPresetOption(
              id: 'wifi',
              title: 'Local Wi-Fi Network (PC)',
              subtitle: AppConfig.defaultLocalWifiUrl,
              icon: Icons.wifi_rounded,
              onTap: () => _applyPreset('wifi', AppConfig.defaultLocalWifiUrl),
            ),
            const SizedBox(height: 8),

            _buildPresetOption(
              id: 'live',
              title: 'Live Online Store',
              subtitle: AppConfig.defaultLiveUrl,
              icon: Icons.public_rounded,
              onTap: () => _applyPreset('live', AppConfig.defaultLiveUrl),
            ),
            const SizedBox(height: 8),

            _buildPresetOption(
              id: 'emulator',
              title: 'Android Emulator',
              subtitle: AppConfig.defaultEmulatorUrl,
              icon: Icons.phone_android_rounded,
              onTap: () => _applyPreset('emulator', AppConfig.defaultEmulatorUrl),
            ),
            const SizedBox(height: 16),

            // Custom URL input
            const Text(
              'Custom URL',
              style: TextStyle(
                color: AppConfig.textColor,
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _urlController,
              style: const TextStyle(color: AppConfig.textColor, fontSize: 13),
              decoration: InputDecoration(
                hintText: 'https://...',
                hintStyle: const TextStyle(color: AppConfig.textMuted),
                filled: true,
                fillColor: AppConfig.surfaceColor,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppConfig.borderColor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppConfig.borderColor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: AppConfig.primaryColor),
                ),
              ),
              onChanged: (_) {
                setState(() {
                  _selectedPreset = 'custom';
                });
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel', style: TextStyle(color: AppConfig.textMuted)),
        ),
        ElevatedButton(
          onPressed: () {
            final targetUrl = _urlController.text.trim();
            if (targetUrl.isNotEmpty) {
              AppConfig.saveBaseUrl(targetUrl);
              widget.onUrlChanged(targetUrl);
              Navigator.of(context).pop();
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppConfig.primaryColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text(
            'Save & Connect',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
          ),
        ),
      ],
    );
  }

  Widget _buildPresetOption({
    required String id,
    required String title,
    required String subtitle,
    required IconData icon,
    required VoidCallback onTap,
  }) {
    final isSelected = _selectedPreset == id;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppConfig.primaryColor.withValues(alpha: 0.12) : AppConfig.surfaceColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected ? AppConfig.primaryColor : AppConfig.borderColor,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: isSelected ? AppConfig.primaryColor : AppConfig.textMuted),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: isSelected ? AppConfig.primaryColor : AppConfig.textColor,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      color: AppConfig.textMuted,
                      fontSize: 11,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle_rounded, color: AppConfig.primaryColor, size: 18),
          ],
        ),
      ),
    );
  }
}
