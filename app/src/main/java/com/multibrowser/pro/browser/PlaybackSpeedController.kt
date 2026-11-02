package com.multibrowser.pro.browser

import android.webkit.WebView

/**
 * Handles JavaScript injection for HTML5 video playback speed control,
 * dynamic video detection, and muting.
 */
object PlaybackSpeedController {

    val SUPPORTED_SPEEDS = listOf(
        0.25f,
        0.5f,
        0.75f,
        1.0f,
        1.25f,
        1.5f,
        1.75f,
        2.0f
    )

    /**
     * JavaScript payload injected into the WebView to set playback rate on all media elements,
     * install a persistent MutationObserver for dynamic video elements, and report back the count.
     */
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
                    } catch(e) {
                        return false;
                    }
                    return false;
                }

                var mediaElements = document.querySelectorAll('video, audio');
                var count = 0;
                mediaElements.forEach(function(media) {
                    if (applySpeedToMedia(media)) {
                        count++;
                    }
                });

                // Traverse shadow roots if present
                var allNodes = document.querySelectorAll('*');
                allNodes.forEach(function(node) {
                    if (node.shadowRoot) {
                        var shadowMedia = node.shadowRoot.querySelectorAll('video, audio');
                        shadowMedia.forEach(function(media) {
                            if (applySpeedToMedia(media)) {
                                count++;
                            }
                        });
                    }
                });

                // Install dynamic observer if not already active
                if (!window.__multiBrowserObserverInstalled) {
                    window.__multiBrowserObserverInstalled = true;
                    var observer = new MutationObserver(function(mutations) {
                        var currentSpeed = window.__multiBrowserSpeed || 1.0;
                        document.querySelectorAll('video, audio').forEach(function(media) {
                            try {
                                if (media.playbackRate !== currentSpeed) {
                                    media.playbackRate = currentSpeed;
                                }
                            } catch(e) {}
                        });
                    });
                    observer.observe(document.body || document.documentElement, {
                        childList: true,
                        subtree: true
                    });
                }

                // If bridge exists, notify native Android layer
                if (window.MultiBrowserBridge && typeof window.MultiBrowserBridge.onSpeedApplied === 'function') {
                    window.MultiBrowserBridge.onSpeedApplied(bId, targetSpeed, count);
                }

                return JSON.stringify({ success: true, count: count, speed: targetSpeed });
            } catch(err) {
                if (window.MultiBrowserBridge && typeof window.MultiBrowserBridge.onSpeedFailed === 'function') {
                    window.MultiBrowserBridge.onSpeedFailed(bId, err.message || 'Restricted');
                }
                return JSON.stringify({ success: false, error: err.message });
            }
        })();
        """.trimIndent()
    }

    /**
     * JavaScript payload to mute/unmute videos in the page.
     */
    fun buildMuteInjectionScript(muted: Boolean, browserId: Int): String {
        return """
        (function() {
            try {
                var isMuted = $muted;
                var mediaElements = document.querySelectorAll('video, audio');
                mediaElements.forEach(function(media) {
                    try {
                        media.muted = isMuted;
                    } catch(e) {}
                });
                return { success: true, muted: isMuted };
            } catch(e) {
                return { success: false, error: e.message };
            }
        })();
        """.trimIndent()
    }

    /**
     * Injects the playback speed into the target WebView and handles results.
     */
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

            try {
                if (result.contains("\"success\":true")) {
                    val countRegex = "\"count\":(\\d+)".toRegex()
                    val match = countRegex.find(result)
                    val count = match?.groupValues?.get(1)?.toIntOrNull() ?: 0

                    if (count > 0) {
                        onResult(true, count, "Speed ${speed}x applied to $count video(s)")
                    } else {
                        onResult(
                            false,
                            0,
                            "Speed ${speed}x queued (no HTML5 video detected or DRM protected)"
                        )
                    }
                } else {
                    onResult(
                        false,
                        0,
                        "Website security policy prevented playback speed change"
                    )
                }
            } catch (e: Exception) {
                onResult(false, 0, "Could not apply speed: ${e.message}")
            }
        }
    }

    /**
     * Injects mute state into the WebView.
     */
    fun applyMute(webView: WebView?, browserId: Int, muted: Boolean) {
        if (webView == null) return
        val script = buildMuteInjectionScript(muted, browserId)
        webView.evaluateJavascript(script, null)
    }
}
