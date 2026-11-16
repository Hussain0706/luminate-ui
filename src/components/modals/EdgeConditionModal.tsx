import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  X,
  Save,
  Trash2,
  Sliders,
  CheckCircle2,
  CornerDownRight,
  Sparkles,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { soundEffects } from '../../services/soundFx';

interface EdgeConditionModalProps {
  edgeId?: string | null;
  onClose?: () => void;
}

export const EdgeConditionModal: React.FC<EdgeConditionModalProps> = ({
  edgeId: propEdgeId,
  onClose: propOnClose,
}) => {
  const storeEdgeId = useWorkflowStore((s) => s.activeEdgeModalId);
  const setStoreEdgeId = useWorkflowStore((s) => s.setActiveEdgeModalId);

  const edgeId = propEdgeId !== undefined ? propEdgeId : storeEdgeId;
  const onClose = propOnClose || (() => setStoreEdgeId(null));

  const edges = useWorkflowStore((s) => s.edges);
  const nodes = useWorkflowStore((s) => s.nodes);
  const setEdges = useWorkflowStore((s) => s.setEdges);

  const targetEdge = edges.find((e) => e.id === edgeId);
  const sourceNode = nodes.find((n) => n.id === targetEdge?.source);
  const targetNode = nodes.find((n) => n.id === targetEdge?.target);

  const [conditionKey, setConditionKey] = useState('');
  const [operator, setOperator] = useState<'>' | '<' | '==' | '!=' | '>='>('>=');
  const [thresholdValue, setThresholdValue] = useState<string>('80');
  const [label, setLabel] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    if (targetEdge) {
      const data = (targetEdge.data as any) || {};
      setConditionKey(data.conditionKey || 'confidence');
      setOperator(data.operator || '>=');
      setThresholdValue(String(data.thresholdValue ?? 80));
      setLabel(data.label || '');
      setIsFallback(!!data.isFallback);
    }
  }, [targetEdge]);

  if (!edgeId || !targetEdge) return null;

  const handleSave = () => {
    soundEffects.playClick();
    const updatedEdges = edges.map((edge) => {
      if (edge.id === edgeId) {
        return {
          ...edge,
          data: {
            ...((edge.data as any) || {}),
            conditionKey: isFallback ? undefined : conditionKey,
            operator: isFallback ? undefined : operator,
            thresholdValue: isFallback
              ? undefined
              : isNaN(Number(thresholdValue))
              ? thresholdValue
              : Number(thresholdValue),
            label: label || (isFallback ? 'Fallback / Else' : `${conditionKey} ${operator} ${thresholdValue}`),
            isFallback,
          },
        };
      }
      return edge;
    });

    setEdges(updatedEdges);
    onClose();
  };

  const handleRemoveCondition = () => {
    soundEffects.playClick();
    const updatedEdges = edges.map((edge) => {
      if (edge.id === edgeId) {
        const { conditionKey, operator, thresholdValue, label, isFallback, ...rest } = (edge.data as any) || {};
        return {
          ...edge,
          data: rest,
        };
      }
      return edge;
    });

    setEdges(updatedEdges);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Conditional Edge Branch
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Configure IF / ELSE routing between agents
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source -> Target Nodes Preview */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-sky-400 font-bold">{sourceNode?.data.label || 'Source'}</span>
            <span className="text-slate-500">→</span>
            <span className="text-purple-400 font-bold">{targetNode?.data.label || 'Target'}</span>
          </div>
          <span className="text-[10px] text-slate-500">ID: {edgeId.slice(0, 10)}</span>
        </div>

        {/* Fallback Switch */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-xs font-bold text-slate-200">Fallback / Else Branch</div>
            <div className="text-[10px] text-slate-400">Triggers if no other condition evaluates true</div>
          </div>
          <input
            type="checkbox"
            checked={isFallback}
            onChange={(e) => {
              soundEffects.playClick();
              setIsFallback(e.target.checked);
            }}
            className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
          />
        </div>

        {!isFallback && (
          <div className="space-y-3 font-sans text-xs">
            {/* Condition Field Key */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                <span>Payload Evaluation Key</span>
                <span className="text-[10px] text-slate-500 font-mono">e.g. confidence, cvssScore</span>
              </label>
              <input
                type="text"
                value={conditionKey}
                onChange={(e) => setConditionKey(e.target.value)}
                placeholder="confidence"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-purple-400"
              />
            </div>

            {/* Operator and Threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value=">=">&gt;= (Greater or equal)</option>
                  <option value=">">&gt; (Greater than)</option>
                  <option value="<=">&lt;= (Less or equal)</option>
                  <option value="<">&lt; (Less than)</option>
                  <option value="==">== (Exact match)</option>
                  <option value="!=">!= (Not equal)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Threshold</label>
                <input
                  type="text"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  placeholder="80"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xs outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Display Label Override */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-300 font-semibold flex items-center justify-between">
                <span>Custom Edge Badge Label (Optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. High Confidence (>= 80%)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleRemoveCondition}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Edge</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Apply Condition</span>
          </button>
        </div>
      </div>
    </div>
  );
};
