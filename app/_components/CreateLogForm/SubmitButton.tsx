import React from "react";
import { Button } from "../DesignSystem";
import { SubmitButtonProps } from "./types";

export function SubmitButton({
  isLoading,
  disabled,
  className = "",
  children = isLoading ? "Submitting..." : "Submit",
}: SubmitButtonProps & { className?: string; children?: React.ReactNode }) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="md"
      isLoading={isLoading}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}
