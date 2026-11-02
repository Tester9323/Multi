package com.multibrowser.pro.ui

import android.content.res.Configuration
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
        // Landscape or Horizontal layout: 3 side-by-side columns (approx 1/3 width each)
        Row(modifier = modifier.fillMaxSize()) {
            browsers.forEach { state ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    BrowserPanel(
                        state = state,
                        browserManager = browserManager,
                        showControls = !isFullScreen
                    )
                }
            }
        }
    } else {
        // Portrait or Vertical layout: 3 stacked panels (approx 1/3 height each)
        Column(modifier = modifier.fillMaxSize()) {
            browsers.forEach { state ->
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    BrowserPanel(
                        state = state,
                        browserManager = browserManager,
                        showControls = !isFullScreen
                    )
                }
            }
        }
    }
}
