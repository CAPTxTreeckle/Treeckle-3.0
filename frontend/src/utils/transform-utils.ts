import arraySort from "array-sort";
import { format, getHours, getMinutes, isSameDay } from "date-fns";
import { StringifiableRecord } from "query-string";

import { DATE_FORMAT, DATE_TIME_FORMAT, TIME_FORMAT } from "../constants";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !Array.isArray(value) && typeof value === "object" && value !== null;
}

export function trim<T>(value: T) {
  return typeof value === "string" ? value.trim() : value;
}

export function deepTrim<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepTrim(item) as unknown) as unknown as T;
  }

  if (isRecord(value)) {
    return Object.keys(value).reduce(
      (all, key) => {
        all[key] = deepTrim(value[key]);
        return all;
      },
      {} as Record<string, unknown>,
    ) as T;
  }

  return trim(value) as T;
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

// displays time range given 2 date times
export function displayTimeRange(
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

  return `${displayDateTime(startDateTime, TIME_FORMAT)} - ${displayDateTime(
    endDateTime,
    TIME_FORMAT,
  )}`;
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

export function dateTimeToTimeMins(inputDateTime: string | number | Date) {
  const dateTime =
    typeof inputDateTime === "string"
      ? parseInt(inputDateTime, 10)
      : inputDateTime;
  return getHours(dateTime) * 60 + getMinutes(dateTime);
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
