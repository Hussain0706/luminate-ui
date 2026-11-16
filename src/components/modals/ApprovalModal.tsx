import React, { useState } from 'react';
import {
  PauseCircle,
  XCircle,
  Edit3,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { agentEngine } from '../../services/agentEngine';
import { WorkflowAction, WorkflowMachineState } from '../../reducers/workflowReducer';
import { soundEffects } from '../../services/soundFx';

interface ApprovalModalProps {
  workflowMachine: WorkflowMachineState;
  dispatchWorkflow: React.Dispatch<WorkflowAction>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  workflowMachine,
  dispatchWorkflow,
}) => {
  const isApprovalModalOpen = useWorkflowStore((s) => s.isApprovalModalOpen);
  const setApprovalModalOpen = useWorkflowStore((s) => s.setApprovalModalOpen);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const pendingData = workflowMachine.pendingBreakpointData;
  const targetNode = nodes.find((n) => n.id === pendingData?.nodeId);

  const [editableJson, setEditableJson] = useState(() =>
    JSON.stringify(pendingData?.payload || {}, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isApprovalModalOpen || workflowMachine.state !== 'PAUSED_BREAKPOINT') {
    return null;
  }

  const handleApprove = () => {
    try {
      const parsed = JSON.parse(editableJson);
      if (pendingData?.nodeId) {
        updateNodeData(pendingData.nodeId, {
          customJsonPayload: parsed,
        });
      }
      soundEffects.playClick();
      setApprovalModalOpen(false);
      dispatchWorkflow({ type: 'RESUME_APPROVAL', approvedPayload: parsed });
      agentEngine.resume();
    } catch (err: any) {
      setParseError(err?.message || 'Invalid JSON syntax');
    }
  };

  const handleAbort = () => {
    soundEffects.playClick();
    setApprovalModalOpen(false);
    agentEngine.abort();
    dispatchWorkflow({ type: 'ABORT', reason: 'Aborted at breakpoint review' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150 select-none text-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
              <PauseCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Human-in-the-Loop Review</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  {targetNode?.data.label || 'Node Paused'}
                </span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inspect and optionally edit the intermediate payload before resuming execution.
              </p>
            </div>
          </div>
        </div>

        {/* JSON Editor Body */}
        <div className="p-4 space-y-2 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 font-mono">
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Intermediate Payload (JSON)</span>
            </span>
            <span className="text-[10px] font-mono">
              Role: {targetNode?.data.role?.toUpperCase()}
            </span>
          </div>

          {parseError && (
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <textarea
            value={editableJson}
            onChange={(e) => {
              setEditableJson(e.target.value);
              setParseError(null);
            }}
            rows={10}
            className="w-full flex-1 p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-600 leading-relaxed resize-none"
            spellCheck={false}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50 dark:bg-[#10121a] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAbort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Abort Run</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditableJson(JSON.stringify(pendingData?.payload || {}, null, 2));
                setParseError(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Approve & Continue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
