import React from 'react';
import { Volume2, VolumeX, X, Sliders, Music, Radio, Check } from 'lucide-react';
import { WebBrowserState } from './BrowserPanelWeb';

interface AudioMixerModalProps {
  isOpen: boolean;
  onClose: () => void;
  browsers: WebBrowserState[];
  onUpdateVolume: (id: number, volume: number) => void;
  onToggleMute: (id: number) => void;
  onSoloBrowser: (id: number) => void;
  onMuteAll: () => void;
  onUnmuteAll: () => void;
}

const ACCENT_COLORS = ['#38BDF8', '#818CF8', '#A78BFA'];

export const AudioMixerModal: React.FC<AudioMixerModalProps> = ({
  isOpen,
  onClose,
  browsers,
  onUpdateVolume,
  onToggleMute,
  onSoloBrowser,
  onMuteAll,
  onUnmuteAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#131822] border border-[#283347] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#283347] bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Multi-Stream Audio Mixer</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  STUDIO PRO
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent volume balance and audio focus for all 3 simultaneous streams
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#21262d]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0a0d14]">
          {browsers.map((b, idx) => {
            const vol = b.volume ?? 1.0;
            const accent = ACCENT_COLORS[idx];

            return (
              <div
                key={b.id}
                className="bg-[#161b22] border border-[#283347] rounded-xl p-4 flex flex-col items-center gap-3 relative group"
                style={{
                  boxShadow: !b.isMuted ? `0 0 15px ${accent}15` : 'none'
                }}
              >
                {/* Channel Label */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider"
                    style={{
                      backgroundColor: `${accent}15`,
                      borderColor: accent,
                      color: accent
                    }}
                  >
                    CH {b.id + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSoloBrowser(b.id)}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#21262d] hover:bg-amber-500 hover:text-black text-slate-400 transition-colors"
                    title="Solo this browser stream (mutes others)"
                  >
                    SOLO
                  </button>
                </div>

                {/* Animated VU Meter Sim */}
                <div className="w-full flex items-center justify-center gap-1 h-12 bg-[#0d1117] rounded-lg p-2 border border-[#283347]">
                  {[0.4, 0.7, 0.9, 0.6, 0.8, 0.5, 0.85].map((val, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-[#283347] rounded-full overflow-hidden flex flex-col justify-end h-full"
                    >
                      <div
                        className="w-full rounded-full transition-all duration-300"
                        style={{
                          height: !b.isMuted ? `${val * 100 * vol}%` : '4%',
                          backgroundColor: i > 4 ? '#ef4444' : i > 2 ? '#f59e0b' : accent
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Vertical-like / Horizontal Volume Slider */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Level</span>
                    <span className="font-bold text-slate-200">
                      {b.isMuted ? 'Muted' : `${Math.round(vol * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={b.isMuted ? 0 : vol}
                    onChange={(e) => onUpdateVolume(b.id, parseFloat(e.target.value))}
                    className="w-full accent-blue-500 h-1.5 bg-[#283347] rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Channel Title & Mute Toggle */}
                <div className="w-full flex items-center justify-between pt-1 border-t border-[#283347]">
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[90px]">
                    {b.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleMute(b.id)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      b.isMuted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                    title={b.isMuted ? 'Unmute' : 'Mute'}
                  >
                    {b.isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Controls & Master Actions */}
        <div className="p-4 border-t border-[#283347] bg-[#0d1117] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onMuteAll}
              className="px-3 py-1.5 rounded-lg bg-[#1b2230] hover:bg-[#283347] border border-[#283347] text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Mute All</span>
            </button>
            <button
              type="button"
              onClick={onUnmuteAll}
              className="px-3 py-1.5 rounded-lg bg-[#1b2230] hover:bg-[#283347] border border-[#283347] text-slate-300 text-xs font-semibold flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unmute All</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
