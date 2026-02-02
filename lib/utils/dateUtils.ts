export function toString(dateTime: Date | string): string {
  let dateObj: Date;

  if (typeof dateTime === "string") {
    dateObj = new Date(dateTime);
  } else if (dateTime instanceof Date) {
    dateObj = dateTime;
  } else {
    dateObj = new Date();
  }

  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getDate().toString().padStart(2, "0");
  const hour = dateObj.getHours().toString().padStart(2, "0");
  const minute = dateObj.getMinutes().toString().padStart(2, "0");
  const timezoneOffset = -dateObj.getTimezoneOffset();
  const offsetHours = Math.abs(Math.floor(timezoneOffset / 60));
  const offsetSign = timezoneOffset >= 0 ? "+" : "-";

  return `${month}-${day}-${year}-${hour}-${minute}-GMT${offsetSign}${offsetHours}`;
}

export function toReadableString(
  dateTime: Date | string,
  locale?: string
): string {
  let dateObj: Date;

  if (typeof dateTime === "string") {
    // Use fromString to handle all formats consistently
    dateObj = fromString(dateTime);
  } else if (dateTime instanceof Date) {
    dateObj = dateTime;
  } else {
    dateObj = new Date();
  }

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  try {
    return dateObj.toLocaleString(locale || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
    });
  } catch {
    try {
      return dateObj.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      });
    } catch {
      return dateObj.toUTCString();
    }
  }
}

export function fromString(dateTimeStr: string): Date {
  // Trim and remove surrounding quotes and whitespace if present
  const cleanedValue = dateTimeStr
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();

  // Check if it's a pure numeric timestamp (e.g., "1705987140")
  // This regex matches only digits, no dashes or other characters
  if (/^\d+$/.test(cleanedValue)) {
    const timestamp = Number(cleanedValue);
    // Unix timestamps in seconds are typically 10 digits
    // Milliseconds are 13 digits, so convert to milliseconds if needed
    const milliseconds =
      timestamp < 1000000000000 ? timestamp * 1000 : timestamp;
    return new Date(milliseconds);
  }

  // Check for old format: MM-DD-YYYY-HH-MM-GMT+X or similar
  // This format has exactly 5 numeric parts separated by dashes, then GMT info
  const parts = cleanedValue.split("-");
  if (parts.length >= 5 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1])) {
    // Format: MM-DD-YYYY-HH-MM-GMT+N (or other timezone info)
    const [month, day, year, hour, minute] = parts.slice(0, 5).map(Number);
    // Validate the parts are reasonable numbers
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year > 2000) {
      const date = new Date(year, month - 1, day, hour, minute);
      return date;
    }
  }

  // Final fallback: try parsing as ISO string or standard date format
  const fallbackDate = new Date(cleanedValue);
  if (!isNaN(fallbackDate.getTime())) {
    return fallbackDate;
  }

  // If all else fails, return current date
  return new Date();
}

export function compareDates(a: string, b: string): number {
  const dateA = fromString(a);
  const dateB = fromString(b);
  return dateB.getTime() - dateA.getTime();
}
