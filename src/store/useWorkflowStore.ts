import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
} from '@xyflow/react';
import {
  AgentNodeData,
  AgentRole,
  EngineMode,
  ExecutionLog,
  LogLevel,
  SandboxState,
  TimeTravelSnapshot,
  WorkflowMetrics,
} from '../types';
import { WORKFLOW_TEMPLATES } from '../constants/templates';
import { MOCK_PAGES } from '../constants/mockPages';

interface WorkflowStore {
  // Canvas State
  nodes: Node<AgentNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;

  // Execution Config
  activeGoal: string;
  engineMode: EngineMode;
  speedMultiplier: number;
  mockPageType: 'ecommerce' | 'news' | 'finance';

  // Live Telemetry
  logs: ExecutionLog[];
  logFilter: 'ALL' | LogLevel;
  metrics: WorkflowMetrics;
  sandboxState: SandboxState;

  // Time Travel
  timeTravelSnapshots: TimeTravelSnapshot[];
  timeTravelIndex: number | null; // null = live edge

  // UI state
  activeTab: 'logs' | 'payload' | 'metrics';
  isWebLLMModalOpen: boolean;
  isExportModalOpen: boolean;
  isImportModalOpen: boolean;
  isApprovalModalOpen: boolean;

  // Actions
  setNodes: (nodes: Node<AgentNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addAgentNode: (role: AgentRole, position?: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, partial: Partial<AgentNodeData>) => void;
  toggleNodeBreakpoint: (nodeId: string) => void;
  loadTemplate: (templateId: string) => void;
  setActiveGoal: (goal: string) => void;
  setEngineMode: (mode: EngineMode) => void;
  setSpeedMultiplier: (speed: number) => void;
  setMockPageType: (type: 'ecommerce' | 'news' | 'finance') => void;
  appendLog: (log: ExecutionLog) => void;
  clearLogs: () => void;
  setLogFilter: (filter: 'ALL' | LogLevel) => void;
  updateMetrics: (partial: Partial<WorkflowMetrics>) => void;
  updateSandbox: (partial: Partial<SandboxState>) => void;
  recordSnapshot: (snapshot: TimeTravelSnapshot) => void;
  scrubToSnapshot: (index: number | null) => void;
  resetExecutionState: () => void;
  setActiveTab: (tab: 'logs' | 'payload' | 'metrics') => void;
  setWebLLMModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setApprovalModalOpen: (open: boolean) => void;
  exportAsJson: () => string;
  exportAsMermaid: () => string;
  importWorkflow: (jsonString: string) => boolean;
}

const DEFAULT_METRICS: WorkflowMetrics = {
  totalTokens: 0,
  currentTps: 0,
  totalLatencyMs: 0,
  costSaved: 0.0,
  stepCount: 0,
};

const initialTemplate = WORKFLOW_TEMPLATES[0];

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: initialTemplate.nodes,
  edges: initialTemplate.edges,
  selectedNodeId: null,

  activeGoal: initialTemplate.goal,
  engineMode: 'simulated',
  speedMultiplier: 1,
  mockPageType: initialTemplate.mockPageType,

  logs: [
    {
      id: 'log-welcome',
      timestamp: Date.now(),
      nodeId: 'system',
      agentRole: 'system',
      level: 'SYSTEM',
      message: 'Luminate UI Multi-Agent Workflow Playground loaded. Ready to simulate client-side reasoning.',
    },
  ],
  logFilter: 'ALL',
  metrics: DEFAULT_METRICS,
  sandboxState: {
    currentUrl: initialTemplate.mockUrl,
    pageTitle: MOCK_PAGES.ecommerce.title,
    activeSelector: null,
    highlightedElementId: null,
    cursorPosition: { x: 0, y: 0, visible: false },
    extractedData: null,
    mockPageType: 'ecommerce',
  },

  timeTravelSnapshots: [],
  timeTravelIndex: null,

  activeTab: 'logs',
  isWebLLMModalOpen: false,
  isExportModalOpen: false,
  isImportModalOpen: false,
  isApprovalModalOpen: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<AgentNodeData>[],
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),

  onConnect: (connection: Connection) =>
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          type: 'conditionalEdge',
          data: { label: 'next_handoff', status: 'idle' },
        },
        get().edges
      ),
    }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addAgentNode: (role, position) => {
    const roleLabels: Record<AgentRole, { label: string; desc: string; tools: string[]; prompt: string }> = {
      supervisor: {
        label: 'Supervisor Agent',
        desc: 'Coordinates workflow orchestration and delegates subtasks.',
        tools: ['task_planner', 'handoff_router'],
        prompt: 'You are the Lead Workflow Supervisor. Analyze inputs and delegate tasks.',
      },
      scraper: {
        label: 'Web Scraper Agent',
        desc: 'Extracts real-time DOM attributes, selectors, and structured data.',
        tools: ['dom_query_selector', 'extract_text', 'parse_table_data'],
        prompt: 'You are a Headless Browser Scraper. Target the DOM elements and extract text.',
      },
      researcher: {
        label: 'Fact Researcher Agent',
        desc: 'Queries archival indexes and cross-validates historical context.',
        tools: ['price_history_lookup', 'fraud_detection_engine'],
        prompt: 'Query historical databases and verify assertions against prior records.',
      },
      router: {
        label: 'Router / Guardrail Agent',
        desc: 'Validates confidence thresholds and evaluates conditional branching.',
        tools: ['confidence_scorer', 'schema_validator'],
        prompt: 'Evaluate data confidence: if confidence < 80% route back; else route to output.',
      },
      writer: {
        label: 'Summary Writer Agent',
        desc: 'Produces executive intelligence memos and formatted markdown.',
        tools: ['markdown_generator', 'risk_calculator'],
        prompt: 'Synthesize verified telemetry into an executive markdown intelligence memo.',
      },
    };

    const info = roleLabels[role];
    const newNodeId = `node-${role}-${Date.now().toString(36).substring(4)}`;
    const currentNodes = get().nodes;
    const defaultPos = position || {
      x: 100 + (currentNodes.length % 4) * 260,
      y: 120 + Math.floor(currentNodes.length / 4) * 220,
    };

    const newNode: Node<AgentNodeData> = {
      id: newNodeId,
      type: 'agentNode',
      position: defaultPos,
      data: {
        id: newNodeId,
        label: info.label,
        role,
        description: info.desc,
        systemPrompt: info.prompt,
        status: 'IDLE',
        breakpointEnabled: role === 'router',
        temperature: 0.2,
        tools: info.tools,
        metrics: { tokens: 0, latencyMs: 0, tokensPerSec: 0 },
      },
    };

    set({ nodes: [...currentNodes, newNode], selectedNodeId: newNodeId });
  },

  updateNodeData: (nodeId, partial) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...partial },
          };
        }
        return node;
      }),
    });
  },

  toggleNodeBreakpoint: (nodeId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              breakpointEnabled: !node.data.breakpointEnabled,
            },
          };
        }
        return node;
      }),
    });
  },

  loadTemplate: (templateId) => {
    const tmpl = WORKFLOW_TEMPLATES.find((t) => t.id === templateId) || WORKFLOW_TEMPLATES[0];
    const pageData = MOCK_PAGES[tmpl.mockPageType] || MOCK_PAGES.ecommerce;

    set({
      nodes: JSON.parse(JSON.stringify(tmpl.nodes)),
      edges: JSON.parse(JSON.stringify(tmpl.edges)),
      activeGoal: tmpl.goal,
      mockPageType: tmpl.mockPageType,
      selectedNodeId: null,
      timeTravelSnapshots: [],
      timeTravelIndex: null,
      metrics: DEFAULT_METRICS,
      sandboxState: {
        currentUrl: tmpl.mockUrl,
        pageTitle: pageData.title,
        activeSelector: null,
        highlightedElementId: null,
        cursorPosition: { x: 0, y: 0, visible: false },
        extractedData: null,
        mockPageType: tmpl.mockPageType,
      },
      logs: [
        {
          id: `log-load-${Date.now()}`,
          timestamp: Date.now(),
          nodeId: 'system',
          agentRole: 'system',
          level: 'SYSTEM',
          message: `Loaded template: "${tmpl.name}" with ${tmpl.nodes.length} agent nodes.`,
        },
      ],
    });
  },

  setActiveGoal: (goal) => set({ activeGoal: goal }),
  setEngineMode: (mode) => set({ engineMode: mode }),
  setSpeedMultiplier: (speed) => set({ speedMultiplier: speed }),
  setMockPageType: (type) => {
    const page = MOCK_PAGES[type] || MOCK_PAGES.ecommerce;
    set({
      mockPageType: type,
      sandboxState: {
        ...get().sandboxState,
        currentUrl: page.url,
        pageTitle: page.title,
        mockPageType: type,
      },
    });
  },

  appendLog: (log) =>
    set((state) => ({
      logs: [...state.logs.slice(-500), log], // keep last 500 logs for high responsiveness
    })),

  clearLogs: () => set({ logs: [] }),
  setLogFilter: (filter) => set({ logFilter: filter }),

  updateMetrics: (partial) =>
    set((state) => ({
      metrics: { ...state.metrics, ...partial },
    })),

  updateSandbox: (partial) =>
    set((state) => ({
      sandboxState: { ...state.sandboxState, ...partial },
    })),

  recordSnapshot: (snapshot) =>
    set((state) => ({
      timeTravelSnapshots: [...state.timeTravelSnapshots, snapshot],
    })),

  scrubToSnapshot: (index) => {
    if (index === null) {
      set({ timeTravelIndex: null });
      return;
    }
    const snapshots = get().timeTravelSnapshots;
    if (index >= 0 && index < snapshots.length) {
      const snap = snapshots[index];
      set({
        timeTravelIndex: index,
        nodes: snap.nodes,
        edges: snap.edges,
        logs: snap.logs,
        sandboxState: snap.sandboxState,
        metrics: snap.metrics,
      });
    }
  },

  resetExecutionState: () => {
    set((state) => ({
      nodes: state.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'IDLE',
          currentStepText: undefined,
          lastThought: undefined,
          customJsonPayload: undefined,
        },
      })),
      edges: state.edges.map((e) => ({
        ...e,
        data: {
          ...e.data,
          status: 'idle',
        },
      })),
      metrics: DEFAULT_METRICS,
      timeTravelSnapshots: [],
      timeTravelIndex: null,
      sandboxState: {
        ...state.sandboxState,
        activeSelector: null,
        highlightedElementId: null,
        cursorPosition: { x: 0, y: 0, visible: false },
      },
    }));
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setWebLLMModalOpen: (open) => set({ isWebLLMModalOpen: open }),
  setExportModalOpen: (open) => set({ isExportModalOpen: open }),
  setImportModalOpen: (open) => set({ isImportModalOpen: open }),
  setApprovalModalOpen: (open) => set({ isApprovalModalOpen: open }),

  exportAsJson: () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      goal: get().activeGoal,
      mockPageType: get().mockPageType,
      nodes: get().nodes,
      edges: get().edges,
    };
    return JSON.stringify(data, null, 2);
  },

  exportAsMermaid: () => {
    const { nodes, edges } = get();
    let mermaid = 'graph TD\n';
    nodes.forEach((n) => {
      const label = `${n.data.label} [${n.data.role.toUpperCase()}]`;
      mermaid += `  ${n.id}["${label}"]\n`;
    });
    edges.forEach((e) => {
      const edgeLabel = e.data?.label ? `|${e.data.label}|` : '';
      mermaid += `  ${e.source} -->${edgeLabel} ${e.target}\n`;
    });
    return mermaid;
  },

  importWorkflow: (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        set({
          nodes: parsed.nodes,
          edges: parsed.edges,
          activeGoal: parsed.goal || get().activeGoal,
          mockPageType: parsed.mockPageType || get().mockPageType,
          timeTravelSnapshots: [],
          timeTravelIndex: null,
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  },
}));
