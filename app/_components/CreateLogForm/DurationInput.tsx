import React from "react";
import { DurationInputProps } from "./types";

export function DurationInput({ value, onChange, error }: DurationInputProps) {
  return (
    <label>
      <span>Duration (minutes):</span>
      <textarea
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        required
        onChange={(e) => onChange(e.target.value)}
        value={value}
        cols={4}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </label>
  );
}
