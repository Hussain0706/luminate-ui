import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Sparkles } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';

export const CanvasToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const resetExecutionState = useWorkflowStore((s) => s.resetExecutionState);

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl">
      <button
        onClick={() => zoomIn({ duration: 200 })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <button
        onClick={() => zoomOut({ duration: 200 })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <button
        onClick={() => fitView({ padding: 0.2, duration: 400 })}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        title="Fit View"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-slate-800 my-auto" />

      <button
        onClick={() => resetExecutionState()}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
        title="Reset Node Execution Statuses"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset State</span>
      </button>
    </div>
  );
};
