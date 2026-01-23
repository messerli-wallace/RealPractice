import React from "react";
import { DescriptionInputProps } from "./types";

export function DescriptionInput({
  value,
  onChange,
  error,
}: DescriptionInputProps) {
  return (
    <label>
      <span>Description:</span>
      <textarea
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        cols={60}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </label>
  );
}
