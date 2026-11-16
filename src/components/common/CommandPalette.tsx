import React, { useState, useEffect } from 'react';
import {
  Search,
  Command,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Volume2,
  VolumeX,
  LayoutGrid,
  Columns,
  Globe,
  Share2,
  Sliders,
  X,
  ArrowRight,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { WORKFLOW_TEMPLATES } from '../../constants/templates';
import { soundEffects } from '../../services/soundFx';
import { AgentRole } from '../../types';

interface CommandPaletteProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRunWorkflow?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  onRunWorkflow,
}) => {
  const storeIsOpen = useWorkflowStore((s) => s.isCommandPaletteOpen);
  const setStoreIsOpen = useWorkflowStore((s) => s.setCommandPaletteOpen);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose || (() => setStoreIsOpen(false));

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const nodes = useWorkflowStore((s) => s.nodes);
  const setSelectedNodeId = useWorkflowStore((s) => s.setSelectedNodeId);
  const addAgentNode = useWorkflowStore((s) => s.addAgentNode);
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const resetExecutionState = useWorkflowStore((s) => s.resetExecutionState);
  const setExportModalOpen = useWorkflowStore((s) => s.setExportModalOpen);
  const autoArrangeGraph = useWorkflowStore((s) => s.autoArrangeGraph);

  const [soundMuted, setSoundMuted] = useState(soundEffects.getMuted());

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter commands
  const allCommands = [
    // Workflow Actions
    {
      id: 'action-run',
      category: 'Workflow Action',
      title: 'Run Multi-Agent Workflow',
      desc: 'Execute active DAG with simulated or WebGPU model',
      icon: Play,
      iconColor: 'text-emerald-400',
      action: () => {
        if (onRunWorkflow) onRunWorkflow();
        onClose();
      },
    },
    {
      id: 'action-reset',
      category: 'Workflow Action',
      title: 'Reset Execution State',
      desc: 'Clear active thoughts and set all nodes to IDLE',
      icon: RotateCcw,
      iconColor: 'text-cyan-400',
      action: () => {
        resetExecutionState();
        onClose();
      },
    },
    {
      id: 'action-auto-layout',
      category: 'Canvas Action',
      title: 'Auto-Arrange Graph (Left to Right)',
      desc: 'Organize agent nodes into clean hierarchical layout',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      action: () => {
        autoArrangeGraph('LR');
        onClose();
      },
    },
    {
      id: 'action-toggle-sound',
      category: 'Settings',
      title: soundMuted ? 'Unmute Audio Sound Effects' : 'Mute Audio Sound Effects',
      desc: 'Toggle procedural synthesizer feedback sounds',
      icon: soundMuted ? VolumeX : Volume2,
      iconColor: 'text-amber-400',
      action: () => {
        const next = soundEffects.toggleMute();
        setSoundMuted(next);
      },
    },
    {
      id: 'action-export',
      category: 'Workflow Action',
      title: 'Export Workflow (JSON & Mermaid)',
      desc: 'Open export modal to download JSON state or diagram',
      icon: Share2,
      iconColor: 'text-sky-400',
      action: () => {
        setExportModalOpen(true);
        onClose();
      },
    },

    // Agent Nodes to Add
    ...([
      { role: 'supervisor' as AgentRole, name: 'Supervisor Agent', desc: 'Add DAG coordinator & delegator' },
      { role: 'scraper' as AgentRole, name: 'Web Scraper Agent', desc: 'Add real-time DOM extractor' },
      { role: 'router' as AgentRole, name: 'Router / Guardrail Agent', desc: 'Add conditional branch validator' },
      { role: 'researcher' as AgentRole, name: 'Fact Researcher Agent', desc: 'Add context verification agent' },
      { role: 'writer' as AgentRole, name: 'Summary Writer Agent', desc: 'Add memo & dossier synthesizer' },
    ].map((agent) => ({
      id: `add-${agent.role}`,
      category: 'Add Agent Node',
      title: `Add ${agent.name}`,
      desc: agent.desc,
      icon: Layers,
      iconColor: 'text-sky-400',
      action: () => {
        addAgentNode(agent.role);
        onClose();
      },
    }))),

    // Preset Templates
    ...WORKFLOW_TEMPLATES.map((tmpl) => ({
      id: `template-${tmpl.id}`,
      category: 'Workflow Template',
      title: `Load: ${tmpl.name}`,
      desc: tmpl.description,
      icon: Sparkles,
      iconColor: 'text-purple-400',
      action: () => {
        loadTemplate(tmpl.id);
        onClose();
      },
    })),

    // Active Nodes in Graph
    ...nodes.map((node) => ({
      id: `node-${node.id}`,
      category: 'Canvas Node',
      title: `Jump to: ${node.data.label}`,
      desc: `Role: ${node.data.role} • Status: ${node.data.status}`,
      icon: Sliders,
      iconColor: 'text-sky-400',
      action: () => {
        setSelectedNodeId(node.id);
        onClose();
      },
    })),
  ];

  const filtered = allCommands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.desc.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        soundEffects.playClick();
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[520px]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search nodes, actions, templates..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands found for "{query}".
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => {
                    soundEffects.playClick();
                    cmd.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/40 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 ${cmd.iconColor}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate leading-snug">
                        {cmd.desc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-sky-400' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Dismiss</span>
          </div>
          <span className="text-sky-400 font-bold">Luminate UI Palette</span>
        </div>
      </div>
    </div>
  );
};
