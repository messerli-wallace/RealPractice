import React from "react";

export interface LogFormData {
  dateTimeStr: string;
  duration: string;
  description: string;
  tags: string[];
}

export interface LogFormErrors {
  form?: string;
  success?: boolean;
  duration?: string;
  description?: string;
  tags?: string;
  dateTimeStr?: string;
}

export type DateTimeValue = Date | null | [Date | null, Date | null];

export interface LogFormProps {
  onSubmit: (data: LogFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export interface DateTimePickerProps {
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  error?: string;
}

export interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  error?: string;
}

export interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
}
