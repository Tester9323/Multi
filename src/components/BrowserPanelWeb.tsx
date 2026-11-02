import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Volume2,
  VolumeX,
  Gauge,
  Lock,
  Search,
  ExternalLink,
  Check,
  Globe,
  Share2,
  Sliders,
  Bookmark,
  Play,
  Pause,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface WebBrowserState {
  id: number;
  title: string;
  url: string;
  inputUrl: string;
  history: string[];
  historyIndex: number;
  speed: number;
  isMuted: boolean;
  isPlaying: boolean;
  volume?: number;
  zoom?: number;
  displayMode: 'embed' | 'webpage' | 'html5_portal' | 'iframe' | 'youtube_portal' | 'google_search';
  favicon?: string;
}

interface BrowserPanelWebProps {
  browser: WebBrowserState;
  onUpdate: (id: number, updater: (prev: WebBrowserState) => WebBrowserState) => void;
  isFullScreen: boolean;
  accentColor: string;
}

const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export const BROWSER_BOOKMARKS = [
  {
    name: 'YouTube Portal',
    url: 'https://www.youtube.com',
    title: 'YouTube Video Explorer',
    type: 'youtube_portal',
    icon: '🎬'
  },
  {
    name: 'Google Search',
    url: 'https://www.google.com',
    title: 'Google Web & Video Search',
    type: 'google_search',
    icon: '🔍'
  },
  {
    name: 'Vimeo Player',
    url: 'https://player.vimeo.com/video/76979871?autoplay=1&muted=1&loop=1',
    title: 'Vimeo - The New Movement',
    type: 'embed',
    icon: '🎥'
  },
  {
    name: 'Wikipedia Video',
    url: 'https://en.m.wikipedia.org/wiki/Big_Buck_Bunny',
    title: 'Wikipedia: Big Buck Bunny Open Film',
    type: 'webpage',
    icon: '📖'
  },
  {
    name: 'Internet Archive',
    url: 'https://archive.org/embed/ElephantsDream',
    title: "Internet Archive: Elephant's Dream (2006)",
    type: 'embed',
    icon: '📼'
  },
  {
    name: 'HTML5 Video Lab',
    url: 'internal://video-lab',
    title: 'HTML5 Multi-Video Test Lab',
    type: 'html5_portal',
    icon: '🧪'
  }
];


export const BrowserPanelWeb: React.FC<BrowserPanelWebProps> = ({
  browser,
  onUpdate,
  isFullScreen,
  accentColor
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Sync playback speed to local video tag if in video-lab mode
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.playbackRate = browser.speed;
        videoRef.current.defaultPlaybackRate = browser.speed;
      } catch (e) {
        console.warn(e);
      }
    }
  }, [browser.speed]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = browser.isMuted;
    }
  }, [browser.isMuted]);

  // Sync volume level
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = browser.volume !== undefined ? browser.volume : 1.0;
    }
  }, [browser.volume]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const parseTargetUrl = (input: string) => {
    const trimmed = input.trim();

    // YouTube watch or short link -> convert to embed
    const ytMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      const vid = ytMatch[1];
      return {
        url: `https://www.youtube-nocookie.com/embed/${vid}?enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=${vid}`,
        title: `YouTube - Video (${vid})`,
        displayMode: 'embed' as const
      };
    }

    // Vimeo watch link -> convert to player
    const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && !trimmed.includes('player.vimeo.com')) {
      const vid = vimeoMatch[1];
      return {
        url: `https://player.vimeo.com/video/${vid}?autoplay=1&muted=1&loop=1`,
        title: `Vimeo - Video (${vid})`,
        displayMode: 'embed' as const
      };
    }

    const cleanNoProto = trimmed.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();

    // YouTube homepage or search
    if (cleanNoProto === 'youtube.com' || cleanNoProto.startsWith('youtube.com/') || cleanNoProto === 'm.youtube.com' || cleanNoProto === 'youtube') {
      return {
        url: 'https://www.youtube.com',
        title: 'YouTube Portal',
        displayMode: 'youtube_portal' as const
      };
    }

    // Google homepage or search
    if (cleanNoProto === 'google.com' || cleanNoProto.startsWith('google.com/') || cleanNoProto.startsWith('google.') || cleanNoProto === 'google') {
      return {
        url: 'https://www.google.com',
        title: 'Google Web & Video Search',
        displayMode: 'google_search' as const
      };
    }

    // Direct MP4 / WebM
    if (trimmed.endsWith('.mp4') || trimmed.endsWith('.webm') || trimmed.includes('.mp4?') || trimmed.includes('.webm?')) {
      return {
        url: trimmed,
        title: trimmed.split('/').pop()?.split('?')[0] || 'Media Video',
        displayMode: 'html5_portal' as const
      };
    }

    if (trimmed === 'internal://video-lab') {
      return {
        url: trimmed,
        title: 'HTML5 Multi-Video Test Lab',
        displayMode: 'html5_portal' as const
      };
    }

    // Standard website
    let fullUrl = trimmed;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      if (fullUrl.includes('.') && !fullUrl.includes(' ')) {
        fullUrl = `https://${fullUrl}`;
      } else {
        // Query search via Google Search Portal!
        return {
          url: `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`,
          title: `Google: ${trimmed}`,
          displayMode: 'google_search' as const
        };
      }
    }

    return {
      url: fullUrl,
      title: fullUrl.replace(/^https?:\/\//, '').split('/')[0],
      displayMode: 'iframe' as const
    };
  };

  const handleNavigate = (target: string) => {
    setIsLoading(true);
    setIframeError(false);

    const parsed = parseTargetUrl(target);

    onUpdate(browser.id, (prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(parsed.url);
      return {
        ...prev,
        url: parsed.url,
        inputUrl: parsed.url,
        title: parsed.title,
        displayMode: parsed.displayMode,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isPlaying: true
      };
    });

    setTimeout(() => {
      setIsLoading(false);
      showToast(`Loaded ${parsed.title}`);
    }, 600);
  };

  const handleBack = () => {
    if (browser.historyIndex > 0) {
      const prevIdx = browser.historyIndex - 1;
      const prevUrl = browser.history[prevIdx];
      const parsed = parseTargetUrl(prevUrl);
      onUpdate(browser.id, (prev) => ({
        ...prev,
        historyIndex: prevIdx,
        url: parsed.url,
        inputUrl: parsed.url,
        title: parsed.title,
        displayMode: parsed.displayMode
      }));
    }
  };

  const handleForward = () => {
    if (browser.historyIndex < browser.history.length - 1) {
      const nextIdx = browser.historyIndex + 1;
      const nextUrl = browser.history[nextIdx];
      const parsed = parseTargetUrl(nextUrl);
      onUpdate(browser.id, (prev) => ({
        ...prev,
        historyIndex: nextIdx,
        url: parsed.url,
        inputUrl: parsed.url,
        title: parsed.title,
        displayMode: parsed.displayMode
      }));
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = browser.url;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Reloaded Browser ${browser.id + 1}`);
    }, 400);
  };

  const handleHome = () => {
    const defaultBookmark = BROWSER_BOOKMARKS[browser.id % BROWSER_BOOKMARKS.length];
    handleNavigate(defaultBookmark.url);
  };

  const handleSpeedChange = (spd: number) => {
    onUpdate(browser.id, (prev) => ({
      ...prev,
      speed: spd
    }));
    setSpeedMenuOpen(false);

    // Apply speed via evaluateJavascript in Android, or direct media in web
    if (videoRef.current) {
      videoRef.current.playbackRate = spd;
    }

    showToast(`Speed ${spd}x injected into Browser ${browser.id + 1}`);
  };

  const toggleMute = () => {
    onUpdate(browser.id, (prev) => ({
      ...prev,
      isMuted: !prev.isMuted
    }));
  };

  const canGoBack = browser.historyIndex > 0;
  const canGoForward = browser.historyIndex < browser.history.length - 1;

  // Render HTML5 Video Test Lab with internal multi-video player
  const renderInternalVideoLab = () => {
    const sampleVideos = [
      {
        name: 'Big Buck Bunny (H.264)',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      },
      {
        name: "Elephant's Dream (H.264)",
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
      },
      {
        name: 'Tears of Steel (H.264)',
        src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
      }
    ];

    return (
      <div className="flex-1 bg-[#0a0d14] flex flex-col p-3 overflow-y-auto">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              HTML5 Video Player Portal • Browser {browser.id + 1}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Speed: <strong className="text-blue-400">{browser.speed}x</strong> | Muted: {browser.isMuted ? 'YES' : 'NO'}
          </span>
        </div>

        {/* Video Player Box */}
        <div className="flex-1 min-h-[180px] bg-black rounded-lg overflow-hidden relative border border-[#30363d] flex items-center justify-center">
          <video
            ref={videoRef}
            src={browser.url.startsWith('http') ? browser.url : sampleVideos[browser.id % 3].src}
            controls
            autoPlay
            playsInline
            loop
            muted={browser.isMuted}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Quick Video Switcher Chips */}
        <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] text-slate-400 font-semibold mr-1">Switch Stream:</span>
          {sampleVideos.map((vid, idx) => (
            <button
              key={vid.name}
              type="button"
              onClick={() => handleNavigate(vid.src)}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1e293b] hover:bg-[#334155] text-slate-300 border border-[#334155] transition-colors"
            >
              Stream {idx + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavigate('https://en.m.wikipedia.org/wiki/Big_Buck_Bunny')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800 transition-colors"
          >
            Open Wikipedia Article
          </button>
        </div>
      </div>
    );
  };

  // Render YouTube Video Portal
  const renderYouTubePortal = () => {
    const featuredVideos = [
      {
        id: 'aqz-KE-bpKQ',
        title: 'Big Buck Bunny 4K (60fps Ultra HD)',
        channel: 'Blender Studio',
        duration: '9:56',
        views: '14M views',
        thumb: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80'
      },
      {
        id: 'R6MlUcmOul8',
        title: 'Tears of Steel - VFX Sci-Fi Short Movie',
        channel: 'Blender Foundation',
        duration: '12:14',
        views: '8.2M views',
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80'
      },
      {
        id: 'eRsGyueVLvQ',
        title: 'Sintel (4K Open-Source Fantasy Animation)',
        channel: 'Blender Animation',
        duration: '14:48',
        views: '11M views',
        thumb: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&q=80'
      },
      {
        id: 'jfKfPfyJRdk',
        title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
        channel: 'Lofi Girl',
        duration: 'LIVE',
        views: '42K watching',
        thumb: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'
      },
      {
        id: '21X5lGlDOfg',
        title: 'NASA Live: Earth Views from the Space Station',
        channel: 'NASA',
        duration: 'LIVE',
        views: '18K watching',
        thumb: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80'
      },
      {
        id: 'ysz5S6PUM-U',
        title: '4K Ultra HD Nature & Wildlife Relaxing Film',
        channel: 'Nature Relaxation',
        duration: '3:05:12',
        views: '22M views',
        thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'
      }
    ];

    return (
      <div className="flex-1 bg-[#0f0f0f] flex flex-col p-3 overflow-y-auto text-white">
        {/* YouTube Header */}
        <div className="flex items-center justify-between mb-3 border-b border-[#272727] pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-4 bg-red-600 rounded-sm flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
            </div>
            <span className="font-bold text-sm tracking-tight">YouTube</span>
            <span className="text-[10px] text-slate-400 font-mono ml-1">Explorer</span>
          </div>

          <span className="text-[10px] text-slate-400">
            Click any video to play inside Browser {browser.id + 1}
          </span>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {featuredVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleNavigate(`https://www.youtube.com/watch?v=${vid.id}`)}
              className="bg-[#181818] hover:bg-[#222222] border border-[#272727] rounded-lg overflow-hidden cursor-pointer group transition-all"
            >
              <div className="relative aspect-video bg-[#282828] overflow-hidden flex items-center justify-center">
                <img
                  src={vid.thumb}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                  {vid.duration}
                </span>
              </div>
              <div className="p-2">
                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 group-hover:text-red-400 transition-colors">
                  {vid.title}
                </h4>
                <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                  <span>{vid.channel}</span>
                  <span>{vid.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Google Search Engine Portal
  const renderGoogleSearch = () => {
    const searchResults = [
      {
        title: 'Big Buck Bunny - Blender Open Movie',
        url: 'https://en.m.wikipedia.org/wiki/Big_Buck_Bunny',
        desc: 'Big Buck Bunny is a 2008 open-source animated short film by the Blender Institute, featuring open source 3D computer graphics.',
        actionUrl: 'https://en.m.wikipedia.org/wiki/Big_Buck_Bunny',
        tag: 'Wikipedia Article'
      },
      {
        title: 'Watch Big Buck Bunny in 4K 60fps on YouTube',
        url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        desc: 'Stream the full 4K 60fps remastered cut of Big Buck Bunny with stereo audio.',
        actionUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        tag: 'YouTube Video'
      },
      {
        title: 'Vimeo: The New Movement Cinema Showcase',
        url: 'https://vimeo.com/76979871',
        desc: 'Explore high-definition cinematography and cinematic movement on Vimeo player.',
        actionUrl: 'https://vimeo.com/76979871',
        tag: 'Vimeo Video'
      },
      {
        title: "Internet Archive: Elephant's Dream (2006)",
        url: 'https://archive.org/embed/ElephantsDream',
        desc: 'Free open culture film archive by Ton Roosendaal and Orange Open Movie Team.',
        actionUrl: 'https://archive.org/embed/ElephantsDream',
        tag: 'Archive Video'
      },
      {
        title: 'HTML5 Multi-Video Test Lab',
        url: 'internal://video-lab',
        desc: 'Multi-stream HTML5 testing suite with simultaneous media channels and speed injection.',
        actionUrl: 'internal://video-lab',
        tag: 'Local Portal'
      }
    ];

    return (
      <div className="flex-1 bg-white text-slate-900 flex flex-col p-4 overflow-y-auto">
        {/* Google Branding Header */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="text-3xl font-bold tracking-tight mb-3">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>

          <div className="w-full max-w-md flex items-center gap-2 border border-slate-300 shadow-sm rounded-full px-3.5 py-1.5 hover:shadow-md transition-shadow">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Google or type a URL..."
              defaultValue={browser.inputUrl.includes('search?q=') ? decodeURIComponent(browser.inputUrl.split('search?q=')[1]) : ''}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query = (e.target as HTMLInputElement).value;
                  handleNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
                }
              }}
              className="w-full text-xs outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Search Results List */}
        <div className="max-w-xl mx-auto w-full mt-2 space-y-3">
          <div className="text-[11px] text-slate-500 border-b border-slate-200 pb-1 flex items-center justify-between">
            <span>Web & Video Search Results for Browser {browser.id + 1}</span>
            <span className="text-emerald-600 font-semibold">● Live Links</span>
          </div>

          {searchResults.map((res, i) => (
            <div key={i} className="group">
              <div className="text-[11px] text-slate-600 truncate flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                  {res.tag}
                </span>
                <span className="font-mono text-[10px]">{res.url}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNavigate(res.actionUrl)}
                className="text-left text-sm font-semibold text-[#1a0dab] hover:underline block leading-snug"
              >
                {res.title}
              </button>
              <p className="text-xs text-[#4d5156] line-clamp-2 mt-0.5">
                {res.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] border border-[#21262d] overflow-hidden relative select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg bg-emerald-950/95 border border-emerald-500 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Progress loading bar */}
      {isLoading && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse z-40" />
      )}

      {/* Browser Controls / Chrome Bar */}
      {!isFullScreen && (
        <div className="bg-[#161b22] border-b border-[#30363d] px-2.5 py-1.5 flex flex-col gap-1.5 z-20 shrink-0">
          {/* Top Row: Browser ID Badge, Title, Bookmarks, Speed Selector, Mute */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="px-2 py-0.5 rounded text-[11px] font-black border tracking-wider shrink-0"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: accentColor,
                  color: accentColor
                }}
              >
                BROWSER {browser.id + 1}
              </span>
              <span className="text-xs font-bold text-slate-200 truncate max-w-[140px] sm:max-w-[240px]">
                {browser.title}
              </span>
            </div>

            <div className="flex items-center gap-1.5 relative">
              {/* Quick Bookmarks / Portal Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBookmarksOpen(!bookmarksOpen)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-300 text-[11px] font-medium transition-colors"
                  title="Bookmarks & Popular Video Portals"
                >
                  <Bookmark className="w-3 h-3 text-amber-400" />
                  <span className="hidden sm:inline">Portals</span>
                </button>

                {bookmarksOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-[#1c2128] border border-[#30363d] rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#30363d]">
                      MultiBrowser Portals
                    </div>
                    {BROWSER_BOOKMARKS.map((bm) => (
                      <button
                        key={bm.name}
                        type="button"
                        onClick={() => {
                          setBookmarksOpen(false);
                          handleNavigate(bm.url);
                        }}
                        className="w-full px-3 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-[#2d333b] transition-colors"
                      >
                        <span className="text-base">{bm.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-slate-100 font-semibold truncate">{bm.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{bm.title}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Speed Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-slate-200 text-[11px] font-bold transition-colors"
                  title="Independent Playback Speed"
                >
                  <Gauge className="w-3 h-3 text-blue-400" />
                  <span>{browser.speed}x</span>
                </button>

                {speedMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-28 bg-[#1c2128] border border-[#30363d] rounded-lg shadow-2xl py-1 z-50">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-[#30363d]">
                      Playback Speed
                    </div>
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-[#2d333b] transition-colors ${
                          browser.speed === spd
                            ? 'text-blue-400 font-bold bg-blue-500/10'
                            : 'text-slate-200'
                        }`}
                      >
                        <span>{spd}x</span>
                        {browser.speed === spd && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mute Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded hover:bg-[#21262d] text-slate-400 hover:text-slate-100 transition-colors"
                title={browser.isMuted ? 'Unmute' : 'Mute'}
              >
                {browser.isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Bottom Row: Back, Forward, Reload, Home, Omnibar with Lock & Search */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!canGoBack}
              onClick={handleBack}
              className={`p-1 rounded transition-colors ${
                canGoBack
                  ? 'text-slate-300 hover:bg-[#21262d] hover:text-white'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Back"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={!canGoForward}
              onClick={handleForward}
              className={`p-1 rounded transition-colors ${
                canGoForward
                  ? 'text-slate-300 hover:bg-[#21262d] hover:text-white'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
              title="Forward"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1 rounded text-slate-400 hover:bg-[#21262d] hover:text-slate-100 transition-colors"
              title="Refresh"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleHome}
              className="p-1 rounded text-slate-400 hover:bg-[#21262d] hover:text-slate-100 transition-colors"
              title="Home Portal"
            >
              <Home className="w-3.5 h-3.5" />
            </button>

            {/* Omnibar (URL and Search bar) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleNavigate(browser.inputUrl);
              }}
              className="flex-1 flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] focus-within:border-blue-500 rounded-lg px-2.5 py-1 transition-colors"
            >
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={browser.inputUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  onUpdate(browser.id, (prev) => ({ ...prev, inputUrl: val }));
                }}
                placeholder="Enter website URL or search (e.g. youtube.com, wikipedia.org)..."
                className="w-full bg-transparent text-xs text-slate-200 outline-none font-mono placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors shrink-0"
              >
                Go
              </button>
              <button
                type="button"
                onClick={() => window.open(browser.url, '_blank')}
                className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-[#21262d] transition-colors shrink-0"
                title="Open current URL in dedicated window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Web Page Viewport */}
      <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
        {browser.displayMode === 'html5_portal' ? (
          renderInternalVideoLab()
        ) : browser.displayMode === 'youtube_portal' ? (
          renderYouTubePortal()
        ) : browser.displayMode === 'google_search' ? (
          renderGoogleSearch()
        ) : (
          <div className="w-full h-full relative">
            <iframe
              ref={iframeRef}
              src={browser.url}
              title={browser.title}
              sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 bg-white"
              onError={() => setIframeError(true)}
            />

            {/* In case a website refuses iframes (X-Frame-Options) */}
            {iframeError && (
              <div className="absolute inset-0 bg-[#0d1117] flex flex-col items-center justify-center p-6 text-center z-10">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <h4 className="text-sm font-bold text-white">Website Security Policy Notice</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                  The website <strong className="text-slate-200">{browser.url}</strong> specifies{' '}
                  <code className="text-amber-300 font-mono">X-Frame-Options: SAMEORIGIN</code> which restricts embedding inside a nested web frame.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleNavigate('https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?enablejsapi=1&autoplay=1&mute=1')}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Load YouTube Embed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavigate('internal://video-lab')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                  >
                    Open HTML5 Video Lab
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
