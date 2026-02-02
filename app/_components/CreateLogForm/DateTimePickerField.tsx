import React from "react";
import styles from "./CreateLogForm.module.css";
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
    <div className={styles.formField}>
      <FormField label="Date and time" error={error}>
        <div
          className={`${styles.dateTimeContainer} ${error ? styles.dateTimeContainerError : ""}`}
        >
          <div className={styles.dateTimeInput}>
            <ReactDatePicker
              id="date-picker"
              onChange={handleDateChange}
              selected={dateValue}
              dateFormat="MMM d, yyyy"
              showTimeSelect={false}
              className={styles.wFull}
              placeholderText="Select date"
            />
          </div>
          <div className={styles.dateTimeDivider} />
          <div className={styles.dateTimeInput}>
            <ReactDatePicker
              id="time-picker"
              onChange={handleTimeChange}
              selected={dateValue}
              showTimeSelectOnly
              showTimeSelect
              timeFormat="HH:mm"
              dateFormat="h:mm aa"
              timeIntervals={15}
              className={styles.wFull}
              placeholderText="Select time"
            />
          </div>
        </div>
      </FormField>
    </div>
  );
}
