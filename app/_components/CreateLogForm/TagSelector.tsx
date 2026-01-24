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
        className={`w-full border-2 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-200 focus:ring-blue-500"}`}
        multiple={true}
        value={value}
        onChange={(e) => {
          const options = [...e.target.selectedOptions];
          const values = options.map((option) => option.value);
          onChange(values);
        }}
        onBlur={onBlur}
        size={5}
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
