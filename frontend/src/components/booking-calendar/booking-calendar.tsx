import clsx from "clsx";
import {
  Calendar,
  EventPropGetter,
  Views,
  CalendarProps,
} from "react-big-calendar";
import {
  CURRENT_LOCALE,
  dateLocalizer,
  dayPropGetter,
  DAY_HEADER_FORMAT,
  slotPropGetter,
  weekRangeFormat,
} from "../../utils/calendar-utils";
import CalendarBookingEvent from "../calendar-booking-event";
import CalendarToolbar from "../calendar-toolbar";
import { TITLE, BOOKER, START, END, STATUS, VENUE_NAME } from "../../constants";
import { BookingStatus } from "../../types/bookings";
import { UserData } from "../../types/users";
import styles from "./booking-calendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

export type CalendarBooking = {
  [TITLE]: string;
  [BOOKER]: UserData | null;
  [START]: Date;
  [END]: Date;
  [STATUS]: BookingStatus | null;
  [VENUE_NAME]: string | null;
};

const eventPropGetter: EventPropGetter<CalendarBooking> = ({ status }) => ({
  className: clsx({
    [styles.new]: !status,
    [styles.approved]: status === BookingStatus.Approved,
    [styles.pending]: status === BookingStatus.Pending,
    [styles.rejected]: status === BookingStatus.Rejected,
    [styles.cancelled]: status === BookingStatus.Cancelled,
  }),
});

const VIEWS = [Views.MONTH, Views.WEEK, Views.DAY];

const COMPONENTS = {
  event: CalendarBookingEvent,
  toolbar: CalendarToolbar,
};

type Props = Omit<CalendarProps<CalendarBooking>, "localizer">;

function BookingCalendar(props: Props) {
  return (
    <div className={styles.calendarWrapper}>
      <Calendar
        localizer={dateLocalizer}
        toolbar
        titleAccessor="title"
        startAccessor="start"
        endAccessor="end"
        step={30}
        timeslots={1}
        showMultiDayTimes
        popup
        doShowMoreDrillDown={false}
        views={VIEWS}
        components={COMPONENTS}
        culture={CURRENT_LOCALE}
        formats={{
          dayHeaderFormat: DAY_HEADER_FORMAT,
          dayRangeHeaderFormat: weekRangeFormat,
        }}
        dayPropGetter={dayPropGetter}
        slotPropGetter={slotPropGetter}
        eventPropGetter={eventPropGetter}
        {...props}
      />
    </div>
  );
}

export default BookingCalendar;
