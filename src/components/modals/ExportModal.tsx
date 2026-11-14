import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  FileJson,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

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
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Export Workflow</h3>
              <p className="text-xs text-slate-400">
                Download or copy graph as Mermaid flowchart or JSON schema.
              </p>
            </div>
          </div>

          <button
            onClick={() => setExportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mermaid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'mermaid'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Mermaid Diagram</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'json'
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Full Workflow JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-medium transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4 flex-1 overflow-auto bg-slate-950 font-mono text-xs max-h-96">
          <pre className="text-slate-200 leading-relaxed overflow-x-auto p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            {activeContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
