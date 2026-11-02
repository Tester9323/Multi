// Exportable Android Project File Registry for MultiBrowser Pro

export interface AndroidFileItem {
  path: string;
  category: 'kotlin' | 'gradle' | 'manifest' | 'workflow' | 'resource' | 'doc';
  description: string;
  content: string;
}

export const ANDROID_FILES: AndroidFileItem[] = [
  {
    path: '.github/workflows/build-apk.yml',
    category: 'workflow',
    description: 'GitHub Actions CI workflow compiling assembleDebug and exporting app-debug.apk',
    content: `name: Build MultiBrowser Pro Debug APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
          cache: 'gradle'

      - name: Grant execute permission for gradlew
        run: chmod +x gradlew

      - name: Build with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Verify APK generated
        run: |
          if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
            echo "Debug APK successfully built at app/build/outputs/apk/debug/app-debug.apk"
            ls -la app/build/outputs/apk/debug/app-debug.apk
          else
            echo "Error: APK not found at expected path!"
            find app/build/outputs/ -type f -name "*.apk"
            exit 1
          fi

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: multibrowser-pro-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    category: 'manifest',
    description: 'Android Manifest with hardware acceleration, cleartext traffic & orientation configChanges',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.MultiBrowserPro"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true"
        tools:targetApi="29">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.MultiBrowserPro"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="orientation|screenSize|screenLayout|smallestScreenSize|keyboardHidden|uiMode">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  },
  {
    path: 'app/build.gradle.kts',
    category: 'gradle',
    description: 'App module Gradle build file configured for minSdk 29, Jetpack Compose and WebKit',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.multibrowser.pro"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.multibrowser.pro"
        minSdk = 29 // Android 10 (API 29) minimum requirement
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isDebuggable = true
            applicationIdSuffix = ""
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.webkit)
    implementation(libs.kotlinx.coroutines.android)
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/MainActivity.kt',
    category: 'kotlin',
    description: 'ComponentActivity hosting Jetpack Compose TopBar, LayoutManager, and full-screen controller',
    content: `package com.multibrowser.pro

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material.icons.filled.ViewColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.multibrowser.pro.browser.BrowserManager
import com.multibrowser.pro.ui.*
import com.multibrowser.pro.ui.theme.*

class MainActivity : ComponentActivity() {

    private val browserManager: BrowserManager by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MultiBrowserTheme {
                var isFullScreen by remember { mutableStateOf(false) }
                var layoutMode by remember { mutableStateOf(AppLayoutMode.AUTO) }
                var showSettings by remember { mutableStateOf(false) }

                LaunchedEffect(isFullScreen) {
                    FullScreenController.setSystemBarsVisible(this@MainActivity, !isFullScreen)
                }

                val browsers by browserManager.browsers.collectAsState()

                Scaffold(
                    topBar = {
                        AnimatedVisibility(
                            visible = !isFullScreen,
                            enter = slideInVertically(),
                            exit = slideOutVertically()
                        ) {
                            TopAppBar(
                                layoutMode = layoutMode,
                                onLayoutChange = { layoutMode = it },
                                onFullScreen = { isFullScreen = true },
                                onOpenSettings = { showSettings = true }
                            )
                        }
                    },
                    containerColor = DarkBackground
                ) { paddingValues ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                    ) {
                        MultiBrowserLayout(
                            browsers = browsers,
                            browserManager = browserManager,
                            layoutMode = layoutMode,
                            isFullScreen = isFullScreen,
                            modifier = Modifier.fillMaxSize()
                        )

                        FloatingExitFullScreenButton(
                            visible = isFullScreen,
                            onExit = { isFullScreen = false },
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 24.dp)
                        )
                    }

                    if (showSettings) {
                        SettingsScreen(
                            onDismiss = { showSettings = false },
                            browserManager = browserManager,
                            onRunTests = {}
                        )
                    }
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/browser/BrowserManager.kt',
    category: 'kotlin',
    description: 'Central ViewModel retaining isolated WebViews and independent browser states',
    content: `package com.multibrowser.pro.browser

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class BrowserManager(application: Application) : AndroidViewModel(application), BrowserWebView.BrowserCallbacks {

    private val audioFocusHelper = AudioFocusHelper(application)

    private val _browsers = MutableStateFlow(
        listOf(
            BrowserState(id = 0, title = "Browser 1"),
            BrowserState(id = 1, title = "Browser 2"),
            BrowserState(id = 2, title = "Browser 3")
        )
    )
    val browsers: StateFlow<List<BrowserState>> = _browsers.asStateFlow()

    private val webViewHolders = mutableMapOf<Int, BrowserWebView>()

    init {
        audioFocusHelper.requestAppAudioFocus()
    }

    fun getOrCreateWebView(browserId: Int, context: Context): BrowserWebView {
        return webViewHolders.getOrPut(browserId) {
            val holder = BrowserWebView(context.applicationContext, browserId, this)
            val initialUrl = _browsers.value.getOrNull(browserId)?.currentUrl
                ?: BrowserState.DEFAULT_URLS.getOrElse(browserId) { "https://en.wikipedia.org" }
            holder.loadUrl(initialUrl)
            holder
        }
    }

    fun loadUrl(browserId: Int, url: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(inputUrl = url, errorMessage = null) else state
            }
        }
        webViewHolders[browserId]?.loadUrl(url)
    }

    fun updateInputUrl(browserId: Int, text: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(inputUrl = text) else state
            }
        }
    }

    fun goBack(browserId: Int) {
        webViewHolders[browserId]?.goBack()
    }

    fun goForward(browserId: Int) {
        webViewHolders[browserId]?.goForward()
    }

    fun refresh(browserId: Int) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(errorMessage = null) else state
            }
        }
        webViewHolders[browserId]?.reload()
    }

    fun goHome(browserId: Int) {
        val homeUrl = BrowserState.DEFAULT_HOMEPAGES.getOrElse(browserId) { "https://en.wikipedia.org" }
        loadUrl(browserId, homeUrl)
    }

    fun setPlaybackSpeed(browserId: Int, speed: Float) {
        val holder = webViewHolders[browserId]
        PlaybackSpeedController.applySpeed(holder?.webView, browserId, speed) { success, count, message ->
            _browsers.update { list ->
                list.map { state ->
                    if (state.id == browserId) {
                        state.copy(
                            playbackSpeed = speed,
                            videoCount = if (count > 0) count else state.videoCount,
                            speedStatusMessage = message
                        )
                    } else state
                }
            }
        }
    }

    fun toggleMute(browserId: Int) {
        val currentState = _browsers.value.find { it.id == browserId } ?: return
        val newMuted = !currentState.isMuted
        PlaybackSpeedController.applyMute(webViewHolders[browserId]?.webView, browserId, newMuted)
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(isMuted = newMuted) else state
            }
        }
    }

    fun dismissSpeedMessage(browserId: Int) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(speedStatusMessage = null) else state
            }
        }
    }

    override fun onPageStarted(browserId: Int, url: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(currentUrl = url, inputUrl = url, isLoading = true, progress = 10) else state
            }
        }
    }

    override fun onPageFinished(browserId: Int, url: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(currentUrl = url, isLoading = false, progress = 100) else state
            }
        }
        val state = _browsers.value.find { it.id == browserId }
        if (state != null && state.playbackSpeed != 1.0f) {
            setPlaybackSpeed(browserId, state.playbackSpeed)
        }
    }

    override fun onProgressChanged(browserId: Int, progress: Int) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(progress = progress, isLoading = progress < 100) else state
            }
        }
    }

    override fun onTitleReceived(browserId: Int, title: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(title = title) else state
            }
        }
    }

    override fun onNavigationStateChanged(browserId: Int, canGoBack: Boolean, canGoForward: Boolean) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(canGoBack = canGoBack, canGoForward = canGoForward) else state
            }
        }
    }

    override fun onError(browserId: Int, errorDescription: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(isLoading = false, errorMessage = errorDescription) else state
            }
        }
    }

    override fun onVideoStateDetected(browserId: Int, count: Int, isPlaying: Boolean) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(videoCount = count, isPlayingMedia = isPlaying) else state
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        audioFocusHelper.abandonFocus()
        webViewHolders.values.forEach { it.destroy() }
        webViewHolders.clear()
    }
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/browser/PlaybackSpeedController.kt',
    category: 'kotlin',
    description: 'HTML5 video playback rate injector and dynamic video MutationObserver',
    content: `package com.multibrowser.pro.browser

import android.webkit.WebView

object PlaybackSpeedController {

    val SUPPORTED_SPEEDS = listOf(0.25f, 0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.75f, 2.0f)

    fun buildSpeedInjectionScript(speed: Float, browserId: Int): String {
        return """
        (function() {
            try {
                var targetSpeed = $speed;
                var bId = $browserId;
                window.__multiBrowserSpeed = targetSpeed;
                function applySpeedToMedia(element) {
                    try {
                        if (element && typeof element.playbackRate !== 'undefined') {
                            element.playbackRate = targetSpeed;
                            element.defaultPlaybackRate = targetSpeed;
                            return true;
                        }
                    } catch(e) {}
                    return false;
                }
                var mediaElements = document.querySelectorAll('video, audio');
                var count = 0;
                mediaElements.forEach(function(media) {
                    if (applySpeedToMedia(media)) count++;
                });
                if (!window.__multiBrowserObserverInstalled) {
                    window.__multiBrowserObserverInstalled = true;
                    var observer = new MutationObserver(function() {
                        var currentSpeed = window.__multiBrowserSpeed || 1.0;
                        document.querySelectorAll('video, audio').forEach(function(media) {
                            try { if (media.playbackRate !== currentSpeed) media.playbackRate = currentSpeed; } catch(e) {}
                        });
                    });
                    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
                }
                if (window.MultiBrowserBridge && typeof window.MultiBrowserBridge.onSpeedApplied === 'function') {
                    window.MultiBrowserBridge.onSpeedApplied(bId, targetSpeed, count);
                }
                return JSON.stringify({ success: true, count: count, speed: targetSpeed });
            } catch(err) {
                return JSON.stringify({ success: false, error: err.message });
            }
        })();
        """.trimIndent()
    }

    fun applySpeed(
        webView: WebView?,
        browserId: Int,
        speed: Float,
        onResult: (success: Boolean, videoCount: Int, message: String) -> Unit
    ) {
        if (webView == null) {
            onResult(false, 0, "Browser not ready")
            return
        }
        val script = buildSpeedInjectionScript(speed, browserId)
        webView.evaluateJavascript(script) { result ->
            if (result == null || result == "null") {
                onResult(false, 0, "No response from webpage")
                return@evaluateJavascript
            }
            if (result.contains("\"success\":true")) {
                val countRegex = "\"count\":(\\d+)".toRegex()
                val count = countRegex.find(result)?.groupValues?.get(1)?.toIntOrNull() ?: 0
                if (count > 0) {
                    onResult(true, count, "Speed \${speed}x applied to \$count video(s)")
                } else {
                    onResult(false, 0, "Speed \${speed}x queued (no HTML5 video detected or DRM protected)")
                }
            } else {
                onResult(false, 0, "Website security policy prevented playback speed change")
            }
        }
    }

    fun applyMute(webView: WebView?, browserId: Int, muted: Boolean) {
        if (webView == null) return
        val script = "document.querySelectorAll('video, audio').forEach(function(m){ try { m.muted = $muted; } catch(e){} });"
        webView.evaluateJavascript(script, null)
    }
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/browser/AudioFocusHelper.kt',
    category: 'kotlin',
    description: 'Prevents Android from muting background WebViews and enforces simultaneous playback',
    content: `package com.multibrowser.pro.browser

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build

class AudioFocusHelper(private val context: Context) {
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var hasFocus = false

    private val focusChangeListener = AudioManager.OnAudioFocusChangeListener {}

    fun requestAppAudioFocus(): Boolean {
        if (audioManager == null || hasFocus) return hasFocus
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val playbackAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MOVIE)
                    .build()
                val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setWillPauseWhenDucked(false)
                    .setOnAudioFocusChangeListener(focusChangeListener)
                    .build()
                focusRequest = request
                val result = audioManager.requestAudioFocus(request)
                hasFocus = (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
                hasFocus
            } else {
                @Suppress("DEPRECATION")
                val result = audioManager.requestAudioFocus(
                    focusChangeListener,
                    AudioManager.STREAM_MUSIC,
                    AudioManager.AUDIOFOCUS_GAIN
                )
                hasFocus = (result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED)
                hasFocus
            }
        } catch (e: Exception) {
            false
        }
    }

    fun abandonFocus() {
        if (!hasFocus || audioManager == null) return
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
                audioManager.abandonAudioFocusRequest(focusRequest!!)
            } else {
                @Suppress("DEPRECATION")
                audioManager.abandonAudioFocus(focusChangeListener)
            }
            hasFocus = false
        } catch (e: Exception) {}
    }
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/browser/BrowserWebView.kt',
    category: 'kotlin',
    description: 'Hardware accelerated WebView wrapper with JavascriptInterface and isolated navigation client',
    content: `package com.multibrowser.pro.browser

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.webkit.*

class BrowserWebView(
    private val context: Context,
    val browserId: Int,
    private val callbacks: BrowserCallbacks
) {
    interface BrowserCallbacks {
        fun onPageStarted(browserId: Int, url: String)
        fun onPageFinished(browserId: Int, url: String)
        fun onProgressChanged(browserId: Int, progress: Int)
        fun onTitleReceived(browserId: Int, title: String)
        fun onNavigationStateChanged(browserId: Int, canGoBack: Boolean, canGoForward: Boolean)
        fun onError(browserId: Int, errorDescription: String)
        fun onVideoStateDetected(browserId: Int, count: Int, isPlaying: Boolean)
    }

    val webView: WebView = createWebView()
    private val mainHandler = Handler(Looper.getMainLooper())

    @SuppressLint("SetJavaScriptEnabled")
    private fun createWebView(): WebView {
        return WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                mediaPlaybackRequiresUserGesture = false // Key for simultaneous background playback!
                useWideViewPort = true
                loadWithOverviewMode = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
            addJavascriptInterface(BridgeInterface(), "MultiBrowserBridge")
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    callbacks.onProgressChanged(browserId, newProgress)
                }
                override fun onReceivedTitle(view: WebView?, title: String?) {
                    if (!title.isNullOrBlank()) callbacks.onTitleReceived(browserId, title)
                }
            }
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    view?.loadUrl(request?.url?.toString() ?: return false)
                    return true
                }
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    if (url != null) callbacks.onPageStarted(browserId, url)
                    updateNavigationState()
                }
                override fun onPageFinished(view: WebView?, url: String?) {
                    if (url != null) callbacks.onPageFinished(browserId, url)
                    updateNavigationState()
                }
            }
        }
    }

    fun updateNavigationState() {
        mainHandler.post {
            callbacks.onNavigationStateChanged(browserId, webView.canGoBack(), webView.canGoForward())
        }
    }

    inner class BridgeInterface {
        @JavascriptInterface
        fun onSpeedApplied(id: Int, speed: Float, count: Int) {
            mainHandler.post { callbacks.onVideoStateDetected(id, count, true) }
        }
    }

    fun loadUrl(url: String) = webView.loadUrl(url)
    fun goBack() = webView.canGoBack().also { if (it) webView.goBack() }
    fun goForward() = webView.canGoForward().also { if (it) webView.goForward() }
    fun reload() = webView.reload()
    fun destroy() = webView.destroy()
}`
  },
  {
    path: 'app/src/main/java/com/multibrowser/pro/ui/LayoutManager.kt',
    category: 'kotlin',
    description: 'Portrait 9:16 vertical 3-stack, Landscape 16:9 horizontal 3-column layout engine',
    content: `package com.multibrowser.pro.ui

import android.content.res.Configuration
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import com.multibrowser.pro.browser.BrowserManager
import com.multibrowser.pro.browser.BrowserState

enum class AppLayoutMode {
    AUTO,
    VERTICAL_STACK,
    HORIZONTAL_COLUMNS
}

@Composable
fun MultiBrowserLayout(
    browsers: List<BrowserState>,
    browserManager: BrowserManager,
    layoutMode: AppLayoutMode,
    isFullScreen: Boolean,
    modifier: Modifier = Modifier
) {
    val configuration = LocalConfiguration.current
    val isLandscape = configuration.orientation == Configuration.ORIENTATION_LANDSCAPE
    val effectiveLayout = when (layoutMode) {
        AppLayoutMode.VERTICAL_STACK -> false
        AppLayoutMode.HORIZONTAL_COLUMNS -> true
        AppLayoutMode.AUTO -> isLandscape
    }

    if (effectiveLayout) {
        Row(modifier = modifier.fillMaxSize()) {
            browsers.forEach { state ->
                Box(modifier = Modifier.weight(1f).fillMaxHeight()) {
                    BrowserPanel(state = state, browserManager = browserManager, showControls = !isFullScreen)
                }
            }
        }
    } else {
        Column(modifier = modifier.fillMaxSize()) {
            browsers.forEach { state ->
                Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
                    BrowserPanel(state = state, browserManager = browserManager, showControls = !isFullScreen)
                }
            }
        }
    }
}`
  },
  {
    path: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Root Gradle settings file declaring module dependencies and repositories',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MultiBrowserPro"
include(":app")`
  },
  {
    path: 'build.gradle.kts',
    category: 'gradle',
    description: 'Root Gradle build file with modern Android Application and Compose plugins',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}`
  },
  {
    path: 'gradle/libs.versions.toml',
    category: 'gradle',
    description: 'Version Catalog defining Android Gradle Plugin 8.3.2, Kotlin 2.0.0 and Compose BOM',
    content: `[versions]
agp = "8.3.2"
kotlin = "2.0.0"
coreKtx = "1.13.1"
lifecycleRuntimeKtx = "2.8.4"
activityCompose = "1.9.1"
composeBom = "2024.06.00"
webkit = "1.11.0"
material3 = "1.2.1"
coroutines = "1.8.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-webkit = { group = "androidx.webkit", name = "webkit", version.ref = "webkit" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: 'README.md',
    category: 'doc',
    description: 'Complete build instructions for GitHub Actions, local Gradle, and Android Studio',
    content: `# MultiBrowser Pro – Android Multi-Window Video Browser\nBuild with ./gradlew assembleDebug or via GitHub Actions.\nDebug APK location: app/build/outputs/apk/debug/app-debug.apk`
  }
];
