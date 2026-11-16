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
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { agentEngine } from '../../services/agentEngine';
import { JsonInspector } from '../inspector/JsonInspector';
import { WorkflowAction, WorkflowMachineState } from '../../reducers/workflowReducer';
import { AgentRole } from '../../types';
import { soundEffects } from '../../services/soundFx';

interface RightSidebarProps {
  workflowMachine: WorkflowMachineState;
  dispatchWorkflow: React.Dispatch<WorkflowAction>;
}

const ROLE_AVATAR_CONFIG: Record<AgentRole, { badge: string; text: string }> = {
  supervisor: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800', text: 'Supervisor' },
  scraper: { badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', text: 'Scraper' },
  router: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800', text: 'Router' },
  researcher: { badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', text: 'Researcher' },
  writer: { badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800', text: 'Writer' },
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
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
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
    <aside className="w-88 xl:w-96 h-full flex flex-col bg-white dark:bg-[#12141c] border-l border-slate-200 dark:border-[#212638] select-text overflow-hidden text-xs transition-colors">
      {/* Goal Input & Primary Orchestrator Controls */}
      <div className="p-4 border-b border-slate-200 dark:border-[#212638] space-y-3 bg-slate-50/60 dark:bg-[#151822]/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Task Orchestrator</span>
          </span>

          {/* Workflow State Pill */}
          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
              workflowMachine.state === 'RUNNING'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                : workflowMachine.state === 'PAUSED_BREAKPOINT'
                ? 'bg-amber-500 text-white border-amber-600 font-extrabold animate-pulse'
                : workflowMachine.state === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : workflowMachine.state === 'ABORTED'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                workflowMachine.state === 'RUNNING'
                  ? 'bg-blue-600 animate-ping'
                  : workflowMachine.state === 'PAUSED_BREAKPOINT'
                  ? 'bg-white'
                  : workflowMachine.state === 'COMPLETED'
                  ? 'bg-emerald-600'
                  : workflowMachine.state === 'ABORTED'
                  ? 'bg-rose-600'
                  : 'bg-slate-400'
              }`}
            />
            <span>{workflowMachine.state}</span>
          </div>
        </div>

        {/* Goal Input Bar */}
        <div className="space-y-1">
          <label className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span>Mission Objective</span>
            <span className="text-[10px] text-slate-400 font-mono">Editable</span>
          </label>
          <textarea
            value={activeGoal}
            onChange={(e) => setActiveGoal(e.target.value)}
            disabled={workflowMachine.state === 'RUNNING'}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-sans placeholder-slate-400 outline-none focus:border-blue-600 resize-none leading-relaxed transition-all disabled:opacity-60"
            placeholder="Describe the agent objective..."
          />
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2">
          {workflowMachine.state === 'RUNNING' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={handleAbort}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Inspect & Approve</span>
              </button>
              <button
                onClick={handleAbort}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-colors"
                title="Abort Run"
              >
                <Square className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartWorkflow}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Run Multi-Agent Workflow</span>
            </button>
          )}

          {/* Speed Multipliers */}
          <div className="flex items-center justify-between pt-0.5">
            <span className="text-[11px] font-mono text-slate-500">Speed:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0c0e14] p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium">
              {[
                { s: 1, label: '1x' },
                { s: 2, label: '2x' },
                { s: 5, label: '5x Turbo' },
              ].map(({ s, label }) => (
                <button
                  key={s}
                  onClick={() => {
                    soundEffects.playClick();
                    setSpeedMultiplier(s);
                  }}
                  className={`px-2 py-0.5 rounded transition-all ${
                    speedMultiplier === s
                      ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs font-bold border border-slate-200 dark:border-slate-700'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
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
      <div className="p-3 border-b border-slate-200 dark:border-[#212638] bg-white dark:bg-[#12141c] space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Time-Travel Scrubber</span>
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {timeTravelIndex === null ? 'LIVE' : `Step ${timeTravelIndex + 1}/${timeTravelSnapshots.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (timeTravelSnapshots.length > 0) {
                const target = Math.max(0, currentIndex - 1);
                scrubToSnapshot(target);
                soundEffects.playBlip();
              }
            }}
            disabled={timeTravelSnapshots.length <= 1 || currentIndex <= 0}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title="Previous Step"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
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
            className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <button
            onClick={() => {
              if (timeTravelSnapshots.length > 0) {
                const target = Math.min(timeTravelSnapshots.length - 1, currentIndex + 1);
                scrubToSnapshot(target);
                soundEffects.playBlip();
              }
            }}
            disabled={timeTravelSnapshots.length <= 1 || currentIndex >= timeTravelSnapshots.length - 1}
            className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            title="Next Step"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {timeTravelIndex !== null && (
            <button
              onClick={() => {
                soundEffects.playClick();
                scrubToSnapshot(null);
              }}
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap shadow-xs"
            >
              Live
            </button>
          )}
        </div>
      </div>

      {/* Telemetry Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 p-2.5 border-b border-slate-200 dark:border-[#212638] bg-slate-50/50 dark:bg-[#151822]/40 text-xs font-mono">
        <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 mb-0.5 flex items-center gap-1 font-semibold text-[10px]">
            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Speed</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {metrics.currentTps} <span className="text-[10px] font-normal text-slate-500">T/s</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 mb-0.5 flex items-center gap-1 font-semibold text-[10px]">
            <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Tokens</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {metrics.totalTokens}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800">
          <div className="text-slate-500 mb-0.5 flex items-center gap-1 font-semibold text-[10px]">
            <TrendingUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Cost</span>
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <span>$0.00</span>
            <span className="text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-1 rounded">
              FREE
            </span>
          </div>
        </div>
      </div>

      {/* Clean Segmented Tab Switcher */}
      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#0c0e14] border-b border-slate-200 dark:border-[#212638] text-xs">
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-[#161923] p-1 rounded-lg">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('logs');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
              activeTab === 'logs'
                ? 'bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('chat');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
              activeTab === 'chat'
                ? 'bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Arena</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('payload');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
              activeTab === 'payload'
                ? 'bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>State</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('analytics');
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-[#202534] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
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
              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
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
              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => {
              soundEffects.playClick();
              setExportModalOpen(true);
            }}
            title="Export Workflow JSON"
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setImportModalOpen(true);
            }}
            title="Import Workflow JSON"
            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white dark:bg-[#12141c]">
        {/* TAB 1: Logs */}
        {activeTab === 'logs' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#10121a] text-xs overflow-x-auto">
              <span className="text-slate-400 mr-1 font-mono text-[10px]">Filter:</span>
              {(['ALL', 'THOUGHT', 'TOOL', 'JSON', 'WARN', 'SYSTEM'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundEffects.playClick();
                    setLogFilter(lvl);
                  }}
                  className={`px-2 py-0.5 rounded transition-all font-mono text-[10px] font-semibold ${
                    logFilter === lvl
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Scrollable Output */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-2 select-text leading-relaxed">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded font-bold uppercase text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.level}
                      </span>
                      <span className="font-semibold uppercase">{log.agentRole}</span>
                    </div>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="text-slate-800 dark:text-slate-200 font-sans text-xs break-words pl-0.5">
                    {log.message}
                  </div>

                  {log.payload && (
                    <div className="mt-1 p-2 rounded bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-emerald-400 text-[11px] overflow-x-auto max-h-36">
                      <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* TAB 2: Agent Arena Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between bg-slate-50 dark:bg-[#10121a]">
              <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Inter-Agent Dialogue</span>
              </span>
              <span>{chatMessages.length} msgs</span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-1">
                  <MessageSquare className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No dialogue recorded yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Start a workflow to view real-time inter-agent messages and handoffs.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const roleCfg = ROLE_AVATAR_CONFIG[msg.agentRole] || ROLE_AVATAR_CONFIG.supervisor;
                  return (
                    <div
                      key={msg.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${roleCfg.badge}`}>
                            {roleCfg.text}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {msg.agentName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans">
                        {msg.content}
                      </div>

                      {msg.toolCall && (
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                          <Wrench className="w-3 h-3 shrink-0" />
                          <span className="font-bold">{msg.toolCall.name}</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">
                            ({JSON.stringify(msg.toolCall.args)})
                          </span>
                        </div>
                      )}

                      {msg.tokens && (
                        <div className="flex justify-end pt-0.5">
                          <span className="text-[10px] font-mono text-slate-500">
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

        {/* TAB 3: State / JSON */}
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

        {/* TAB 4: Cost ROI */}
        {activeTab === 'analytics' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
            {/* Hero Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Cost Efficiency ROI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                  100% Client-Side
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-baseline gap-2">
                <span>$0.00</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Total Spent</span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                By orchestrating models directly in the browser, you incur zero cloud API costs.
              </p>
            </div>

            {/* Comparison */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Equivalent Cloud API Cost</span>
              </h4>

              <div className="space-y-1.5 font-mono text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-800 dark:text-slate-200 font-bold">Luminate UI</div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans">Client-side execution</div>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">$0.00</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-85">
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold">OpenAI GPT-4o</div>
                    <div className="text-[10px] text-slate-500 font-sans">$5.00 / 1M tokens</div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">${gpt4oCost}</span>
                </div>

                <div className="p-2 rounded-lg bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 flex items-center justify-between opacity-85">
                  <div>
                    <div className="text-slate-700 dark:text-slate-300 font-semibold">Claude 3.5 Sonnet</div>
                    <div className="text-[10px] text-slate-500 font-sans">$3.00 / 1M tokens</div>
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 font-bold">${claudeCost}</span>
                </div>
              </div>
            </div>

            {/* Privacy */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero-Data-Retention Guarantee</span>
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                All prompt text, extracted DOM nodes, and outputs remain strictly in your browser session.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
