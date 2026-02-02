import React, { useState } from "react";
import styles from "./CreateLogForm.module.css";
import { TagSelectorProps } from "./types";
import { FormField } from "./FormField";

export function TagSelector({
  value,
  otherTag,
  onChange,
  onOtherTagChange,
  onBlur,
  error,
}: TagSelectorProps) {
  const [otherTagInputValue, setOtherTagInputValue] = useState("");

  const tags = [
    { label: "Music", value: "music" },
    { label: "Piano", value: "piano" },
    { label: "Meditation", value: "meditation" },
    { label: "Studying", value: "studying" },
    { label: "Other", value: "other" },
  ];

  const handleToggle = (tagValue: string) => {
    const newValue = value.includes(tagValue)
      ? value.filter((t) => t !== tagValue)
      : [...value, tagValue];
    onChange(newValue);

    if (tagValue !== "other" && newValue.includes("other")) {
      onOtherTagChange(otherTagInputValue);
    }
  };

  const handleOtherInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.slice(0, 50);
    setOtherTagInputValue(newValue);
    onOtherTagChange(newValue);
  };

  const hasOther = value.includes("other");

  return (
    <div className={styles.tagSelector}>
      <FormField label="Tags:" error={error} required>
        <div className={styles.spaceY2}>
          {tags.map((tag) => (
            <div key={tag.value} className={styles.tagRow}>
              <button
                type="button"
                onClick={() => handleToggle(tag.value)}
                className={styles.tagButton}
                onBlur={onBlur}
              >
                {value.includes(tag.value) ? (
                  <svg
                    className={styles.tagIcon}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path
                      fillRule="evenodd"
                      d="M9 12l2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                  </svg>
                ) : (
                  <svg
                    className={styles.tagIcon}
                    fill="none"
                    stroke="#3b82f6"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                <span className={styles.tagLabel}>{tag.label}</span>
              </button>
              {tag.value === "other" && hasOther && (
                <input
                  type="text"
                  value={otherTag}
                  onChange={handleOtherInputChange}
                  placeholder="Enter custom tag"
                  maxLength={50}
                  className={styles.otherTagInput}
                  onBlur={onBlur}
                />
              )}
            </div>
          ))}
        </div>
        {hasOther && (
          <div className={styles.characterCount}>
            {otherTag.length}/50 characters
          </div>
        )}
      </FormField>
    </div>
  );
}
