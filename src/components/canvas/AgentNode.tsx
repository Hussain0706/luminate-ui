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
  color: string;
  badgeBg: string;
  badgeBorder: string;
  accentHex: string;
}> = {
  supervisor: {
    icon: Compass,
    title: 'Supervisor',
    color: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/40',
    accentHex: '#38bdf8',
  },
  scraper: {
    icon: Globe,
    title: 'Web Scraper',
    color: 'text-purple-400',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/40',
    accentHex: '#a855f7',
  },
  router: {
    icon: ShieldCheck,
    title: 'Router / Guardrail',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/40',
    accentHex: '#f59e0b',
  },
  researcher: {
    icon: BookOpen,
    title: 'Fact Researcher',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/40',
    accentHex: '#10b981',
  },
  writer: {
    icon: FileText,
    title: 'Summary Writer',
    color: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    badgeBorder: 'border-rose-500/40',
    accentHex: '#f43f5e',
  },
};

const STATUS_CONFIG: Record<AgentStatus, {
  label: string;
  badgeClass: string;
  cardGlowClass: string;
  icon: React.ElementType;
}> = {
  IDLE: {
    label: 'IDLE',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    cardGlowClass: 'border-slate-800 hover:border-slate-700 shadow-xl',
    icon: Clock,
  },
  THINKING: {
    label: 'THINKING...',
    badgeClass: 'bg-cyan-500/25 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] animate-pulse',
    cardGlowClass: 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/60',
    icon: Sparkles,
  },
  TOOL_CALL: {
    label: 'TOOL CALL',
    badgeClass: 'bg-amber-500/25 text-amber-200 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse',
    cardGlowClass: 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] ring-2 ring-amber-400/60',
    icon: Wrench,
  },
  AWAITING_APPROVAL: {
    label: 'AWAITING APPROVAL',
    badgeClass: 'bg-yellow-400 text-slate-950 border-yellow-300 font-bold shadow-[0_0_15px_rgba(250,204,21,0.7)] animate-bounce',
    cardGlowClass: 'border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.7)] ring-2 ring-yellow-400',
    icon: PauseCircle,
  },
  DONE: {
    label: 'COMPLETED',
    badgeClass: 'bg-emerald-500/25 text-emerald-200 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]',
    cardGlowClass: 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)]',
    icon: CheckCircle2,
  },
  ERROR: {
    label: 'ERROR',
    badgeClass: 'bg-rose-500/25 text-rose-200 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    cardGlowClass: 'border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.5)]',
    icon: AlertCircle,
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
      className={`relative w-[340px] rounded-2xl bg-slate-900/95 backdrop-blur-2xl border transition-all duration-300 text-slate-100 shadow-2xl ${
        statusInfo.cardGlowClass
      } ${selected ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-slate-950' : ''}`}
    >
      {/* Target Handle (Left: Input) with label */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex items-center z-20">
        <Handle
          type="target"
          position={Position.Left}
          className="!relative !left-0 !w-4 !h-4 !bg-slate-800 !border-2 !border-sky-400 hover:!scale-125 !transition-transform cursor-crosshair shadow-md"
        />
        <span className="ml-1 text-[9px] font-mono font-bold text-sky-400 bg-slate-950/90 px-1 py-0.2 rounded border border-sky-500/30 shadow-sm pointer-events-none select-none">
          IN
        </span>
      </div>

      {/* Source Handle (Right: Output) with label */}
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 flex items-center z-20">
        <span className="mr-1 text-[9px] font-mono font-bold text-purple-400 bg-slate-950/90 px-1 py-0.2 rounded border border-purple-500/30 shadow-sm pointer-events-none select-none">
          OUT
        </span>
        <Handle
          type="source"
          position={Position.Right}
          className="!relative !right-0 !w-4 !h-4 !bg-slate-800 !border-2 !border-purple-400 hover:!scale-125 !transition-transform cursor-crosshair shadow-md"
        />
      </div>

      {/* Header Color Accent Bar */}
      <div
        className="h-1.5 w-full rounded-t-2xl transition-colors duration-300"
        style={{ backgroundColor: status === 'IDLE' ? '#334155' : roleInfo.accentHex }}
      />

      <div className="p-4">
        {/* Top Header: Role Icon, Title & Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`p-2 rounded-xl ${roleInfo.badgeBg} border ${roleInfo.badgeBorder} shadow-sm shrink-0`}>
              <RoleIcon className={`w-4 h-4 ${roleInfo.color}`} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold tracking-wide text-white truncate">
                {data.label}
              </h4>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
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
              className="p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
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
              className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-3 flex items-center justify-between">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${statusInfo.badgeClass}`}
          >
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </div>

          {/* Telemetry pill */}
          <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            {data.metrics && data.metrics.tokens > 0 ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>{data.metrics.tokens} tok</span>
              </span>
            ) : (
              <span className="text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                temp: {data.temperature ?? 0.2}
              </span>
            )}
          </div>
        </div>

        {/* Node Description */}
        <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2 mb-3">
          {data.description}
        </p>

        {/* Live Thought / Streaming Preview Snippet */}
        {(data.lastThought || data.currentStepText) && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-cyan-300 leading-snug flex items-start gap-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 animate-spin" />
            <span className="line-clamp-2">
              {data.currentStepText || data.lastThought}
            </span>
          </div>
        )}

        {/* Tools Pill List */}
        {data.tools && data.tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.tools.map((tool: string) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/90 text-slate-300 border border-slate-700/80 shadow-sm"
              >
                {tool}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Prominent Breakpoint Button, Config */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            {/* Breakpoint Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playWarn();
                toggleNodeBreakpoint(id);
              }}
              title={isBreakpoint ? 'Breakpoint Active: Will pause execution on this node' : 'Click to enable pause breakpoint'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
                isBreakpoint
                  ? 'bg-amber-400 text-slate-950 font-bold border border-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>{isBreakpoint ? 'Breakpoint: ON' : 'Pause'}</span>
            </button>

            {/* Config Prompt Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundEffects.playClick();
                setIsConfigOpen(true);
              }}
              title="Edit Node System Prompt & Temperature"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Inline Config Drawer */}
        {isConfigOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 p-3 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2.5 shadow-xl animate-in fade-in"
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                <span>Configure Agent</span>
              </span>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono block mb-1">
                System Prompt
              </label>
              <textarea
                value={promptEdit}
                onChange={(e) => setPromptEdit(e.target.value)}
                rows={3}
                className="w-full p-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 outline-none focus:border-sky-400 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">Temp:</span>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={tempEdit}
                  onChange={(e) => setTempEdit(Number(e.target.value))}
                  className="w-14 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Save className="w-3 h-3" />
                <span>Apply</span>
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
