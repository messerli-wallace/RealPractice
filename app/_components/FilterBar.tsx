import React from "react";
import styles from "./FilterBar.module.css";
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
    <div className={styles.filterBar}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>Filter Logs</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className={styles.clearButton}>
            Clear Filters
          </button>
        )}
      </div>

      <div className={styles.filterGrid}>
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

      <div className={styles.checkboxContainer}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            id="showOnlyMine"
            checked={showOnlyMine}
            onChange={(e) => setShowOnlyMine(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.checkboxText}>
            Show only {currentUserName}&apos;s posts
          </span>
        </label>
      </div>
    </div>
  );
}
