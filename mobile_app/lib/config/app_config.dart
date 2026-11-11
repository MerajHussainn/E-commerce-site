import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/local_asset_server.dart';

class AppConfig {
  static const String appName = 'E-Commerce Site';
  static const String appTagline = 'Fast & Fresh Online Shopping';

  // Standalone marker
  static const String defaultStandaloneUrl = 'local://bundled';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:5173';
  static const String defaultLocalWifiUrl = 'http://10.238.87.29:5173';
  static const String defaultLiveUrl = 'https://susheela-upvan.firebaseapp.com';

  // Preference Key
  static const String _prefKeyBaseUrl = 'app_base_url';

  // Current active URL
  static String activeUrl = '';

  /// Load persisted base URL or fallback to embedded local server
  static Future<String> loadBaseUrl() async {
    // Start local embedded asset server on device
    final localUrl = await LocalAssetServer.start();

    try {
      final prefs = await SharedPreferences.getInstance();
      final saved = prefs.getString(_prefKeyBaseUrl);

      // Clean up any stale local development IPs so standalone embedded mode works seamlessly
      if (saved != null &&
          saved.trim().isNotEmpty &&
          !saved.contains('10.238.87.29') &&
          !saved.contains('10.0.2.2') &&
          !saved.contains('127.0.0.1') &&
          !saved.contains('localhost') &&
          saved != defaultStandaloneUrl) {
        activeUrl = saved.trim();
      } else {
        // By default on mobile, run standalone from built-in assets
        activeUrl = localUrl.isNotEmpty ? localUrl : defaultStandaloneUrl;
      }
    } catch (_) {
      activeUrl = localUrl.isNotEmpty ? localUrl : defaultStandaloneUrl;
    }

    return activeUrl;
  }

  /// Save new base URL
  static Future<void> saveBaseUrl(String url) async {
    final trimmed = url.trim();
    if (trimmed.startsWith('http://127.0.0.1') ||
        trimmed.startsWith('http://localhost') ||
        trimmed.contains('10.238.87.29') ||
        trimmed == defaultStandaloneUrl) {
      activeUrl = LocalAssetServer.serverUrl;
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_prefKeyBaseUrl, defaultStandaloneUrl);
      } catch (_) {}
    } else {
      activeUrl = trimmed;
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_prefKeyBaseUrl, activeUrl);
      } catch (_) {}
    }
  }

  // Theme Colors matching Shusila Upvan website
  static const Color primaryColor = Color(0xFF22C55E); // Green 500
  static const Color primaryDark = Color(0xFF16A34A); // Green 600
  static const Color secondaryColor = Color(0xFF10B981); // Emerald 500
  static const Color accentYellow = Color(0xFFF3CC00); // Yellow accent
  static const Color backgroundColor = Color(0xFF0A0A0A); // Universal dark
  static const Color cardColor = Color(0xFF171717); // Neutral 900
  static const Color surfaceColor = Color(0xFF1F1F1F);
  static const Color textColor = Color(0xFFF3F4F6); // Gray 100
  static const Color textMuted = Color(0xFF9CA3AF); // Gray 400
  static const Color borderColor = Color(0xFF2E2E2E);
  static const Color errorColor = Color(0xFFEF4444); // Red 500
}

