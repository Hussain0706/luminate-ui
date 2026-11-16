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
  selected,
}: EdgeProps<any>) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const setActiveEdgeModalId = useWorkflowStore((s) => (s as any).setActiveEdgeModalId);

  const status = data?.status || 'idle';
  const label = data?.label || '';
  const isFallback = !!data?.isFallback;

  // Determine edge color and glow based on status
  let strokeColor = '#334155'; // default slate-700
  let strokeWidth = 2;
  let isDashed = false;
  let glowFilter = '';

  if (status === 'active') {
    strokeColor = '#38bdf8'; // sky
    strokeWidth = 3;
    isDashed = true;
    glowFilter = 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.9))';
  } else if (status === 'passed') {
    strokeColor = '#10b981'; // emerald
    strokeWidth = 2.5;
    glowFilter = 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.7))';
  } else if (status === 'skipped') {
    strokeColor = '#1e293b'; // dim
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
          strokeDasharray: isDashed ? '6,6' : undefined,
          filter: glowFilter,
          transition: 'all 0.3s ease',
        }}
      />

      {/* Animated glowing particle packet traveling along edge when active */}
      {status === 'active' && (
        <circle r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)">
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
              className={`group flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border backdrop-blur-md transition-all duration-300 shadow-md active:scale-95 cursor-pointer ${
                status === 'active'
                  ? 'bg-sky-500/25 text-sky-200 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.6)] animate-pulse'
                  : status === 'passed'
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : status === 'skipped'
                  ? 'bg-slate-900/80 text-slate-500 border-slate-800 opacity-60'
                  : isFallback
                  ? 'bg-slate-900/90 text-purple-300 border-purple-500/50 hover:border-purple-400 hover:bg-slate-800'
                  : 'bg-slate-900/95 text-slate-200 border-slate-700 hover:border-sky-400 hover:bg-slate-800'
              }`}
            >
              {isFallback ? (
                <CornerDownRight className="w-3 h-3 text-purple-400" />
              ) : (
                <GitBranch className="w-3 h-3 text-sky-400" />
              )}
              <span>{label}</span>
              {status === 'passed' && <Check className="w-3 h-3 text-emerald-400" />}
              <Sliders className="w-2.5 h-2.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const ConditionalEdge = memo(ConditionalEdgeComponent);
