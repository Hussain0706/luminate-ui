import React, { useReducer, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import {
  Sparkles,
  Globe,
  Share2,
  Maximize2,
  Minimize2,
  Columns,
  LayoutGrid,
  Volume2,
  VolumeX,
  Command,
} from 'lucide-react';

import { useWorkflowStore } from './store/useWorkflowStore';
import { workflowReducer, initialWorkflowState } from './reducers/workflowReducer';
import { AgentNode } from './components/canvas/AgentNode';
import { ConditionalEdge } from './components/canvas/ConditionalEdge';
import { CanvasToolbar } from './components/canvas/CanvasToolbar';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { RightSidebar } from './components/sidebar/RightSidebar';
import { BrowserSandbox } from './components/sandbox/BrowserSandbox';
import { ApprovalModal } from './components/modals/ApprovalModal';
import { ExportModal } from './components/modals/ExportModal';
import { ImportModal } from './components/modals/ImportModal';
import { WebLLMModal } from './components/modals/WebLLMModal';
import { CommandPalette } from './components/common/CommandPalette';
import { EdgeConditionModal } from './components/modals/EdgeConditionModal';
import { WORKFLOW_TEMPLATES } from './constants/templates';
import { soundEffects } from './services/soundFx';

function FlowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);

  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);
  const edgeTypes = useMemo(() => ({ conditionalEdge: ConditionalEdge }), []);

  return (
    <div className="relative w-full h-full bg-[#090d16]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 60, y: 40, zoom: 0.85 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={24} size={1.2} />
        <Controls
          position="bottom-right"
          className="!mb-4 !mr-4 !bg-slate-900 !border-slate-700 !shadow-2xl"
        />
        <MiniMap
          nodeColor={(n) => {
            const role = (n.data as any)?.role;
            if (role === 'supervisor') return '#38bdf8';
            if (role === 'scraper') return '#a855f7';
            if (role === 'router') return '#f59e0b';
            if (role === 'researcher') return '#10b981';
            return '#f43f5e';
          }}
          maskColor="rgba(9, 13, 22, 0.8)"
          className="!bottom-4 !left-4 !w-44 !h-28 !rounded-xl !border !border-slate-700 !bg-slate-900/90 !overflow-hidden !shadow-2xl"
          zoomable
          pannable
        />
        <CanvasToolbar />
      </ReactFlow>
    </div>
  );
}

export default function App() {
  const [workflowMachine, dispatchWorkflow] = useReducer(
    workflowReducer,
    initialWorkflowState
  );

  const engineMode = useWorkflowStore((s) => s.engineMode);
  const loadTemplate = useWorkflowStore((s) => s.loadTemplate);
  const setExportModalOpen = useWorkflowStore((s) => s.setExportModalOpen);
  const setWebLLMModalOpen = useWorkflowStore((s) => s.setWebLLMModalOpen);
  const setCommandPaletteOpen = useWorkflowStore((s) => s.setCommandPaletteOpen);

  // Sound FX State
  const [soundEnabled, setSoundEnabled] = useState(soundEffects.isEnabled());

  // View modes: 'canvas' (spacious focused canvas), 'split' (balanced split), 'sandbox' (browser focused)
  const [viewMode, setViewMode] = useState<'canvas' | 'split' | 'sandbox'>('split');

  // Global hotkey: Cmd+K / Ctrl+K opens Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundEffects.playBlip();
        setCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const toggleSound = () => {
    const next = !soundEnabled;
    soundEffects.setEnabled(next);
    setSoundEnabled(next);
    if (next) {
      soundEffects.playBlip();
    }
  };

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100">
        {/* Top Navigation Bar */}
        <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between z-30 select-none shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold tracking-tight text-white text-base">
                Luminate UI
              </span>
            </div>

            <div className="h-5 w-[1px] bg-slate-800" />

            {/* Command Palette Trigger Button */}
            <button
              onClick={() => {
                soundEffects.playBlip();
                setCommandPaletteOpen(true);
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner group"
              title="Quick Search & Actions (Cmd+K)"
            >
              <Command className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span>Search actions...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Template Selector Buttons in Header */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <span className="text-slate-400 text-[11px] font-mono px-2">Template:</span>
              {WORKFLOW_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    soundEffects.playClick();
                    loadTemplate(tmpl.id);
                  }}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95 border border-transparent hover:border-slate-700 text-xs"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Center: View Switcher (Canvas Studio vs Split View vs Browser Sandbox) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('canvas');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'canvas'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full Screen Canvas Mode"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Canvas View</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('split');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'split'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Balanced Split Mode (Canvas + Browser Sandbox)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('sandbox');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'sandbox'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Focused Browser Sandbox Simulator"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Browser Sandbox</span>
            </button>
          </div>

          {/* Right Header Status & Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Sound FX Toggle Button */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30 shadow-sm'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Web Audio FX: Enabled' : 'Web Audio FX: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Active Engine Pill */}
            <div
              onClick={() => {
                soundEffects.playClick();
                setWebLLMModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono border bg-slate-950 border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm"
              title="Click to configure execution engine"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-200 font-semibold">
                {engineMode === 'webllm' ? 'WebGPU AI' : 'Simulated Engine'}
              </span>
              <span className="text-emerald-400 font-bold">$0.00 FREE</span>
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setExportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all shadow-sm active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Left Sidebar: Agent Hub & Templates */}
          <LeftSidebar />

          {/* 2. Center Area: Dynamic View (Canvas, Split, or Sandbox) */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Center Top: Multi-Agent Node Canvas */}
            <div
              className={`relative transition-all duration-300 ease-in-out ${
                viewMode === 'canvas'
                  ? 'h-full'
                  : viewMode === 'sandbox'
                  ? 'h-0 overflow-hidden'
                  : 'h-[55%]'
              }`}
            >
              <FlowCanvas />
            </div>

            {/* Split Bar (Visible only in Split mode) */}
            {viewMode === 'split' && (
              <div className="h-10 px-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs select-none z-20 shadow-md">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-slate-100 text-xs">
                    Live Browser Sandbox Simulator
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-semibold">
                    DOM Inspector & Virtual Scraper Cursor
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setViewMode('canvas');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                  >
                    <Minimize2 className="w-3 h-3" />
                    <span>Hide Sandbox</span>
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setViewMode('sandbox');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Maximize Sandbox</span>
                  </button>
                </div>
              </div>
            )}

            {/* Floating button in Canvas mode to quickly open the Sandbox */}
            {viewMode === 'canvas' && (
              <div className="absolute bottom-5 right-20 z-30">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('split');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 text-xs font-bold border border-purple-500/40 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-xl transition-all active:scale-95"
                >
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Open Browser Sandbox Simulator</span>
                </button>
              </div>
            )}

            {/* Center Bottom: Live Browser Sandbox Simulator */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                viewMode === 'sandbox'
                  ? 'h-full'
                  : viewMode === 'canvas'
                  ? 'h-0'
                  : 'h-[calc(45%-40px)]'
              }`}
            >
              <BrowserSandbox />
            </div>
          </main>

          {/* 3. Right Sidebar: Task Orchestrator, Time-Travel Scrubber & Visual Inspector */}
          <RightSidebar
            workflowMachine={workflowMachine}
            dispatchWorkflow={dispatchWorkflow}
          />
        </div>

        {/* Global Modals */}
        <ApprovalModal
          workflowMachine={workflowMachine}
          dispatchWorkflow={dispatchWorkflow}
        />
        <ExportModal />
        <ImportModal />
        <WebLLMModal />
        <CommandPalette />
        <EdgeConditionModal />
      </div>
    </ReactFlowProvider>
  );
}
