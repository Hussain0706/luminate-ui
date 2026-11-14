import { ModelOption, WebLLMStatus } from '../types';

export interface StreamChunk {
  content: string;
  isFinished: boolean;
  tokensPerSec?: number;
  totalTokens?: number;
}

class WebLLMManager {
  private engine: any = null;
  private currentModel: ModelOption = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
  private status: WebLLMStatus = {
    isSupported: false,
    isLoaded: false,
    isLoading: false,
    downloadProgress: 0,
    progressText: '',
    selectedModel: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    error: null,
  };
  private listeners: ((status: WebLLMStatus) => void)[] = [];

  constructor() {
    this.checkWebGPUSupport();
  }

  public checkWebGPUSupport(): boolean {
    const supported = typeof navigator !== 'undefined' && 'gpu' in navigator;
    this.status.isSupported = supported;
    if (!supported) {
      this.status.progressText = 'WebGPU is not enabled or supported in this browser. Fallback to Simulated Engine.';
    }
    this.notify();
    return supported;
  }

  public getStatus(): WebLLMStatus {
    return { ...this.status };
  }

  public subscribe(callback: (status: WebLLMStatus) => void): () => void {
    this.listeners.push(callback);
    callback(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    const current = this.getStatus();
    this.listeners.forEach(l => l(current));
  }

  public async initializeEngine(
    model: ModelOption = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    onProgress?: (progress: number, text: string) => void
  ): Promise<boolean> {
    if (!this.checkWebGPUSupport()) {
      this.status.error = 'WebGPU is not supported in this browser environment.';
      this.notify();
      return false;
    }

    if (this.engine && this.currentModel === model && this.status.isLoaded) {
      return true;
    }

    this.status.isLoading = true;
    this.status.selectedModel = model;
    this.status.error = null;
    this.notify();

    try {
      // Dynamic import of web-llm so it never blocks the initial bundle
      const webllm = await import('@mlc-ai/web-llm');
      
      const initProgressCallback = (report: any) => {
        const text = report.text || 'Loading weights...';
        const progress = Math.min(100, Math.max(0, Math.round((report.progress || 0) * 100)));
        this.status.downloadProgress = progress;
        this.status.progressText = text;
        this.notify();
        if (onProgress) {
          onProgress(progress, text);
        }
      };

      const engine = await webllm.CreateMLCEngine(model, {
        initProgressCallback,
      });

      this.engine = engine;
      this.currentModel = model;
      this.status.isLoaded = true;
      this.status.isLoading = false;
      this.status.progressText = `Ready: ${model}`;
      this.notify();
      return true;
    } catch (err: any) {
      console.warn('WebLLM init error:', err);
      this.status.isLoading = false;
      this.status.error = err?.message || 'Failed to initialize WebGPU LLM. Defaulting to Simulated Engine.';
      this.notify();
      return false;
    }
  }

  public async *streamChat(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: { temperature?: number; max_tokens?: number }
  ): AsyncGenerator<StreamChunk, void, unknown> {
    if (!this.engine || !this.status.isLoaded) {
      throw new Error('WebLLM engine is not loaded');
    }

    const startTime = performance.now();
    let tokenCount = 0;

    const completion = await this.engine.chat.completions.create({
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 512,
      stream: true,
    });

    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        tokenCount += Math.ceil(delta.length / 3.5);
        const elapsedSec = (performance.now() - startTime) / 1000;
        const tps = elapsedSec > 0 ? Math.round(tokenCount / elapsedSec) : 0;

        yield {
          content: delta,
          isFinished: false,
          tokensPerSec: tps,
          totalTokens: tokenCount,
        };
      }
    }

    const finalElapsed = (performance.now() - startTime) / 1000;
    yield {
      content: '',
      isFinished: true,
      tokensPerSec: finalElapsed > 0 ? Math.round(tokenCount / finalElapsed) : 0,
      totalTokens: tokenCount,
    };
  }
}

export const webLLMService = new WebLLMManager();
