import React from 'react';
import type { AdvancedJobSearchFilters } from '../../types/job-search.types';
import { X, RotateCcw } from 'lucide-react';

interface ActiveFiltersProps {
  filters: AdvancedJobSearchFilters;
  onRemove: (key: keyof AdvancedJobSearchFilters) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  const activeChips: { key: keyof AdvancedJobSearchFilters; label: string }[] = [];

  if (filters.q) activeChips.push({ key: 'q', label: `"${filters.q}"` });
  if (filters.location) activeChips.push({ key: 'location', label: `Location: ${filters.location}` });
  if (filters.workMode) activeChips.push({ key: 'workMode', label: `Mode: ${filters.workMode}` });
  if (filters.jobType) activeChips.push({ key: 'jobType', label: `Type: ${filters.jobType}` });
  if (filters.experienceLevel) activeChips.push({ key: 'experienceLevel', label: `Exp: ${filters.experienceLevel}` });
  if (filters.salaryMin != null) activeChips.push({ key: 'salaryMin', label: `Min: $${filters.salaryMin.toLocaleString()}` });
  if (filters.salaryMax != null) activeChips.push({ key: 'salaryMax', label: `Max: $${filters.salaryMax.toLocaleString()}` });
  if (filters.skills && filters.skills.length > 0)
    activeChips.push({ key: 'skills', label: `Skills (${filters.skillMatch?.toUpperCase() || 'ANY'}): ${filters.skills.join(', ')}` });

  if (activeChips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-slate-400 font-bold uppercase mr-1">Active Filters:</span>

      {activeChips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center space-x-1.5 bg-indigo-950/80 border border-indigo-800 text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.key)}
            className="hover:text-white p-0.5 rounded-full hover:bg-indigo-900 transition"
            title="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-xs text-slate-400 hover:text-red-400 font-semibold underline ml-2 transition flex items-center space-x-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
};
