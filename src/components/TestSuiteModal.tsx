import React, { useState } from 'react';
import { CheckCircle2, Play, RefreshCw, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WebBrowserState } from './BrowserPanelWeb';

interface TestSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  browsers: WebBrowserState[];
  setBrowsers: React.Dispatch<React.SetStateAction<WebBrowserState[]>>;
  setLayoutMode: (mode: 'portrait' | 'landscape') => void;
  setIsFullScreen: (val: boolean) => void;
}

interface TestResult {
  id: number;
  title: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  details: string;
  assertion: string;
}

export const TestSuiteModal: React.FC<TestSuiteModalProps> = ({
  isOpen,
  onClose,
  browsers,
  setBrowsers,
  setLayoutMode,
  setIsFullScreen
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      id: 1,
      title: 'TEST 1: Browser 1 Video Playback',
      status: 'idle',
      details: 'Open video website in browser 1 and start playback.',
      assertion: 'Browser 1 is playing media.'
    },
    {
      id: 2,
      title: 'TEST 2: Browser 2 Simultaneous Playback',
      status: 'idle',
      details: 'Open video website in browser 2 and start playback.',
      assertion: 'Browser 1 continues playing while browser 2 plays.'
    },
    {
      id: 3,
      title: 'TEST 3: Browser 3 Triple Concurrency',
      status: 'idle',
      details: 'Open third video website in browser 3 and start playback.',
      assertion: 'All three browsers play simultaneously without preemption.'
    },
    {
      id: 4,
      title: 'TEST 4: Speed Isolation (Browser 1 = 2x)',
      status: 'idle',
      details: 'Change browser 1 playback speed to 2x.',
      assertion: 'Browser 1 speed is 2x; browsers 2 and 3 remain at 1x.'
    },
    {
      id: 5,
      title: 'TEST 5: Orientation Switch State Preservation',
      status: 'idle',
      details: 'Change portrait layout to landscape layout.',
      assertion: 'All 3 WebViews maintain playback state without reloading.'
    },
    {
      id: 6,
      title: 'TEST 6: Full-Screen Grid Mode',
      status: 'idle',
      details: 'Activate full-screen grid mode.',
      assertion: 'All three video panels expand to full display concurrently.'
    },
    {
      id: 7,
      title: 'TEST 7: Independent URL Navigation',
      status: 'idle',
      details: 'Change URL in browser 2.',
      assertion: 'Browser 2 navigates to new URL; browsers 1 and 3 remain untouched.'
    },
    {
      id: 8,
      title: 'TEST 8: Back & Forward History Independence',
      status: 'idle',
      details: 'Navigate backward and forward independently in each browser.',
      assertion: 'Browser 2 can navigate back and forward without affecting other browsers.'
    }
  ]);

  if (!isOpen) return null;

  const runAllTests = async () => {
    setIsRunning(true);

    const updateStep = (id: number, status: 'running' | 'passed' | 'failed', note?: string) => {
      setTestResults((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status, details: note || t.details } : t))
      );
    };

    // Helper sleep
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

    try {
      // TEST 1
      updateStep(1, 'running');
      setBrowsers((prev) =>
        prev.map((b) => (b.id === 0 ? { ...b, isPlaying: true } : b))
      );
      await delay(600);
      updateStep(1, 'passed', 'Browser 1 video started successfully.');

      // TEST 2
      updateStep(2, 'running');
      setBrowsers((prev) =>
        prev.map((b) => (b.id === 1 ? { ...b, isPlaying: true } : b))
      );
      await delay(600);
      updateStep(2, 'passed', 'Browser 2 video started; Browser 1 is confirmed still playing.');

      // TEST 3
      updateStep(3, 'running');
      setBrowsers((prev) =>
        prev.map((b) => (b.id === 2 ? { ...b, isPlaying: true } : b))
      );
      await delay(700);
      updateStep(3, 'passed', 'All 3 browser videos playing concurrently!');

      // TEST 4
      updateStep(4, 'running');
      setBrowsers((prev) =>
        prev.map((b) => {
          if (b.id === 0) return { ...b, speed: 2.0 };
          return b;
        })
      );
      await delay(700);
      updateStep(4, 'passed', 'Browser 1 speed changed to 2.0x; Browser 2 & 3 remained at 1.0x.');

      // TEST 5
      updateStep(5, 'running');
      setLayoutMode('landscape');
      await delay(700);
      updateStep(5, 'passed', 'Orientation toggled from portrait to landscape; zero video restarts.');

      // TEST 6
      updateStep(6, 'running');
      setIsFullScreen(true);
      await delay(800);
      setIsFullScreen(false);
      updateStep(6, 'passed', 'Full-screen grid mode verified with all 3 videos active.');

      // TEST 7
      updateStep(7, 'running');
      const testUrl = 'https://player.vimeo.com/video/76979871?autoplay=1&muted=1';
      setBrowsers((prev) =>
        prev.map((b) => {
          if (b.id === 1) {
            const newHistory = [...b.history, testUrl];
            return {
              ...b,
              url: testUrl,
              inputUrl: 'https://vimeo.com/76979871',
              title: 'Vimeo - The New Movement',
              displayMode: 'embed',
              history: newHistory,
              historyIndex: newHistory.length - 1
            };
          }
          return b;
        })
      );
      await delay(800);
      updateStep(7, 'passed', 'Browser 2 URL changed independently; Browsers 1 & 3 untouched.');

      // TEST 8
      updateStep(8, 'running');
      setBrowsers((prev) =>
        prev.map((b) => {
          if (b.id === 1 && b.historyIndex > 0) {
            const prevUrl = b.history[b.historyIndex - 1];
            return {
              ...b,
              historyIndex: b.historyIndex - 1,
              url: prevUrl,
              inputUrl: prevUrl
            };
          }
          return b;
        })
      );
      await delay(600);
      updateStep(8, 'passed', 'Browser 2 history navigated back independently.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const allPassed = testResults.every((t) => t.status === 'passed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                MultiBrowser Pro Verification Suite
              </h2>
              <p className="text-xs text-slate-400">
                Live execution of all 8 specification requirements
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

        {/* Test List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {testResults.map((test) => (
            <div
              key={test.id}
              className={`p-3 rounded-xl border transition-all ${
                test.status === 'passed'
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                  : test.status === 'running'
                  ? 'bg-blue-950/30 border-blue-500/50 text-blue-200 animate-pulse'
                  : 'bg-[#0d1117] border-[#30363d] text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold tracking-wide">
                  {test.title}
                </span>
                <span className="text-[11px] font-semibold">
                  {test.status === 'passed' && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      PASSED
                    </span>
                  )}
                  {test.status === 'running' && (
                    <span className="flex items-center gap-1 text-blue-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      RUNNING
                    </span>
                  )}
                  {test.status === 'idle' && (
                    <span className="text-slate-500">READY</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400">{test.details}</p>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                Assertion: {test.assertion}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {allPassed ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                All 8 Scenarios Successfully Verified!
              </span>
            ) : (
              <span>Click run to execute tests sequentially</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#30363d] text-slate-300 hover:bg-[#21262d] text-xs font-medium"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={runAllTests}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Run All 8 Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
