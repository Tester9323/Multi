package com.multibrowser.pro.browser

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.util.Log

/**
 * Manages audio focus for MultiBrowser Pro.
 * 
 * In standard Android, when media starts playing in one component, Android's AudioManager
 * or the media stack can revoke focus from other components, causing background WebViews to pause.
 * 
 * AudioFocusHelper requests an application-wide media focus with AUDIOFOCUS_GAIN,
 * prevents ducking or internal audio-focus preemption across the 3 WebViews,
 * and maintains continuous simultaneous playback.
 */
class AudioFocusHelper(private val context: Context) {

    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
    private var focusRequest: AudioFocusRequest? = null
    private var hasFocus = false

    private val focusChangeListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        when (focusChange) {
            AudioManager.AUDIOFOCUS_LOSS -> {
                Log.d(TAG, "Audio focus lost permanently (external app)")
                hasFocus = false
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> {
                Log.d(TAG, "Audio focus lost transiently")
                hasFocus = false
            }
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> {
                // Do not silence or duck internal browsers!
                Log.d(TAG, "Audio focus transient can duck - keeping internal playback alive")
            }
            AudioManager.AUDIOFOCUS_GAIN -> {
                Log.d(TAG, "Audio focus gained")
                hasFocus = true
            }
        }
    }

    /**
     * Request global application audio focus for simultaneous media playback.
     */
    fun requestAppAudioFocus(): Boolean {
        if (audioManager == null) return false
        if (hasFocus) return true

        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val playbackAttributes = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MOVIE)
                    .build()

                val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setWillPauseWhenDucked(false) // Crucial: do not auto-pause when ducked!
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
            Log.e(TAG, "Error requesting audio focus", e)
            false
        }
    }

    /**
     * Abandon audio focus when application is closed.
     */
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
        } catch (e: Exception) {
            Log.e(TAG, "Error abandoning audio focus", e)
        }
    }

    companion object {
        private const val TAG = "MultiBrowserAudio"
    }
}
