import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const ImportModal: React.FC = () => {
  const isImportModalOpen = useWorkflowStore((s) => s.isImportModalOpen);
  const setImportModalOpen = useWorkflowStore((s) => s.setImportModalOpen);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);

  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isImportModalOpen) return null;

  const handleImport = () => {
    if (!jsonText.trim()) {
      setError('Please provide workflow JSON');
      return;
    }

    const ok = importWorkflow(jsonText);
    if (ok) {
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        setSuccess(false);
        setImportModalOpen(false);
      }, 1000);
    } else {
      setError('Invalid workflow JSON format. Must contain "nodes" and "edges" arrays.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setError(null);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Import Workflow</h3>
              <p className="text-xs text-slate-400">
                Paste JSON workflow schema or upload a exported configuration file.
              </p>
            </div>
          </div>

          <button
            onClick={() => setImportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {error && (
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Workflow imported successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Paste JSON string:</span>
            <label className="text-sky-400 hover:text-sky-300 cursor-pointer font-medium">
              <span>Upload .json file</span>
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setError(null);
            }}
            placeholder='{"nodes": [...], "edges": [...]}'
            rows={10}
            className="w-full flex-1 p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs outline-none focus:border-purple-500 leading-relaxed resize-none shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={() => setImportModalOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95"
          >
            Import to Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
