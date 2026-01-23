export function datetimeToString(datetime: Date): string {
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
  const arrDT = str_date?.split(/[\s:,/]+/);
  const outDT = arrDT?.join("-");
  return outDT || "";
}
