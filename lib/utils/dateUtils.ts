export function toString(dateTime: Date | string): string {
  let dateObj: Date;

  if (typeof dateTime === "string") {
    dateObj = new Date(dateTime);
  } else if (dateTime instanceof Date) {
    dateObj = dateTime;
  } else {
    dateObj = new Date();
  }

  const year = dateObj.getUTCFullYear();
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = dateObj.getUTCDate().toString().padStart(2, "0");
  const hour = dateObj.getUTCHours().toString().padStart(2, "0");
  const minute = dateObj.getUTCMinutes().toString().padStart(2, "0");

  return `${year}-${month}-${day}-${hour}-${minute}`;
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
    const [year, month, day, hour, minute] = parts.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return date;
  }
  return new Date();
}

export function compareDates(a: string, b: string): number {
  const dateA = fromString(a);
  const dateB = fromString(b);
  return dateB.getTime() - dateA.getTime();
}
