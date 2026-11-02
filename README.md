# MultiBrowser Pro – Android Multi-Window Video Browser

MultiBrowser Pro is a production-ready native Android application built with **Kotlin**, **Jetpack Compose**, and **Android WebKit/WebView** running on Android 10+ (API 29 to API 34+).

It features three completely isolated, independent browser instances that simultaneously play videos across three split-screen viewport panels with independent speed controls (0.25x – 2.0x), full-screen grid immersion, and responsive layout management without WebViews reloading on rotation.

---

## 🌟 Key Architecture & Capabilities

1. **Three Independent WebViews**:
   - Each browser instance operates its own `WebView`, navigation back/forward stack, DOM storage, and session cookie jar.
   - Links always stay inside the corresponding browser panel without triggering unexpected external browser intents.

2. **Simultaneous Video Playback (High Priority)**:
   - Configured with `mediaPlaybackRequiresUserGesture = false` on all three WebViews.
   - Integrated with `AudioFocusHelper` requesting `AUDIOFOCUS_GAIN` with `willPauseWhenDucked(false)`, preventing Android audio focus preemption between the app's internal WebViews.
   - When Video 1 plays and Video 2 or 3 is started, existing videos continue uninterrupted.

3. **Independent Playback Speed Controls**:
   - Preset speeds: `0.25x`, `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`, `1.75x`, `2.0x`.
   - JavaScript engine injection applies `playbackRate` to all `<video>` and `<audio>` elements (including dynamically loaded elements monitored via `MutationObserver`).
   - Changing speed on Browser 1 does not affect Browser 2 or 3.
   - Graceful feedback notification when a website restricts script manipulation or lacks HTML5 media.

4. **Responsive Layouts**:
   - **Portrait (9:16)**: Three stacked panels (each ~1/3 screen height, full width).
   - **Landscape (16:9)**: Three side-by-side columns (each ~1/3 screen width, full height).
   - **Full Screen Grid Mode**: Expands all three video panels across 100% of the display with system bars hidden and floating exit control.
   - Persistent view caching in `BrowserManager` ensures zero WebView destruction or page reloads when changing orientation or toggling full screen.

---

## 🚀 Building the APK via GitHub Actions (Automated CI/CD)

The repository includes a ready-to-use GitHub Actions workflow configured at `.github/workflows/build-apk.yml`.

### Steps:
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MultiBrowser Pro"
   git remote add origin https://github.com/YOUR_USERNAME/multibrowser-pro.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository, navigate to the **Actions** tab.
3. The **Build MultiBrowser Pro Debug APK** workflow triggers automatically on push or pull requests.
4. Once completed, download the generated artifact:
   - **Artifact Name**: `multibrowser-pro-debug-apk`
   - **File Path**: `app/build/outputs/apk/debug/app-debug.apk`

---

## 💻 Building Locally with Gradle or Android Studio

### Prerequisites:
- JDK 17 (Eclipse Temurin or OpenJDK recommended)
- Android SDK with Platform 34 installed (`ANDROID_HOME` configured)

### Command Line:
```bash
# Make gradlew executable
chmod +x gradlew

# Build Debug APK
./gradlew assembleDebug

# The APK will be saved at:
# app/build/outputs/apk/debug/app-debug.apk
```

### Android Studio:
1. Open Android Studio -> **File > Open...** -> select the project root.
2. Allow Gradle sync to complete.
3. Select `app` run configuration and click **Run** (or `Shift + F10`) on any Android 10+ (API 29+) device or emulator.

---

## 📁 Project Structure

```
├── .github/workflows/
│   └── build-apk.yml               # Automated CI workflow compiling assembleDebug
├── app/
│   ├── build.gradle.kts            # Application dependencies and Android configuration
│   ├── proguard-rules.pro          # ProGuard rules for JavaScript interfaces
│   └── src/main/
│       ├── AndroidManifest.xml     # Hardware acceleration, network permissions & config changes
│       ├── java/com/multibrowser/pro/
│       │   ├── MainActivity.kt               # Jetpack Compose root & top app bar
│       │   ├── browser/
│       │   │   ├── BrowserState.kt           # Independent browser data model
│       │   │   ├── BrowserManager.kt         # ViewModel managing persistent WebViews
│       │   │   ├── BrowserWebView.kt         # Custom WebView with JavaScript bridge
│       │   │   ├── PlaybackSpeedController.kt# HTML5 playback rate injector & observer
│       │   │   └── AudioFocusHelper.kt       # Multi-stream simultaneous audio focus manager
│       │   └── ui/
│       │       ├── BrowserPanel.kt           # Panel composable reusing persistent WebViews
│       │       ├── BrowserControls.kt        # Compact navigation and speed bar
│       │       ├── LayoutManager.kt          # Portrait / Landscape / Grid layout switcher
│       │       ├── FullScreenController.kt   # System bars immersion & floating exit toggle
│       │       ├── SettingsScreen.kt         # Media policies & test runner modal
│       │       └── theme/Theme.kt            # Modern dark color palette
│       └── res/
│           ├── values/                       # strings.xml, colors.xml, themes.xml
│           └── drawable/                     # Adaptive launcher vector icons
├── gradle/
│   ├── libs.versions.toml          # Gradle version catalog
│   └── wrapper/
│       └── gradle-wrapper.properties
├── build.gradle.kts                # Top-level build configuration
├── settings.gradle.kts             # Module repository configuration
├── gradle.properties               # JVM memory allocation & AndroidX settings
├── gradlew                         # Linux/macOS wrapper script
└── gradlew.bat                     # Windows wrapper script
```
