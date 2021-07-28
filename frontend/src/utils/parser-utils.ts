import { format, isSameDay } from "date-fns";
import { StringifiableRecord } from "query-string";
import arraySort from "array-sort";
import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from "../constants";

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

export function sanitizeArray(
  strings: string[],
  options: { unique: boolean } = { unique: true },
): string[] {
  const { unique } = options;
  if (unique) {
    return Array.from(new Set(strings.map((s) => s.trim()).filter((s) => s)));
  }
  return strings.map((s) => s.trim()).filter((s) => s);
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

export function displayDateTimeRange(
  inputStartDateTime: string | number | Date,
  inputEndDateTime: string | number | Date,
) {
  const startDateTime =
    typeof inputStartDateTime === "string"
      ? parseInt(inputStartDateTime, 10)
      : inputStartDateTime;
  const endDateTime =
    typeof inputEndDateTime === "string"
      ? parseInt(inputEndDateTime, 10)
      : inputEndDateTime;

  return isSameDay(startDateTime, endDateTime)
    ? `${displayDateTime(startDateTime, DATE_FORMAT)} ${displayDateTime(
        startDateTime,
        TIME_FORMAT,
      )} - ${displayDateTime(endDateTime, TIME_FORMAT)}`
    : `${displayDateTime(startDateTime)} - ${displayDateTime(endDateTime)}`;
}

export function changeKeyCase(
  caseChanger: (input: string) => string,
  object?: StringifiableRecord,
) {
  if (!object) {
    return object;
  }

  const newObject: StringifiableRecord = {};

  Object.entries(object).forEach(([key, value]) => {
    newObject[caseChanger(key)] = value;
  });

  return newObject;
}

export function sort<T>(
  array: T[],
  {
    props,
    reverse = false,
  }: { props?: Parameters<typeof arraySort>[1]; reverse?: boolean } = {},
) {
  return arraySort([...array], props, { reverse });
}
