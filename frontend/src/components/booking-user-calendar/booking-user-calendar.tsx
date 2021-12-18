import { Segment } from "semantic-ui-react";

import useBookingCalendarState from "../../custom-hooks/use-booking-calendar-state";
import { useAppSelector, useDeepEqualAppSelector } from "../../redux/hooks";
import { selectBookingsByUserId } from "../../redux/slices/bookings-slice";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import BookingCalendar from "../booking-calendar";

function BookingUserCalendar() {
  const { id: userId } =
    useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const userBookings = useAppSelector((state) =>
    selectBookingsByUserId(state, userId ?? 0),
  );

  const {
    calendarBookings,
    view,
    dateView,
    onView,
    onNavigate,
    onSelectEvent,
    onDrillDown,
  } = useBookingCalendarState({ bookings: userBookings, showBooker: false });

  return (
    <Segment raised>
      <BookingCalendar
        events={calendarBookings}
        view={view}
        date={dateView}
        scrollToTime={dateView}
        onView={onView}
        onNavigate={onNavigate}
        onSelectEvent={onSelectEvent}
        onDrillDown={onDrillDown}
      />
    </Segment>
  );
}

export default BookingUserCalendar;
