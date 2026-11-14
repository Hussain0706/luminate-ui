export type AgentRole = 'supervisor' | 'scraper' | 'researcher' | 'router' | 'writer';

export type AgentStatus = 'IDLE' | 'THINKING' | 'TOOL_CALL' | 'AWAITING_APPROVAL' | 'DONE' | 'ERROR';

export type WorkflowState = 'IDLE' | 'RUNNING' | 'PAUSED_BREAKPOINT' | 'COMPLETED' | 'ABORTED';

export type EngineMode = 'simulated' | 'webllm';

export type ModelOption = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC' | 'SmolLM2-360M-Instruct-q4f16_1-MLC';

export interface AgentNodeData {
  id: string;
  label: string;
  role: AgentRole;
  description: string;
  systemPrompt: string;
  status: AgentStatus;
  breakpointEnabled: boolean;
  temperature: number;
  tools: string[];
  customJsonPayload?: Record<string, any>;
  lastThought?: string;
  currentStepText?: string;
  metrics?: {
    tokens: number;
    latencyMs: number;
    tokensPerSec: number;
  };
}

export interface EdgeConditionData {
  conditionKey?: string;
  operator?: '>' | '<' | '==' | '!=' | 'includes';
  thresholdValue?: any;
  label?: string;
  isFallback?: boolean; // else path
  status?: 'idle' | 'active' | 'passed' | 'skipped';
}

export type LogLevel = 'INFO' | 'THOUGHT' | 'TOOL' | 'JSON' | 'WARN' | 'ERROR' | 'SYSTEM';

export interface ExecutionLog {
  id: string;
  timestamp: number;
  nodeId: string;
  agentRole: AgentRole | 'system';
  level: LogLevel;
  message: string;
  payload?: any;
  tps?: number;
}

export interface SandboxElement {
  id: string;
  selector: string;
  tag: string;
  text: string;
  attributes: Record<string, string>;
  coords?: { x: number; y: number; width: number; height: number };
}

export interface SandboxState {
  currentUrl: string;
  pageTitle: string;
  activeSelector: string | null;
  highlightedElementId: string | null;
  cursorPosition: {
    x: number;
    y: number;
    visible: boolean;
  };
  extractedData: any;
  mockPageType: 'ecommerce' | 'news' | 'finance' | 'custom';
}

export interface WorkflowMetrics {
  totalTokens: number;
  currentTps: number;
  totalLatencyMs: number;
  costSaved: number;
  stepCount: number;
}

export interface TimeTravelSnapshot {
  stepIndex: number;
  timestamp: number;
  nodeId: string;
  workflowState: WorkflowState;
  activeNodeId: string | null;
  nodes: any[];
  edges: any[];
  logs: ExecutionLog[];
  sandboxState: SandboxState;
  metrics: WorkflowMetrics;
}

export interface WebLLMStatus {
  isSupported: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  downloadProgress: number; // 0 - 100
  progressText: string;
  selectedModel: ModelOption;
  error: string | null;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  goal: string;
  nodes: any[];
  edges: any[];
  mockPageType: 'ecommerce' | 'news' | 'finance';
  mockUrl: string;
}
