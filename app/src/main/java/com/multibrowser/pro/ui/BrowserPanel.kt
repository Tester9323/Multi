package com.multibrowser.pro.ui

import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.multibrowser.pro.browser.BrowserManager
import com.multibrowser.pro.browser.BrowserState
import com.multibrowser.pro.ui.theme.DarkBackground
import com.multibrowser.pro.ui.theme.DarkBorder
import com.multibrowser.pro.ui.theme.PrimaryAccent
import kotlinx.coroutines.delay

@Composable
fun BrowserPanel(
    state: BrowserState,
    browserManager: BrowserManager,
    showControls: Boolean = true,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current

    // Auto-dismiss speed banner after 4 seconds
    LaunchedEffect(state.speedStatusMessage) {
        if (state.speedStatusMessage != null) {
            delay(4000)
            browserManager.dismissSpeedMessage(state.id)
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .border(width = 0.5.dp, color = DarkBorder)
    ) {
        if (showControls) {
            BrowserControls(
                state = state,
                onUrlSubmit = { url -> browserManager.loadUrl(state.id, url) },
                onUrlChange = { text -> browserManager.updateInputUrl(state.id, text) },
                onBack = { browserManager.goBack(state.id) },
                onForward = { browserManager.goForward(state.id) },
                onRefresh = { browserManager.refresh(state.id) },
                onHome = { browserManager.goHome(state.id) },
                onSpeedSelected = { speed -> browserManager.setPlaybackSpeed(state.id, speed) },
                onToggleMute = { browserManager.toggleMute(state.id) }
            )
        }

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            // AndroidView hosting the persistent WebView instance
            // Zero WebView recreation on layout/orientation changes!
            AndroidView(
                factory = {
                    val browserHolder = browserManager.getOrCreateWebView(state.id, context)
                    val parent = browserHolder.webView.parent as? ViewGroup
                    parent?.removeView(browserHolder.webView)

                    FrameLayout(context).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        addView(browserHolder.webView)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )

            // Speed feedback banner (shows whether speed was applied to HTML5 videos or website prevented it)
            AnimatedVisibility(
                visible = state.speedStatusMessage != null,
                enter = fadeIn(),
                exit = fadeOut(),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(8.dp)
            ) {
                state.speedStatusMessage?.let { msg ->
                    val isError = msg.contains("prevented") || msg.contains("no HTML5") || msg.contains("queued")
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (isError) Color(0xD978350F) else Color(0xD9064E3B))
                            .border(1.dp, if (isError) Color(0xFFF59E0B) else Color(0xFF10B981), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = if (isError) Icons.Default.Warning else Icons.Default.Info,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = msg,
                            color = Color.White,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier
                                .size(14.dp)
                                .clickable { browserManager.dismissSpeedMessage(state.id) }
                        )
                    }
                }
            }

            // Error overlay with Retry
            if (state.errorMessage != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(DarkBackground.copy(alpha = 0.92f))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Error",
                            tint = Color(0xFFEF4444),
                            modifier = Modifier.size(32.dp)
                        )
                        Text(
                            text = "Page Loading Error",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.padding(top = 8.dp)
                        )
                        Text(
                            text = state.errorMessage,
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )
                        Button(
                            onClick = { browserManager.refresh(state.id) },
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryAccent)
                        ) {
                            Text(text = "Retry", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}
