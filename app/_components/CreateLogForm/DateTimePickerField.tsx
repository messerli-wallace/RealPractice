import React from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { DateTimePickerProps } from "./types";

export function DateTimePickerField({
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  return (
    <label htmlFor="datetime-picker">
      <span>Date and time:</span>
      <DateTimePicker
        id="datetime-picker"
        onChange={onChange}
        value={value}
        className={error ? "border-red-500" : ""}
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </label>
  );
}
