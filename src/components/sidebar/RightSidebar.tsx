import React, { useState, useTransition, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Square,
  Sliders,
  Terminal,
  FileJson,
  Activity,
  Download,
  Upload,
  Clock,
  Zap,
  TrendingUp,
  CheckCircle2,
  Trash2,
  Sparkles,
  MessageSquare,
  Shield,
  Layers,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Cpu,
  Lock,
  Wrench,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { agentEngine } from '../../services/agentEngine';
import { JsonInspector } from '../inspector/JsonInspector';
import { WorkflowAction, WorkflowMachineState } from '../../reducers/workflowReducer';
import { LogLevel, AgentRole } from '../../types';
import { soundEffects } from '../../services/soundFx';

interface RightSidebarProps {
  workflowMachine: WorkflowMachineState;
  dispatchWorkflow: React.Dispatch<WorkflowAction>;
}

const ROLE_AVATAR_CONFIG: Record<AgentRole, { bg: string; text: string; border: string }> = {
  supervisor: { bg: 'bg-sky-500/20', text: 'text-sky-300', border: 'border-sky-500/40' },
  scraper: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
  router: { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
  researcher: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  writer: { bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  workflowMachine,
  dispatchWorkflow,
}) => {
  const [, startTransition] = useTransition();

  // Zustand Store Selectors
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const activeGoal = useWorkflowStore((s) => s.activeGoal);
  const setActiveGoal = useWorkflowStore((s) => s.setActiveGoal);
  const engineMode = useWorkflowStore((s) => s.engineMode);
  const speedMultiplier = useWorkflowStore((s) => s.speedMultiplier);
  const setSpeedMultiplier = useWorkflowStore((s) => s.setSpeedMultiplier);
  const mockPageType = useWorkflowStore((s) => s.mockPageType);
  const logs = useWorkflowStore((s) => s.logs);
  const logFilter = useWorkflowStore((s) => s.logFilter);
  const setLogFilter = useWorkflowStore((s) => s.setLogFilter);
  const appendLog = useWorkflowStore((s) => s.appendLog);
  const clearLogs = useWorkflowStore((s) => s.clearLogs);
  const chatMessages = useWorkflowStore((s) => s.chatMessages);
  const appendChatMessage = useWorkflowStore((s) => s.appendChatMessage);
  const clearChatMessages = useWorkflowStore((s) => s.clearChatMessages);
  const appendSandboxConsole = useWorkflowStore((s) => s.appendSandboxConsole);
  const metrics = useWorkflowStore((s) => s.metrics);
  const updateMetrics = useWorkflowStore((s) => s.updateMetrics);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const updateSandbox = useWorkflowStore((s) => s.updateSandbox);
  const recordSnapshot = useWorkflowStore((s) => s.recordSnapshot);
  const timeTravelSnapshots = useWorkflowStore((s) => s.timeTravelSnapshots);
  const timeTravelIndex = useWorkflowStore((s) => s.timeTravelIndex);
  const scrubToSnapshot = useWorkflowStore((s) => s.scrubToSnapshot);
  const activeTab = useWorkflowStore((s) => s.activeTab);
  const setActiveTab = useWorkflowStore((s) => s.setActiveTab);
  const setExportModalOpen = useWorkflowStore((s) => s.setExportModalOpen);
  const setImportModalOpen = useWorkflowStore((s) => s.setImportModalOpen);
  const setApprovalModalOpen = useWorkflowStore((s) => s.setApprovalModalOpen);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal logs
  useEffect(() => {
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Sync speed multiplier to execution engine
  useEffect(() => {
    agentEngine.setSpeed(speedMultiplier);
  }, [speedMultiplier]);

  // Execute Workflow Generator Loop
  const handleStartWorkflow = async () => {
    if (workflowMachine.state === 'RUNNING') return;

    soundEffects.playRunStart();
    dispatchWorkflow({ type: 'START' });
    agentEngine.setSpeed(speedMultiplier);

    const stepGenerator = agentEngine.runWorkflow({
      nodes,
      edges,
      goal: activeGoal,
      engineMode,
      mockPageType,
    });

    try {
      let stepIndex = 0;

      for await (const event of stepGenerator) {
        stepIndex++;

        startTransition(() => {
          switch (event.type) {
            case 'STATUS_CHANGE':
              updateNodeData(event.nodeId, { status: event.status });
              if (event.status === 'THINKING') {
                soundEffects.playNodeActivate();
              }
              break;

            case 'TOKEN_STREAM':
              updateNodeData(event.nodeId, {
                lastThought: event.thought,
                currentStepText: event.thought,
              });
              if (event.metrics) {
                const estGpt4Cost = Number(((event.metrics.tokens / 1000) * 0.005).toFixed(4));
                updateMetrics({
                  totalTokens: event.metrics.tokens,
                  currentTps: event.metrics.tps,
                  totalLatencyMs: event.metrics.latencyMs,
                  stepCount: stepIndex,
                  costSaved: estGpt4Cost,
                  estimatedGpt4Cost: estGpt4Cost,
                });
              }
              break;

            case 'SCRAPER_ACTION':
              if (event.cursor) {
                updateSandbox({
                  cursorPosition: event.cursor,
                  activeSelector: event.selector || null,
                  highlightedElementId: event.highlightedElementId || null,
                });
              }
              break;

            case 'TOOL_CALL':
              soundEffects.playToolCall();
              updateNodeData(event.nodeId, {
                currentStepText: `Executing tool ${event.toolName}()...`,
              });
              break;

            case 'BREAKPOINT_TRIGGERED':
              soundEffects.playWarn();
              dispatchWorkflow({
                type: 'PAUSE_BREAKPOINT',
                nodeId: event.nodeId,
                payload: event.payload,
              });
              setApprovalModalOpen(true);
              break;

            case 'ROUTER_BRANCH':
              soundEffects.playBlip();
              break;

            case 'NODE_COMPLETE':
              soundEffects.playBlip();
              updateNodeData(event.nodeId, {
                status: 'DONE',
                customJsonPayload: event.payload,
              });
              break;

            case 'LOG_APPEND':
              if (event.log) {
                appendLog(event.log);
              }
              break;

            case 'CHAT_MESSAGE':
              if (event.chatMessage) {
                appendChatMessage(event.chatMessage);
                soundEffects.playBlip();
              }
              break;

            case 'CONSOLE_LOG':
              if (event.consoleLog) {
                appendSandboxConsole(event.consoleLog);
              }
              break;

            case 'WORKFLOW_FINISH':
              soundEffects.playSuccess();
              dispatchWorkflow({ type: 'COMPLETE', result: event.payload });
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#38bdf8', '#a855f7', '#10b981', '#f59e0b'],
              });
              break;
          }
        });

        // Record snapshot for Time-Travel Scrubber
        recordSnapshot({
          stepIndex,
          timestamp: Date.now(),
          nodeId: event.nodeId,
          workflowState: workflowMachine.state,
          activeNodeId: event.nodeId,
          nodes: JSON.parse(JSON.stringify(useWorkflowStore.getState().nodes)),
          edges: JSON.parse(JSON.stringify(useWorkflowStore.getState().edges)),
          logs: [...useWorkflowStore.getState().logs],
          sandboxState: { ...useWorkflowStore.getState().sandboxState },
          metrics: { ...useWorkflowStore.getState().metrics },
        });
      }
    } catch (err: any) {
      if (err.message === 'ABORTED') {
        dispatchWorkflow({ type: 'ABORT', reason: 'Aborted by user' });
      } else {
        console.error('Workflow error:', err);
        dispatchWorkflow({ type: 'ABORT', reason: err.message });
      }
    }
  };

  const handleAbort = () => {
    soundEffects.playClick();
    agentEngine.abort();
    dispatchWorkflow({ type: 'ABORT', reason: 'Execution manually stopped.' });
  };

  const handlePauseResume = () => {
    soundEffects.playClick();
    if (workflowMachine.state === 'RUNNING') {
      agentEngine.pause();
    } else if (workflowMachine.state === 'PAUSED_BREAKPOINT') {
      agentEngine.resume();
      dispatchWorkflow({ type: 'RESUME_APPROVAL' });
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  const currentIndex = timeTravelIndex ?? (timeTravelSnapshots.length - 1);

  // Compute estimated cost savings
  const tokens = metrics.totalTokens;
  const gpt4oCost = ((tokens / 1000) * 0.005).toFixed(4);
  const claudeCost = ((tokens / 1000) * 0.003).toFixed(4);

  return (
    <aside className="w-96 h-full flex flex-col bg-slate-900 border-l border-slate-800 select-text overflow-hidden">
      {/* Goal Input & Primary Orchestrator Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3.5 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>Task Orchestrator</span>
          </span>

          {/* Workflow State Pill */}
          <div
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 shadow-sm ${
              workflowMachine.state === 'RUNNING'
                ? 'bg-sky-500/20 text-sky-300 border-sky-400 animate-pulse'
                : workflowMachine.state === 'PAUSED_BREAKPOINT'
                ? 'bg-yellow-400 text-slate-950 border-yellow-300 font-extrabold animate-bounce'
                : workflowMachine.state === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                : workflowMachine.state === 'ABORTED'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                workflowMachine.state === 'RUNNING'
                  ? 'bg-sky-400 animate-ping'
                  : workflowMachine.state === 'PAUSED_BREAKPOINT'
                  ? 'bg-slate-950'
                  : workflowMachine.state === 'COMPLETED'
                  ? 'bg-emerald-400'
                  : workflowMachine.state === 'ABORTED'
                  ? 'bg-rose-400'
                  : 'bg-slate-500'
              }`}
            />
            <span>{workflowMachine.state}</span>
          </div>
        </div>

        {/* Goal Input Bar */}
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
            <span>Mission Goal Prompt</span>
            <span className="text-[10px] text-slate-400 font-mono">Editable</span>
          </label>
          <textarea
            value={activeGoal}
            onChange={(e) => setActiveGoal(e.target.value)}
            disabled={workflowMachine.state === 'RUNNING'}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs font-sans placeholder-slate-500 outline-none focus:border-sky-400 resize-none leading-relaxed transition-all shadow-inner disabled:opacity-60"
            placeholder="Describe the agent objective..."
          />
        </div>

        {/* Large Prominent Action Buttons */}
        <div className="space-y-2">
          {workflowMachine.state === 'RUNNING' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Execution</span>
              </button>
              <button
                onClick={handleAbort}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Abort</span>
              </button>
            </div>
          ) : workflowMachine.state === 'PAUSED_BREAKPOINT' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setApprovalModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-bold text-xs transition-all shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Inspect & Approve</span>
              </button>
              <button
                onClick={handleAbort}
                className="py-2.5 px-3 rounded-xl bg-rose-600/30 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/50 text-xs font-bold transition-colors"
                title="Abort Run"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartWorkflow}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Multi-Agent Workflow</span>
            </button>
          )}

          {/* Speed Multipliers */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-slate-400">Simulation Speed:</span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono font-bold">
              {[
                { s: 1, label: '1x Normal' },
                { s: 2, label: '2x Fast' },
                { s: 5, label: '5x Turbo' },
              ].map(({ s, label }) => (
                <button
                  key={s}
                  onClick={() => {
                    soundEffects.playClick();
                    setSpeedMultiplier(s);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    speedMultiplier === s
                      ? 'bg-sky-500 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time-Travel Execution Scrubber with Step Buttons */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-mono text-purple-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Time-Travel Scrubber</span>
          </span>
          <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">
            {timeTravelIndex === null ? 'LIVE EDGE' : `Step ${timeTravelIndex + 1} of ${timeTravelSnapshots.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {/* Step Back button */}
          <button
            onClick={() => {
              if (timeTravelSnapshots.length > 0) {
                const target = Math.max(0, currentIndex - 1);
                scrubToSnapshot(target);
                soundEffects.playBlip();
              }
            }}
            disabled={timeTravelSnapshots.length <= 1 || currentIndex <= 0}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="range"
            min={0}
            max={Math.max(0, timeTravelSnapshots.length - 1)}
            value={currentIndex}
            disabled={timeTravelSnapshots.length <= 1}
            onChange={(e) => {
              const val = Number(e.target.value);
              scrubToSnapshot(val);
              soundEffects.playBlip();
            }}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          {/* Step Forward button */}
          <button
            onClick={() => {
              if (timeTravelSnapshots.length > 0) {
                const target = Math.min(timeTravelSnapshots.length - 1, currentIndex + 1);
                scrubToSnapshot(target);
                soundEffects.playBlip();
              }
            }}
            disabled={timeTravelSnapshots.length <= 1 || currentIndex >= timeTravelSnapshots.length - 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {timeTravelIndex !== null && (
            <button
              onClick={() => {
                soundEffects.playClick();
                scrubToSnapshot(null);
              }}
              className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-purple-500 hover:bg-purple-400 text-white transition-colors whitespace-nowrap shadow-sm"
            >
              Live
            </button>
          )}
        </div>
      </div>

      {/* Real-time Telemetry Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-slate-800 bg-slate-900/40 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="text-slate-400 mb-1 flex items-center gap-1.5 font-bold text-[10px]">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Speed</span>
          </div>
          <div className="text-base font-extrabold text-emerald-400">
            {metrics.currentTps} <span className="text-[10px] font-normal text-slate-400">T/s</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="text-slate-400 mb-1 flex items-center gap-1.5 font-bold text-[10px]">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>Tokens</span>
          </div>
          <div className="text-base font-extrabold text-sky-400">
            {metrics.totalTokens}
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-sm">
          <div className="text-slate-400 mb-1 flex items-center gap-1.5 font-bold text-[10px]">
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            <span>Cost</span>
          </div>
          <div className="text-base font-extrabold text-purple-400 flex items-center gap-1">
            <span>$0.00</span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.2 rounded">
              FREE
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Tab Switcher (4 Tabs: Logs, Arena Chat, State/JSON, Cost ROI) */}
      <div className="flex items-center justify-between p-2 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('logs');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'logs'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Terminal Execution Logs"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs ({logs.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('chat');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'chat'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Agent Arena Chat Feed"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Arena ({chatMessages.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('payload');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'payload'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Inspect Structured State & JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>State</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('analytics');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
              activeTab === 'analytics'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Cost Savings and Performance ROI"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>ROI</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {activeTab === 'logs' && (
            <button
              onClick={() => {
                soundEffects.playClick();
                clearLogs();
              }}
              title="Clear terminal logs"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {activeTab === 'chat' && (
            <button
              onClick={() => {
                soundEffects.playClick();
                clearChatMessages();
              }}
              title="Clear agent arena chat"
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              soundEffects.playClick();
              setExportModalOpen(true);
            }}
            title="Export Workflow as JSON / Mermaid"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Export</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setImportModalOpen(true);
            }}
            title="Import Workflow JSON"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col">
        {/* TAB 1: Live Streaming Terminal Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-900 bg-slate-950 text-xs overflow-x-auto">
              <span className="text-slate-500 mr-1 font-mono text-[11px]">Filter:</span>
              {(['ALL', 'THOUGHT', 'TOOL', 'JSON', 'WARN', 'SYSTEM'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundEffects.playClick();
                    setLogFilter(lvl);
                  }}
                  className={`px-2 py-0.5 rounded-md transition-all font-mono text-[10px] font-bold ${
                    logFilter === lvl
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Scrollable Terminal Output */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 select-text leading-relaxed">
              {filteredLogs.map((log) => {
                let badgeClass = 'text-slate-300 bg-slate-800';
                if (log.level === 'THOUGHT') badgeClass = 'text-cyan-200 bg-cyan-950/80 border border-cyan-700/60 font-bold';
                if (log.level === 'TOOL') badgeClass = 'text-amber-200 bg-amber-950/80 border border-amber-700/60 font-bold';
                if (log.level === 'JSON') badgeClass = 'text-purple-200 bg-purple-950/80 border border-purple-700/60 font-bold';
                if (log.level === 'WARN') badgeClass = 'text-yellow-200 bg-yellow-950/80 border border-yellow-700/60 font-bold';
                if (log.level === 'ERROR') badgeClass = 'text-rose-200 bg-rose-950/80 border border-rose-700/60 font-bold';
                if (log.level === 'SYSTEM') badgeClass = 'text-emerald-200 bg-emerald-950/80 border border-emerald-700/60 font-bold';

                return (
                  <div key={log.id} className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded ${badgeClass}`}>
                          {log.level}
                        </span>
                        <span className="text-slate-300 font-bold uppercase">{log.agentRole}</span>
                      </div>
                      <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div className="text-slate-100 font-sans text-xs break-words pl-1">{log.message}</div>

                    {log.payload && (
                      <div className="mt-1 p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-emerald-300 text-[11px] overflow-x-auto max-h-36">
                        <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2: Agent Arena Chat Feed */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            <div className="p-2 border-b border-slate-900 text-[11px] font-mono text-slate-400 flex items-center justify-between bg-slate-900/50">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inter-Agent Collaboration Feed</span>
              </span>
              <span>{chatMessages.length} Messages</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 opacity-40 text-sky-400" />
                  <p className="text-xs font-semibold text-slate-400">No agent dialogue yet.</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Start the workflow to observe agents conversing, passing tokens, and sharing structured context.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const roleConfig = ROLE_AVATAR_CONFIG[msg.agentRole] || ROLE_AVATAR_CONFIG.supervisor;
                  return (
                    <div
                      key={msg.id}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-lg ${roleConfig.bg} ${roleConfig.text} border ${roleConfig.border} flex items-center justify-center font-bold text-[10px] uppercase font-mono shadow-sm`}
                          >
                            {msg.agentRole[0]}
                          </span>
                          <span className="text-xs font-bold text-slate-100">
                            {msg.agentName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                            {msg.agentRole}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-200 font-sans leading-relaxed pl-1">
                        {msg.content}
                      </div>

                      {msg.toolCall && (
                        <div className="p-2 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-1.5 shadow-inner">
                          <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold">{msg.toolCall.name}</span>
                          <span className="text-slate-400 truncate">
                            ({JSON.stringify(msg.toolCall.args)})
                          </span>
                        </div>
                      )}

                      {msg.tokens && (
                        <div className="flex justify-end pt-1">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-900">
                            ⚡ {msg.tokens} tokens
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* TAB 3: Interactive JSON Payload Inspector */}
        {activeTab === 'payload' && (
          <div className="h-full">
            <JsonInspector
              data={
                workflowMachine.completionData ||
                workflowMachine.pendingBreakpointData?.payload ||
                nodes.reduce((acc, cur) => {
                  if (cur.data.customJsonPayload) {
                    acc[cur.data.role] = cur.data.customJsonPayload;
                  }
                  return acc;
                }, {} as Record<string, any>)
              }
              title="Execution Memory & State"
              isEditable={workflowMachine.state === 'PAUSED_BREAKPOINT'}
            />
          </div>
        )}

        {/* TAB 4: Cost & Performance ROI Analytics */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs bg-slate-950">
            {/* Cost Savings Hero Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-sky-950/60 border border-emerald-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cost Efficiency ROI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/40">
                  100% IN-BROWSER
                </span>
              </div>

              <div className="text-3xl font-black text-white flex items-baseline gap-2">
                <span>$0.00</span>
                <span className="text-xs font-semibold text-emerald-400">Total Spent</span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                By executing models and agents natively in your browser tab (Web Audio, WebGPU, and client simulation), you bypass cloud GPU billings completely.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" />
                <span>Cloud API Cost Comparison</span>
              </h4>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-200 font-bold">Luminate UI (Browser)</div>
                    <div className="text-[10px] text-emerald-400 font-sans">Zero API Keys, Pure Client-Side</div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-sm">$0.00</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between opacity-85">
                  <div>
                    <div className="text-slate-300 font-semibold">OpenAI GPT-4o</div>
                    <div className="text-[10px] text-slate-500 font-sans">$5.00 / 1M tokens equivalent</div>
                  </div>
                  <div className="text-right">
                    <span className="text-rose-400 font-bold">${gpt4oCost}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between opacity-85">
                  <div>
                    <div className="text-slate-300 font-semibold">Anthropic Claude 3.5 Sonnet</div>
                    <div className="text-[10px] text-slate-500 font-sans">$3.00 / 1M tokens equivalent</div>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-400 font-bold">${claudeCost}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy & Hardware Efficiency */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md">
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Zero-Data-Retention Guarantee</span>
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                All prompt vectors, scraped DOM nodes, and tool outputs stay strictly inside your local browser memory. No external server receives your proprietary workflows.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
