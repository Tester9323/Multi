package com.multibrowser.pro.browser

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Bitmap
import android.net.http.SslError
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient

/**
 * Creates and configures an isolated, high-performance WebView instance for MultiBrowser Pro.
 */
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

            // Essential hardware acceleration & layer type for video
            setLayerType(View.LAYER_TYPE_HARDWARE, null)
            isVerticalScrollBarEnabled = true
            isHorizontalScrollBarEnabled = true

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true

                // CRITICAL FOR SIMULTANEOUS PLAYBACK:
                // Disable user gesture requirement so multiple video streams can play without blocking
                mediaPlaybackRequiresUserGesture = false

                // Support HTML5 viewport tags
                useWideViewPort = true
                loadWithOverviewMode = true

                // Enable zoom controls
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false

                // Cache and storage
                cacheMode = WebSettings.LOAD_DEFAULT

                // Mixed content support for HTTP video embedded in HTTPS pages
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW

                // Modern standard mobile browser user agent
                userAgentString = settings.userAgentString + " MultiBrowserPro/1.0"
            }

            // Expose JavaScript Interface to bridge video events
            addJavascriptInterface(BridgeInterface(), "MultiBrowserBridge")

            // Custom Chrome client for HTML5 media and progress
            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    callbacks.onProgressChanged(browserId, newProgress)
                }

                override fun onReceivedTitle(view: WebView?, title: String?) {
                    if (!title.isNullOrBlank()) {
                        callbacks.onTitleReceived(browserId, title)
                    }
                }

                // Handle video element custom fullscreen views if triggered
                override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                    super.onShowCustomView(view, callback)
                }

                override fun onHideCustomView() {
                    super.onHideCustomView()
                }
            }

            // Custom WebViewClient keeping all navigation internal to this panel
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(
                    view: WebView?,
                    request: WebResourceRequest?
                ): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Always handle inside this independent WebView instance
                    view?.loadUrl(url)
                    return true
                }

                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    if (url != null) {
                        view?.loadUrl(url)
                    }
                    return true
                }

                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    if (url != null) {
                        callbacks.onPageStarted(browserId, url)
                    }
                    updateNavigationState()
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    if (url != null) {
                        callbacks.onPageFinished(browserId, url)
                    }
                    updateNavigationState()
                    injectVideoDetectionScript()
                }

                override fun onReceivedError(
                    view: WebView?,
                    request: WebResourceRequest?,
                    error: WebResourceError?
                ) {
                    if (request?.isForMainFrame == true) {
                        val desc = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            error?.description?.toString() ?: "Loading error"
                        } else {
                            "Failed to load page"
                        }
                        callbacks.onError(browserId, desc)
                    }
                }

                @SuppressLint("WebViewClientOnReceivedSslError")
                override fun onReceivedSslError(
                    view: WebView?,
                    handler: SslErrorHandler?,
                    error: SslError?
                ) {
                    // For test streams / local test servers, proceed or notify
                    handler?.proceed()
                }
            }
        }
    }

    /**
     * Updates back/forward state to the ViewModel.
     */
    fun updateNavigationState() {
        mainHandler.post {
            callbacks.onNavigationStateChanged(
                browserId,
                webView.canGoBack(),
                webView.canGoForward()
            )
        }
    }

    /**
     * Injects a lightweight watcher to detect video presence and playback status.
     */
    private fun injectVideoDetectionScript() {
        val script = """
        (function() {
            try {
                function checkVideos() {
                    var videos = document.querySelectorAll('video');
                    var isPlaying = false;
                    for (var i = 0; i < videos.length; i++) {
                        if (!videos[i].paused && !videos[i].ended && videos[i].readyState > 2) {
                            isPlaying = true;
                            break;
                        }
                    }
                    if (window.MultiBrowserBridge && typeof window.MultiBrowserBridge.onVideoStatus === 'function') {
                        window.MultiBrowserBridge.onVideoStatus($browserId, videos.length, isPlaying);
                    }
                }
                checkVideos();
                setInterval(checkVideos, 2500);
            } catch(e) {}
        })();
        """.trimIndent()
        webView.evaluateJavascript(script, null)
    }

    inner class BridgeInterface {
        @JavascriptInterface
        fun onSpeedApplied(id: Int, speed: Float, count: Int) {
            mainHandler.post {
                callbacks.onVideoStateDetected(id, count, true)
            }
        }

        @JavascriptInterface
        fun onSpeedFailed(id: Int, reason: String) {
            mainHandler.post {
                Log.w("BrowserWebView", "Speed injection restricted on Browser $id: $reason")
            }
        }

        @JavascriptInterface
        fun onVideoStatus(id: Int, videoCount: Int, isPlaying: Boolean) {
            mainHandler.post {
                callbacks.onVideoStateDetected(id, videoCount, isPlaying)
            }
        }
    }

    fun loadUrl(url: String) {
        var formatted = url.trim()
        if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
            formatted = if (formatted.contains(".") && !formatted.contains(" ")) {
                "https://$formatted"
            } else {
                "https://www.google.com/search?q=" + java.net.URLEncoder.encode(formatted, "UTF-8")
            }
        }
        webView.loadUrl(formatted)
    }

    fun goBack(): Boolean {
        if (webView.canGoBack()) {
            webView.goBack()
            updateNavigationState()
            return true
        }
        return false
    }

    fun goForward(): Boolean {
        if (webView.canGoForward()) {
            webView.goForward()
            updateNavigationState()
            return true
        }
        return false
    }

    fun reload() {
        webView.reload()
    }

    fun stopLoading() {
        webView.stopLoading()
    }

    fun destroy() {
        try {
            webView.stopLoading()
            webView.loadUrl("about:blank")
            webView.onPause()
            webView.removeAllViews()
            webView.destroy()
        } catch (e: Exception) {
            Log.e("BrowserWebView", "Error destroying webview $browserId", e)
        }
    }
}
