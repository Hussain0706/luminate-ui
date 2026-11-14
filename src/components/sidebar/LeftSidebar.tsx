import React from 'react';
import {
  Compass,
  Globe,
  ShieldCheck,
  BookOpen,
  FileText,
  Sparkles,
  Cpu,
  Layers,
  Plus,
  Play,
  Zap,
  CheckCircle2,
  Sliders,
  Flame,
} from 'lucide-react';
import { AgentRole } from '../../types';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { WORKFLOW_TEMPLATES } from '../../constants/templates';

const AGENT_CATALOG: {
  role: AgentRole;
  title: string;
  roleTag: string;
  desc: string;
  icon: React.ElementType;
  colorClass: string;
  badgeBg: string;
  borderClass: string;
  btnClass: string;
}[] = [
  {
    role: 'supervisor',
    title: 'Supervisor Agent',
    roleTag: 'COORDINATOR',
    desc: 'Orchestrates the graph and delegates tasks.',
    icon: Compass,
    colorClass: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    borderClass: 'border-sky-500/30 hover:border-sky-400',
    btnClass: 'bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-500/40',
  },
  {
    role: 'scraper',
    title: 'Web Scraper Agent',
    roleTag: 'BROWSER DOM',
    desc: 'Extracts real-time DOM elements & attributes.',
    icon: Globe,
    colorClass: 'text-purple-400',
    badgeBg: 'bg-purple-500/15',
    borderClass: 'border-purple-500/30 hover:border-purple-400',
    btnClass: 'bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-500/40',
  },
  {
    role: 'router',
    title: 'Router / Guardrail',
    roleTag: 'IF / ELSE LOGIC',
    desc: 'Validates confidence & conditional branches.',
    icon: ShieldCheck,
    colorClass: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30 hover:border-amber-400',
    btnClass: 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/40',
  },
  {
    role: 'researcher',
    title: 'Fact Researcher',
    roleTag: 'DATA ENRICHMENT',
    desc: 'Queries archives and validates prior context.',
    icon: BookOpen,
    colorClass: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400',
    btnClass: 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/40',
  },
  {
    role: 'writer',
    title: 'Summary Writer',
    roleTag: 'SYNTHESIS',
    desc: 'Produces executive memos and markdown dossiers.',
    icon: FileText,
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-500/15',
    borderClass: 'border-rose-500/30 hover:border-rose-400',
    btnClass: 'bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40',
  },
];

export const LeftSidebar: React.FC = () => {
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const engineMode = useWorkflowStore((s) => s.engineMode);
  const setEngineMode = useWorkflowStore((s) => s.setEngineMode);
  const setWebLLMModalOpen = useWorkflowStore((s) => s.setWebLLMModalOpen);

  return (
    <aside className="w-80 h-full flex flex-col bg-slate-900 border-r border-slate-800 select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white">
                Luminate UI
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Multi-Agent Workflow Playground
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>100% Free Client-Side • No API Keys</span>
        </div>
      </div>

      <div className="p-4 space-y-6 flex-1">
        {/* Execution Engine Selector */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-400 font-mono">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              <span>Execution Engine</span>
            </span>
          </div>

          <div className="space-y-2">
            {/* Mode 1: Simulated Agent Engine */}
            <div
              onClick={() => setEngineMode('simulated')}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                engineMode === 'simulated'
                  ? 'bg-sky-500/15 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] ring-1 ring-sky-400/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Simulated Engine</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  INSTANT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Zero download. Simulates multi-agent reasoning, high-speed token generation, and DOM scraping.
              </p>
            </div>

            {/* Mode 2: Real Browser AI (WebGPU) */}
            <div
              onClick={() => {
                setEngineMode('webllm');
                setWebLLMModalOpen(true);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                engineMode === 'webllm'
                  ? 'bg-purple-500/15 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Local WebGPU AI</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FREE LOCAL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                Runs Qwen2.5/SmolLM2 locally on your GPU via `@mlc-ai/web-llm`.
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setWebLLMModalOpen(true);
                }}
                className="w-full py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Sliders className="w-3 h-3" />
                <span>Configure Model & Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Agent Hub: Add Node Section */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-400 font-mono">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Agent Hub (Add Node)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">5 Roles</span>
          </div>

          <div className="space-y-2.5">
            {AGENT_CATALOG.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  className={`p-3 rounded-xl bg-slate-950/80 border ${item.borderClass} transition-all space-y-2 shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${item.badgeBg}`}>
                        <Icon className={`w-4 h-4 ${item.colorClass}`} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">
                          {item.title}
                        </h4>
                        <span className="text-[9px] font-mono text-slate-400 uppercase font-semibold">
                          {item.roleTag}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated "+ Add Node" button */}
                    <button
                      type="button"
                      onClick={() => addAgentNode(item.role)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-sm active:scale-95 ${item.btnClass}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Preset Workflow Templates */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2.5">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-slate-400 font-mono">
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>Preset Templates</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {WORKFLOW_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30 font-bold">
                    {tmpl.nodes.length} Nodes
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>

                <button
                  type="button"
                  onClick={() => loadTemplate(tmpl.id)}
                  className="w-full py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load Template</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 font-mono flex items-center justify-between">
        <span>React 19 • React Flow</span>
        <span className="text-emerald-400 font-bold">Zero Backend</span>
      </div>
    </aside>
  );
};
