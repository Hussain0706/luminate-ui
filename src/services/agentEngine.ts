import { AgentNodeData, AgentRole, ExecutionLog, LogLevel, SandboxState, WorkflowState } from '../types';
import { MOCK_PAGES } from '../constants/mockPages';
import { webLLMService } from './webllmService';

export interface WorkflowStepEvent {
  type: 
    | 'STATUS_CHANGE'
    | 'TOKEN_STREAM'
    | 'TOOL_CALL'
    | 'SCRAPER_ACTION'
    | 'ROUTER_BRANCH'
    | 'BREAKPOINT_TRIGGERED'
    | 'NODE_COMPLETE'
    | 'LOG_APPEND'
    | 'METRICS_UPDATE'
    | 'WORKFLOW_FINISH';
  nodeId: string;
  role?: AgentRole;
  status?: AgentNodeData['status'];
  delta?: string;
  thought?: string;
  toolName?: string;
  toolArgs?: any;
  toolResult?: any;
  cursor?: { x: number; y: number; visible: boolean };
  selector?: string;
  highlightedElementId?: string;
  extractedData?: any;
  branchEdgeId?: string;
  branchCondition?: string;
  payload?: any;
  log?: ExecutionLog;
  metrics?: { tokens: number; tps: number; latencyMs: number };
}

// Simulated persona steps for high realism
const AGENT_PERSONA_LOGIC: Record<AgentRole, {
  thoughts: (goal: string, prevData: any) => string[];
  tools: { name: string; args: any; result: (prev: any) => any }[];
  outputJson: (goal: string, prevData: any) => any;
}> = {
  supervisor: {
    thoughts: (goal) => [
      `Deconstructing user mission: "${goal.slice(0, 60)}..."`,
      'Formulating directed acyclic task graph and dependency matrix.',
      'Assigning high-priority scraping probe to Web Scraper Agent.',
      'Setting quality guardrail threshold: Confidence minimum 80% with cross-validation.',
    ],
    tools: [
      {
        name: 'task_planner',
        args: { strategy: 'hierarchical_tree_of_thought', depth: 3 },
        result: () => ({ subtasks: ['scrape_pricing', 'validate_schema', 'conditional_route', 'synthesize_report'], priority: 'HIGH' }),
      },
    ],
    outputJson: (goal) => ({
      mission: goal,
      workflowPlanId: 'WF-7821-X',
      targetDomain: 'store.hypertech.io',
      dispatchSchedule: [
        { agent: 'scraper', action: 'extract_dom_pricing' },
        { agent: 'router', action: 'guardrail_confidence_audit' },
        { agent: 'writer', action: 'generate_executive_dossier' },
      ],
      delegatedAt: new Date().toISOString(),
    }),
  },
  scraper: {
    thoughts: () => [
      'Initializing headless browser DOM session at target URL.',
      'Navigating to simulated page container and waiting for selector "#product-title".',
      'Querying DOM node: extracting element text and computed CSS styles.',
      'Parsing structured JSON-LD and microdata for pricing matrix.',
    ],
    tools: [
      {
        name: 'dom_query_selector',
        args: { selector: '#product-title', extract: 'innerText' },
        result: () => ({ text: 'HyperTech Quantum GPU-X1 Extreme Edition (24GB GDDR7)' }),
      },
      {
        name: 'extract_text',
        args: { selector: '#current-price', attribute: 'data-price' },
        result: () => ({ price: 899.99, msrp: 1149.99, discount: '22%' }),
      },
      {
        name: 'parse_table_data',
        args: { selector: '#specs-table' },
        result: () => ({ vram: '24GB GDDR7', architecture: 'TensorCore 5.0', tdp: '285W' }),
      },
    ],
    outputJson: () => ({
      product: 'HyperTech Quantum GPU-X1 Extreme Edition (24GB GDDR7)',
      priceUSD: 899.99,
      msrpUSD: 1149.99,
      discountPercentage: 22.0,
      stockStatus: 'In Stock (4 units CA)',
      merchantRating: 4.8,
      specs: {
        architecture: 'TensorCore 5.0',
        memory: '24GB GDDR7',
        tdp: '285W',
      },
      extractionTimestamp: new Date().toISOString(),
      rawSelectorHits: 6,
    }),
  },
  router: {
    thoughts: (_goal, prevData) => [
      `Ingested payload from upstream agent. Evaluating data integrity.`,
      `Testing heuristic: price variance (${prevData?.discountPercentage || 22}%) against baseline risk threshold.`,
      `Computing confidence score: Verification metrics = 88.5% confidence.`,
      `Branch decision: Condition (confidence >= 80%) met -> Dispatching directly to Summary Writer.`,
    ],
    tools: [
      {
        name: 'schema_validator',
        args: { schema: 'PricingIntelligence_v2' },
        result: () => ({ valid: true, missingFields: 0 }),
      },
      {
        name: 'confidence_scorer',
        args: { signals: ['seller_verified', 'msrp_delta_sane', 'dom_integrity'] },
        result: () => ({ confidence: 88.5, anomalies: 0 }),
      },
    ],
    outputJson: (_goal, prevData) => ({
      routedAt: new Date().toISOString(),
      confidence: 88.5,
      riskLevel: 'LOW',
      evaluation: 'Valid flash discount; authorized merchant; stock authentic.',
      selectedBranch: 'Summary Writer Agent',
      upstreamPayload: prevData,
    }),
  },
  researcher: {
    thoughts: () => [
      'Scanning historical price database and SKU registry.',
      'Checking 90-day pricing trajectory across 12 competitor stores.',
      'Verifying merchant license and return policy guarantees.',
      'Synthesizing empirical proof and cross-validation score.',
    ],
    tools: [
      {
        name: 'price_history_lookup',
        args: { sku: 'QNTM-GPU-X1-24G' },
        result: () => ({ historicalAvg: 1099.00, lowestRecorded: 899.99 }),
      },
      {
        name: 'fraud_detection_engine',
        args: { domain: 'store.hypertech.io' },
        result: () => ({ riskScore: 0.04, isLegitimate: true }),
      },
    ],
    outputJson: (_goal, prevData) => ({
      enrichmentType: 'historical_verification',
      historicalLowConfirmed: true,
      priceTrend30Days: 'Downward -6.2%',
      sellerLegitimacy: 'Certified Tier 1 Reseller',
      verifiedConfidence: 94.2,
      priorContext: prevData,
    }),
  },
  writer: {
    thoughts: () => [
      'Aggregating verified data points into executive synthesis format.',
      'Formulating actionable strategic recommendations and market impact analysis.',
      'Formatting markdown tables, summary bullet points, and pricing delta alerts.',
      'Reviewing output tone for crisp C-level clarity.',
    ],
    tools: [
      {
        name: 'markdown_generator',
        args: { template: 'executive_intel_memo' },
        result: () => ({ format: 'markdown', sections: 4 }),
      },
    ],
    outputJson: (goal, prevData) => ({
      reportTitle: 'EXECUTIVE INTELLIGENCE MEMO: Competitive Pricing Variance',
      summary: `Target product "${prevData?.upstreamPayload?.product || 'Quantum GPU-X1'}" is currently retailing at $${prevData?.upstreamPayload?.priceUSD || 899.99}, reflecting a 22% flash discount from $${prevData?.upstreamPayload?.msrpUSD || 1149.99} MSRP.`,
      recommendation: 'STRATEGIC BUY RECOMMENDATION — Flash discount is genuine with verified 4.8★ merchant. Immediate repricing or inventory procurement advised before 4-hour window expires.',
      confidenceScore: prevData?.confidence || 88.5,
      riskAssessment: 'LOW RISK / VERIFIED AUTHENTIC',
      generatedAt: new Date().toISOString(),
    }),
  },
};

export class AgentExecutionEngine {
  private abortController: AbortController | null = null;
  private isPaused: boolean = false;
  private resumeResolve: (() => void) | null = null;
  private speedMultiplier: number = 1;

  public setSpeed(multiplier: number) {
    this.speedMultiplier = multiplier;
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    if (this.resumeResolve) {
      this.resumeResolve();
      this.resumeResolve = null;
    }
  }

  public abort() {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.resume();
  }

  private async sleep(ms: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new Error('ABORTED');
    const adjusted = Math.max(10, ms / this.speedMultiplier);
    
    // Check pause
    if (this.isPaused) {
      await new Promise<void>((resolve) => {
        this.resumeResolve = resolve;
      });
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, adjusted);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('ABORTED'));
      });
    });
  }

  public async *runWorkflow(params: {
    nodes: any[];
    edges: any[];
    goal: string;
    engineMode: 'simulated' | 'webllm';
    mockPageType: 'ecommerce' | 'news' | 'finance';
  }): AsyncGenerator<WorkflowStepEvent, void, unknown> {
    this.abortController = new AbortController();
    const signal = this.abortController.signal;
    this.isPaused = false;

    const { nodes, edges, goal, engineMode, mockPageType } = params;
    const pageData = MOCK_PAGES[mockPageType] || MOCK_PAGES.ecommerce;

    let totalTokens = 0;
    const startTime = performance.now();
    let accumulatedPayload: any = { goal, pageUrl: pageData.url };

    // Find starting supervisor node
    let currentNode = nodes.find(n => n.data.role === 'supervisor') || nodes[0];
    const visitedNodeIds = new Set<string>();

    yield {
      type: 'LOG_APPEND',
      nodeId: currentNode.id,
      log: {
        id: `log-${Date.now()}-init`,
        timestamp: Date.now(),
        nodeId: 'system',
        agentRole: 'system',
        level: 'SYSTEM',
        message: `Workflow initiated with goal: "${goal}" (${engineMode === 'webllm' ? 'Local WebGPU Mode' : 'Simulated Agent Engine'})`,
      },
    };

    while (currentNode) {
      if (signal.aborted) throw new Error('ABORTED');
      visitedNodeIds.add(currentNode.id);
      const nodeRole: AgentRole = currentNode.data.role;
      const persona = AGENT_PERSONA_LOGIC[nodeRole];

      // 1. Status -> THINKING
      yield {
        type: 'STATUS_CHANGE',
        nodeId: currentNode.id,
        role: nodeRole,
        status: 'THINKING',
      };

      yield {
        type: 'LOG_APPEND',
        nodeId: currentNode.id,
        log: {
          id: `log-${Date.now()}-${nodeRole}-think`,
          timestamp: Date.now(),
          nodeId: currentNode.id,
          agentRole: nodeRole,
          level: 'THOUGHT',
          message: `${currentNode.data.label} activated: formulating reasoning sequence.`,
        },
      };

      await this.sleep(400, signal);

      // WebGPU real streaming vs simulated streaming
      if (engineMode === 'webllm' && webLLMService.getStatus().isLoaded) {
        try {
          const stream = webLLMService.streamChat([
            { role: 'system', content: currentNode.data.systemPrompt },
            { role: 'user', content: `Current Mission: ${goal}. Context: ${JSON.stringify(accumulatedPayload)}` },
          ], { temperature: currentNode.data.temperature });

          for await (const chunk of stream) {
            if (signal.aborted) throw new Error('ABORTED');
            if (chunk.content) {
              totalTokens += Math.ceil(chunk.content.length / 3.5);
              yield {
                type: 'TOKEN_STREAM',
                nodeId: currentNode.id,
                delta: chunk.content,
                thought: chunk.content,
                metrics: {
                  tokens: totalTokens,
                  tps: chunk.tokensPerSec || 42,
                  latencyMs: Math.round(performance.now() - startTime),
                },
              };
            }
          }
        } catch (err: any) {
          console.warn('Fallback to simulated streaming on error:', err);
        }
      } else {
        // High fidelity simulated token & thought streaming
        const thoughts = persona.thoughts(goal, accumulatedPayload);
        for (const thought of thoughts) {
          if (signal.aborted) throw new Error('ABORTED');

          const tokensInThought = Math.ceil(thought.length / 3.5);
          totalTokens += tokensInThought;
          const elapsedSec = (performance.now() - startTime) / 1000;
          const currentTps = Math.round(35 + Math.random() * 30);

          yield {
            type: 'TOKEN_STREAM',
            nodeId: currentNode.id,
            thought,
            metrics: {
              tokens: totalTokens,
              tps: currentTps,
              latencyMs: Math.round(performance.now() - startTime),
            },
          };

          yield {
            type: 'LOG_APPEND',
            nodeId: currentNode.id,
            log: {
              id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              timestamp: Date.now(),
              nodeId: currentNode.id,
              agentRole: nodeRole,
              level: 'THOUGHT',
              message: thought,
              tps: currentTps,
            },
          };

          await this.sleep(350, signal);
        }
      }

      // 2. Status -> TOOL_CALL (or Scraper animation if Scraper Agent)
      yield {
        type: 'STATUS_CHANGE',
        nodeId: currentNode.id,
        role: nodeRole,
        status: 'TOOL_CALL',
      };

      if (nodeRole === 'scraper') {
        // Animate virtual cursor across mock DOM elements!
        for (const elem of pageData.elements) {
          if (signal.aborted) throw new Error('ABORTED');

          yield {
            type: 'SCRAPER_ACTION',
            nodeId: currentNode.id,
            cursor: { x: elem.bounds.left + 20, y: elem.bounds.top + 10, visible: true },
            selector: elem.selector,
            highlightedElementId: elem.id,
          };

          yield {
            type: 'LOG_APPEND',
            nodeId: currentNode.id,
            log: {
              id: `log-${Date.now()}-scrape-${elem.id}`,
              timestamp: Date.now(),
              nodeId: currentNode.id,
              agentRole: nodeRole,
              level: 'TOOL',
              message: `Scraper Virtual Cursor -> Target selector "${elem.selector}" (${elem.label})`,
              payload: { selector: elem.selector, extractedText: elem.text },
            },
          };

          await this.sleep(450, signal);
        }

        // Hide virtual cursor after scraping
        yield {
          type: 'SCRAPER_ACTION',
          nodeId: currentNode.id,
          cursor: { x: 0, y: 0, visible: false },
          selector: undefined,
          highlightedElementId: undefined,
        };
      } else {
        // Execute persona tools
        for (const tool of persona.tools) {
          if (signal.aborted) throw new Error('ABORTED');

          const toolResult = tool.result(accumulatedPayload);
          yield {
            type: 'TOOL_CALL',
            nodeId: currentNode.id,
            toolName: tool.name,
            toolArgs: tool.args,
            toolResult,
          };

          yield {
            type: 'LOG_APPEND',
            nodeId: currentNode.id,
            log: {
              id: `log-${Date.now()}-tool-${tool.name}`,
              timestamp: Date.now(),
              nodeId: currentNode.id,
              agentRole: nodeRole,
              level: 'TOOL',
              message: `Tool invocation: ${tool.name}()`,
              payload: { args: tool.args, result: toolResult },
            },
          };

          await this.sleep(300, signal);
        }
      }

      // Generate structured node payload
      const nodeOutput = persona.outputJson(goal, accumulatedPayload);
      accumulatedPayload = { ...accumulatedPayload, ...nodeOutput };

      yield {
        type: 'LOG_APPEND',
        nodeId: currentNode.id,
        log: {
          id: `log-${Date.now()}-json`,
          timestamp: Date.now(),
          nodeId: currentNode.id,
          agentRole: nodeRole,
          level: 'JSON',
          message: `Structured output generated for ${currentNode.data.label}`,
          payload: nodeOutput,
        },
      };

      // 3. Human-in-the-Loop Breakpoint check!
      if (currentNode.data.breakpointEnabled) {
        yield {
          type: 'STATUS_CHANGE',
          nodeId: currentNode.id,
          role: nodeRole,
          status: 'AWAITING_APPROVAL',
        };

        yield {
          type: 'BREAKPOINT_TRIGGERED',
          nodeId: currentNode.id,
          payload: nodeOutput,
        };

        yield {
          type: 'LOG_APPEND',
          nodeId: currentNode.id,
          log: {
            id: `log-${Date.now()}-bp`,
            timestamp: Date.now(),
            nodeId: currentNode.id,
            agentRole: nodeRole,
            level: 'WARN',
            message: `⏸️ Human-in-the-Loop Breakpoint triggered on ${currentNode.data.label}. Execution paused for inspection & approval.`,
            payload: nodeOutput,
          },
        };

        // Pause until user hits "Approve / Resume" in the UI
        this.isPaused = true;
        await new Promise<void>((resolve) => {
          this.resumeResolve = resolve;
        });

        if (signal.aborted) throw new Error('ABORTED');
      }

      // 4. Status -> DONE
      yield {
        type: 'STATUS_CHANGE',
        nodeId: currentNode.id,
        role: nodeRole,
        status: 'DONE',
      };

      yield {
        type: 'NODE_COMPLETE',
        nodeId: currentNode.id,
        payload: nodeOutput,
      };

      // 5. Evaluate Outgoing Edges & Conditional Routing
      const outgoingEdges = edges.filter(e => e.source === currentNode.id);

      if (outgoingEdges.length === 0) {
        // Terminal node reached
        break;
      }

      let nextNodeId: string | null = null;

      // Check conditional edges
      if (outgoingEdges.length > 1) {
        // Conditional branching router!
        let matchedEdge = null;
        for (const edge of outgoingEdges) {
          const edgeData = edge.data || {};
          if (edgeData.conditionKey) {
            const keyVal = accumulatedPayload[edgeData.conditionKey];
            const threshold = edgeData.thresholdValue;
            let conditionPassed = false;

            if (edgeData.operator === '<') conditionPassed = Number(keyVal) < Number(threshold);
            else if (edgeData.operator === '>') conditionPassed = Number(keyVal) > Number(threshold);
            else if (edgeData.operator === '==') conditionPassed = keyVal === threshold;
            else if (edgeData.operator === '>=') conditionPassed = Number(keyVal) >= Number(threshold);
            else if (edgeData.operator === '<=') conditionPassed = Number(keyVal) <= Number(threshold);

            if (conditionPassed) {
              matchedEdge = edge;
              break;
            }
          }
        }

        // If no conditional edge matched, pick fallback (else) edge or first
        if (!matchedEdge) {
          matchedEdge = outgoingEdges.find(e => e.data?.isFallback) || outgoingEdges[0];
        }

        yield {
          type: 'ROUTER_BRANCH',
          nodeId: currentNode.id,
          branchEdgeId: matchedEdge.id,
          branchCondition: matchedEdge.data?.label || 'default',
        };

        yield {
          type: 'LOG_APPEND',
          nodeId: currentNode.id,
          log: {
            id: `log-${Date.now()}-branch`,
            timestamp: Date.now(),
            nodeId: currentNode.id,
            agentRole: nodeRole,
            level: 'INFO',
            message: `Conditional Branch evaluated -> Routed along edge "${matchedEdge.data?.label || matchedEdge.id}"`,
          },
        };

        nextNodeId = matchedEdge.target;
      } else {
        nextNodeId = outgoingEdges[0].target;
      }

      await this.sleep(300, signal);

      // Prevent infinite loops if loopback reached max iterations
      if (nextNodeId && visitedNodeIds.has(nextNodeId) && visitedNodeIds.size > 8) {
        break;
      }

      currentNode = nodes.find(n => n.id === nextNodeId) || null;
    }

    yield {
      type: 'WORKFLOW_FINISH',
      nodeId: 'workflow-complete',
      payload: accumulatedPayload,
      metrics: {
        tokens: totalTokens,
        tps: Math.round(totalTokens / Math.max(1, (performance.now() - startTime) / 1000)),
        latencyMs: Math.round(performance.now() - startTime),
      },
    };

    yield {
      type: 'LOG_APPEND',
      nodeId: 'system',
      log: {
        id: `log-${Date.now()}-complete`,
        timestamp: Date.now(),
        nodeId: 'system',
        agentRole: 'system',
        level: 'SYSTEM',
        message: `🎉 Workflow completed successfully in ${Math.round(performance.now() - startTime)}ms. Total tokens generated: ${totalTokens} (100% Free Client-Side).`,
        payload: accumulatedPayload,
      },
    };
  }
}

export const agentEngine = new AgentExecutionEngine();
