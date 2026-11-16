import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Map,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

export const CanvasToolbar: React.FC = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const resetExecutionState = useWorkflowStore((s) => s.resetExecutionState);
  const autoArrangeGraph = useWorkflowStore((s) => s.autoArrangeGraph);
  const isMiniMapVisible = useWorkflowStore((s) => s.isMiniMapVisible);
  const toggleMiniMap = useWorkflowStore((s) => s.toggleMiniMap);

  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');

  const handleAutoLayout = () => {
    soundEffects.playBlip();
    autoArrangeGraph(direction);
    setTimeout(() => {
      fitView({ padding: 0.25, duration: 350 });
    }, 50);
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-white/90 dark:bg-[#151822]/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md select-none text-xs">
      {/* Auto-Layout Action */}
      <button
        onClick={handleAutoLayout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors active:scale-95"
        title="Automatically arrange nodes cleanly into a hierarchical DAG"
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
          setTimeout(() => fitView({ padding: 0.25, duration: 350 }), 50);
        }}
        className="px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-mono font-medium"
        title={`Orientation: ${direction === 'LR' ? 'Horizontal (Left to Right)' : 'Vertical (Top to Bottom)'}. Click to switch.`}
      >
        {direction === 'LR' ? (
          <span className="flex items-center gap-1">LR <ArrowRight className="w-3 h-3 text-blue-600 dark:text-blue-400" /></span>
        ) : (
          <span className="flex items-center gap-1">TB <ArrowDown className="w-3 h-3 text-indigo-600 dark:text-indigo-400" /></span>
        )}
      </button>

      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 my-auto" />

      {/* Zoom in */}
      <button
        onClick={() => {
          soundEffects.playClick();
          zoomIn({ duration: 200 });
        }}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Fit view */}
      <button
        onClick={() => {
          soundEffects.playClick();
          fitView({ padding: 0.25, duration: 350 });
        }}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Fit all nodes on screen"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* MiniMap Toggle */}
      <button
        onClick={() => {
          soundEffects.playClick();
          toggleMiniMap();
        }}
        className={`p-1.5 rounded-lg transition-colors ${
          isMiniMapVisible
            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title={isMiniMapVisible ? 'Hide MiniMap' : 'Show MiniMap'}
      >
        <Map className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800 my-auto" />

      {/* Reset State */}
      <button
        onClick={() => {
          soundEffects.playClick();
          resetExecutionState();
        }}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Reset Node Statuses"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset</span>
      </button>
    </div>
  );
};
