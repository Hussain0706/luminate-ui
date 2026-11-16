import React, { useReducer, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react';
import {
  Sparkles,
  Globe,
  Share2,
  Columns,
  LayoutGrid,
  Volume2,
  VolumeX,
  Command,
  Sun,
  Moon,
  ChevronDown,
  ExternalLink,
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
  const theme = useWorkflowStore((s) => s.theme);
  const isMiniMapVisible = useWorkflowStore((s) => s.isMiniMapVisible);

  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({ agentNode: AgentNode }), []);
  const edgeTypes = useMemo(() => ({ conditionalEdge: ConditionalEdge }), []);

  // Auto fit graph on template change
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.3, duration: 400 });
    }, 150);
    return () => clearTimeout(timer);
  }, [nodes.length, fitView]);

  const isDark = theme === 'dark';

  return (
    <div className="relative w-full h-full bg-[#f8fafc] dark:bg-[#0c0e14] transition-colors">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={{ x: 80, y: 80, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={isDark ? '#23283a' : '#cbd5e1'}
          gap={24}
          size={1.2}
        />
        <Controls
          position="bottom-right"
          className="!mb-4 !mr-4 !shadow-md"
        />
        {isMiniMapVisible && (
          <MiniMap
            nodeColor={(n) => {
              const role = (n.data as any)?.role;
              if (role === 'supervisor') return '#2563eb';
              if (role === 'scraper') return '#4f46e5';
              if (role === 'router') return '#d97706';
              if (role === 'researcher') return '#059669';
              return '#7c3aed';
            }}
            maskColor={isDark ? 'rgba(12, 14, 20, 0.75)' : 'rgba(248, 250, 252, 0.75)'}
            className="!bottom-4 !left-4 !w-40 !h-24 !rounded-xl !border !border-slate-200 dark:!border-slate-800 !bg-white/80 dark:!bg-[#151822]/80 !overflow-hidden !shadow-md"
            zoomable
            pannable
          />
        )}
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
  const theme = useWorkflowStore((s) => s.theme);
  const toggleTheme = useWorkflowStore((s) => s.toggleTheme);
  const viewMode = useWorkflowStore((s) => s.viewMode);
  const setViewMode = useWorkflowStore((s) => s.setViewMode);

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

  const soundEnabled = soundEffects.isEnabled();

  const toggleSound = () => {
    soundEffects.toggleMute();
    soundEffects.playClick();
  };

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 font-sans transition-colors">
        {/* Clean, Non-Crowded Top Navigation Bar */}
        <header className="h-13 border-b border-slate-200 dark:border-[#212638] bg-white dark:bg-[#12141c] px-4 flex items-center justify-between z-30 select-none shadow-xs transition-colors">
          {/* Left: Brand & Templates */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-sm">
                Luminate UI
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium border border-slate-200 dark:border-slate-700">
                v1.2
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

            {/* Template Dropdown Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Preset:</span>
              <select
                onChange={(e) => {
                  soundEffects.playClick();
                  loadTemplate(e.target.value);
                }}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer transition-colors shadow-xs"
              >
                {WORKFLOW_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                soundEffects.playBlip();
                setCommandPaletteOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              title="Search commands (⌘K)"
            >
              <Command className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[11px]">Search...</span>
              <kbd className="px-1 py-0.2 rounded bg-white dark:bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Center: Clean Segmented View Mode Tabs */}
          <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-[#0c0e14] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold shadow-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('canvas');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                viewMode === 'canvas'
                  ? 'bg-white dark:bg-[#161923] text-blue-700 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Full Screen Canvas Workspace"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('split');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-[#161923] text-blue-700 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Split View (Canvas + Sandbox)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

            <button
              onClick={() => {
                soundEffects.playClick();
                setViewMode('sandbox');
              }}
              className={`flex items-center gap-1 px-3 py-1 rounded-md transition-all ${
                viewMode === 'sandbox'
                  ? 'bg-white dark:bg-[#161923] text-blue-700 dark:text-blue-400 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Focused Browser Sandbox Simulator"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>
          </div>

          {/* Right: Theme Toggle, Sound, Engine & Export */}
          <div className="flex items-center gap-2">
            {/* White / Black (Light / Dark) Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
              title={theme === 'dark' ? 'Switch to Light Mode (White Theme)' : 'Switch to Dark Mode (Black Theme)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title={soundEnabled ? 'Sound FX: Enabled' : 'Sound FX: Muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Active Engine Pill */}
            <div
              onClick={() => {
                soundEffects.playClick();
                setWebLLMModalOpen(true);
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs transition-colors"
              title="Click to configure execution engine"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">
                {engineMode === 'webllm' ? 'WebGPU' : 'Simulated'}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">$0.00</span>
            </div>

            {/* Export Button */}
            <button
              onClick={() => {
                soundEffects.playClick();
                setExportModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* 1. Left Sidebar: Agent Library & Templates */}
          <LeftSidebar />

          {/* 2. Middle Area: Dynamic Workspace */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            {/* Canvas View: 100% full screen by default so nodes have complete room! */}
            <div
              className={`relative transition-all duration-200 ease-in-out ${
                viewMode === 'canvas'
                  ? 'h-full'
                  : viewMode === 'sandbox'
                  ? 'h-0 overflow-hidden'
                  : 'h-[60%]'
              }`}
            >
              <FlowCanvas />
            </div>

            {/* Split Mode Divider (Only visible in Split mode) */}
            {viewMode === 'split' && (
              <div className="h-8 px-4 bg-slate-100 dark:bg-[#12141c] border-t border-slate-200 dark:border-[#212638] flex items-center justify-between text-xs select-none z-20 shadow-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Live Browser Sandbox Simulator
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setViewMode('canvas');
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Hide Sandbox
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setViewMode('sandbox');
                    }}
                    className="px-2 py-0.5 rounded text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    Maximize Sandbox
                  </button>
                </div>
              </div>
            )}

            {/* Floating button in Canvas mode to quickly open the Sandbox */}
            {viewMode === 'canvas' && (
              <div className="absolute bottom-4 right-20 z-30">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setViewMode('split');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#151822]/95 hover:bg-white dark:hover:bg-[#1c202e] text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-md backdrop-blur-md transition-all active:scale-95"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Inspect Browser Sandbox</span>
                </button>
              </div>
            )}

            {/* Browser Sandbox Component */}
            <div
              className={`transition-all duration-200 ease-in-out overflow-hidden ${
                viewMode === 'sandbox'
                  ? 'h-full'
                  : viewMode === 'canvas'
                  ? 'h-0'
                  : 'h-[calc(40%-32px)]'
              }`}
            >
              <BrowserSandbox />
            </div>
          </main>

          {/* 3. Right Sidebar: Task Orchestrator & Inspector */}
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
