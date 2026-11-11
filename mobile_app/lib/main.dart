import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'config/app_config.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Configure system navigation bar and status bar colors
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark,
      systemNavigationBarColor: AppConfig.backgroundColor,
      systemNavigationBarIconBrightness: Brightness.light,
      systemNavigationBarDividerColor: Colors.transparent,
    ),
  );

  // Lock to preferred portrait orientations for smooth mobile shopping
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  runApp(const MushroomMartApp());
}

class MushroomMartApp extends StatelessWidget {
  const MushroomMartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppConfig.backgroundColor,
        colorScheme: const ColorScheme.dark(
          primary: AppConfig.primaryColor,
          secondary: AppConfig.secondaryColor,
          surface: AppConfig.cardColor,
          error: AppConfig.errorColor,
          onPrimary: Colors.black,
          onSecondary: Colors.black,
          onSurface: AppConfig.textColor,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppConfig.backgroundColor,
          elevation: 0,
          scrolledUnderElevation: 0,
        ),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}
