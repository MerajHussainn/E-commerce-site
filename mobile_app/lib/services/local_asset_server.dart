import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class LocalAssetServer {
  static HttpServer? _server;
  static int _port = 0;
  static bool _isRunning = false;

  static int get port => _port;
  static bool get isRunning => _isRunning;
  static String get serverUrl => 'http://localhost:$_port';

  /// Start the embedded HTTP server to serve the local bundled web app
  static Future<String> start() async {
    if (_isRunning && _server != null) {
      return serverUrl;
    }

    try {
      // First try preferred port 8080, fallback to 0 (any available port)
      try {
        _server = await HttpServer.bind(InternetAddress.loopbackIPv4, 8080);
      } catch (_) {
        _server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      }

      _port = _server!.port;
      _isRunning = true;
      debugPrint('[LocalAssetServer] Started at http://localhost:$_port');

      _server!.listen((HttpRequest request) async {
        try {
          String path = request.uri.path;
          if (path.isEmpty || path == '/') {
            path = '/index.html';
          }

          // Normalize path for Flutter assets
          String assetKey = 'assets/dist$path';
          ByteData? fileData;

          try {
            fileData = await rootBundle.load(assetKey);
          } catch (_) {
            // SPA fallback: If requesting a route without file extension (e.g. /cart, /mushrooms), serve index.html
            if (!path.contains('.')) {
              assetKey = 'assets/dist/index.html';
              path = '/index.html';
              try {
                fileData = await rootBundle.load(assetKey);
              } catch (e) {
                debugPrint('[LocalAssetServer] Error loading index.html: $e');
              }
            }
          }

          if (fileData != null) {
            final mimeType = _getMimeType(path);
            request.response.headers.set('Content-Type', mimeType);
            request.response.headers.set('Access-Control-Allow-Origin', '*');
            request.response.headers.set('Cache-Control', 'no-cache');
            request.response.add(fileData.buffer.asUint8List(
              fileData.offsetInBytes,
              fileData.lengthInBytes,
            ));
          } else {
            request.response.statusCode = HttpStatus.notFound;
            request.response.write('File not found');
          }
        } catch (e) {
          debugPrint('[LocalAssetServer] Request error: $e');
          request.response.statusCode = HttpStatus.internalServerError;
        } finally {
          await request.response.close();
        }
      });

      return serverUrl;
    } catch (e) {
      debugPrint('[LocalAssetServer] Fatal startup error: $e');
      return '';
    }
  }

  static String _getMimeType(String path) {
    final lower = path.toLowerCase();
    if (lower.endsWith('.html')) return 'text/html; charset=utf-8';
    if (lower.endsWith('.js')) return 'application/javascript; charset=utf-8';
    if (lower.endsWith('.css')) return 'text/css; charset=utf-8';
    if (lower.endsWith('.svg')) return 'image/svg+xml';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.json')) return 'application/json';
    if (lower.endsWith('.ico')) return 'image/x-icon';
    if (lower.endsWith('.ttf')) return 'font/ttf';
    if (lower.endsWith('.woff')) return 'font/woff';
    if (lower.endsWith('.woff2')) return 'font/woff2';
    return 'application/octet-stream';
  }

  static Future<void> stop() async {
    await _server?.close(force: true);
    _server = null;
    _isRunning = false;
  }
}

