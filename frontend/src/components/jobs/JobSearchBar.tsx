import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, Trash2 } from 'lucide-react';
import { jobSearchService } from '../../services/job-search.service';
import type { SearchHistoryItem } from '../../types/job-search.types';
import { useAuth } from '../../context/AuthContext';

interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
  onSelectHistoryItem?: (query: string, filters: Record<string, any>) => void;
}

export const JobSearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSelectHistoryItem,
}) => {
  const { user } = useAuth();

  const [inputVal, setInputVal] = useState<string>(value);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<SearchHistoryItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal input state with parent prop
  useEffect(() => {
    setInputVal(value);
  }, [value]);

  // Debounce search query changes by 400ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (inputVal !== value) {
        onChange(inputVal);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [inputVal, value, onChange]);

  // Close history dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHistoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    if (!user || user.role !== 'student') return;
    try {
      const history = await jobSearchService.getSearchHistory();
      setHistoryItems(history);
    } catch (err) {
      // Ignore
    }
  };

  const handleOpenHistory = () => {
    fetchHistory();
    setHistoryOpen((prev) => !prev);
  };

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobSearchService.clearSearchHistory();
      setHistoryItems([]);
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-indigo-400 pointer-events-none" />

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Search job title, skills, keywords, company..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-24 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-xl text-sm sm:text-base font-medium transition"
        />

        <div className="absolute right-3 flex items-center space-x-1">
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                onChange('');
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {user && user.role === 'student' && (
            <button
              type="button"
              onClick={handleOpenHistory}
              className="p-1.5 text-slate-400 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition"
              title="Recent Search History"
            >
              <History className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search History Dropdown */}
      {historyOpen && user && user.role === 'student' && (
        <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Recent Searches</span>
            </span>
            {historyItems.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs text-slate-500 hover:text-red-400 flex items-center space-x-1 font-medium transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 p-2">
            {historyItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No recent search history found.</div>
            ) : (
              historyItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectHistoryItem) {
                      onSelectHistoryItem(item.query || '', item.filters || {});
                    } else {
                      setInputVal(item.query || '');
                      onChange(item.query || '');
                    }
                    setHistoryOpen(false);
                  }}
                  className="p-2.5 hover:bg-slate-800 rounded-xl cursor-pointer transition flex items-center justify-between text-sm text-slate-300 hover:text-white"
                >
                  <span className="font-semibold truncate">{item.query || 'Filter Search'}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
