import { format } from "date-fns";
import { DATE_TIME_FORMAT } from "../constants";

export function deepTrim<T>(value: T): T {
  const unknownValue = value as unknown;

  if (Array.isArray(unknownValue)) {
    return unknownValue.map((item) => deepTrim(item)) as unknown as T;
  }

  if (typeof unknownValue === "object" && unknownValue !== null) {
    return Object.keys(unknownValue).reduce((all, key) => {
      all[key] = deepTrim((unknownValue as Record<string, unknown>)[key]);
      return all;
    }, {} as Record<string, unknown>) as T;
  }

  if (typeof unknownValue === "string") {
    return unknownValue.trim() as unknown as T;
  }

  return value;
}

export function displayDateTime(
  inputDateTime: string | number | Date,
  dateTimeFormat: string = DATE_TIME_FORMAT,
): string {
  try {
    const dateTime =
      typeof inputDateTime === "string"
        ? parseInt(inputDateTime, 10)
        : inputDateTime;

    return format(dateTime, dateTimeFormat);
  } catch {
    return "";
  }
}
