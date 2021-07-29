import { Segment } from "semantic-ui-react";
import useBookingCalendarState from "../../custom-hooks/use-booking-calendar-state";
import { useAppSelector } from "../../redux/hooks";
import { selectBookingsByVenueId } from "../../redux/slices/bookings-slice";
import { VenueViewProps } from "../../types/venues";
import BookingCalendar from "../booking-calendar";
import styles from "./booking-venue-calendar.module.scss";

type Props = VenueViewProps;

function BookingVenueCalendar({
  id: venueId,
  venueFormProps: { name },
}: Props) {
  const venueBookings = useAppSelector((state) =>
    selectBookingsByVenueId(state, venueId),
  );

  const {
    calendarBookings,
    view,
    dateView,
    onView,
    onNavigate,
    onSelectEvent,
    onDrillDown,
  } = useBookingCalendarState({ bookings: venueBookings });

  return (
    <>
      <Segment className={styles.bookingVenueCalendar} raised>
        <h2>{name} Bookings</h2>

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
    </>
  );
}

export default BookingVenueCalendar;
