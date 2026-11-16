import React, { useState } from 'react';
import {
  Copy,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronRight,
  FileJson,
} from 'lucide-react';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { soundEffects } from '../../services/soundFx';

interface JsonInspectorProps {
  data: any;
  title?: string;
  isEditable?: boolean;
  onSave?: (updatedData: any) => void;
}

const JsonInspectorInternal: React.FC<JsonInspectorProps> = ({
  data,
  title = 'JSON Payload Inspector',
  isEditable = false,
  onSave,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(() => JSON.stringify(data, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedKeys, setCollapsedKeys] = useState<Record<string, boolean>>({});

  const handleCopy = () => {
    soundEffects.playClick();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    soundEffects.playClick();
    setEditText(JSON.stringify(data, null, 2));
    setParseError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editText);
      soundEffects.playClick();
      setParseError(null);
      setIsEditing(false);
      if (onSave) {
        onSave(parsed);
      }
    } catch (err: any) {
      soundEffects.playWarn();
      setParseError(err?.message || 'Invalid JSON format');
    }
  };

  const toggleCollapse = (path: string) => {
    setCollapsedKeys((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Render a syntax-highlighted collapsible tree
  const renderValue = (val: any, path: string = '', depth: number = 0): React.ReactNode => {
    if (val === null) return <span className="text-slate-400">null</span>;
    if (val === undefined) return <span className="text-slate-400">undefined</span>;

    const valType = typeof val;

    if (valType === 'boolean') {
      return <span className="text-amber-600 dark:text-amber-400 font-semibold">{val ? 'true' : 'false'}</span>;
    }
    if (valType === 'number') {
      return <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{val}</span>;
    }
    if (valType === 'string') {
      return <span className="text-blue-600 dark:text-sky-300">"{val}"</span>;
    }

    if (Array.isArray(val)) {
      const isCollapsed = !!collapsedKeys[path];
      if (val.length === 0) return <span className="text-slate-400">[]</span>;

      return (
        <span className="inline-block">
          <button
            onClick={() => toggleCollapse(path)}
            className="inline-flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mr-1"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <span className="text-slate-400">{'['}</span>
          {isCollapsed ? (
            <span
              onClick={() => toggleCollapse(path)}
              className="text-slate-500 cursor-pointer text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded ml-1"
            >
              {val.length} items...
            </span>
          ) : (
            <div className="pl-4 border-l border-slate-200 dark:border-slate-800 my-0.5 space-y-0.5">
              {val.map((item, idx) => (
                <div key={idx} className="leading-tight">
                  <span className="text-slate-400 mr-1">{idx}:</span>
                  {renderValue(item, `${path}[${idx}]`, depth + 1)}
                  {idx < val.length - 1 && <span className="text-slate-400">,</span>}
                </div>
              ))}
            </div>
          )}
          <span className="text-slate-400">{']'}</span>
        </span>
      );
    }

    if (valType === 'object') {
      const keys = Object.keys(val);
      const isCollapsed = !!collapsedKeys[path];
      if (keys.length === 0) return <span className="text-slate-400">{'{}'}</span>;

      return (
        <span className="inline-block">
          {path && (
            <button
              onClick={() => toggleCollapse(path)}
              className="inline-flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mr-1"
            >
              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          <span className="text-slate-400">{'{'}</span>
          {isCollapsed ? (
            <span
              onClick={() => toggleCollapse(path)}
              className="text-slate-500 cursor-pointer text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded ml-1"
            >
              {keys.length} keys...
            </span>
          ) : (
            <div className="pl-4 border-l border-slate-200 dark:border-slate-800 my-0.5 space-y-0.5">
              {keys.map((k, idx) => {
                const isMatch = searchQuery && k.toLowerCase().includes(searchQuery.toLowerCase());
                return (
                  <div key={k} className="leading-tight">
                    <span
                      className={`font-semibold mr-1.5 ${
                        isMatch
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-1 rounded'
                          : 'text-indigo-600 dark:text-purple-300'
                      }`}
                    >
                      "{k}":
                    </span>
                    {renderValue(val[k], path ? `${path}.${k}` : k, depth + 1)}
                    {idx < keys.length - 1 && <span className="text-slate-400">,</span>}
                  </div>
                );
              })}
            </div>
          )}
          <span className="text-slate-400">{'}'}</span>
        </span>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#12141c] font-mono text-xs select-text transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-[#10121a] border-b border-slate-200 dark:border-[#212638] text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <FileJson className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{title}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {data ? `${Object.keys(data).length} root keys` : 'Empty'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick search input */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter keys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-6 pr-2 py-0.5 text-[10px] rounded bg-white dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-blue-600 w-24 focus:w-32 transition-all"
            />
          </div>

          {/* Edit in place toggle button */}
          {isEditable && (
            <>
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-sans font-medium transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setParseError(null);
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
                    title="Cancel Edit"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEdit}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-sans transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              )}
            </>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy JSON to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 overflow-auto bg-white dark:bg-[#12141c]">
        {parseError && (
          <div className="mb-2 p-2 rounded bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px]">
            {parseError}
          </div>
        )}

        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full h-full min-h-[220px] p-3 rounded-lg bg-slate-50 dark:bg-[#0c0e14] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-600 leading-relaxed resize-none shadow-xs"
            spellCheck={false}
          />
        ) : (
          <div className="leading-relaxed">
            {data ? (
              renderValue(data, '', 0)
            ) : (
              <div className="text-slate-400 italic py-6 text-center">No JSON payload yet. Run the workflow to inspect data handoffs.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const JsonInspector: React.FC<JsonInspectorProps> = (props) => {
  return (
    <ErrorBoundary fallbackTitle="JSON Inspector Error">
      <JsonInspectorInternal {...props} />
    </ErrorBoundary>
  );
};
