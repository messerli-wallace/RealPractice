import React from "react";
import { TagSelectorProps } from "./types";

export function TagSelector({ value, onChange, error }: TagSelectorProps) {
  return (
    <label>
      <span>Tags:</span>
      <select
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        multiple={true}
        value={value}
        onChange={(e) => {
          const options = [...e.target.selectedOptions];
          const values = options.map((option) => option.value);
          onChange(values);
        }}
      >
        <option value="music">Music</option>
        <option value="piano">Piano</option>
        <option value="meditation">Meditation</option>
        <option value="studying">Studying</option>
        <option value="other">Other</option>
      </select>
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </label>
  );
}
