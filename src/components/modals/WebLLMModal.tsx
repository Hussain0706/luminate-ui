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
    const success = await webLLMService.initializeEngine(selectedModel);
    if (success) {
      setEngineMode('webllm');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Real Browser AI (WebGPU Local LLM)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  100% Free Client-Side
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Execute open-weights SLMs directly on your device GPU via WebGPU and `@mlc-ai/web-llm`.
              </p>
            </div>
          </div>

          <button
            onClick={() => setWebLLMModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Hardware Compatibility Check */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-sky-400" />
                <span>WebGPU Hardware Status</span>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  status.isSupported
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {status.isSupported ? '✓ WebGPU Enabled' : '⚠ WebGPU Unavailable'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {status.isSupported
                ? 'Your browser supports modern WebGPU hardware acceleration. Shaders and tensor weights run locally with zero server calls.'
                : 'WebGPU is not detected in this browser session. You can still use the instant, zero-download Simulated Agent Engine!'}
            </p>
          </div>

          {/* Model Options */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Select Free Local Model:</label>
            <div className="space-y-2">
              <div
                onClick={() => setSelectedModel('Qwen2.5-0.5B-Instruct-q4f16_1-MLC')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedModel === 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'
                    ? 'bg-purple-950/30 border-purple-400 shadow-md ring-1 ring-purple-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-100">Qwen 2.5 (0.5B Instruct)</span>
                  <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                    Recommended (~350MB)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Exceptional structured JSON output, fast inference, and strong agent reasoning.
                </p>
              </div>

              <div
                onClick={() => setSelectedModel('SmolLM2-360M-Instruct-q4f16_1-MLC')}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedModel === 'SmolLM2-360M-Instruct-q4f16_1-MLC'
                    ? 'bg-purple-950/30 border-purple-400 shadow-md ring-1 ring-purple-400'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-100">SmolLM2 (360M Instruct)</span>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
                    Ultra-Light (~250MB)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Minimal memory footprint, instant compilation, ideal for lower-spec GPUs.
                </p>
              </div>
            </div>
          </div>

          {/* Download & Initialization Progress Bar */}
          {status.isLoading && (
            <div className="p-3 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-purple-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 animate-bounce" />
                  <span>{status.progressText || 'Loading model weights into GPU...'}</span>
                </span>
                <span className="text-purple-400 font-bold">{status.downloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-sky-400 transition-all duration-300"
                  style={{ width: `${status.downloadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Model weights are cached in browser IndexedDB/CacheStorage for instant future reloads.
              </p>
            </div>
          )}

          {status.isLoaded && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Model loaded and compiled in browser GPU memory! WebGPU AI mode is active.</span>
            </div>
          )}

          {status.error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Notice: WebGPU Initialization</span>
              </div>
              <p className="text-[11px]">{status.error}</p>
              <p className="text-[10px] text-slate-400 pt-1">
                You can switch back to the Simulated Engine at any time for instant 0-download execution.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              setEngineMode('simulated');
              setWebLLMModalOpen(false);
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            Use Simulated Engine Instead
          </button>

          <button
            onClick={handleInitialize}
            disabled={status.isLoading || !status.isSupported}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{status.isLoaded ? 'Reload Engine' : 'Load & Cache Model'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
