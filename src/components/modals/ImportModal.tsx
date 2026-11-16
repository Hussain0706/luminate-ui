import React, { useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

export const ImportModal: React.FC = () => {
  const isImportModalOpen = useWorkflowStore((s) => s.isImportModalOpen);
  const setImportModalOpen = useWorkflowStore((s) => s.setImportModalOpen);
  const importWorkflow = useWorkflowStore((s) => s.importWorkflow);

  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isImportModalOpen) return null;

  const handleImport = () => {
    soundEffects.playClick();
    if (!jsonText.trim()) {
      setError('Please provide workflow JSON');
      return;
    }

    const ok = importWorkflow(jsonText);
    if (ok) {
      soundEffects.playSuccess();
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        setSuccess(false);
        setImportModalOpen(false);
      }, 1000);
    } else {
      soundEffects.playWarn();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 select-none text-xs"
      onClick={() => setImportModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#10121a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Import Workflow</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Paste JSON workflow schema or upload an exported configuration file.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setImportModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 flex-1 flex flex-col">
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Workflow imported successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Paste JSON string:</span>
            <label className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium">
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
            rows={10}
            placeholder={`{\n  "nodes": [...],\n  "edges": [...]\n}`}
            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-600 leading-relaxed resize-none shadow-xs"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#10121a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              setImportModalOpen(false);
            }}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Load Workflow</span>
          </button>
        </div>
      </div>
    </div>
  );
};
