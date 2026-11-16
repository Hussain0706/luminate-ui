import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  Database,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { webLLMService } from '../../services/webllmService';
import { ModelOption, WebLLMStatus } from '../../types';
import { soundEffects } from '../../services/soundFx';

export const WebLLMModal: React.FC = () => {
  const isWebLLMModalOpen = useWorkflowStore((s) => s.isWebLLMModalOpen);
  const setWebLLMModalOpen = useWorkflowStore((s) => s.setWebLLMModalOpen);
  const setEngineMode = useWorkflowStore((s) => s.setEngineMode);

  const [status, setStatus] = useState<WebLLMStatus>(webLLMService.getStatus());
  const [selectedModel, setSelectedModel] = useState<ModelOption>('Qwen2.5-0.5B-Instruct-q4f16_1-MLC');

  useEffect(() => {
    const unsubscribe = webLLMService.subscribe((newStatus) => {
      setStatus(newStatus);
    });
    return unsubscribe;
  }, []);

  if (!isWebLLMModalOpen) return null;

  const handleInitialize = async () => {
    soundEffects.playClick();
    const success = await webLLMService.initializeEngine(selectedModel);
    if (success) {
      soundEffects.playSuccess();
      setEngineMode('webllm');
    } else {
      soundEffects.playWarn();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 select-none text-xs"
      onClick={() => setWebLLMModalOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#10121a] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Real Browser AI (WebGPU Local LLM)</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  100% Free Client-Side
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Execute open-weights SLMs directly on your device GPU via WebGPU and `@mlc-ai/web-llm`.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              setWebLLMModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Hardware Compatibility Check */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>WebGPU Hardware Status</span>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  status.isSupported
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {status.isSupported ? '✓ WebGPU Enabled' : '⚠ WebGPU Unavailable'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {status.isSupported
                ? 'Your browser supports modern WebGPU hardware acceleration. Shaders and tensor weights run locally with zero server calls.'
                : 'WebGPU is not detected in this browser session. You can still use the instant, zero-download Simulated Agent Engine!'}
            </p>
          </div>

          {/* Model Options */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-2">Select Free Local Model:</label>
            <div className="space-y-2">
              {[
                {
                  id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC' as ModelOption,
                  name: 'Qwen2.5-0.5B-Instruct',
                  size: '~390 MB (q4f16)',
                  desc: 'Optimal balance of structured tool-calling, speed, and reasoning.',
                },
                {
                  id: 'SmolLM2-360M-Instruct-q4f16_1-MLC' as ModelOption,
                  name: 'SmolLM2-360M-Instruct',
                  size: '~230 MB (q4f16)',
                  desc: 'Ultralight model designed specifically for edge browser execution.',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    selectedModel === m.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-[#161923] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{m.name}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700">
                        {m.size}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{m.desc}</p>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedModel === m.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {selectedModel === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download Progress */}
          {status.isLoading && (
            <div className="space-y-2 p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 dark:text-slate-400">Loading Weights...</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.round(status.downloadProgress)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${status.downloadProgress}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{status.progressText}</div>
            </div>
          )}

          {status.error && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-[#10121a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setEngineMode('simulated');
              setWebLLMModalOpen(false);
            }}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium"
          >
            Use Simulated Engine (Instant)
          </button>

          <button
            onClick={handleInitialize}
            disabled={status.isLoading || !status.isSupported}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{status.isLoaded ? 'Engine Ready' : 'Load Model to GPU'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
