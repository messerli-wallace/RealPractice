"use client";

import { useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { addLog } from "../_db/db";
import { validateLogEntry, validateDuration } from "../../lib/utils/validation";
import { logError, createComponentContext } from "../../lib/utils/errorLogger";
import { datetimeToString } from "../../lib/utils/dateUtils";
import {
  DateTimeValue,
  LogFormErrors,
  LogFormData,
} from "./CreateLogForm/types";
import {
  DateTimePickerField,
  DurationInput,
  DescriptionInput,
  TagSelector,
  SubmitButton,
} from "./CreateLogForm";

export default function CreateLog() {
  const errorContext = createComponentContext("CreateLog");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [datetime, changeDatetime] = useState<DateTimeValue>(new Date());
  const [isLoading, setLoading] = useState(false);
  const [tags, setTags] = useState(["other"]);
  const { user } = UserAuth();

  const [errors, setErrors] = useState<LogFormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const dateTimeStr = datetimeToString(
      Array.isArray(datetime)
        ? datetime[0] || new Date()
        : datetime || new Date()
    );
    const ticket: LogFormData = {
      dateTimeStr,
      duration,
      description,
      tags,
    };

    const validationResult = validateLogEntry(ticket);

    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      setLoading(false);

      if (errors.success) {
        setTimeout(() => {
          setErrors((prev) => ({
            ...prev,
            form: undefined,
            success: undefined,
          }));
        }, 5000);
      }
      return;
    }

    const sanitizedTicket = validationResult.sanitized;

    try {
      if (user && sanitizedTicket) {
        const logPath = user.uid;
        await addLog(logPath, sanitizedTicket);
        setErrors((prev) => ({
          ...prev,
          form: "Log submitted successfully!",
          success: true,
        }));

        setDescription("");
        setDuration("");
        setTags(["other"]);
        changeDatetime(new Date());
      }
    } catch (error) {
      let errorMessage = "Failed to submit log. Please try again.";

      if (error instanceof Error) {
        logError(
          "Failed to submit practice log",
          error,
          errorContext.withUser(user)
        );

        if (
          error.message.includes("network") ||
          error.message.includes("timeout")
        ) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (
          error.message.includes("permission") ||
          error.message.includes("auth")
        ) {
          errorMessage = "Authentication error. Please log in again.";
        } else if (error.message.includes("Invalid log item data")) {
          errorMessage =
            "Invalid log data. Please check your inputs and try again.";
        }
      }

      setErrors((prev) => ({
        ...prev,
        form: errorMessage,
      }));
    }
    setLoading(false);
  };

  const handleChangeDuration = (e: string) => {
    const validationResult = validateDuration(e);

    if (validationResult.valid) {
      setDuration(validationResult.sanitized);
      if (errors.duration) {
        setErrors((prev) => ({ ...prev, duration: undefined }));
      }
    } else {
      if (validationResult.error) {
        setErrors((prev) => ({ ...prev, duration: validationResult.error }));
      }
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl">New Log</h1>
      {user ? (
        <form
          onSubmit={handleSubmit}
          id="createLog"
          className="w-screen flex border border-solid border-grey"
        >
          {errors.form && (
            <div
              className={`text-sm mb-4 ${errors.success ? "text-green-500" : "text-red-500"}`}
            >
              {errors.form}
            </div>
          )}
          <DateTimePickerField
            value={datetime}
            onChange={changeDatetime}
            error={errors.dateTimeStr}
          />
          <DurationInput
            value={duration}
            onChange={handleChangeDuration}
            error={errors.duration}
          />
          <DescriptionInput
            value={description}
            onChange={setDescription}
            error={errors.description}
          />
          <TagSelector value={tags} onChange={setTags} error={errors.tags} />
          <SubmitButton isLoading={isLoading} />
        </form>
      ) : (
        <div className="p-4">You must be logged in to add a log.</div>
      )}
    </div>
  );
}
