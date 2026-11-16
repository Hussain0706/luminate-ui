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
  Share2,
  Sliders,
  Sun,
  Moon,
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
  const theme = useWorkflowStore((s) => s.theme);
  const toggleTheme = useWorkflowStore((s) => s.toggleTheme);

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
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      action: () => {
        if (onRunWorkflow) onRunWorkflow();
        onClose();
      },
    },
    {
      id: 'action-theme-toggle',
      category: 'Appearance',
      title: theme === 'dark' ? 'Switch to Light Mode (White Theme)' : 'Switch to Dark Mode (Black Theme)',
      desc: 'Toggle between classic enterprise light and dark themes',
      icon: theme === 'dark' ? Sun : Moon,
      iconColor: 'text-amber-500',
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    {
      id: 'action-reset',
      category: 'Workflow Action',
      title: 'Reset Execution State',
      desc: 'Clear active thoughts and set all nodes to Idle',
      icon: RotateCcw,
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: () => {
        resetExecutionState();
        onClose();
      },
    },
    {
      id: 'action-auto-layout',
      category: 'Canvas Action',
      title: 'Auto-Arrange Graph',
      desc: 'Organize agent nodes into clean hierarchical layout',
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
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
      iconColor: 'text-slate-600 dark:text-slate-400',
      action: () => {
        const next = soundEffects.toggleMute();
        setSoundMuted(next);
      },
    },
    {
      id: 'action-export',
      category: 'Workflow Action',
      title: 'Export Workflow (JSON)',
      desc: 'Open export modal to download JSON state or diagram',
      icon: Share2,
      iconColor: 'text-blue-600 dark:text-blue-400',
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
      iconColor: 'text-blue-600 dark:text-blue-400',
      action: () => {
        addAgentNode(agent.role);
        onClose();
      },
    }))),

    // Preset Templates
    ...WORKFLOW_TEMPLATES.map((tmpl) => ({
      id: `template-${tmpl.id}`,
      category: 'Workflow Preset',
      title: `Load: ${tmpl.name}`,
      desc: tmpl.description,
      icon: Sparkles,
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      action: () => {
        loadTemplate(tmpl.id);
        onClose();
      },
    })),

    // Active Nodes in Graph
    ...nodes.map((node) => ({
      id: `node-${node.id}`,
      category: 'Canvas Node',
      title: `Select: ${node.data.label}`,
      desc: `Role: ${node.data.role} • Status: ${node.data.status}`,
      icon: Sliders,
      iconColor: 'text-slate-600 dark:text-slate-400',
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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#10121a]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search commands, nodes, templates, actions..."
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none font-sans"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No results found for "{query}".
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
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-100'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-md bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 shrink-0 ${cmd.iconColor}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">
                          {cmd.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 shrink-0">
                          {cmd.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate leading-snug">
                        {cmd.desc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-blue-600 dark:text-blue-400' : 'opacity-0'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#10121a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-semibold text-slate-600 dark:text-slate-400">Command Menu</span>
        </div>
      </div>
    </div>
  );
};
