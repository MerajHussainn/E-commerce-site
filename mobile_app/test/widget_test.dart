import 'package:flutter_test/flutter_test.dart';
import 'package:mushroom_mart/main.dart';
import 'package:mushroom_mart/screens/splash_screen.dart';

void main() {
  testWidgets('App smoke test - verifies SplashScreen renders',
      (WidgetTester tester) async {
    await tester.pumpWidget(const MushroomMartApp());

    // Verify SplashScreen is loaded
    expect(find.byType(SplashScreen), findsOneWidget);

    // Verify tagline text
    expect(
      find.text('Fresh Mushrooms • Organic Dairy Farm'),
      findsOneWidget,
    );

    // Advance timers so pending splash timer completes
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pump(const Duration(milliseconds: 1500));
  });
}
