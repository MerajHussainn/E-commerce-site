import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
// Android specific features
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../config/app_config.dart';
import '../services/connectivity_service.dart';
import '../widgets/error_view.dart';
import '../widgets/loading_indicator.dart';
import '../widgets/offline_view.dart';
import 'settings_dialog.dart';

class MainWebViewScreen extends StatefulWidget {
  const MainWebViewScreen({super.key});

  @override
  State<MainWebViewScreen> createState() => _MainWebViewScreenState();
}

class _MainWebViewScreenState extends State<MainWebViewScreen> {
  late final WebViewController _webViewController;
  final ConnectivityService _connectivityService = ConnectivityService();

  int _loadingProgress = 0;
  bool _isLoading = true;
  bool _hasError = false;
  String? _errorMessage;
  String? _failingUrl;
  String _currentUrl = AppConfig.activeUrl;
  DateTime? _lastBackPressTime;
  bool _previousIsConnected = true;

  @override
  void initState() {
    super.initState();
    _previousIsConnected = _connectivityService.isConnected;
    _initWebViewController();
    _connectivityService.addListener(_handleConnectivityChange);
  }

  void _handleConnectivityChange() {
    if (!mounted) return;
    final currentlyConnected = _connectivityService.isConnected;
    final wasDisconnected = !_previousIsConnected;
    _previousIsConnected = currentlyConnected;

    setState(() {});

    // Only auto-retry if device transitioned from offline to online
    if (wasDisconnected && currentlyConnected && _hasError) {
      _reloadCurrentPage();
    }
  }

  void _initWebViewController() {
    final PlatformWebViewControllerCreationParams params =
        const PlatformWebViewControllerCreationParams();

    final WebViewController controller =
        WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(AppConfig.backgroundColor)
      ..setUserAgent(
          'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 ShusilaUpvanApp/1.0')
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (mounted) {
              setState(() {
                _loadingProgress = progress;
              });
            }
          },
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
                _errorMessage = null;
                _failingUrl = null;
                _currentUrl = url;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _loadingProgress = 100;
                _currentUrl = url;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            // Main frame errors indicate failure to reach the site
            if (error.isForMainFrame ?? true) {
              if (mounted) {
                setState(() {
                  _hasError = true;
                  _isLoading = false;
                  _errorMessage = error.description;
                  _failingUrl = error.url ?? _currentUrl;
                });
              }
            }
          },
          onNavigationRequest: (NavigationRequest request) async {
            return _handleNavigationRequest(request.url);
          },
        ),
      );

    // Android specific configurations
    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setMediaPlaybackRequiresUserGesture(false);

      // Handle Geolocation permissions in WebView (e.g. for GPS address auto-fetch)
      androidController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          final status = await Permission.location.request();
          return GeolocationPermissionsResponse(
            allow: status.isGranted,
            retain: true,
          );
        },
      );
    }

    _webViewController = controller;
    _webViewController.loadRequest(Uri.parse(_currentUrl));
  }

  /// Handle non-HTTP/HTTPS URLs (tel:, mailto:, upi:, whatsapp:, etc.)
  Future<NavigationDecision> _handleNavigationRequest(String url) async {
    final uri = Uri.parse(url);
    final scheme = uri.scheme.toLowerCase();

    // Standard web schemes are permitted inside WebView
    if (scheme == 'http' || scheme == 'https') {
      return NavigationDecision.navigate;
    }

    // External schemes to handle via url_launcher
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Cannot handle action: $url'),
              backgroundColor: AppConfig.cardColor,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error launching external URL $url: $e');
    }

    return NavigationDecision.prevent;
  }

  void _loadUrl(String url) {
    setState(() {
      _currentUrl = url;
      _isLoading = true;
      _hasError = false;
    });
    _webViewController.loadRequest(Uri.parse(url));
  }

  void _reloadCurrentPage() {
    setState(() {
      _hasError = false;
      _isLoading = true;
    });
    _webViewController.reload();
  }

  /// Navigate to relative path (e.g. /cart, /mushrooms)
  void _navigateToPath(String path) {
    try {
      final currentUri = Uri.parse(_currentUrl);
      final newUri = currentUri.replace(path: path);
      _loadUrl(newUri.toString());
    } catch (_) {
      _loadUrl('${AppConfig.activeUrl}$path');
    }
  }

  /// Handle Android hardware back button
  Future<bool> _handleBackPress() async {
    if (await _webViewController.canGoBack()) {
      await _webViewController.goBack();
      return false; // Handled internally
    }

    // Prevent accidental exit: Double back press within 2 seconds
    final now = DateTime.now();
    if (_lastBackPressTime == null ||
        now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Press back again to exit Shusila Upvan',
              style: TextStyle(color: Colors.white, fontSize: 13),
            ),
            backgroundColor: AppConfig.cardColor,
            duration: const Duration(seconds: 2),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
              side: const BorderSide(color: AppConfig.borderColor),
            ),
          ),
        );
      }
      return false;
    }

    return true; // Allow exit
  }

  void _openSettingsDialog() {
    ServerSettingsDialog.show(
      context,
      currentUrl: _currentUrl,
      onUrlChanged: (newUrl) {
        _loadUrl(newUrl);
      },
    );
  }

  @override
  void dispose() {
    _connectivityService.removeListener(_handleConnectivityChange);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isOnline = _connectivityService.isConnected;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldExit = await _handleBackPress();
        if (shouldExit) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: AppConfig.backgroundColor,
        body: SafeArea(
          bottom: false,
          child: Stack(
            children: [
              // 1. Persistent WebView: Kept permanently in tree to prevent surface teardown & crash
              RefreshIndicator(
                color: AppConfig.primaryColor,
                backgroundColor: AppConfig.cardColor,
                onRefresh: () async {
                  _reloadCurrentPage();
                },
                child: WebViewWidget(controller: _webViewController),
              ),

              // 2. Offline Overlay if disconnected
              if (!isOnline)
                Positioned.fill(
                  child: OfflineView(
                    onRetry: () async {
                      final connected = await _connectivityService.checkConnection();
                      if (connected) {
                        _reloadCurrentPage();
                      }
                    },
                    onOpenSettings: _openSettingsDialog,
                  ),
                )
              // 3. Error Overlay if loading failed
              else if (_hasError)
                Positioned.fill(
                  child: WebErrorView(
                    errorDescription: _errorMessage,
                    failingUrl: _failingUrl,
                    onRetry: _reloadCurrentPage,
                    onOpenSettings: _openSettingsDialog,
                  ),
                )
              // 4. Centered Loading Indicator while app is loading content
              else if (_isLoading)
                const Positioned.fill(
                  child: FullPageLoadingIndicator(
                    message: 'Loading Mushroom Mart...',
                  ),
                ),
            ],
          ),
        ),
        bottomNavigationBar: _buildBottomNav(),
      ),
    );
  }

  Widget? _buildBottomNav() {
    return GestureDetector(
      onLongPress: _openSettingsDialog,
      child: Container(
        decoration: const BoxDecoration(
          color: AppConfig.backgroundColor,
          border: Border(
            top: BorderSide(color: AppConfig.borderColor, width: 1),
          ),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  onTap: () => _navigateToPath('/'),
                ),
                _buildNavItem(
                  icon: Icons.spa_rounded,
                  label: 'Mushrooms',
                  onTap: () => _navigateToPath('/mushrooms'),
                ),
                _buildNavItem(
                  icon: Icons.water_drop_rounded,
                  label: 'Dairy',
                  onTap: () => _navigateToPath('/dairy/milkdiary'),
                ),
                _buildNavItem(
                  icon: Icons.shopping_bag_rounded,
                  label: 'Cart',
                  onTap: () => _navigateToPath('/cart'),
                ),
                _buildNavItem(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  onTap: () => _navigateToPath('/profile'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: AppConfig.textMuted),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: AppConfig.textMuted,
                fontSize: 10,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
