"use client";

import { useState } from "react";
import DateTimePicker from "react-datetime-picker";
import "react-datetime-picker/dist/DateTimePicker.css";
import "react-calendar/dist/Calendar.css";
import "react-clock/dist/Clock.css";
import { UserAuth } from "../context/AuthContext";
import { addLog } from "../_db/db";
import { validateLogEntry, validateDuration } from "../../lib/utils/validation";
import { logError, createComponentContext } from "../../lib/utils/errorLogger";

// Typescript declarations for the date-time component in the log form
type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export default function CreateLog() {
  // Create error logging context for this component
  const errorContext = createComponentContext("CreateLog");
  // https://youtu.be/nSfu7sHPE9M?si=vBRp3uHl2pKxk0ZI
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(""); // not implemented yet
  const [datetime, changeDatetime] = useState<Value>(new Date());
  const [isLoading, setLoading] = useState(false); // for when the form is submitted
  const [tags, setTags] = useState(["other"]);
  const { user } = UserAuth();

  const [errors, setErrors] = useState<
    Record<string, string | undefined | boolean>
  >({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // prevents refresh after submissions
    setLoading(true); // stops user from inputting another log when current log is being processed
    setErrors({}); // Clear previous errors

    const dateTimeStr = datetimeToString(
      Array.isArray(datetime)
        ? datetime[0] || new Date()
        : datetime || new Date()
    );
    const ticket = {
      dateTimeStr,
      duration,
      description,
      tags,
    };

    // Validate the log entry
    const validationResult = validateLogEntry(ticket);

    if (!validationResult.valid) {
      setErrors(validationResult.errors);
      setLoading(false);

      // Clear success message after 5 seconds
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

    // Use sanitized data
    const sanitizedTicket = validationResult.sanitized;

    //try logging
    try {
      if (user && sanitizedTicket) {
        const logPath = user.uid;
        await addLog(logPath, sanitizedTicket); //writes the log ticket
        // Show success feedback to user
        setErrors((prev) => ({
          ...prev,
          form: "Log submitted successfully!",
          success: true,
        }));

        // Clear form after successful submission
        setDescription("");
        setDuration("");
        setTags(["other"]);
        changeDatetime(new Date());
      }
    } catch (error) {
      // Enhanced error handling with user-friendly messages
      let errorMessage = "Failed to submit log. Please try again.";

      if (error instanceof Error) {
        // Log the error with context
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
    // Use the validation utility
    const validationResult = validateDuration(e);

    if (validationResult.valid) {
      setDuration(validationResult.sanitized);
      // Clear duration error if validation passes
      if (errors.duration) {
        setErrors((prev) => ({ ...prev, duration: undefined }));
      }
    } else {
      // Set error if validation fails
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
          <label htmlFor="datetime-picker">
            <span>Date and time:</span>
            <DateTimePicker
              id="datetime-picker"
              onChange={changeDatetime}
              value={datetime}
            />
          </label>
          <label>
            <span>Duration (minutes):</span>
            <textarea
              className={`border border-solid ${errors.duration ? "border-red-500" : "border-grey"}`}
              required
              onChange={(e) => handleChangeDuration(e.target.value)}
              value={duration}
              cols={4}
            />
            {errors.duration && (
              <div className="text-red-500 text-sm">{errors.duration}</div>
            )}
          </label>

          <label>
            <span>Description:</span>
            <textarea
              className={`border border-solid ${errors.description ? "border-red-500" : "border-grey"}`}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              cols={60}
            />
            {errors.description && (
              <div className="text-red-500 text-sm">{errors.description}</div>
            )}
          </label>
          <label>
            <span>Tags:</span>
            <select
              // https://react.dev/reference/react-dom/components/select
              className={`border border-solid ${errors.tags ? "border-red-500" : "border-grey"}`}
              multiple={true}
              value={tags}
              onChange={(e) => {
                const options = [...e.target.selectedOptions];
                const values = options.map((option) => option.value);
                setTags(values);
              }}
            >
              <option value="music">Music</option>
              <option value="piano">Piano</option>
              <option value="meditation">Meditation</option>
              <option value="studying">Studying</option>
              <option value="other">Other</option>
            </select>
            {errors.tags && (
              <div className="text-red-500 text-sm">{errors.tags}</div>
            )}
          </label>

          <button
            className="p-4 border border-solid border-grey"
            disabled={isLoading}
            type="submit"
          >
            {isLoading && <span>Adding to log!</span>}
            {!isLoading && <span>Submit</span>}
          </button>
        </form>
      ) : (
        <div className="p-4">You must be logged in to add a log.</div>
      )}
    </div>
  );
}

function datetimeToString(datetime: Date) {
  /* 
    returns a date-time object to a string in the format {MM}-{DD}-{YYYY}-{HH}-{MM}-GMT-{N} 
    */
  //Specify the options for the output format
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "shortOffset",
    hour12: false,
  } as Intl.DateTimeFormatOptions;
  const str_date = datetime?.toLocaleString([], options);
  const arrDT = str_date?.split(/[\s:,/]+/); //split on all the separating characters
  // format ['MM', 'DD', 'YYYY', 'HH', 'MM', 'GMT-6']
  const outDT = arrDT?.join("-");
  return outDT;
}

// Define the interfaces for the tag option object, needed in TypeScript implementation that currently isn't being used
// interface Option {
//     value: string;
//     label: string;
//   }
// const tagOptions: Option[] = [
// { value: "music", label: "Music" },
// { value: "meditation", label: "Meditation" },
// { value: "studying", label: "Studying" },
// { value: "other", label: "Other"},
// ];
