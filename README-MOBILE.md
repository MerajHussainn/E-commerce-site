# Shusila Upvan (Mushroom Mart) - Flutter Android Mobile Application

This repository contains the mobile application conversion of the **Shusila Upvan (Mushroom Mart & Organic Dairy)** E-commerce platform into a high-performance Flutter Android mobile application.

The mobile application is fully isolated in the `mobile_app/` directory and connects to the existing web platform via a hardened Flutter WebView integration, maintaining session persistence, authentication, shopping cart, checkout, geolocation, and external payment gateways without altering any website or backend files.

---

## 1. System Requirements & Prerequisites

The following software is configured and verified on the system:

| Component | Version / Path |
|-----------|----------------|
| **Flutter SDK** | `3.47.9` (Channel `stable`) at `C:\src\flutter` |
| **Dart SDK** | `3.13.7` |
| **Android SDK** | Version `36.0.0` (Platform `android-37.0`, Build-Tools `36.0.0`) at `C:\Users\mh780\AppData\Local\Android\Sdk` |
| **JDK (Java)** | OpenJDK `25.0.4` at `C:\Program Files\Android\Android Studio\jbr` |
| **Android Studio** | Installed at `C:\Program Files\Android\Android Studio` |
| **Gradle** | `9.3.1` (Android Gradle Plugin `9.1.0`) |
| **Node.js & npm** | Node `v24.11.0`, npm `11.6.1` (for existing website) |

---

## 2. Mobile Project Architecture

The Flutter application lives in `mobile_app/`:

```text
mobile_app/
├── android/                          # Native Android platform configuration
│   ├── app/
│   │   ├── build.gradle.kts          # Application ID, SDK versions (minSdk 21, compileSdk 36)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml   # Permissions, cleartext traffic, intent filters
│   │       ├── kotlin/               # MainActivity
│   │       └── res/                  # Launcher icons and themes
│   ├── gradle/wrapper/               # Gradle 9.3.1 distribution
│   └── settings.gradle.kts           # AGP and plugins
├── assets/
│   ├── icons/                        # Brand icons and vector assets
│   └── images/                       # Mobile graphics
├── lib/
│   ├── main.dart                     # App entry point, dark theme, orientation locking
│   ├── config/
│   │   └── app_config.dart           # Server presets (Emulator, Wi-Fi LAN, Live store), theme constants
│   ├── services/
│   │   └── connectivity_service.dart # Real-time Wi-Fi & cellular monitoring via connectivity_plus
│   ├── widgets/
│   │   ├── loading_indicator.dart    # Precision progress bar and branded loader
│   │   ├── offline_view.dart         # Offline detection UI with retry trigger
│   │   └── error_view.dart           # Connection failure fallback with server configuration
│   └── screens/
│       ├── splash_screen.dart        # Branded launch screen with emerald ambient glow
│       ├── settings_dialog.dart      # Interactive server environment switcher
│       └── webview_screen.dart       # Hardened WebView controller, navigation & session management
├── test/
│   └── widget_test.dart              # Automated widget & smoke test
└── pubspec.yaml                      # Dependencies & asset declarations
```

---

## 3. Installed Dependencies

All dependencies have been vetted, resolved, and verified:

- **`webview_flutter: ^4.10.0`** & **`webview_flutter_android: ^4.14.1`**: Core WebView rendering engine, unrestricted JavaScript, DOM storage, and cookie persistence.
- **`connectivity_plus: ^6.1.0`**: Network connectivity stream detecting mobile data, Wi-Fi, ethernet, and offline states.
- **`permission_handler: ^11.3.1`**: Runtime Android permission management for GPS Location (delivery address auto-fill) and camera/storage.
- **`url_launcher: ^6.3.1`**: Native intent delegation for external schemes (`tel:`, `mailto:`, `sms:`, `whatsapp:`, `upi:`).
- **`shared_preferences: ^2.3.2`**: Persistent local storage for user preferences and target server URLs.
- **`cupertino_icons: ^1.0.8`**: iOS & Material icon resources.

---

## 4. Key Native & WebView Features

1. **Authentication & Session Persistence**:
   - Cookies and HTML5 `localStorage` are preserved across app restarts and navigation.
   - Firebase Authentication sessions remain active.
2. **Checkout & Geolocation Support**:
   - The app delegates WebView geolocation prompts to native Android runtime permissions (`ACCESS_FINE_LOCATION`), allowing the checkout page to auto-fill delivery addresses.
3. **External Scheme & Payment Interception**:
   - External URLs (`tel:`, `mailto:`, `whatsapp:`, `upi:`) are intercepted and launched through Android's native intent resolver rather than failing inside the WebView.
4. **Android Hardware Back Navigation**:
   - Android back button navigates backwards in the web history (`controller.canGoBack()`).
   - On the root page, double-tap-to-exit prevents accidental application termination.
5. **Offline & Error Resilience**:
   - Real-time offline detection displays a branded offline screen.
   - Server errors present clear diagnostic details and a "Server Settings" shortcut.
6. **Dynamic Server Switcher**:
   - Tap the settings icon in the top bar to switch between:
     - **Android Emulator**: `http://10.0.2.2:5173`
     - **Local Wi-Fi Network**: `http://10.238.87.29:5173`
     - **Live Online Store**: `https://susheela-upvan.firebaseapp.com`
     - **Custom URL**: Any remote or staging URL.

---

## 5. Development & Testing Instructions

### A. Testing on Android Emulator

1. Start your local Vite web server from the project root:
   ```bash
   npm run dev -- --host
   ```
2. Launch the Android emulator:
   ```bash
   flutter emulators --launch Medium_Phone_API_37.0
   ```
3. Run the Flutter app in debug mode:
   ```bash
   cd mobile_app
   flutter run
   ```
4. In the mobile app, the default target URL `http://10.0.2.2:5173` maps directly to your host machine's Vite dev server on port 5173.

### B. Testing on a Physical Android Device

1. Enable **Developer Options** and **USB Debugging** on your Android phone:
   - Go to **Settings** > **About Phone**.
   - Tap **Build Number** 7 times.
   - Go to **System** > **Developer Options** > Enable **USB Debugging**.
2. Connect your phone to your PC via USB.
3. Verify connection:
   ```bash
   adb devices
   ```
4. Ensure your phone and PC are connected to the same Wi-Fi network.
5. In the mobile app, tap the **Server Settings** icon in the top bar and select **Local Wi-Fi Network** (`http://10.238.87.29:5173`) or tap to enter your PC's current IP address.
6. Alternatively, install the APK directly:
   ```bash
   adb install -r build/app/outputs/flutter-apk/app-debug.apk
   ```

---

## 6. Building APKs

Run these commands inside the `mobile_app/` directory:

### Debug APK (For development and testing)
```bash
cd mobile_app
flutter build apk --debug
```
**Output Location:**
```text
mobile_app/build/app/outputs/flutter-apk/app-debug.apk
```

### Release APK (For distribution)
```bash
cd mobile_app
flutter build apk --release
```
**Output Location:**
```text
mobile_app/build/app/outputs/flutter-apk/app-release.apk
```

---

## 7. Troubleshooting & Common Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **WebView shows `net::ERR_CONNECTION_REFUSED`** | Local Vite server is not running or incorrect IP used | Start `npm run dev -- --host`. If using an emulator, use `http://10.0.2.2:5173`. If using a physical phone, use your PC's Wi-Fi IP (`http://10.238.87.29:5173`). Tap the tune/settings icon in the app bar to switch. |
| **Location permission denied in checkout** | Runtime permission was denied | Open Android **Settings** > **Apps** > **Shusila Upvan** > **Permissions** > Grant **Location**. |
| **External payment link won't open** | App tried loading custom URI in WebView | App automatically delegates non-HTTP schemes (`upi://`, `whatsapp://`) to native Android intents via `url_launcher`. Ensure the required banking/UPI app is installed on the device. |
| **Cleartext HTTP traffic blocked on Android 9+** | Android blocks non-HTTPS traffic by default | `android:usesCleartextTraffic="true"` is already configured in `AndroidManifest.xml` to allow local HTTP testing. |

