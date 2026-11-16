import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Sparkles, Layout, ArrowRight, ArrowDown } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

export const CanvasToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const resetExecutionState = useWorkflowStore((s) => s.resetExecutionState);
  const autoArrangeGraph = useWorkflowStore((s) => s.autoArrangeGraph);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');

  const handleAutoLayout = () => {
    soundEffects.playBlip();
    autoArrangeGraph(direction);
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 400 });
    }, 50);
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl select-none">
      {/* Auto-Layout Action */}
      <button
        onClick={handleAutoLayout}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-sky-400 hover:text-white hover:bg-sky-500/20 border border-sky-500/30 transition-all shadow-sm active:scale-95"
        title="Automatically Arrange Agent Nodes Cleanly"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Auto-Arrange</span>
      </button>

      {/* Direction toggle */}
      <button
        onClick={() => {
          soundEffects.playClick();
          const next = direction === 'LR' ? 'TB' : 'LR';
          setDirection(next);
          autoArrangeGraph(next);
          setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
        }}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-[10px] font-mono font-bold"
        title={`Current Layout: ${direction === 'LR' ? 'Left-to-Right' : 'Top-to-Bottom'}. Click to toggle.`}
      >
        {direction === 'LR' ? (
          <span className="flex items-center gap-0.5">LR <ArrowRight className="w-3 h-3 text-sky-400" /></span>
        ) : (
          <span className="flex items-center gap-0.5">TB <ArrowDown className="w-3 h-3 text-purple-400" /></span>
        )}
      </button>

      <div className="w-[1px] h-4 bg-slate-800 my-auto" />

      {/* Zoom in */}
      <button
        onClick={() => {
          soundEffects.playClick();
          zoomIn({ duration: 200 });
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom out */}
      <button
        onClick={() => {
          soundEffects.playClick();
          zoomOut({ duration: 200 });
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Fit view */}
      <button
        onClick={() => {
          soundEffects.playClick();
          fitView({ padding: 0.2, duration: 400 });
        }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Fit View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 my-auto" />

      {/* Reset State */}
      <button
        onClick={() => {
          soundEffects.playClick();
          resetExecutionState();
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        title="Reset Node Execution Statuses"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
