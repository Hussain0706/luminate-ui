import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FileJson,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

export const ExportModal: React.FC = () => {
  const isExportModalOpen = useWorkflowStore((s) => s.isExportModalOpen);
  const setExportModalOpen = useWorkflowStore((s) => s.setExportModalOpen);
  const exportAsJson = useWorkflowStore((s) => s.exportAsJson);
  const exportAsMermaid = useWorkflowStore((s) => s.exportAsMermaid);

  const [activeTab, setActiveTab] = useState<'mermaid' | 'json'>('mermaid');
  const [copied, setCopied] = useState(false);

  if (!isExportModalOpen) return null;

  const jsonContent = exportAsJson();
  const mermaidContent = exportAsMermaid();
  const activeContent = activeTab === 'mermaid' ? mermaidContent : jsonContent;

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundEffects.playClick();
    const filename = activeTab === 'mermaid' ? 'workflow-graph.mmd' : 'luminate-workflow.json';
    const mime = activeTab === 'mermaid' ? 'text/plain' : 'application/json';
    const blob = new Blob([activeContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 select-none text-xs"
      onClick={() => setExportModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#10121a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Export Workflow</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Download or copy graph as Mermaid flowchart or JSON schema.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setExportModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch & Actions */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#12141c]">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0c0e14] p-1 rounded-lg">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('mermaid');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'mermaid'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Mermaid Diagram</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('json');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Full Workflow JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 flex-1 overflow-auto bg-slate-50 dark:bg-[#0c0e14] font-mono text-xs max-h-96">
          <pre className="text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto p-3.5 rounded-lg bg-white dark:bg-[#161923] border border-slate-200 dark:border-slate-800 shadow-xs">
            {activeContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
