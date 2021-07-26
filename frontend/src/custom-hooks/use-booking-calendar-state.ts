import { useState, useMemo, useCallback } from "react";
import { View, Views } from "react-big-calendar";
import {
  set,
  getHours,
  getMinutes,
  getSeconds,
  getMilliseconds,
} from "date-fns";
import { BookingData, BookingStatus } from "../types/bookings";
import { CalendarBooking } from "../components/booking-calendar";

export default function useBookingCalendarState({
  bookings,
  showVenueName = true,
  showBooker = true,
}: {
  bookings: BookingData[];
  showVenueName?: boolean;
  showBooker?: boolean;
}) {
  const [view, setView] = useState<View>(Views.MONTH);
  const [dateView, setDateView] = useState<Date>(new Date());

  const calendarBookings: CalendarBooking[] = useMemo(
    () =>
      bookings.flatMap(
        ({ title, booker, startDateTime, endDateTime, status, venue }) =>
          status === BookingStatus.Cancelled
            ? []
            : [
                {
                  title,
                  booker: showBooker ? booker : null,
                  start: new Date(startDateTime),
                  end: new Date(endDateTime),
                  status,
                  venueName: showVenueName ? venue.name : null,
                },
              ],
      ),
    [bookings, showVenueName, showBooker],
  );

  const viewCurrentDateTime = useCallback((date: Date) => {
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
  }, []);

  const onSelectEvent = useCallback(
    (
      { start }: CalendarBooking,
      _: React.SyntheticEvent<HTMLElement, Event>,
      forceJumpToEvent = false,
    ) => {
      if (forceJumpToEvent || view !== Views.DAY) {
        setDateView(start);
      }

      setView(Views.DAY);
    },
    [view],
  );

  return {
    calendarBookings,
    view,
    dateView,
    onView: setView,
    onNavigate: setDateView,
    onSelectEvent,
    onDrillDown: viewCurrentDateTime,
  };
}
