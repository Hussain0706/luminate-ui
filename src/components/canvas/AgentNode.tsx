import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Compass,
  Globe,
  ShieldCheck,
  BookOpen,
  FileText,
  PauseCircle,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  X,
  Save,
  Copy,
  Trash2,
} from 'lucide-react';
import { AgentNodeData, AgentRole, AgentStatus } from '../../types';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

const ROLE_CONFIG: Record<AgentRole, {
  icon: React.ElementType;
  title: string;
  badgeClass: string;
  accentBar: string;
}> = {
  supervisor: {
    icon: Compass,
    title: 'Supervisor',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    accentBar: 'bg-blue-600',
  },
  scraper: {
    icon: Globe,
    title: 'Web Scraper',
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    accentBar: 'bg-indigo-600',
  },
  router: {
    icon: ShieldCheck,
    title: 'Router / Guardrail',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    accentBar: 'bg-amber-500',
  },
  researcher: {
    icon: BookOpen,
    title: 'Fact Researcher',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    accentBar: 'bg-emerald-600',
  },
  writer: {
    icon: FileText,
    title: 'Summary Writer',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
    accentBar: 'bg-purple-600',
  },
};

const STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  badgeClass: string;
  cardBorderClass: string;
  icon: React.ElementType;
  dotColor: string;
}> = {
  IDLE: {
    label: 'Idle',
    badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    cardBorderClass: 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700',
    icon: Clock,
    dotColor: 'bg-slate-400',
  },
  THINKING: {
    label: 'Thinking',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-bold',
    cardBorderClass: 'border-blue-500 dark:border-blue-500 shadow-md ring-1 ring-blue-500/30',
    icon: Sparkles,
    dotColor: 'bg-blue-500 animate-ping',
  },
  TOOL_CALL: {
    label: 'Tool Call',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-bold',
    cardBorderClass: 'border-amber-500 dark:border-amber-500 shadow-md ring-1 ring-amber-500/30',
    icon: Wrench,
    dotColor: 'bg-amber-500 animate-pulse',
  },
  AWAITING_APPROVAL: {
    label: 'Awaiting Approval',
    badgeClass: 'bg-amber-500 text-white font-bold animate-pulse',
    cardBorderClass: 'border-amber-500 dark:border-amber-400 shadow-lg ring-2 ring-amber-400',
    icon: PauseCircle,
    dotColor: 'bg-white',
  },
  DONE: {
    label: 'Completed',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold',
    cardBorderClass: 'border-emerald-500 dark:border-emerald-600 shadow-sm',
    icon: CheckCircle2,
    dotColor: 'bg-emerald-500',
  },
  ERROR: {
    label: 'Error',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold',
    cardBorderClass: 'border-rose-500 dark:border-rose-500 shadow-sm',
    icon: AlertCircle,
    dotColor: 'bg-rose-500',
  },
};

const AgentNodeComponent = ({ id, data, selected }: NodeProps<any>) => {
  const toggleNodeBreakpoint = useWorkflowStore((s) => s.toggleNodeBreakpoint);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const duplicateNode = useWorkflowStore((s) => s.duplicateNode);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [promptEdit, setPromptEdit] = useState(data.systemPrompt || '');
  const [tempEdit, setTempEdit] = useState(data.temperature ?? 0.2);

  const role = (data.role as AgentRole) || 'supervisor';
  const roleInfo = ROLE_CONFIG[role] || ROLE_CONFIG.supervisor;
  const RoleIcon = roleInfo.icon;

  const status = (data.status as AgentStatus) || 'IDLE';
  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.IDLE;
  const StatusIcon = statusInfo.icon;

  const isBreakpoint = !!data.breakpointEnabled;

  const handleSaveConfig = () => {
    soundEffects.playClick();
    updateNodeData(id, {
      systemPrompt: promptEdit,
      temperature: Number(tempEdit),
    });
    setIsConfigOpen(false);
  };

  return (
    <div
      onClick={() => {
        soundEffects.playClick();
        setSelectedNodeId(id);
      }}
      className={`relative w-[340px] rounded-xl bg-white dark:bg-[#151822] border transition-all duration-200 shadow-sm hover:shadow-md select-none ${
        statusInfo.cardBorderClass
      } ${selected ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white dark:ring-offset-[#0c0e14]' : ''}`}
    >
      {/* Target Handle (Left: Input) with label */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center z-20">
        <Handle
          type="target"
          position={Position.Left}
          className="!relative !left-0 !w-3.5 !h-3.5 !bg-white dark:!bg-slate-900 !border-2 !border-blue-600 hover:!scale-125 !transition-transform cursor-crosshair shadow-sm"
        />
        <span className="ml-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 pointer-events-none">
          IN
        </span>
      </div>

      {/* Source Handle (Right: Output) with label */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center z-20">
        <span className="mr-1 text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-700 pointer-events-none">
          OUT
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!relative !right-0 !w-3.5 !h-3.5 !bg-white dark:!bg-slate-900 !border-2 !border-blue-600 hover:!scale-125 !transition-transform cursor-crosshair shadow-sm"
        />
      </div>

      {/* Top Accent Strip */}
      <div className={`h-1 w-full rounded-t-xl ${status === 'IDLE' ? 'bg-slate-200 dark:bg-slate-800' : roleInfo.accentBar}`} />

      <div className="p-4 space-y-3">
        {/* Header: Icon, Label & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-1.5 rounded-lg border shrink-0 ${roleInfo.badgeClass}`}>
              <RoleIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {data.label}
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                {roleInfo.title}
              </p>
            </div>
          </div>

          {/* Quick Node Actions: Duplicate & Delete */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playBlip();
                duplicateNode(id);
              }}
              title="Duplicate Agent Node"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playClick();
                deleteNode(id);
              }}
              title="Delete Agent Node"
              className="p-1 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Badge & Metrics */}
        <div className="flex items-center justify-between pt-0.5">
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusInfo.badgeClass}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`} />
            <span>{statusInfo.label}</span>
          </div>

          {/* Token count / Temperature */}
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
            {data.metrics && data.metrics.tokens > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <Zap className="w-3 h-3" />
                <span>{data.metrics.tokens} tok</span>
              </span>
            ) : (
              <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                t: {data.temperature ?? 0.2}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
          {data.description}
        </p>

        {/* Live Thought / Step Snippet */}
        {(data.lastThought || data.currentStepText) && (
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-sky-300 leading-snug flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {data.currentStepText || data.lastThought}
            </span>
          </div>
        )}

        {/* Tools Pill List */}
        {data.tools && data.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.tools.map((tool: string) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions: Pause Breakpoint & Configure */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playWarn();
              toggleNodeBreakpoint(id);
            }}
            title={isBreakpoint ? 'Breakpoint Active: Will pause execution here' : 'Set pause breakpoint'}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isBreakpoint
                ? 'bg-amber-500 text-white font-bold shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>{isBreakpoint ? 'Breakpoint: ON' : 'Add Breakpoint'}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEffects.playClick();
              setIsConfigOpen(!isConfigOpen);
            }}
            title="Configure System Prompt & Parameters"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline Drawer for prompt tuning */}
        {isConfigOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Configure Agent</span>
              </span>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mb-1">
                System Prompt
              </label>
              <textarea
                value={promptEdit}
                onChange={(e) => setPromptEdit(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Temp:</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={tempEdit}
                  onChange={(e) => setTempEdit(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Save className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AgentNode = memo(AgentNodeComponent, (prev, next) => {
  return (
    prev.id === next.id &&
    prev.selected === next.selected &&
    prev.data.status === next.data.status &&
    prev.data.breakpointEnabled === next.data.breakpointEnabled &&
    prev.data.currentStepText === next.data.currentStepText &&
    prev.data.lastThought === next.data.lastThought &&
    prev.data.metrics?.tokens === next.data.metrics?.tokens &&
    prev.data.label === next.data.label &&
    prev.data.role === next.data.role
  );
});
