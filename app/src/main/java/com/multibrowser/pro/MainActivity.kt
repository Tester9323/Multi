package com.multibrowser.pro

import android.content.res.Configuration
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
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material.icons.filled.ViewColumn
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.multibrowser.pro.browser.BrowserManager
import com.multibrowser.pro.ui.AppLayoutMode
import com.multibrowser.pro.ui.FloatingExitFullScreenButton
import com.multibrowser.pro.ui.FullScreenController
import com.multibrowser.pro.ui.MultiBrowserLayout
import com.multibrowser.pro.ui.SettingsScreen
import com.multibrowser.pro.ui.theme.DarkBackground
import com.multibrowser.pro.ui.theme.DarkBorder
import com.multibrowser.pro.ui.theme.DarkSurface
import com.multibrowser.pro.ui.theme.MultiBrowserTheme
import com.multibrowser.pro.ui.theme.PrimaryAccent
import com.multibrowser.pro.ui.theme.TextPrimary
import com.multibrowser.pro.ui.theme.TextSecondary

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
                        )
                        {
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

                        // Floating exit button in full screen grid mode
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
                            onRunTests = {
                                // Default run test setup
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TopAppBar(
    layoutMode: AppLayoutMode,
    onLayoutChange: (AppLayoutMode) -> Unit,
    onFullScreen: () -> Unit,
    onOpenSettings: () -> Unit
) {
    var layoutMenuExpanded by remember { mutableStateOf(false) }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(DarkSurface)
            .border(width = 0.5.dp, color = DarkBorder)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // App Branding
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(PrimaryAccent)
                    .padding(horizontal = 6.dp, vertical = 3.dp)
            ) {
                Text(
                    text = "PRO",
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = 10.sp
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "MultiBrowser Pro",
                color = TextPrimary,
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp
            )
        }

        // Actions: Layout Switcher, Full Screen Grid, Settings
        Row(verticalAlignment = Alignment.CenterVertically) {
            // Layout Selector Button
            Box {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0xFF1F2937))
                        .border(1.dp, DarkBorder, RoundedCornerShape(6.dp))
                        .clickable { layoutMenuExpanded = true }
                        .padding(horizontal = 8.dp, vertical = 5.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = when (layoutMode) {
                                AppLayoutMode.VERTICAL_STACK -> Icons.Default.ViewAgenda
                                AppLayoutMode.HORIZONTAL_COLUMNS -> Icons.Default.ViewColumn
                                AppLayoutMode.AUTO -> Icons.Default.GridView
                            },
                            contentDescription = "Layout",
                            tint = PrimaryAccent,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = when (layoutMode) {
                                AppLayoutMode.VERTICAL_STACK -> "Stack"
                                AppLayoutMode.HORIZONTAL_COLUMNS -> "Columns"
                                AppLayoutMode.AUTO -> "Auto"
                            },
                            color = TextPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                DropdownMenu(
                    expanded = layoutMenuExpanded,
                    onDismissRequest = { layoutMenuExpanded = false }
                ) {
                    DropdownMenuItem(
                        text = { Text("Auto (Orientation Detect)") },
                        onClick = {
                            layoutMenuExpanded = false
                            onLayoutChange(AppLayoutMode.AUTO)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Portrait Stack (Vertical)") },
                        onClick = {
                            layoutMenuExpanded = false
                            onLayoutChange(AppLayoutMode.VERTICAL_STACK)
                        }
                    )
                    DropdownMenuItem(
                        text = { Text("Landscape Columns (Horizontal)") },
                        onClick = {
                            layoutMenuExpanded = false
                            onLayoutChange(AppLayoutMode.HORIZONTAL_COLUMNS)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Full Screen Grid Mode Button
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(6.dp))
                    .background(PrimaryAccent.copy(alpha = 0.2f))
                    .border(1.dp, PrimaryAccent, RoundedCornerShape(6.dp))
                    .clickable { onFullScreen() }
                    .padding(horizontal = 8.dp, vertical = 5.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Fullscreen,
                        contentDescription = "Full Screen Grid",
                        tint = PrimaryAccent,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Full Screen",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.width(4.dp))

            // Settings Button
            IconButton(
                onClick = onOpenSettings,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    tint = TextSecondary,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
