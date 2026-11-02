import React, { useState } from 'react';
import {
  FileCode2,
  FolderGit2,
  Download,
  Copy,
  Check,
  Code2,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { ANDROID_FILES, AndroidFileItem } from '../data/androidProjectFiles';
import { generateAndroidProjectZip, downloadBlob } from '../utils/zipExporter';

export const AndroidCodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFileItem>(ANDROID_FILES[3]); // MainActivity.kt by default
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsExporting(true);
      const blob = await generateAndroidProjectZip();
      downloadBlob(blob, 'multibrowser-pro-android.zip');
    } catch (err) {
      console.error('Failed to export ZIP', err);
    } finally {
      setIsExporting(false);
    }
  };

  const kotlinFiles = ANDROID_FILES.filter((f) => f.category === 'kotlin');
  const gradleFiles = ANDROID_FILES.filter((f) => f.category === 'gradle');
  const otherFiles = ANDROID_FILES.filter(
    (f) => f.category !== 'kotlin' && f.category !== 'gradle'
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-[#0d1117] text-slate-200 overflow-hidden">
      {/* File Tree Sidebar */}
      <div className="w-full md:w-80 bg-[#161b22] border-r border-[#30363d] flex flex-col h-auto md:h-full shrink-0">
        <div className="p-4 border-b border-[#30363d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Project Structure
            </span>
          </div>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadZip}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            title="Download complete project ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Zipping...' : 'Export ZIP'}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Kotlin Components */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Kotlin Architecture ({kotlinFiles.length})</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {kotlinFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-[#21262d] hover:text-slate-200'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span className="truncate">{file.path.split('/').pop()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Gradle Build Files */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Gradle & Dependencies ({gradleFiles.length})</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {gradleFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-[#21262d] hover:text-slate-200'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manifest, Workflow & Docs */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manifest & Workflows ({otherFiles.length})</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {otherFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                    selectedFile.path === file.path
                      ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                      : 'text-slate-400 hover:bg-[#21262d] hover:text-slate-200'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">{file.path.split('/').pop()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 flex flex-col h-full bg-[#0d1117] overflow-hidden">
        {/* Code Header Bar */}
        <div className="px-5 py-3 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-2">
              <span>{selectedFile.path}</span>
              <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {selectedFile.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {selectedFile.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-[#30363d]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 bg-[#0d1117]">
          <pre className="whitespace-pre">
            {selectedFile.content.split('\n').map((line, index) => (
              <div key={index} className="flex hover:bg-slate-800/30 rounded px-1">
                <span className="w-10 text-slate-600 text-right pr-4 select-none">
                  {index + 1}
                </span>
                <span className="flex-1">{line}</span>
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};
