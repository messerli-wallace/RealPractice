import React from "react";
import { Input } from "./DesignSystem";

export interface FilterBarProps {
  tagFilter: string;
  setTagFilter: (value: string) => void;
  userFilter: string;
  setUserFilter: (value: string) => void;
  showOnlyMine: boolean;
  setShowOnlyMine: (value: boolean) => void;
  currentUserName?: string;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export function FilterBar({
  tagFilter,
  setTagFilter,
  userFilter,
  setUserFilter,
  showOnlyMine,
  setShowOnlyMine,
  currentUserName = "You",
  hasActiveFilters,
  clearFilters,
}: FilterBarProps) {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Filter Logs</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-2 sm:mt-0 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Filter by Tags"
          placeholder="Comma-separated tags (e.g., guitar, practice)"
          value={tagFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTagFilter(e.target.value)
          }
        />

        <Input
          label="Filter by User"
          placeholder="Username"
          value={userFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setUserFilter(e.target.value)
          }
        />
      </div>

      <div className="mt-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            id="showOnlyMine"
            checked={showOnlyMine}
            onChange={(e) => setShowOnlyMine(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-700">
            Show only {currentUserName}&apos;s posts
          </span>
        </label>
      </div>
    </div>
  );
}
