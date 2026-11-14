import React, { useState } from 'react';
import {
  Globe,
  RotateCw,
  Lock,
  Code2,
  Eye,
  FileJson,
  MousePointer2,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/useWorkflowStore';
import { MOCK_PAGES, MockPageElement } from '../../constants/mockPages';
import { ErrorBoundary } from '../common/ErrorBoundary';

const BrowserSandboxInternal: React.FC = () => {
  const sandboxState = useWorkflowStore((s) => s.sandboxState);
  const mockPageType = useWorkflowStore((s) => s.mockPageType);
  const setMockPageType = useWorkflowStore((s) => s.setMockPageType);
  const updateSandbox = useWorkflowStore((s) => s.updateSandbox);

  const [activeTab, setActiveTab] = useState<'preview' | 'dom' | 'extracted'>('preview');
  const [copiedSelector, setCopiedSelector] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const pageData = MOCK_PAGES[mockPageType] || MOCK_PAGES.ecommerce;
  const cursor = sandboxState.cursorPosition;
  const activeSelector = sandboxState.activeSelector;
  const highlightedId = sandboxState.highlightedElementId || selectedElementId;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSelector(text);
    setTimeout(() => setCopiedSelector(null), 2000);
  };

  const handleElementClick = (elem: MockPageElement) => {
    setSelectedElementId(elem.id);
    updateSandbox({
      activeSelector: elem.selector,
      highlightedElementId: elem.id,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 border-t border-slate-800 select-text overflow-hidden">
      {/* Mini-Browser Top Chrome / Address Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Window controls & Nav actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm" />
          </div>

          <button
            onClick={() => {
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
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs shadow-inner">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-slate-500 select-none">https://</span>
          <span className="text-slate-100 truncate flex-1 font-semibold">{sandboxState.currentUrl.replace('https://', '')}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase font-sans font-bold">
            MOCK DOM
          </span>
        </div>

        {/* Page Switcher & View Mode Tabs */}
        <div className="flex items-center gap-3">
          {/* Target mock page dropdown */}
          <select
            value={mockPageType}
            onChange={(e) => setMockPageType(e.target.value as any)}
            className="bg-slate-800 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 outline-none hover:border-slate-600 focus:border-sky-500 font-sans cursor-pointer shadow-sm"
          >
            <option value="ecommerce">E-Commerce (HyperTech GPU)</option>
            <option value="news">News Archive (Biotech Pilot)</option>
          </select>

          {/* View tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'preview'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('dom')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'dom'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DOM Tree</span>
            </button>
            <button
              onClick={() => setActiveTab('extracted')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all font-semibold ${
                activeTab === 'extracted'
                  ? 'bg-sky-500 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Extracted</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox View Area */}
      <div className="relative flex-1 bg-slate-950 overflow-auto">
        {/* Tab 1: Rendered Interactive Mock Page */}
        {activeTab === 'preview' && (
          <div className="relative min-h-[300px] p-6 text-slate-100 max-w-4xl mx-auto">
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
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
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
                        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                          <span className="text-purple-400">{`<${elem.tag}>`}</span>
                          <span className="text-sky-300">{elem.selector}</span>
                          <span className="text-slate-500 font-sans">({elem.label})</span>
                        </span>
                        {isHighlighted ? (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400 animate-pulse text-[10px] font-bold">
                            TARGETED
                          </span>
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-sky-400 font-sans transition-opacity">
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
          <div className="p-5 font-mono text-xs max-w-4xl mx-auto space-y-3.5">
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
          <div className="p-5 font-mono text-xs max-w-4xl mx-auto">
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
