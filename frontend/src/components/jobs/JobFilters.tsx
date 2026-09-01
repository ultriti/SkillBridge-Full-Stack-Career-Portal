import React from 'react';
import type { AdvancedJobSearchFilters } from '../../types/job-search.types';
import { Filter, RotateCcw, MapPin, DollarSign, Briefcase, Code, Award } from 'lucide-react';

interface FiltersProps {
  filters: AdvancedJobSearchFilters;
  onChange: (newFilters: AdvancedJobSearchFilters) => void;
  onReset: () => void;
}

export const JobFilters: React.FC<FiltersProps> = ({ filters, onChange, onReset }) => {
  const handleChange = (key: keyof AdvancedJobSearchFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      page: 1, // Reset to page 1 on filter change
    });
  };

  const handleSkillsChange = (rawSkills: string) => {
    const skillList = rawSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    onChange({
      ...filters,
      skills: skillList.length > 0 ? skillList : undefined,
      page: 1,
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-lg">Filters</h3>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          <span>Location</span>
        </label>
        <input
          type="text"
          placeholder="e.g. New York, Remote"
          value={filters.location || ''}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span>Work Mode</span>
        </label>
        <select
          value={filters.workMode || ''}
          onChange={(e) => handleChange('workMode', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Work Modes</option>
          <option value="REMOTE">Remote</option>
          <option value="HYBRID">Hybrid</option>
          <option value="ONSITE">Onsite</option>
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
          <span>Job Type</span>
        </label>
        <select
          value={filters.jobType || ''}
          onChange={(e) => handleChange('jobType', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Job Types</option>
          <option value="FULL_TIME">Full Time</option>
          <option value="PART_TIME">Part Time</option>
          <option value="INTERNSHIP">Internship</option>
          <option value="CONTRACT">Contract</option>
          <option value="FREELANCE">Freelance</option>
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
          <Award className="w-3.5 h-3.5 text-indigo-400" />
          <span>Experience Level</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Senior or 2+ years"
          value={filters.experienceLevel || ''}
          onChange={(e) => handleChange('experienceLevel', e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-xs uppercase font-bold text-slate-400 mb-2 flex items-center space-x-1.5">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>Salary Range ($)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min Salary"
            value={filters.salaryMin ?? ''}
            onChange={(e) => handleChange('salaryMin', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <input
            type="number"
            placeholder="Max Salary"
            value={filters.salaryMax ?? ''}
            onChange={(e) => handleChange('salaryMax', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs uppercase font-bold text-slate-400 flex items-center space-x-1.5">
            <Code className="w-3.5 h-3.5 text-indigo-400" />
            <span>Skills</span>
          </label>
          <div className="flex items-center space-x-1 text-[11px] text-slate-400">
            <button
              onClick={() => handleChange('skillMatch', 'any')}
              className={`px-1.5 py-0.5 rounded font-bold transition ${
                (filters.skillMatch || 'any') === 'any'
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  : 'hover:text-white'
              }`}
            >
              ANY
            </button>
            <span>/</span>
            <button
              onClick={() => handleChange('skillMatch', 'all')}
              className={`px-1.5 py-0.5 rounded font-bold transition ${
                filters.skillMatch === 'all'
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  : 'hover:text-white'
              }`}
            >
              ALL
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="e.g. React, Node.js, PostgreSQL"
          value={filters.skills ? filters.skills.join(', ') : ''}
          onChange={(e) => handleSkillsChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
        />
        <span className="text-[11px] text-slate-500 mt-1 block">Separate skills with commas</span>
      </div>
    </div>
  );
};
