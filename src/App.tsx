import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Maximize2,
  Minimize2,
  Code2,
  PlaySquare,
  HelpCircle,
  Download,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Volume2,
  Play,
  Pause,
  Sliders,
  Columns3,
  Rows3,
  LayoutGrid,
  Radio,
  Star
} from 'lucide-react';
import { BrowserPanelWeb, WebBrowserState } from './components/BrowserPanelWeb';
import { AndroidCodeExplorer } from './components/AndroidCodeExplorer';
import { TestSuiteModal } from './components/TestSuiteModal';
import { BuildGuideModal } from './components/BuildGuideModal';
import { AudioMixerModal } from './components/AudioMixerModal';
import { generateAndroidProjectZip, downloadBlob } from './utils/zipExporter';

const INITIAL_BROWSERS: WebBrowserState[] = [
  {
    id: 0,
    title: 'YouTube - Big Buck Bunny 4K',
    url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=aqz-KE-bpKQ',
    inputUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    history: ['https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=aqz-KE-bpKQ'],
    historyIndex: 0,
    speed: 1.0,
    isMuted: true,
    isPlaying: true,
    volume: 1.0,
    displayMode: 'embed'
  },
  {
    id: 1,
    title: 'Vimeo - The New Movement',
    url: 'https://player.vimeo.com/video/76979871?autoplay=1&muted=1&loop=1',
    inputUrl: 'https://vimeo.com/76979871',
    history: ['https://player.vimeo.com/video/76979871?autoplay=1&muted=1&loop=1'],
    historyIndex: 0,
    speed: 1.0,
    isMuted: true,
    isPlaying: true,
    volume: 0.85,
    displayMode: 'embed'
  },
  {
    id: 2,
    title: 'HTML5 Multi-Video Lab',
    url: 'internal://video-lab',
    inputUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    history: ['internal://video-lab'],
    historyIndex: 0,
    speed: 1.0,
    isMuted: true,
    isPlaying: true,
    volume: 0.7,
    displayMode: 'html5_portal'
  }
];

const ACCENTS = ['#38BDF8', '#818CF8', '#A78BFA'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code'>('simulator');
  const [layoutMode, setLayoutMode] = useState<'portrait' | 'landscape' | 'focus'>('portrait');
  const [primaryBrowserId, setPrimaryBrowserId] = useState<number>(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [browsers, setBrowsers] = useState<WebBrowserState[]>(INITIAL_BROWSERS);
  const [showTestSuite, setShowTestSuite] = useState(false);
  const [showBuildGuide, setShowBuildGuide] = useState(false);
  const [showAudioMixer, setShowAudioMixer] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const allPlaying = browsers.every((b) => b.isPlaying);

  const toggleAllPlay = () => {
    const nextState = !allPlaying;
    setBrowsers((prev) =>
      prev.map((b) => ({ ...b, isPlaying: nextState }))
    );
  };

  const handleUpdateBrowser = (
    id: number,
    updater: (prev: WebBrowserState) => WebBrowserState
  ) => {
    setBrowsers((prev) =>
      prev.map((b) => (b.id === id ? updater(b) : b))
    );
  };

  const handleUpdateVolume = (id: number, volume: number) => {
    handleUpdateBrowser(id, (prev) => ({
      ...prev,
      volume,
      isMuted: volume === 0
    }));
  };

  const handleToggleMute = (id: number) => {
    handleUpdateBrowser(id, (prev) => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const handleSoloBrowser = (id: number) => {
    setBrowsers((prev) =>
      prev.map((b) => ({ ...b, isMuted: b.id !== id }))
    );
  };

  const handleMuteAll = () => {
    setBrowsers((prev) => prev.map((b) => ({ ...b, isMuted: true })));
  };

  const handleUnmuteAll = () => {
    setBrowsers((prev) => prev.map((b) => ({ ...b, isMuted: false })));
  };

  const handleExportZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidProjectZip();
      downloadBlob(blob, 'multibrowser-pro-android.zip');
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  // Primary browser vs secondary browsers in Focus mode
  const primaryBrowser = browsers.find((b) => b.id === primaryBrowserId) || browsers[0];
  const secondaryBrowsers = browsers.filter((b) => b.id !== primaryBrowser.id);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0a0d14] text-slate-100 font-sans overflow-hidden select-none">
      {/* Top Main Navigation Bar (hidden in Full Screen Grid mode) */}
      {!isFullScreen && (
        <header className="bg-[#131822] border-b border-[#283347] px-4 py-2 flex items-center justify-between shrink-0 z-40">
          {/* Logo & Product Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-xs tracking-wider shadow-sm">
                PRO
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>MultiBrowser Pro</span>
                <span className="text-[11px] font-normal text-slate-400 hidden sm:inline">
                  • 3-Window Multi-Engine Browser
                </span>
              </h1>
            </div>

            {/* View Switcher Pills */}
            <div className="flex items-center bg-[#0a0d14] p-0.5 rounded-lg border border-[#283347] ml-2">
              <button
                type="button"
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'simulator'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlaySquare className="w-3.5 h-3.5" />
                <span>3-Browser Simulator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Android Source & ZIP</span>
              </button>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {activeTab === 'simulator' && (
              <>
                {/* Professional Layout Mode Selector */}
                <div className="flex items-center bg-[#1b2230] rounded-lg p-0.5 border border-[#283347]">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('portrait')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      layoutMode === 'portrait'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Portrait Layout (3 Stacked Panels - 9:16)"
                  >
                    <Rows3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Stack</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('landscape')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      layoutMode === 'landscape'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Landscape Layout (3 Columns - 16:9)"
                  >
                    <Columns3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Columns</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('focus')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      layoutMode === 'focus'
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Focus Layout (1 Large Primary + 2 Side Windows)"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Focus 1+2</span>
                  </button>
                </div>

                {/* Studio Audio Mixer Button */}
                <button
                  type="button"
                  onClick={() => setShowAudioMixer(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b2230] hover:bg-[#283347] border border-[#283347] text-slate-200 text-xs font-semibold transition-all shadow-sm"
                  title="Studio Audio Mixer (Volume sliders & solo channels)"
                >
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Mixer</span>
                </button>

                {/* Master Play All 3 / Pause All Button */}
                <button
                  type="button"
                  onClick={toggleAllPlay}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    allPlaying
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  title={allPlaying ? 'Pause all 3 browsers' : 'Play all 3 browsers simultaneously'}
                >
                  {allPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-white" />
                      <span>Pause All</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play All 3</span>
                    </>
                  )}
                </button>

                {/* Full-Screen Grid Mode Button */}
                <button
                  type="button"
                  onClick={() => setIsFullScreen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                  title="Expand all 3 browser panels across 100% of display"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>
              </>
            )}

            {/* Test Suite Runner Button */}
            <button
              type="button"
              onClick={() => setShowTestSuite(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors"
              title="Run 8 Specification Verification Tests"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Run 8 Tests</span>
            </button>

            {/* APK Build Guide Modal */}
            <button
              type="button"
              onClick={() => setShowBuildGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1b2230] hover:bg-[#283347] border border-[#283347] text-slate-300 text-xs font-medium transition-colors"
              title="GitHub Actions & Gradle APK Build Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">APK Guide</span>
            </button>

            {/* Export Complete Android Project ZIP */}
            <button
              type="button"
              disabled={isExporting}
              onClick={handleExportZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-bold transition-colors shadow-sm"
              title="Export complete Android Studio Gradle project"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>{isExporting ? 'Zipping...' : 'Download ZIP'}</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Body View */}
      <main className="flex-1 relative overflow-hidden flex">
        {activeTab === 'simulator' ? (
          <div className="flex-1 w-full h-full relative bg-[#0a0d14]">
            {/* Focus 1+2 Layout vs Portrait vs Landscape */}
            {layoutMode === 'focus' ? (
              <div className="w-full h-full flex flex-col md:flex-row">
                {/* Large Primary Window (65%) */}
                <div className="flex-1 md:w-[65%] h-full relative border-r border-[#283347]">
                  <div className="absolute top-2 right-2 z-30">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      PRIMARY BROWSER
                    </span>
                  </div>
                  <BrowserPanelWeb
                    browser={primaryBrowser}
                    onUpdate={handleUpdateBrowser}
                    isFullScreen={isFullScreen}
                    accentColor={ACCENTS[primaryBrowser.id]}
                  />
                </div>

                {/* Two Secondary Stacked Windows (35%) */}
                <div className="md:w-[35%] h-full flex flex-col">
                  {secondaryBrowsers.map((b) => (
                    <div key={b.id} className="flex-1 relative border-b border-[#283347] last:border-b-0">
                      <div className="absolute top-2 right-2 z-30">
                        <button
                          type="button"
                          onClick={() => setPrimaryBrowserId(b.id)}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1e293b] hover:bg-blue-600 text-slate-300 hover:text-white border border-[#334155] transition-colors"
                        >
                          Make Primary
                        </button>
                      </div>
                      <BrowserPanelWeb
                        browser={b}
                        onUpdate={handleUpdateBrowser}
                        isFullScreen={isFullScreen}
                        accentColor={ACCENTS[b.id]}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`w-full h-full ${
                  layoutMode === 'portrait'
                    ? 'flex flex-col' // Portrait: 3 stacked panels
                    : 'flex flex-row' // Landscape: 3 side-by-side columns
                }`}
              >
                {browsers.map((b, idx) => (
                  <div
                    key={b.id}
                    className={`relative ${
                      layoutMode === 'portrait' ? 'flex-1 w-full' : 'flex-1 h-full'
                    }`}
                  >
                    <BrowserPanelWeb
                      browser={b}
                      onUpdate={handleUpdateBrowser}
                      isFullScreen={isFullScreen}
                      accentColor={ACCENTS[idx]}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Floating Exit Full-Screen Button */}
            {isFullScreen && (
              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#161b22]/90 hover:bg-[#161b22] border border-blue-500 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur transition-all hover:scale-105"
              >
                <Minimize2 className="w-4 h-4 text-blue-400" />
                <span>Exit Full Screen Grid</span>
              </button>
            )}
          </div>
        ) : (
          <AndroidCodeExplorer />
        )}
      </main>

      {/* Professional Multi-Window Status Bar */}
      {!isFullScreen && (
        <footer className="h-6 bg-[#0a0d14] border-t border-[#1e293b] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <strong className="text-slate-200">3 Isolated Web Engines Active</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>Hardware Accel: ON</span>
            <span className="text-slate-600">|</span>
            <span>Multi-Audio Focus: Synchronized</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Target: Android 10+ (API 29-34)</span>
            <span className="text-slate-600">|</span>
            <span className="text-blue-400 font-semibold">MultiBrowser Pro v1.0.0</span>
          </div>
        </footer>
      )}

      {/* Test Suite Modal */}
      <TestSuiteModal
        isOpen={showTestSuite}
        onClose={() => setShowTestSuite(false)}
        browsers={browsers}
        setBrowsers={setBrowsers}
        setLayoutMode={(m) => setLayoutMode(m as any)}
        setIsFullScreen={setIsFullScreen}
      />

      {/* Build Guide Modal */}
      <BuildGuideModal
        isOpen={showBuildGuide}
        onClose={() => setShowBuildGuide(false)}
      />

      {/* Studio Audio Mixer Modal */}
      <AudioMixerModal
        isOpen={showAudioMixer}
        onClose={() => setShowAudioMixer(false)}
        browsers={browsers}
        onUpdateVolume={handleUpdateVolume}
        onToggleMute={handleToggleMute}
        onSoloBrowser={handleSoloBrowser}
        onMuteAll={handleMuteAll}
        onUnmuteAll={handleUnmuteAll}
      />
    </div>
  );
}
