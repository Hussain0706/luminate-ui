import React, { useState } from 'react';
import {
  PauseCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Layers,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { agentEngine } from '../../services/agentEngine';
import { WorkflowAction, WorkflowMachineState } from '../../reducers/workflowReducer';

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
      setApprovalModalOpen(false);
      dispatchWorkflow({ type: 'RESUME_APPROVAL', approvedPayload: parsed });
      agentEngine.resume();
    } catch (err: any) {
      setParseError(err?.message || 'Invalid JSON syntax');
    }
  };

  const handleAbort = () => {
    setApprovalModalOpen(false);
    agentEngine.abort();
    dispatchWorkflow({ type: 'ABORT', reason: 'Aborted at breakpoint review' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-yellow-500/40 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.2)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_12px_rgba(250,204,21,0.4)]">
              <PauseCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Human-in-the-Loop Breakpoint</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  {targetNode?.data.label || 'Node Execution Paused'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Inspect and optionally modify the intermediate JSON payload before delegating to downstream agents.
              </p>
            </div>
          </div>
        </div>

        {/* JSON Editor Body */}
        <div className="p-4 space-y-3 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 font-mono">
              <Edit3 className="w-3.5 h-3.5 text-yellow-400" />
              <span>Intermediate Payload (Editable JSON)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Role: {targetNode?.data.role?.toUpperCase()}
            </span>
          </div>

          {parseError && (
            <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
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
            rows={12}
            className="w-full flex-1 p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 font-mono text-xs outline-none focus:border-yellow-400 leading-relaxed resize-none shadow-inner"
            spellCheck={false}
          />
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleAbort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition-colors"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleApprove}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(250,204,21,0.5)] active:scale-95"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Approve & Continue Workflow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
