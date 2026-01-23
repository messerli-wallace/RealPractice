import React from "react";
import { TagSelectorProps } from "./types";
import { FormField } from "./FormField";

export function TagSelector({
  value,
  onChange,
  onBlur,
  error,
}: TagSelectorProps) {
  return (
    <FormField label="Tags:" error={error} required>
      <select
        className={`border border-solid ${error ? "border-red-500" : "border-grey"}`}
        multiple={true}
        value={value}
        onChange={(e) => {
          const options = [...e.target.selectedOptions];
          const values = options.map((option) => option.value);
          onChange(values);
        }}
        onBlur={onBlur}
      >
        <option value="music">Music</option>
        <option value="piano">Piano</option>
        <option value="meditation">Meditation</option>
        <option value="studying">Studying</option>
        <option value="other">Other</option>
      </select>
    </FormField>
  );
}
