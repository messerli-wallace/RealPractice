import React from "react";

export interface LogFormData {
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
}

export interface LogFormProps {
  onSubmit: (data: LogFormData) => Promise<void>;
  isLoading?: boolean;
}

export interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface DurationInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export interface TagSelectorProps {
  value: string[];
  otherTag: string;
  onChange: (tags: string[]) => void;
  onOtherTagChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export interface SubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
