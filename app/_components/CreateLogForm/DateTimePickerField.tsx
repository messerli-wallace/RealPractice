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
      <DateTimePicker
        id="datetime-picker"
        onChange={onChange}
        value={value}
        className={error ? "border-red-500" : ""}
      />
    </FormField>
  );
}
