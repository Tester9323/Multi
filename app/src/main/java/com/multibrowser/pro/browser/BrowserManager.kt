package com.multibrowser.pro.browser

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

/**
 * Architecture controller managing the 3 isolated browser instances and states.
 */
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

    // Persistent WebView holders to guarantee ZERO recreation on layout/orientation changes
    private val webViewHolders = mutableMapOf<Int, BrowserWebView>()

    init {
        audioFocusHelper.requestAppAudioFocus()
    }

    /**
     * Retrieves or creates the persistent BrowserWebView instance for a panel.
     */
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
                if (state.id == browserId) {
                    state.copy(inputUrl = url, errorMessage = null)
                } else state
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
        val homeUrl = BrowserState.DEFAULT_HOMEPAGES.getOrElse(browserId) {
            "https://en.wikipedia.org"
        }
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
        val holder = webViewHolders[browserId]

        PlaybackSpeedController.applyMute(holder?.webView, browserId, newMuted)

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

    fun clearError(browserId: Int) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) state.copy(errorMessage = null) else state
            }
        }
    }

    // --- BrowserWebView.BrowserCallbacks Implementation ---

    override fun onPageStarted(browserId: Int, url: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) {
                    state.copy(
                        currentUrl = url,
                        inputUrl = url,
                        isLoading = true,
                        progress = 10,
                        errorMessage = null
                    )
                } else state
            }
        }
    }

    override fun onPageFinished(browserId: Int, url: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) {
                    state.copy(
                        currentUrl = url,
                        isLoading = false,
                        progress = 100
                    )
                } else state
            }
        }

        // Re-apply desired playback speed after page loads
        val state = _browsers.value.find { it.id == browserId }
        if (state != null && state.playbackSpeed != 1.0f) {
            setPlaybackSpeed(browserId, state.playbackSpeed)
        }
        if (state?.isMuted == true) {
            PlaybackSpeedController.applyMute(webViewHolders[browserId]?.webView, browserId, true)
        }
    }

    override fun onProgressChanged(browserId: Int, progress: Int) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) {
                    state.copy(
                        progress = progress,
                        isLoading = progress < 100
                    )
                } else state
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
                if (state.id == browserId) {
                    state.copy(canGoBack = canGoBack, canGoForward = canGoForward)
                } else state
            }
        }
    }

    override fun onError(browserId: Int, errorDescription: String) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) {
                    state.copy(
                        isLoading = false,
                        errorMessage = errorDescription
                    )
                } else state
            }
        }
    }

    override fun onVideoStateDetected(browserId: Int, count: Int, isPlaying: Boolean) {
        _browsers.update { list ->
            list.map { state ->
                if (state.id == browserId) {
                    state.copy(videoCount = count, isPlayingMedia = isPlaying)
                } else state
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        audioFocusHelper.abandonFocus()
        webViewHolders.values.forEach { it.destroy() }
        webViewHolders.clear()
    }
}
