import { WorkflowState } from '../types';

export type WorkflowAction =
  | { type: 'START' }
  | { type: 'PAUSE_BREAKPOINT'; payload?: any; nodeId?: string }
  | { type: 'RESUME_APPROVAL'; approvedPayload?: any }
  | { type: 'COMPLETE'; result?: any }
  | { type: 'ABORT'; reason?: string }
  | { type: 'RESET' };

export interface WorkflowMachineState {
  state: WorkflowState;
  activeNodeId: string | null;
  pendingBreakpointData: {
    nodeId: string;
    payload: any;
  } | null;
  completionData: any | null;
  errorMessage: string | null;
}

export const initialWorkflowState: WorkflowMachineState = {
  state: 'IDLE',
  activeNodeId: null,
  pendingBreakpointData: null,
  completionData: null,
  errorMessage: null,
};

export function workflowReducer(
  state: WorkflowMachineState,
  action: WorkflowAction
): WorkflowMachineState {
  switch (action.type) {
    case 'START':
      if (state.state === 'IDLE' || state.state === 'COMPLETED' || state.state === 'ABORTED') {
        return {
          ...state,
          state: 'RUNNING',
          pendingBreakpointData: null,
          completionData: null,
          errorMessage: null,
        };
      }
      return state;

    case 'PAUSE_BREAKPOINT':
      if (state.state === 'RUNNING') {
        return {
          ...state,
          state: 'PAUSED_BREAKPOINT',
          activeNodeId: action.nodeId || state.activeNodeId,
          pendingBreakpointData: {
            nodeId: action.nodeId || '',
            payload: action.payload,
          },
        };
      }
      return state;

    case 'RESUME_APPROVAL':
      if (state.state === 'PAUSED_BREAKPOINT') {
        return {
          ...state,
          state: 'RUNNING',
          pendingBreakpointData: null,
        };
      }
      return state;

    case 'COMPLETE':
      if (state.state === 'RUNNING') {
        return {
          ...state,
          state: 'COMPLETED',
          activeNodeId: null,
          completionData: action.result,
        };
      }
      return state;

    case 'ABORT':
      return {
        ...state,
        state: 'ABORTED',
        activeNodeId: null,
        pendingBreakpointData: null,
        errorMessage: action.reason || 'Workflow stopped by user.',
      };

    case 'RESET':
      return {
        ...initialWorkflowState,
      };

    default:
      return state;
  }
}
