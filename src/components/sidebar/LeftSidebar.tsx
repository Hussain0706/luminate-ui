import React from 'react';
import {
  Compass,
  Globe,
  ShieldCheck,
  BookOpen,
  FileText,
  Layers,
  Plus,
  Play,
  CheckCircle2,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Workflow,
} from 'lucide-react';
import { AgentRole } from '../../types';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { WORKFLOW_TEMPLATES } from '../../constants/templates';
import { soundEffects } from '../../services/soundFx';

const AGENT_CATALOG: {
  role: AgentRole;
  title: string;
  roleTag: string;
  desc: string;
  icon: React.ElementType;
  badgeClass: string;
}[] = [
  {
    role: 'supervisor',
    title: 'Supervisor Agent',
    roleTag: 'COORDINATOR',
    desc: 'Orchestrates the graph, decomposes goals, and delegates subtasks.',
    icon: Compass,
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  },
  {
    role: 'scraper',
    title: 'Web Scraper Agent',
    roleTag: 'DOM EXTRACTOR',
    desc: 'Extracts real-time DOM elements, pricing data, and attributes.',
    icon: Globe,
    badgeClass: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
  },
  {
    role: 'router',
    title: 'Router / Guardrail',
    roleTag: 'IF / ELSE LOGIC',
    desc: 'Validates confidence scores and directs conditional branches.',
    icon: ShieldCheck,
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  },
  {
    role: 'researcher',
    title: 'Fact Researcher',
    roleTag: 'ENRICHMENT',
    desc: 'Queries archives and validates prior context against sources.',
    icon: BookOpen,
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  },
  {
    role: 'writer',
    title: 'Summary Writer',
    roleTag: 'SYNTHESIS',
    desc: 'Produces structured executive memos and markdown dossiers.',
    icon: FileText,
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900',
  },
];

export const LeftSidebar: React.FC = () => {
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const isLeftSidebarOpen = useWorkflowStore((s) => s.isLeftSidebarOpen);
  const toggleLeftSidebar = useWorkflowStore((s) => s.toggleLeftSidebar);

  if (!isLeftSidebarOpen) {
    return (
      <div className="w-12 h-full bg-white dark:bg-[#12141c] border-r border-slate-200 dark:border-[#212638] flex flex-col items-center py-3 select-none">
        <button
          onClick={() => {
            soundEffects.playClick();
            toggleLeftSidebar();
          }}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Expand Agent Hub & Templates"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 h-full flex flex-col bg-white dark:bg-[#12141c] border-r border-slate-200 dark:border-[#212638] select-none overflow-y-auto text-xs transition-all">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-[#212638] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px] font-mono">
            Component Library
          </span>
        </div>
        <button
          onClick={() => {
            soundEffects.playClick();
            toggleLeftSidebar();
          }}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-5 flex-1">
        {/* Section 1: Agent Nodes Catalog */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
              Agent Roles ({AGENT_CATALOG.length})
            </span>
          </div>

          <div className="space-y-2">
            {AGENT_CATALOG.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#161923] hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${item.badgeClass}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">
                          {item.roleTag}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        soundEffects.playBlip();
                        addAgentNode(item.role);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900 transition-all active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Preset Workflow Templates */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-500 dark:text-slate-400">
              Preset Templates ({WORKFLOW_TEMPLATES.length})
            </span>
          </div>

          <div className="space-y-2">
            {WORKFLOW_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#161923] hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate mr-1">
                    {tmpl.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded border border-slate-200 dark:border-slate-700 shrink-0">
                    {tmpl.nodes.length} nodes
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    loadTemplate(tmpl.id);
                  }}
                  className="w-full py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-slate-300/80 dark:border-slate-700"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Load Preset</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-[#212638] bg-slate-50/50 dark:bg-[#10121a] text-[11px] font-mono text-slate-500 flex items-center justify-between">
        <span>Client-Side Engine</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Free</span>
      </div>
    </aside>
  );
};
