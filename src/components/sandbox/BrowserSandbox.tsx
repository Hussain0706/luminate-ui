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
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0c0e14] border-t border-slate-200 dark:border-[#212638] select-text overflow-hidden text-xs transition-colors">
      {/* Address Bar & Chrome */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-[#12141c] border-b border-slate-200 dark:border-[#212638]">
        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
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
            title="Reload DOM"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">Reload</span>
          </button>

          {/* Viewport switcher */}
          <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-[#0c0e14] p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('desktop');
              }}
              title="Desktop (100%)"
              className={`p-1 rounded ${
                deviceFrame === 'desktop'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('tablet');
              }}
              title="Tablet (768px)"
              className={`p-1 rounded ${
                deviceFrame === 'tablet'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setDeviceFrame('mobile');
              }}
              title="Mobile (390px)"
              className={`p-1 rounded ${
                deviceFrame === 'mobile'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-lg mx-3 flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs">
          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-slate-400 select-none">https://</span>
          <span className="truncate flex-1 font-medium">{pageData.url.replace('https://', '')}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-sans font-bold">
            DOM
          </span>
        </div>

        {/* Target Page Selector & View Tabs */}
        <div className="flex items-center gap-2">
          <select
            value={mockPageType}
            onChange={(e) => {
              soundEffects.playClick();
              setMockPageType(e.target.value as any);
            }}
            className="bg-slate-100 dark:bg-[#161923] text-slate-800 dark:text-slate-200 text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 outline-none cursor-pointer"
          >
            <option value="ecommerce">E-Commerce</option>
            <option value="news">News Archive</option>
            <option value="finance">CloudSec CVE</option>
          </select>

          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-[#161923] border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('preview');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                activeTab === 'dom'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>DOM</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('extracted');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                activeTab === 'extracted'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Schema</span>
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('console');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                activeTab === 'console'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      <div className="relative flex-1 overflow-auto flex flex-col items-center">
        {/* Tab 1: Rendered Page */}
        {activeTab === 'preview' && (
          <div
            className={`w-full relative transition-all duration-300 py-6 px-4 flex justify-center ${
              deviceFrame === 'mobile'
                ? 'max-w-[420px]'
                : deviceFrame === 'tablet'
                ? 'max-w-[768px]'
                : 'max-w-4xl'
            }`}
          >
            {/* Virtual Cursor */}
            {cursor.visible && (
              <div
                className="absolute z-40 transition-all duration-300 pointer-events-none ease-out"
                style={{ top: `${cursor.y}px`, left: `${cursor.x}px` }}
              >
                <div className="relative">
                  <MousePointer2 className="w-5 h-5 text-indigo-600 fill-indigo-600" />
                  <div className="absolute left-4 top-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-mono font-bold whitespace-nowrap shadow-md">
                    Scraper Cursor
                  </div>
                </div>
              </div>
            )}

            {/* Rendered Container */}
            <div
              className={`w-full rounded-xl bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-all ${
                deviceFrame === 'mobile' ? 'rounded-2xl border-slate-300 dark:border-slate-700 shadow-md' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-sm">
                  <span>{pageData.favicon}</span>
                  <span>{pageData.title}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {pageData.elements.length} Elements
                </span>
              </div>

              <div className="space-y-3">
                {pageData.elements.map((elem) => {
                  const isHighlighted = highlightedId === elem.id;

                  return (
                    <div
                      key={elem.id}
                      onClick={() => handleElementClick(elem)}
                      className={`relative group cursor-pointer p-3 rounded-lg border transition-all ${
                        isHighlighted
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                          : 'bg-slate-50/50 dark:bg-[#0c0e14] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-xs font-mono">
                        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold truncate">
                          <span className="text-indigo-600 dark:text-indigo-400">{`<${elem.tag}>`}</span>
                          <span className="text-blue-600 dark:text-blue-400">{elem.selector}</span>
                          <span className="text-slate-400 font-sans">({elem.label})</span>
                        </span>
                        {isHighlighted && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-bold">
                            TARGETED
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                        {elem.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: DOM Tree */}
        {activeTab === 'dom' && (
          <div className="w-full p-4 font-mono text-xs max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="font-bold">DOM Hierarchy Tree</span>
              <span>Click element to copy selector</span>
            </div>

            <div className="space-y-1.5">
              {pageData.elements.map((elem) => (
                <div
                  key={elem.id}
                  onClick={() => handleElementClick(elem)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    highlightedId === elem.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-[#151822] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{elem.tag}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{elem.selector}</span>
                    <span className="text-slate-500 truncate max-w-sm text-xs font-sans">
                      "{elem.text.slice(0, 50)}..."
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(elem.selector);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 text-[11px]"
                    title="Copy Selector"
                  >
                    {copiedSelector === elem.selector ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSelector === elem.selector ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Extracted */}
        {activeTab === 'extracted' && (
          <div className="w-full p-4 font-mono text-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="font-bold">Extracted Schema</span>
              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(
                      pageData.elements.reduce((acc, cur) => {
                        acc[cur.selector] = cur.dataValue;
                        return acc;
                      }, {} as Record<string, any>),
                      null,
                      2
                    )
                  )
                }
                className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-sans font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </button>
            </div>

            <pre className="p-3.5 rounded-lg bg-white dark:bg-[#151822] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-emerald-400 overflow-x-auto text-xs leading-relaxed">
              {JSON.stringify(
                {
                  domain: pageData.url,
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

        {/* Tab 4: Console */}
        {activeTab === 'console' && (
          <div className="w-full p-4 font-mono text-xs max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <span className="font-bold flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span>Browser Console Output</span>
              </span>
              <span>{consoleLogs.length} events</span>
            </div>

            {consoleLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No console messages recorded.
              </div>
            ) : (
              <div className="space-y-1.5">
                {consoleLogs.map((log) => {
                  let Icon = Info;
                  let colorClass = 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151822]';
                  if (log.type === 'warn') {
                    Icon = AlertTriangle;
                    colorClass = 'text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20';
                  } else if (log.type === 'error') {
                    Icon = AlertCircle;
                    colorClass = 'text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20';
                  }

                  return (
                    <div
                      key={log.id}
                      className={`p-2 rounded-lg border font-mono text-xs flex items-start gap-2 ${colorClass}`}
                    >
                      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 break-words">{log.text}</div>
                      <span className="text-[10px] text-slate-400 shrink-0">
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
