import React from 'react';
import { CEFRLevel, CEFR_DESCRIPTIONS } from '../types';

interface LevelSelectorProps {
  selectedLevel: CEFRLevel;
  onChange: (level: CEFRLevel) => void;
  label: string;
  id?: string;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({ selectedLevel, onChange, label, id }) => {
  const levels = Object.values(CEFRLevel);
  const selectId = id || `level-select-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="flex flex-col w-full">
      <label 
        htmlFor={selectId}
        className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={selectedLevel}
          onChange={(e) => onChange(e.target.value as CEFRLevel)}
          className="appearance-none w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 dark:focus:border-blue-500 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {CEFR_DESCRIPTIONS[level]}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400" aria-hidden="true">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};