import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { GitBranch, Check, CornerDownRight } from 'lucide-react';

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
    glowFilter = 'drop-shadow(0 0 6px rgba(56, 189, 248, 0.8))';
  } else if (status === 'passed') {
    strokeColor = '#10b981'; // emerald
    strokeWidth = 2.5;
    glowFilter = 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))';
  } else if (status === 'skipped') {
    strokeColor = '#1e293b'; // dim
    strokeWidth = 1.5;
    isDashed = true;
  }

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
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border backdrop-blur-md transition-all duration-300 shadow-sm ${
                status === 'active'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.5)] animate-pulse'
                  : status === 'passed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : status === 'skipped'
                  ? 'bg-slate-900/60 text-slate-500 border-slate-800 opacity-60'
                  : isFallback
                  ? 'bg-slate-900/90 text-purple-300 border-purple-500/30'
                  : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-slate-500'
              }`}
            >
              {isFallback ? (
                <CornerDownRight className="w-2.5 h-2.5 text-purple-400" />
              ) : (
                <GitBranch className="w-2.5 h-2.5 text-sky-400" />
              )}
              <span>{label}</span>
              {status === 'passed' && <Check className="w-2.5 h-2.5 text-emerald-400" />}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export const ConditionalEdge = memo(ConditionalEdgeComponent);
