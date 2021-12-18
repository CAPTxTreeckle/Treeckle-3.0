import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isBefore,
  isPast,
  isSameMonth,
  max,
  min,
  parse,
  startOfDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns";
import { enUS } from "date-fns/locale";
import {
  dateFnsLocalizer,
  DateLocalizer,
  DateRange,
  DateRangeFormatFunction,
  DayPropGetter,
  SlotPropGetter,
} from "react-big-calendar";

import { END, START } from "../constants";
import { sort } from "./parser-utils";

export const CURRENT_LOCALE = "en-US";
export const DAY_HEADER_FORMAT = "EEEE dd MMMM";

const locales = {
  [CURRENT_LOCALE]: enUS,
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

export const dayPropGetter: DayPropGetter = (date: Date) => {
  return isBefore(date, startOfToday())
    ? { style: { backgroundColor: "#f2f2f2" } }
    : {};
};

export const slotPropGetter: SlotPropGetter = (date: Date) => {
  return isPast(date) ? { style: { backgroundColor: "#f2f2f2" } } : {};
};

function getFirstVisibleDateInCalendarMonth(date: Date): Date {
  const firstDateOfMonth = startOfMonth(date);

  return startOfWeek(firstDateOfMonth, {
    weekStartsOn: dateLocalizer.startOfWeek(CURRENT_LOCALE) as ReturnType<
      typeof getDay
    >,
  });
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
    start: startOfDay(minDate),
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
