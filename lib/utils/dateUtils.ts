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
    dateObj = new Date(dateTime);
  } else if (dateTime instanceof Date) {
    dateObj = dateTime;
  } else {
    dateObj = new Date();
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
  const parts = dateTimeStr.split("-");
  if (parts.length >= 5) {
    // Format: MM-DD-YYYY-HH-MM-GMT+N (or other timezone info)
    const [month, day, year, hour, minute] = parts.slice(0, 5).map(Number);
    const date = new Date(year, month - 1, day, hour, minute);
    return date;
  }
  return new Date();
}

export function compareDates(a: string, b: string): number {
  const dateA = fromString(a);
  const dateB = fromString(b);
  return dateB.getTime() - dateA.getTime();
}
