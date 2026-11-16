import React, { useState } from 'react';
import {
  Globe,
  RotateCw,
  Lock,
  Code2,
  Eye,
  FileJson,
  MousePointer2,
  Sparkles,
  Layers,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Smartphone,
  Tablet,
  Monitor,
  AlertTriangle,
  Info,
  AlertCircle,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { MOCK_PAGES, MockPageElement } from '../../constants/mockPages';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { soundEffects } from '../../services/soundFx';

const BrowserSandboxInternal: React.FC = () => {
  const sandboxState = useWorkflowStore((s) => s.sandboxState);
  const mockPageType = useWorkflowStore((s) => s.mockPageType);
  const setMockPageType = useWorkflowStore((s) => s.setMockPageType);
  const updateSandbox = useWorkflowStore((s) => s.updateSandbox);
  const deviceFrame = useWorkflowStore((s) => s.deviceFrame);
  const setDeviceFrame = useWorkflowStore((s) => s.setDeviceFrame);

  const [activeTab, setActiveTab] = useState<'preview' | 'dom' | 'extracted' | 'console'>('preview');
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const pageData = MOCK_PAGES[mockPageType] || MOCK_PAGES.ecommerce;
  const cursor = sandboxState.cursorPosition;
  const highlightedId = sandboxState.highlightedElementId || selectedElementId;
  const consoleLogs = sandboxState.consoleLogs || [];

  const handleCopy = (text: string) => {
    soundEffects.playClick();
    navigator.clipboard.writeText(text);
    setCopiedSelector(text);
    setTimeout(() => setCopiedSelector(null), 2000);
  };

  const handleElementClick = (elem: MockPageElement) => {
    soundEffects.playBlip();
    setSelectedElementId(elem.id);
    updateSandbox({
      activeSelector: elem.selector,
      highlightedElementId: elem.id,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-t border-slate-800 select-text overflow-hidden">
      {/* Mini-Browser Top Chrome / Address Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Window controls & Nav actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              updateSandbox({
                activeSelector: null,
                highlightedElementId: null,
                cursorPosition: { x: 0, y: 0, visible: false },
              });
              setSelectedElementId(null);
            }}
            title="Reload Sandbox DOM"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Reload</span>
          </button>

          {/* Responsive Device Frame Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('desktop');
              }}
              title="Desktop Viewport"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'desktop'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('tablet');
              }}
              title="Tablet Viewport (768px)"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'tablet'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('mobile');
              }}
              title="Mobile Viewport (390px)"
              className={`p-1.5 rounded-lg transition-colors ${
                deviceFrame === 'mobile'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs shadow-inner">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-500 select-none">https://</span>
          <span className="text-slate-100 truncate flex-1 font-semibold">{pageData.url.replace('https://', '')}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase font-sans font-bold">
            MOCK DOM
          </span>
        </div>

        {/* Page Switcher & View Mode Tabs */}
        <div className="flex items-center gap-2">
          {/* Target mock page dropdown */}
          <select
            value={mockPageType}
            onChange={(e) => {
              soundEffects.playClick();
              setMockPageType(e.target.value as any);
            }}
            className="bg-slate-800 text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-700 outline-none hover:border-slate-600 focus:border-sky-500 font-sans cursor-pointer shadow-sm"
          >
            <option value="ecommerce">E-Commerce (HyperTech GPU)</option>
            <option value="news">News Archive (Biotech Pilot)</option>
            <option value="finance">CloudSec (Zero-Day Audit)</option>
          </select>

          {/* View tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('preview');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('dom');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'dom'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DOM Tree</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('extracted');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'extracted'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Extracted</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('console');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'console'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console ({consoleLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox View Area */}
      <div className="relative flex-1 bg-slate-950 overflow-auto flex flex-col items-center">
        {/* Tab 1: Rendered Interactive Mock Page with Device Scaling */}
        {activeTab === 'preview' && (
          <div
            className={`w-full relative transition-all duration-300 py-6 px-4 flex justify-center ${
              deviceFrame === 'mobile'
                ? 'max-w-[420px]'
                : deviceFrame === 'tablet'
                ? 'max-w-[800px]'
                : 'max-w-5xl'
            }`}
          >
            {/* Virtual Cursor Animation (When Scraper Agent is executing) */}
            {cursor.visible && (
              <div
                className="absolute z-40 transition-all duration-300 pointer-events-none ease-out"
                style={{ top: `${cursor.y}px`, left: `${cursor.x}px` }}
              >
                <div className="relative">
                  <MousePointer2 className="w-6 h-6 text-purple-400 fill-purple-500 drop-shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse" />
                  <div className="absolute left-5 top-2 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-mono font-bold whitespace-nowrap shadow-xl border border-purple-300 backdrop-blur-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
                    <span>Scraper Cursor [Extracting...]</span>
                  </div>
                </div>
              </div>
            )}

            {/* Target Webpage Content Container */}
            <div
              className={`w-full rounded-2xl bg-slate-900 border p-6 shadow-2xl relative transition-all ${
                deviceFrame === 'mobile'
                  ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)] rounded-3xl'
                  : 'border-slate-800'
              }`}
            >
              {/* Target Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-xs text-slate-300">
                <span className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                  <span>{pageData.favicon}</span>
                  <span>{pageData.title}</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                  DOM Count: {pageData.elements.length} Nodes
                </span>
              </div>

              {/* Interactive Mock Elements with Neon Highlight State */}
              <div className="space-y-4">
                {pageData.elements.map((elem) => {
                  const isHighlighted = highlightedId === elem.id;

                  return (
                    <div
                      key={elem.id}
                      onClick={() => handleElementClick(elem)}
                      className={`relative group cursor-pointer p-3.5 rounded-xl border transition-all duration-200 ${
                        isHighlighted
                          ? 'bg-purple-950/40 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] ring-2 ring-purple-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950/80'
                      }`}
                    >
                      {/* Element Inspector Tag Badge */}
                      <div className="flex items-center justify-between mb-2 text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold truncate">
                          <span className="text-purple-400">{`<${elem.tag}>`}</span>
                          <span className="text-sky-300">{elem.selector}</span>
                          <span className="text-slate-500 font-sans">({elem.label})</span>
                        </span>
                        {isHighlighted ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400 animate-pulse text-[10px] font-bold shrink-0">
                            TARGETED
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-400 font-sans transition-opacity shrink-0">
                            Click to Inspect
                          </span>
                        )}
                      </div>

                      {/* Element Content */}
                      <div className="text-xs text-slate-100 font-sans leading-relaxed">
                        {elem.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DOM Tree & Selector Inspector */}
        {activeTab === 'dom' && (
          <div className="w-full p-5 font-mono text-xs max-w-4xl mx-auto space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 text-xs">
              <span className="font-bold">DOM Hierarchy Tree</span>
              <span className="text-slate-400">Click any element to inspect & copy CSS selector</span>
            </div>

            <div className="space-y-2">
              {pageData.elements.map((elem) => (
                <div
                  key={elem.id}
                  onClick={() => handleElementClick(elem)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                    highlightedId === elem.id
                      ? 'bg-sky-950/50 border-sky-400 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.3)] ring-1 ring-sky-400'
                      : 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate mr-3">
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-purple-400 font-bold">{elem.tag}</span>
                    <span className="text-sky-300 font-bold">{elem.selector}</span>
                    <span className="text-slate-400 truncate max-w-sm text-xs">
                      "{elem.text.slice(0, 50)}..."
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(elem.selector);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
                    title="Copy Selector"
                  >
                    {copiedSelector === elem.selector ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span className="text-[10px] font-sans font-semibold">
                      {copiedSelector === elem.selector ? 'Copied' : 'Copy'}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Selected Element Detail Box */}
            {selectedElementId && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl">
                <div className="text-xs font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Inspected Element Attributes</span>
                </div>
                {(() => {
                  const elem = pageData.elements.find((e) => e.id === selectedElementId);
                  if (!elem) return null;
                  return (
                    <div className="space-y-1.5 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 font-semibold">Selector:</span>{' '}
                        <span className="text-sky-300 font-bold">{elem.selector}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold">Parsed Value:</span>{' '}
                        <span className="text-emerald-400 font-bold">
                          {typeof elem.dataValue === 'object'
                            ? JSON.stringify(elem.dataValue)
                            : String(elem.dataValue)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Extracted Scraper Output JSON */}
        {activeTab === 'extracted' && (
          <div className="w-full p-5 font-mono text-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-300 text-xs">
              <span className="font-bold">Extracted Structured Schema</span>
              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(
                      pageData.elements.map((e) => ({
                        selector: e.selector,
                        value: e.dataValue,
                      })),
                      null,
                      2
                    )
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-sans font-bold transition-all shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Extracted JSON</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 overflow-x-auto text-xs leading-relaxed shadow-inner">
              {JSON.stringify(
                {
                  domain: pageData.url,
                  extractedAt: new Date().toISOString(),
                  dataset: pageData.elements.reduce((acc, cur) => {
                    acc[cur.selector] = cur.dataValue;
                    return acc;
                  }, {} as Record<string, any>),
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Tab 4: Browser Console Simulator */}
        {activeTab === 'console' && (
          <div className="w-full p-5 font-mono text-xs max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-300 text-xs">
              <span className="font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                <span>Simulated DevTools Console</span>
              </span>
              <span className="text-slate-400 text-[11px]">{consoleLogs.length} events logged</span>
            </div>

            {consoleLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No console messages recorded. Run a workflow to observe DOM mutation events.
              </div>
            ) : (
              <div className="space-y-1.5">
                {consoleLogs.map((log) => {
                  let Icon = Info;
                  let colorClass = 'text-slate-300 border-slate-800 bg-slate-900/60';
                  if (log.type === 'warn') {
                    Icon = AlertTriangle;
                    colorClass = 'text-yellow-300 border-yellow-700/50 bg-yellow-950/20';
                  } else if (log.type === 'error') {
                    Icon = AlertCircle;
                    colorClass = 'text-rose-300 border-rose-700/50 bg-rose-950/20';
                  }

                  return (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg border font-mono text-xs flex items-start gap-2 ${colorClass}`}
                    >
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 break-words">{log.text}</div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const BrowserSandbox: React.FC = () => {
  return (
    <ErrorBoundary fallbackTitle="Browser Sandbox Simulator Error">
      <BrowserSandboxInternal />
    </ErrorBoundary>
  );
};
