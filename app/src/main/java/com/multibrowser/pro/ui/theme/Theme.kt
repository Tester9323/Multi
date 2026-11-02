package com.multibrowser.pro.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val DarkBackground = Color(0xFF0A0D14)
val DarkSurface = Color(0xFF131822)
val DarkSurfaceVariant = Color(0xFF1B2230)
val DarkBorder = Color(0xFF283347)
val PrimaryAccent = Color(0xFF3B82F6)
val PrimaryAccentHover = Color(0xFF60A5FA)
val TextPrimary = Color(0xFFF8FAFC)
val TextSecondary = Color(0xFF94A3B8)

// Dedicated accent colors for the 3 browser headers
val Browser1Color = Color(0xFF38BDF8) // Sky
val Browser2Color = Color(0xFF818CF8) // Indigo
val Browser3Color = Color(0xFFA78BFA) // Purple

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryAccent,
    onPrimary = Color.White,
    secondary = PrimaryAccentHover,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    outline = DarkBorder
)

@Composable
fun MultiBrowserTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
