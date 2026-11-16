import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { GitBranch, Check, CornerDownRight, Sliders } from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

const ConditionalEdgeComponent = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps<any>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const setActiveEdgeModalId = useWorkflowStore((s) => s.setActiveEdgeModalId);
  const theme = useWorkflowStore((s) => s.theme);

  const status = data?.status || 'idle';
  const label = data?.label || '';
  const isFallback = !!data?.isFallback;

  // Determine edge color based on status and theme
  const isDark = theme === 'dark';
  let strokeColor = isDark ? '#334155' : '#cbd5e1';
  let strokeWidth = 2;
  let isDashed = false;

  if (status === 'active') {
    strokeColor = '#2563eb'; // blue-600
    strokeWidth = 3;
    isDashed = true;
  } else if (status === 'passed') {
    strokeColor = '#059669'; // emerald-600
    strokeWidth = 2.5;
  } else if (status === 'skipped') {
    strokeColor = isDark ? '#1e293b' : '#e2e8f0';
    strokeWidth = 1.5;
    isDashed = true;
  }

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    if (setActiveEdgeModalId) {
      setActiveEdgeModalId(id);
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isDashed ? '5,5' : undefined,
          transition: 'stroke 0.3s ease, stroke-width 0.2s ease',
        }}
      />

      {/* Animated particle pulse traveling along active edge */}
      {status === 'active' && (
        <circle r="3.5" fill="#2563eb">
          <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button
              type="button"
              onClick={handleEdgeClick}
              title="Click to edit condition logic"
              className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border shadow-sm transition-all duration-150 cursor-pointer ${
                status === 'active'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-400 font-bold'
                  : status === 'passed'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-400 font-bold'
                  : status === 'skipped'
                  ? 'bg-slate-100 text-slate-400 dark:bg-slate-900/80 dark:text-slate-500 border-slate-200 dark:border-slate-800 opacity-60'
                  : isFallback
                  ? 'bg-white text-indigo-700 dark:bg-slate-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400'
                  : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-500'
              }`}
            >
              {isFallback ? (
                <CornerDownRight className="w-3 h-3 text-indigo-500" />
              ) : (
                <GitBranch className="w-3 h-3 text-blue-500" />
              )}
              <span>{label}</span>
              {status === 'passed' && <Check className="w-3 h-3 text-emerald-600" />}
              <Sliders className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const ConditionalEdge = memo(ConditionalEdgeComponent);
