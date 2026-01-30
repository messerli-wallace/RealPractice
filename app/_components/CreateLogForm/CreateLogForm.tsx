import { useState } from "react";
import { LogFormData, LogFormErrors, DateTimeValue } from "./types";
import {
  validateLogEntry,
  validateDuration,
  validateDescription,
  validateTags,
} from "../../../lib/utils/validation";
import { toString } from "../../../lib/utils/dateUtils";
import { Alert } from "../DesignSystem";
import {
  DateTimePickerField,
  DurationInput,
  DescriptionInput,
  TagSelector,
  SubmitButton,
} from ".";

export interface CreateLogFormProps {
  onSubmit: (data: LogFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: {
    description: string;
    duration: string;
    datetime: DateTimeValue;
    tags: string[];
  };
  className?: string;
}

export function CreateLogForm({
  onSubmit,
  isLoading = false,
  initialData = {
    description: "",
    duration: "",
    datetime: new Date(),
    tags: [],
  },
  className = "",
}: CreateLogFormProps) {
  const [description, setDescription] = useState(initialData.description);
  const [duration, setDuration] = useState(initialData.duration);
  const [datetime, changeDatetime] = useState<DateTimeValue>(
    initialData.datetime
  );
  const [tags, setTags] = useState(initialData.tags);
  const [otherTag, setOtherTag] = useState("");
  const [errors, setErrors] = useState<LogFormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dateTimeStr = toString(
      Array.isArray(datetime)
        ? datetime[0] || new Date()
        : datetime || new Date()
    );

    const processedTags = tags.map((tag) =>
      tag === "other" && otherTag ? otherTag : tag
    );

    const ticket: LogFormData = {
      dateTimeStr,
      duration,
      description,
      tags: processedTags,
    };

    const validationResult = validateLogEntry(ticket);

    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      return;
    }

    const sanitizedTicket = validationResult.sanitized;

    try {
      if (sanitizedTicket) {
        await onSubmit(sanitizedTicket);
        setErrors((prev) => ({
          ...prev,
          form: "Log submitted successfully!",
          success: true,
        }));

        setDescription("");
        setDuration("");
        setTags([]);
        setOtherTag("");
        changeDatetime(new Date());
      }
    } catch (error) {
      let errorMessage = "Failed to submit log. Please try again.";

      if (error instanceof Error) {
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

  const handleBlur = (fieldName: string) => {
    setTouchedFields((prev) => new Set(prev).add(fieldName));
  };

  const validateField = (fieldName: string, value: unknown) => {
    let error = "";

    switch (fieldName) {
      case "description":
        if (touchedFields.has("description")) {
          const result = validateDescription(value as string);
          if (!result.valid && result.error) {
            error = result.error;
          }
        }
        break;
      case "duration":
        if (touchedFields.has("duration")) {
          const result = validateDuration(value as string);
          if (!result.valid && result.error) {
            error = result.error;
          }
        }
        break;
      case "tags":
        if (touchedFields.has("tags")) {
          const result = validateTags(value as string[]);
          if (!result.valid && result.error) {
            error = result.error;
          }
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [fieldName]: error || undefined }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      id="createLog"
      className={`create-log-form ${className}`}
    >
      {errors.form && (
        <div className="mb-3 sm:mb-4">
          <Alert
            variant={errors.success ? "success" : "error"}
            title={errors.success ? "Success" : "Error"}
            onClose={() => setErrors((prev) => ({ ...prev, form: undefined }))}
          >
            {errors.form}
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <DateTimePickerField
          value={datetime}
          onChange={changeDatetime}
          error={errors.dateTimeStr}
        />
        <DurationInput
          value={duration}
          onChange={(value) => {
            handleChangeDuration(value);
            validateField("duration", value);
          }}
          onBlur={() => handleBlur("duration")}
          error={touchedFields.has("duration") ? errors.duration : undefined}
        />
      </div>

      <DescriptionInput
        value={description}
        onChange={(value) => {
          setDescription(value);
          validateField("description", value);
        }}
        onBlur={() => handleBlur("description")}
        error={
          touchedFields.has("description") ? errors.description : undefined
        }
      />

      <TagSelector
        value={tags}
        otherTag={otherTag}
        onChange={(value) => {
          setTags(value);
          validateField("tags", value);
        }}
        onBlur={() => handleBlur("tags")}
        error={touchedFields.has("tags") ? errors.tags : undefined}
        onOtherTagChange={setOtherTag}
      />

      <div className="mt-8 flex justify-end">
        <SubmitButton isLoading={isLoading} className="px-8 py-3 text-lg" />
      </div>
    </form>
  );
}
