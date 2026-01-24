import React from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { DateTimePickerProps } from "./types";
import { FormField } from "./FormField";

export function DateTimePickerField({
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  return (
    <FormField label="Date and time:" error={error}>
      <div
        className={`border rounded-lg p-3 ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
      >
        <DateTimePicker
          id="datetime-picker"
          onChange={onChange}
          value={value}
          className="w-full"
        />
      </div>
    </FormField>
  );
}
