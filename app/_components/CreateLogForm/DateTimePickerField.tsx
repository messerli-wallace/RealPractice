import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { DateTimePickerProps } from "./types";
import { FormField } from "./FormField";

export function DateTimePickerField({
  value,
  onChange,
  error,
}: DateTimePickerProps) {
  const dateValue = value instanceof Date ? value : new Date();

  const handleDateChange = (newDate: Date | null) => {
    if (!newDate) return;
    const combined = new Date(newDate);
    combined.setHours(dateValue.getHours(), dateValue.getMinutes());
    onChange(combined);
  };

  const handleTimeChange = (newDate: Date | null) => {
    if (!newDate) return;
    const combined = new Date(dateValue);
    combined.setHours(newDate.getHours(), newDate.getMinutes());
    onChange(combined);
  };

  return (
    <div className="space-y-2">
      <FormField label="Date and time" error={error}>
        <div
          className={`border-2 rounded-lg p-2 sm:p-3 flex gap-2 overflow-hidden ${error ? "border-red-300 bg-red-50" : "border-gray-200"}`}
        >
          <div className="flex-1 min-w-0">
            <ReactDatePicker
              id="date-picker"
              onChange={handleDateChange}
              selected={dateValue}
              dateFormat="MMM d, yyyy"
              showTimeSelect={false}
              className="w-full"
              placeholderText="Select date"
            />
          </div>
          <div className="border-l border-gray-300" />
          <div className="flex-1 min-w-0">
            <ReactDatePicker
              id="time-picker"
              onChange={handleTimeChange}
              selected={dateValue}
              showTimeSelectOnly
              showTimeSelect
              timeFormat="HH:mm"
              dateFormat="h:mm aa"
              timeIntervals={15}
              className="w-full"
              placeholderText="Select time"
            />
          </div>
        </div>
      </FormField>
    </div>
  );
}
