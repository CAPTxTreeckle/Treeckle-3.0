import { useState, useMemo } from "react";
import {
  DateRange,
  SlotInfo,
  stringOrDate,
  View,
  Views,
} from "react-big-calendar";
import {
  isWithinInterval,
  isFuture,
  areIntervalsOverlapping,
  isSameDay,
  set,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
} from "date-fns";
import equal from "fast-deep-equal";
import {
  getVisibleRangeInCalendarMonth,
  getVisibleRange,
  mergeDateRanges,
} from "../utils/calendar-utils";
import { BookingData, BookingStatus, DateTimeRange } from "../types/bookings";
import { STATUS } from "../constants";
import { UserData } from "../types/users";
import { CalendarBooking } from "../components/booking-calendar";

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
  const now = new Date();
  const [visibleDateRange, setVisibleDateRange] = useState<DateRange>(
    getVisibleRangeInCalendarMonth(now),
  );
  const [view, setView] = useState<View>(Views.MONTH);
  const [dateView, setDateView] = useState<Date>(now);

  const newBookings = useMemo(
    () =>
      newBookingPeriods.map(({ startDateTime, endDateTime }) => ({
        title: NEW_BOOKING,
        booker: user,
        start: new Date(startDateTime),
        end: new Date(endDateTime),
        status: null,
      })),
    [newBookingPeriods, user],
  );

  const allBookings = useMemo(
    () =>
      (
        existingBookings.map(
          ({ title, booker, startDateTime, endDateTime, status }) => ({
            title,
            booker,
            start: new Date(startDateTime),
            end: new Date(endDateTime),
            status,
          }),
        ) as CalendarBooking[]
      ).concat(newBookings),
    [existingBookings, newBookings],
  );

  const onRangeChange = (
    range: Date[] | { start: stringOrDate; end: stringOrDate },
  ) => {
    const newVisibleRange: DateRange = Array.isArray(range)
      ? getVisibleRange(range as Date[])
      : { start: new Date(range.start), end: new Date(range.end) };

    const { start, end } = newVisibleRange;

    if (
      isWithinInterval(start, visibleDateRange) &&
      isWithinInterval(end, visibleDateRange)
    ) {
      return;
    }

    setVisibleDateRange(newVisibleRange);
  };

  const viewCurrentTime = (date: Date) => {
    const now = new Date();

    setView(Views.DAY);
    setDateView(
      set(date, {
        hours: getHours(now),
        minutes: getMinutes(now),
        seconds: getSeconds(now),
        milliseconds: getMilliseconds(now),
      }),
    );
  };

  const onSelecting = ({
    start,
    end,
  }: {
    start: stringOrDate;
    end: stringOrDate;
  }) => {
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
  };

  const onSelectSlot = ({ action, start, end }: SlotInfo) => {
    const selectedRange: DateRange = {
      start: new Date(start),
      end: new Date(end),
    };

    switch (view) {
      case Views.MONTH: {
        action === "click" && viewCurrentTime(selectedRange.start);
        return;
      }
      case Views.WEEK:
      case Views.DAY: {
        if (!isSameDay(selectedRange.start, selectedRange.end)) {
          action === "click" && viewCurrentTime(selectedRange.start);
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
        }));

        didUpdateNewBookingPeriods(updatedNewBookings);
      }
    }
  };

  const onSelectEvent = (
    { start }: CalendarBooking,
    _: React.SyntheticEvent<HTMLElement, Event>,
    forceJumpToEvent = false,
  ) => {
    if (forceJumpToEvent || view !== Views.DAY) {
      setDateView(start);
    }

    setView(Views.DAY);
  };

  const removeNewBooking = (currentBooking: CalendarBooking) => {
    if (currentBooking[STATUS]) {
      return;
    }

    didUpdateNewBookingPeriods(
      newBookings.filter((booking) => !equal(booking, currentBooking)),
    );
  };

  const onDrillDown = (date: Date) => {
    viewCurrentTime(date);
  };

  return {
    allBookings,
    newBookings,
    visibleDateRange,
    view,
    dateView,
    onRangeChange,
    onView: setView,
    onSelectSlot,
    onNavigate: setDateView,
    onSelectEvent,
    onSelecting,
    removeNewBooking,
    onDrillDown,
  };
}
