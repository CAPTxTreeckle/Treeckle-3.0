import {
  areIntervalsOverlapping,
  isFuture,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import equal from "fast-deep-equal";
import { useCallback, useMemo, useState } from "react";
import { DateRange, SlotInfo, stringOrDate, Views } from "react-big-calendar";

import { CalendarBooking } from "../components/booking-calendar";
import { STATUS } from "../constants";
import { BookingData, BookingStatus, DateTimeRange } from "../types/bookings";
import { UserData } from "../types/users";
import {
  getRepeatedDateRanges,
  getVisibleRange,
  getVisibleRangeInCalendarMonth,
  mergeDateRanges,
} from "../utils/calendar-utils";
import useBookingCalendarState from "./use-booking-calendar-state";

const NEW_BOOKING = "New booking";

export default function useBookingCreationCalendarState({
  existingBookings,
  newBookingPeriods,
  user,
  didUpdateNewBookingPeriods,
}: {
  existingBookings: BookingData[];
  newBookingPeriods: DateTimeRange[];
  user: UserData | null;
  didUpdateNewBookingPeriods: (newBookings: CalendarBooking[]) => void;
}) {
  const {
    calendarBookings: existingCalendarBookings,
    view,
    dateView,
    onView: setView,
    onNavigate: setDateView,
    onSelectEvent,
    onDrillDown: viewCurrentDateTime,
  } = useBookingCalendarState({
    bookings: existingBookings,
    showVenueName: false,
  });
  const [visibleDateRange, setVisibleDateRange] = useState<DateRange>(
    getVisibleRangeInCalendarMonth(dateView),
  );

  const newBookings: CalendarBooking[] = useMemo(
    () =>
      newBookingPeriods.map(({ startDateTime, endDateTime }) => ({
        title: NEW_BOOKING,
        booker: user,
        start: new Date(startDateTime),
        end: new Date(endDateTime),
        status: null,
        venueName: null,
      })),
    [newBookingPeriods, user],
  );

  const allBookings: CalendarBooking[] = useMemo(
    () => existingCalendarBookings.concat(newBookings),
    [existingCalendarBookings, newBookings],
  );

  const onRangeChange = useCallback(
    (range: Date[] | { start: stringOrDate; end: stringOrDate }) => {
      const newVisibleRange: DateRange = Array.isArray(range)
        ? getVisibleRange(range as Date[])
        : { start: new Date(range.start), end: new Date(range.end) };

      const { start, end } = newVisibleRange;

      setVisibleDateRange((visibleDateRange) =>
        isWithinInterval(start, visibleDateRange) &&
        isWithinInterval(end, visibleDateRange)
          ? visibleDateRange
          : newVisibleRange,
      );
    },
    [],
  );

  const onSelecting = useCallback(
    ({ start, end }: { start: stringOrDate; end: stringOrDate }) => {
      const selectingRange: DateRange = {
        start: new Date(start),
        end: new Date(end),
      };

      return (
        isFuture(selectingRange.start) &&
        isFuture(selectingRange.end) &&
        !allBookings.some(
          ({ start, end, status }) =>
            (!status || status === BookingStatus.Approved) &&
            areIntervalsOverlapping(
              selectingRange,
              { start, end },
              { inclusive: false },
            ),
        )
      );
    },
    [allBookings],
  );

  const onRepeatSlot = useCallback(
    (start: Date, end: Date, occurrences: number) => {
      const mergedDateRanges = mergeDateRanges(
        newBookings
          .map(({ start, end }) => ({ start, end }))
          .concat(getRepeatedDateRanges(start, end, occurrences)),
      );

      const updatedNewBookings = mergedDateRanges.map((dateRange) => ({
        title: NEW_BOOKING,
        booker: user,
        ...dateRange,
        status: null,
        venueName: null,
      }));

      didUpdateNewBookingPeriods(updatedNewBookings);
    },
    [user, newBookings, didUpdateNewBookingPeriods],
  );

  const onSelectSlot = useCallback(
    ({ action, start, end }: SlotInfo) => {
      const selectedRange: DateRange = {
        start: new Date(start),
        end: new Date(end),
      };

      switch (view) {
        case Views.MONTH: {
          action === "click" && viewCurrentDateTime(selectedRange.start);
          return;
        }
        case Views.WEEK:
        case Views.DAY: {
          if (!isSameDay(selectedRange.start, selectedRange.end)) {
            action === "click" && viewCurrentDateTime(selectedRange.start);
            return;
          }

          if (!onSelecting(selectedRange)) {
            return;
          }

          const mergedDateRanges = mergeDateRanges(
            newBookings
              .map(({ start, end }) => ({ start, end }))
              .concat([selectedRange]),
          );

          const updatedNewBookings = mergedDateRanges.map((dateRange) => ({
            title: NEW_BOOKING,
            booker: user,
            ...dateRange,
            status: null,
            venueName: null,
          }));

          didUpdateNewBookingPeriods(updatedNewBookings);
        }
      }
    },
    [
      view,
      user,
      onSelecting,
      newBookings,
      viewCurrentDateTime,
      didUpdateNewBookingPeriods,
    ],
  );

  const removeNewBooking = useCallback(
    (currentBooking: CalendarBooking) => {
      if (currentBooking[STATUS]) {
        return;
      }

      didUpdateNewBookingPeriods(
        newBookings.filter((booking) => !equal(booking, currentBooking)),
      );
    },
    [newBookings, didUpdateNewBookingPeriods],
  );

  return {
    allBookings,
    newBookings,
    visibleDateRange,
    view,
    dateView,
    onRangeChange,
    onRepeatSlot,
    onView: setView,
    onSelectSlot,
    onNavigate: setDateView,
    onSelectEvent,
    onSelecting,
    removeNewBooking,
    onDrillDown: viewCurrentDateTime,
  };
}
