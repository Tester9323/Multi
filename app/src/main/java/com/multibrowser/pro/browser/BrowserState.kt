package com.multibrowser.pro.browser

/**
 * State representation for an independent browser panel in MultiBrowser Pro.
 */
data class BrowserState(
    val id: Int,
    val title: String = "Browser ${id + 1}",
    val currentUrl: String = DEFAULT_URLS.getOrElse(id) { "https://en.wikipedia.org" },
    val inputUrl: String = DEFAULT_URLS.getOrElse(id) { "https://en.wikipedia.org" },
    val canGoBack: Boolean = false,
    val canGoForward: Boolean = false,
    val isLoading: Boolean = false,
    val progress: Int = 0,
    val playbackSpeed: Float = 1.0f,
    val isMuted: Boolean = false,
    val videoCount: Int = 0,
    val isPlayingMedia: Boolean = false,
    val speedStatusMessage: String? = null,
    val errorMessage: String? = null
) {
    companion object {
        val DEFAULT_URLS = listOf(
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        )

        val DEFAULT_HOMEPAGES = listOf(
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        )
    }
}
