# MultiBrowser Pro ProGuard Rules
-keepattributes *Annotation*
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.multibrowser.pro.browser.** { *; }
