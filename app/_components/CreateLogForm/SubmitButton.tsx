import React from "react";
import { SubmitButtonProps } from "./types";

export function SubmitButton({ isLoading, disabled }: SubmitButtonProps) {
  return (
    <button
      className="p-4 border border-solid border-grey"
      disabled={disabled || isLoading}
      type="submit"
    >
      {isLoading && <span>Adding to log!</span>}
      {!isLoading && <span>Submit</span>}
    </button>
  );
}
