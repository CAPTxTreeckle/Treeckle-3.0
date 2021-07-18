import { useState, useMemo, useCallback, useEffect } from "react";
import { DateRange, stringOrDate, View } from "react-big-calendar";
import {
  isWithinInterval,
  isEqual as isEqualDates,
  startOfToday,
  startOfDay,
  isFuture,
  areIntervalsOverlapping,
  isSameDay,
} from "date-fns";
import equal from "fast-deep-equal";
import {
  getVisibleRangeInCalendarMonth,
  getVisibleRange,
  mergeDateRanges,
} from "../utils/calendar-utils";
import { BookingData, DateTimeRange } from "../types/bookings";
import { EMAIL, NAME, TITLE, START, END, IS_NEW } from "../constants";

export type CalendarBooking = {
  [TITLE]: string;
  [NAME]: string;
  [EMAIL]: string;
  [START]: Date;
  [END]: Date;
  [IS_NEW]: boolean;
};

const NEW_BOOKING = "New booking";

export default function useBookingCreationCalendarState(
  approvedBookings: BookingData[],
  newBookingPeriods: DateTimeRange[],
) {
  const today = startOfToday();
  const [visibleDateRange, setVisibleDateRange] = useState<DateRange>(
    getVisibleRangeInCalendarMonth(today),
  );
  const [view, setView] = useState<View>("month");
  const [dateView, setDateView] = useState<Date>(today);
  const [newBookings, setNewBookings] = useState<CalendarBooking[]>([]);
  const allBookings = useMemo(
    () =>
      approvedBookings
        .map(
          ({ title, booker: { name, email }, startDateTime, endDateTime }) => ({
            title,
            name,
            email,
            start: new Date(startDateTime),
            end: new Date(endDateTime),
            isNew: false,
          }),
        )
        .concat(newBookings),
    [approvedBookings, newBookings],
  );

  useEffect(() => {
    setNewBookings(
      newBookingPeriods.map(({ startDateTime, endDateTime }) => ({
        title: NEW_BOOKING,
        name: "",
        email: "",
        isNew: true,
        start: new Date(startDateTime),
        end: new Date(endDateTime),
      })),
    );
  }, [newBookingPeriods]);

  const updateDateView = useCallback(
    (newDate: Date) => {
      if (isEqualDates(dateView, newDate)) {
        return;
      }

      setDateView(newDate);
    },
    [dateView],
  );

  const onRangeChange = useCallback(
    (range: Date[] | { start: stringOrDate; end: stringOrDate }) => {
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
    },

    [visibleDateRange],
  );

  const onNavigate = useCallback(
    (newDate: Date) => updateDateView(startOfDay(newDate)),
    [updateDateView],
  );

  const onSelectSlot = useCallback(
    (slotInfo: {
      start: stringOrDate;
      end: stringOrDate;
      slots: Date[] | string[];
      action: "select" | "click" | "doubleClick";
      box?: { x: number; y: number; clientX: number; clientY: number };
    }) => {
      console.log("onSelectSlot:", slotInfo);

      const { slots, box, start, end } = slotInfo;
      const selectedRange: DateRange = {
        start: new Date(start),
        end: new Date(end),
      };

      if (
        slots.length === 1 &&
        isEqualDates(selectedRange.start, selectedRange.end)
      ) {
        if (box) {
          setView("day");
          updateDateView(slots[0] as Date);
        }

        return;
      }

      if (
        !isSameDay(selectedRange.start, selectedRange.end) ||
        !isFuture(selectedRange.start) ||
        !isFuture(selectedRange.end)
      ) {
        return;
      }

      const mergedDateRanges = mergeDateRanges(
        newBookings
          .map(({ start, end }) => ({ start, end }))
          .concat([selectedRange]),
      );

      const updatedNewBookings = mergedDateRanges.map((dateRange) => ({
        title: NEW_BOOKING,
        name: "",
        email: "",
        isNew: true,
        ...dateRange,
      }));

      setNewBookings(updatedNewBookings);
    },
    [updateDateView, newBookings],
  );

  const onSelectEvent = useCallback(
    (
      { start }: CalendarBooking,
      e: React.SyntheticEvent<HTMLElement, Event>,
      forceJumpToEvent = false,
    ) => {
      if (forceJumpToEvent || view !== "day" || !isSameDay(start, dateView)) {
        updateDateView(start);
      }

      setView("day");
    },
    [updateDateView, dateView, view],
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
        !allBookings.some(({ start, end }) =>
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

  const removeNewBooking = useCallback(
    (currentBooking: CalendarBooking) => {
      if (!currentBooking[IS_NEW]) {
        return;
      }

      setNewBookings(
        newBookings.filter((booking) => !equal(booking, currentBooking)),
      );
    },

    [newBookings],
  );

  return {
    allBookings,
    newBookings,
    visibleDateRange,
    view,
    dateView,
    onRangeChange,
    onView: setView,
    onSelectSlot,
    onNavigate,
    onSelectEvent,
    onSelecting,
    removeNewBooking,
  };
}
