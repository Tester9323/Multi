import React from 'react';
import { X, GitBranch, Terminal, Download, ShieldCheck, Cpu } from 'lucide-react';
import { generateAndroidProjectZip, downloadBlob } from '../utils/zipExporter';

interface BuildGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuildGuideModal: React.FC<BuildGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    const blob = await generateAndroidProjectZip();
    downloadBlob(blob, 'multibrowser-pro-android.zip');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                APK Build & GitHub Actions CI Guide
              </h2>
              <p className="text-xs text-slate-400">
                How to export, push to GitHub, and build the native Android APK
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* Method 1: GitHub Actions CI */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <GitBranch className="w-4 h-4" />
                <span>Method 1: Automated Build via GitHub Actions (Recommended)</span>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                No Local Android SDK Needed
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The project is already pre-configured with a continuous integration workflow located at{' '}
              <code className="text-blue-300 font-mono">.github/workflows/build-apk.yml</code>.
            </p>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-slate-500"># 1. Download or clone this project</div>
              <div>git init</div>
              <div>git add .</div>
              <div>git commit -m &quot;Initial commit: MultiBrowser Pro&quot;</div>
              <div className="text-slate-500 mt-2"># 2. Push to your GitHub repository</div>
              <div>git remote add origin https://github.com/YOUR_USER/multibrowser-pro.git</div>
              <div>git branch -M main</div>
              <div>git push -u origin main</div>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">What happens automatically:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li>GitHub Actions spins up an Ubuntu VM with JDK 17.</li>
                <li>Runs <code className="text-slate-200 font-mono">./gradlew assembleDebug</code>.</li>
                <li>
                  Outputs and uploads the artifact at:{' '}
                  <code className="text-emerald-400 font-mono">
                    app/build/outputs/apk/debug/app-debug.apk
                  </code>
                </li>
                <li>Download your ready-to-install debug APK directly from the GitHub Actions run page.</li>
              </ul>
            </div>
          </div>

          {/* Method 2: Local Gradle Build */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Terminal className="w-4 h-4" />
              <span>Method 2: Local Terminal or Android Studio Build</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If you have Android Studio or the Android SDK Platform 34 and JDK 17 installed locally:
            </p>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-slate-500"># Grant execute permissions</div>
              <div>chmod +x gradlew</div>
              <div className="text-slate-500 mt-1"># Assemble debug APK</div>
              <div>./gradlew assembleDebug</div>
              <div className="text-slate-500 mt-1"># Generated APK artifact path:</div>
              <div className="text-emerald-400">app/build/outputs/apk/debug/app-debug.apk</div>
            </div>
          </div>

          {/* One-click Export Action */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-950/20 border border-blue-500/30">
            <div>
              <h4 className="text-xs font-bold text-slate-200">Export Complete Project Bundle</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Download all Kotlin files, Gradle wrapper, AndroidManifest.xml, and GitHub Actions workflow in a single ZIP.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadZip}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Project .ZIP</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-200 text-xs font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
