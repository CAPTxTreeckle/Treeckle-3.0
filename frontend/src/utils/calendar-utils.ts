import { CSSProperties } from "react";
import {
  dateFnsLocalizer,
  DateRangeFormatFunction,
  DateRange,
  DateLocalizer,
} from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameMonth,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  max,
  min,
  endOfDay,
  startOfToday,
  isBefore,
  isPast,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { sort } from "./parser-utils";
import { START, END } from "../constants";

export const CURRENT_LOCALE = "en-US";
export const DAY_HEADER_FORMAT = "EEEE dd MMMM";

const locales = {
  "en-US": enUS,
};

export const dateLocalizer: DateLocalizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const weekRangeFormat: DateRangeFormatFunction = (
  { start, end },
  culture = CURRENT_LOCALE,
  local = dateLocalizer,
) =>
  `${local.format(
    start,
    isSameMonth(start, end) ? "dd" : "dd MMMM",
    culture,
  )} – ${local.format(end, "dd MMMM", culture)}`;

function getFirstVisibleDateInCalendarMonth(date: Date): Date {
  const firstDateOfMonth = startOfMonth(date);

  return startOfWeek(firstDateOfMonth, {
    weekStartsOn: dateLocalizer.startOfWeek(CURRENT_LOCALE) as ReturnType<
      typeof getDay
    >,
  });
}

export function dayPropGetter(date: Date): {
  className?: string;
  style?: CSSProperties;
} {
  return isBefore(date, startOfToday())
    ? { style: { backgroundColor: "#f2f2f2" } }
    : {};
}

export function slotPropGetter(date: Date): {
  className?: string;
  style?: CSSProperties;
} {
  return isPast(date) ? { style: { backgroundColor: "#f2f2f2" } } : {};
}

function getLastVisibleDateInCalendarMonth(date: Date): Date {
  const lastDateOfMonth = endOfMonth(date);

  return endOfWeek(lastDateOfMonth, {
    weekStartsOn: dateLocalizer.startOfWeek(CURRENT_LOCALE) as ReturnType<
      typeof getDay
    >,
  });
}

export function getVisibleRangeInCalendarMonth(date: Date): DateRange {
  return {
    start: getFirstVisibleDateInCalendarMonth(date),
    end: getLastVisibleDateInCalendarMonth(date),
  };
}

export function getVisibleRange(dates: Date[]): DateRange {
  const minDate = min(dates);
  const maxDate = max(dates);

  return {
    start: minDate,
    end: endOfDay(maxDate),
  };
}

export function mergeDateRanges(dateRanges: DateRange[]): DateRange[] {
  const sortedDateRanges = sort(dateRanges, { props: [START, END] });
  const mergedDateRanges: DateRange[] = [];

  sortedDateRanges.forEach((dateRange) => {
    if (
      mergedDateRanges.length === 0 ||
      mergedDateRanges[mergedDateRanges.length - 1].end < dateRange.start
    ) {
      mergedDateRanges.push(dateRange);
    } else {
      mergedDateRanges[mergedDateRanges.length - 1].end = max([
        mergedDateRanges[mergedDateRanges.length - 1].end,
        dateRange.end,
      ]);
    }
  });

  return mergedDateRanges;
}
