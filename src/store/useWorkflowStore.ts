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
  AgentChatMessage,
  AgentNodeData,
  AgentRole,
  DeviceFrame,
  EngineMode,
  ExecutionLog,
  LogLevel,
  SandboxConsoleLog,
  SandboxState,
  TimeTravelSnapshot,
  WorkflowMetrics,
} from '../types';
import { WORKFLOW_TEMPLATES } from '../constants/templates';
import { MOCK_PAGES } from '../constants/mockPages';
import { calculateAutoLayout } from '../utils/autoLayout';
import { soundEffects } from '../services/soundFx';

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
  chatMessages: AgentChatMessage[];
  metrics: WorkflowMetrics;
  sandboxState: SandboxState;
  deviceFrame: DeviceFrame;

  // Time Travel
  timeTravelSnapshots: TimeTravelSnapshot[];
  timeTravelIndex: number | null; // null = live edge

  // UI state
  theme: 'light' | 'dark';
  viewMode: 'canvas' | 'split' | 'sandbox';
  isMiniMapVisible: boolean;
  isLeftSidebarOpen: boolean;
  activeTab: 'logs' | 'chat' | 'payload' | 'analytics';
  isWebLLMModalOpen: boolean;
  isExportModalOpen: boolean;
  isImportModalOpen: boolean;
  isApprovalModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  activeEdgeModalId: string | null;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setViewMode: (mode: 'canvas' | 'split' | 'sandbox') => void;
  toggleMiniMap: () => void;
  toggleLeftSidebar: () => void;
  setNodes: (nodes: Node<AgentNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setSelectedNodeId: (id: string | null) => void;
  addAgentNode: (role: AgentRole, position?: { x: number; y: number }) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, partial: Partial<AgentNodeData>) => void;
  toggleNodeBreakpoint: (nodeId: string) => void;
  loadTemplate: (templateId: string) => void;
  autoArrangeGraph: (direction?: 'LR' | 'TB') => void;
  setActiveGoal: (goal: string) => void;
  setEngineMode: (mode: EngineMode) => void;
  setSpeedMultiplier: (speed: number) => void;
  setMockPageType: (type: 'ecommerce' | 'news' | 'finance') => void;
  setDeviceFrame: (frame: DeviceFrame) => void;
  appendLog: (log: ExecutionLog) => void;
  clearLogs: () => void;
  setLogFilter: (filter: 'ALL' | LogLevel) => void;
  appendChatMessage: (msg: AgentChatMessage) => void;
  clearChatMessages: () => void;
  updateMetrics: (partial: Partial<WorkflowMetrics>) => void;
  updateSandbox: (partial: Partial<SandboxState>) => void;
  appendSandboxConsole: (log: SandboxConsoleLog) => void;
  recordSnapshot: (snapshot: TimeTravelSnapshot) => void;
  scrubToSnapshot: (index: number | null) => void;
  resetExecutionState: () => void;
  setActiveTab: (tab: 'logs' | 'chat' | 'payload' | 'analytics') => void;
  setWebLLMModalOpen: (open: boolean) => void;
  setExportModalOpen: (open: boolean) => void;
  setImportModalOpen: (open: boolean) => void;
  setApprovalModalOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveEdgeModalId: (id: string | null) => void;
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
  estimatedGpt4Cost: 0.0,
};

const initialTemplate = WORKFLOW_TEMPLATES[0];

const getStoredTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('luminate-theme') as 'light' | 'dark' | null;
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
  }
  return 'dark';
};

const applyDocumentTheme = (theme: 'light' | 'dark') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }
};

const initialTheme = getStoredTheme();
applyDocumentTheme(initialTheme);

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: initialTemplate.nodes,
  edges: initialTemplate.edges,
  selectedNodeId: null,

  activeGoal: initialTemplate.goal,
  engineMode: 'simulated',
  speedMultiplier: 1,
  mockPageType: initialTemplate.mockPageType,
  deviceFrame: 'desktop',

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
  chatMessages: [
    {
      id: 'chat-welcome',
      timestamp: Date.now(),
      nodeId: 'node-supervisor',
      agentRole: 'supervisor',
      agentName: 'Supervisor Agent',
      content: 'Standing by to coordinate multi-agent execution. Ready for mission objectives.',
    },
  ],
  metrics: DEFAULT_METRICS,
  sandboxState: {
    currentUrl: initialTemplate.mockUrl,
    pageTitle: MOCK_PAGES.ecommerce.title,
    activeSelector: null,
    highlightedElementId: null,
    cursorPosition: { x: 0, y: 0, visible: false },
    extractedData: null,
    mockPageType: 'ecommerce',
    consoleLogs: [
      { id: 'c-1', type: 'info', text: '[Navigation] Loaded document https://store.hypertech.io/products/quantum-gpu-x1', timestamp: Date.now() - 2000 },
      { id: 'c-2', type: 'log', text: '[DOM] 6 target selectors registered and ready for extraction', timestamp: Date.now() - 1000 },
    ],
  },

  timeTravelSnapshots: [],
  timeTravelIndex: null,

  activeTab: 'logs',
  theme: initialTheme,
  viewMode: 'canvas',
  isMiniMapVisible: true,
  isLeftSidebarOpen: true,
  isWebLLMModalOpen: false,
  isExportModalOpen: false,
  isImportModalOpen: false,
  isApprovalModalOpen: false,
  isCommandPaletteOpen: false,
  activeEdgeModalId: null,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminate-theme', next);
    }
    applyDocumentTheme(next);
    soundEffects.playClick();
    set({ theme: next });
  },

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luminate-theme', theme);
    }
    applyDocumentTheme(theme);
    set({ theme });
  },

  setViewMode: (viewMode) => set({ viewMode }),
  toggleMiniMap: () => set((state) => ({ isMiniMapVisible: !state.isMiniMapVisible })),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarOpen: !state.isLeftSidebarOpen })),

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

  onConnect: (connection: Connection) => {
    soundEffects.playClick();
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
    });
  },

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  addAgentNode: (role, position) => {
    soundEffects.playNodeActive();
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
      x: 100 + (currentNodes.length % 3) * 360,
      y: 120 + Math.floor(currentNodes.length / 3) * 280,
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

  duplicateNode: (nodeId: string) => {
    soundEffects.playClick();
    const sourceNode = get().nodes.find((n) => n.id === nodeId);
    if (!sourceNode) return;

    const newId = `${sourceNode.id}-copy-${Date.now().toString(36).substring(4)}`;
    const newNode: Node<AgentNodeData> = {
      ...sourceNode,
      id: newId,
      position: {
        x: sourceNode.position.x + 40,
        y: sourceNode.position.y + 40,
      },
      data: {
        ...sourceNode.data,
        id: newId,
        label: `${sourceNode.data.label} (Copy)`,
        status: 'IDLE',
        metrics: { tokens: 0, latencyMs: 0, tokensPerSec: 0 },
      },
    };

    set({ nodes: [...get().nodes, newNode], selectedNodeId: newId });
  },

  deleteNode: (nodeId: string) => {
    soundEffects.playClick();
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: null,
    });
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
    soundEffects.playClick();
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
    soundEffects.playClick();
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
      chatMessages: [
        {
          id: `chat-${Date.now()}`,
          timestamp: Date.now(),
          nodeId: 'node-supervisor',
          agentRole: 'supervisor',
          agentName: 'Supervisor Agent',
          content: `Loaded workflow mission: "${tmpl.name}". Standing by for start command.`,
        },
      ],
      sandboxState: {
        currentUrl: tmpl.mockUrl,
        pageTitle: pageData.title,
        activeSelector: null,
        highlightedElementId: null,
        cursorPosition: { x: 0, y: 0, visible: false },
        extractedData: null,
        mockPageType: tmpl.mockPageType,
        consoleLogs: [
          { id: `c-${Date.now()}-1`, type: 'info', text: `[Navigation] Navigated to ${tmpl.mockUrl}`, timestamp: Date.now() },
        ],
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

  autoArrangeGraph: (direction = 'LR') => {
    soundEffects.playClick();
    const arrangedNodes = calculateAutoLayout(get().nodes, get().edges, direction);
    set({ nodes: arrangedNodes });
  },

  setActiveGoal: (goal) => set({ activeGoal: goal }),
  setEngineMode: (mode) => {
    soundEffects.playClick();
    set({ engineMode: mode });
  },
  setSpeedMultiplier: (speed) => {
    soundEffects.playClick();
    set({ speedMultiplier: speed });
  },
  setDeviceFrame: (frame) => {
    soundEffects.playClick();
    set({ deviceFrame: frame });
  },
  setMockPageType: (type) => {
    const page = MOCK_PAGES[type] || MOCK_PAGES.ecommerce;
    set({
      mockPageType: type,
      sandboxState: {
        ...get().sandboxState,
        currentUrl: page.url,
        pageTitle: page.title,
        mockPageType: type,
        consoleLogs: [
          ...get().sandboxState.consoleLogs,
          { id: `c-${Date.now()}`, type: 'info', text: `[Navigation] Switched target domain to ${page.url}`, timestamp: Date.now() },
        ],
      },
    });
  },

  appendLog: (log) =>
    set((state) => ({
      logs: [...state.logs.slice(-500), log],
    })),

  clearLogs: () => {
    soundEffects.playClick();
    set({ logs: [] });
  },
  setLogFilter: (filter) => {
    soundEffects.playClick();
    set({ logFilter: filter });
  },

  appendChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-200), msg],
    })),

  clearChatMessages: () => {
    soundEffects.playClick();
    set({ chatMessages: [] });
  },

  updateMetrics: (partial) =>
    set((state) => {
      const newTokens = partial.totalTokens ?? state.metrics.totalTokens;
      // Estimate GPT-4o cost at $0.005 / 1,000 tokens
      const estimatedGpt4Cost = Number(((newTokens / 1000) * 0.005).toFixed(4));
      return {
        metrics: {
          ...state.metrics,
          ...partial,
          estimatedGpt4Cost,
        },
      };
    }),

  updateSandbox: (partial) =>
    set((state) => ({
      sandboxState: { ...state.sandboxState, ...partial },
    })),

  appendSandboxConsole: (log) =>
    set((state) => ({
      sandboxState: {
        ...state.sandboxState,
        consoleLogs: [...state.sandboxState.consoleLogs.slice(-100), log],
      },
    })),

  recordSnapshot: (snapshot) =>
    set((state) => ({
      timeTravelSnapshots: [...state.timeTravelSnapshots, snapshot],
    })),

  scrubToSnapshot: (index) => {
    soundEffects.playClick();
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
    soundEffects.playClick();
    set((state) => ({
      nodes: state.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'IDLE',
          currentStepText: undefined,
          lastThought: undefined,
          customJsonPayload: undefined,
          activeTool: undefined,
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

  setActiveTab: (tab) => {
    soundEffects.playClick();
    set({ activeTab: tab });
  },
  setWebLLMModalOpen: (open) => {
    soundEffects.playClick();
    set({ isWebLLMModalOpen: open });
  },
  setExportModalOpen: (open) => {
    soundEffects.playClick();
    set({ isExportModalOpen: open });
  },
  setImportModalOpen: (open) => {
    soundEffects.playClick();
    set({ isImportModalOpen: open });
  },
  setApprovalModalOpen: (open) => {
    soundEffects.playClick();
    set({ isApprovalModalOpen: open });
  },
  setCommandPaletteOpen: (open) => {
    soundEffects.playClick();
    set({ isCommandPaletteOpen: open });
  },
  setActiveEdgeModalId: (id) => {
    soundEffects.playClick();
    set({ activeEdgeModalId: id });
  },

  exportAsJson: () => {
    const data = {
      version: '2.0.0',
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
        soundEffects.playComplete();
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
