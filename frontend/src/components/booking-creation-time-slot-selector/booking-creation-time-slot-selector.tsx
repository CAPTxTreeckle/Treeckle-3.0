import { useEffect, useCallback } from "react";
import { useModal } from "react-modal-hook";
import {
  Segment,
  Button,
  TransitionablePortal,
  Modal,
  Label,
} from "semantic-ui-react";
import { Calendar, EventPropGetter, Views } from "react-big-calendar";
import {
  CURRENT_LOCALE,
  dateLocalizer,
  dayPropGetter,
  DAY_HEADER_FORMAT,
  slotPropGetter,
  weekRangeFormat,
} from "../../utils/calendar-utils";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  backFromBookingPeriodsSelectionAction,
  updateBookingPeriodsAction,
  confirmBookingPeriodsAction,
  selectNewBookingPeriods,
  selectSelectedVenue,
} from "../../redux/slices/booking-creation-slice";
import { BookingStatus } from "../../types/bookings";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import CalendarBookingEvent from "../calendar-booking-event";
import useBookingCreationCalendarState, {
  CalendarBooking,
} from "../../custom-hooks/use-booking-creation-calendar-state";
import { DEFAULT_ARRAY } from "../../constants";
import { displayDateTimeRange } from "../../utils/parser-utils";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import styles from "./booking-creation-time-slot-selector.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

const eventPropGetter: EventPropGetter<CalendarBooking> = ({ status }) =>
  !status ? { style: { backgroundColor: "#00b5ad" } } : {};

const views = [Views.MONTH, Views.WEEK, Views.DAY];

const components = {
  event: CalendarBookingEvent,
};

function BookingCreationTimeSlotSelector() {
  const { id: venueId, venueFormProps } =
    useAppSelector(selectSelectedVenue) ?? {};
  const newBookingPeriods =
    useAppSelector(selectNewBookingPeriods) ?? DEFAULT_ARRAY;
  const user = useAppSelector(selectCurrentUserDisplayInfo) ?? null;
  const dispatch = useAppDispatch();

  const { bookings: approvedBookings, loading, getBookings } = useGetBookings();

  const [showModal, hideModal] = useModal(({ in: open, onExited }) => (
    <TransitionablePortal
      transition={{ animation: "fade down" }}
      open={open}
      onHide={onExited}
    >
      <Modal basic open>
        <PlaceholderWrapper
          loading
          loadingMessage="Retrieving booking periods"
          inverted
        />
      </Modal>
    </TransitionablePortal>
  ));

  useEffect(() => {
    if (loading) {
      showModal();
    } else {
      hideModal();
    }
  }, [loading, showModal, hideModal]);

  const didUpdateNewBookingPeriods = useCallback(
    (newBookings: CalendarBooking[]) =>
      dispatch(
        updateBookingPeriodsAction(
          newBookings.map(({ start, end }) => ({
            startDateTime: start.getTime(),
            endDateTime: end.getTime(),
          })),
        ),
      ),
    [dispatch],
  );

  const {
    allBookings,
    newBookings,
    visibleDateRange,
    view,
    dateView,
    onRangeChange,
    onView,
    onSelectSlot,
    onNavigate,
    onSelectEvent,
    onSelecting,
    removeNewBooking,
  } = useBookingCreationCalendarState({
    approvedBookings,
    newBookingPeriods,
    user,
    didUpdateNewBookingPeriods,
  });

  useEffect(() => {
    const { start, end } = visibleDateRange;
    const startDateTime = start.getTime();
    const endDateTime = end.getTime();

    getBookings({
      venueId,
      status: BookingStatus.Approved,
      startDateTime,
      endDateTime,
    });
  }, [getBookings, venueId, visibleDateRange]);

  return (
    <>
      <Segment>
        <Segment raised>
          <Label
            attached="top left"
            content="Selected time slot(s)"
            size="large"
          />
          <Label.Group>
            {newBookings.map((booking) => {
              const { start, end } = booking;

              const label = displayDateTimeRange(start, end);

              return (
                <Label
                  as="a"
                  key={label}
                  color="teal"
                  content={label}
                  onClick={(e) => onSelectEvent(booking, e, true)}
                  onRemove={() => removeNewBooking(booking)}
                />
              );
            })}
          </Label.Group>
        </Segment>

        <h2>{venueFormProps?.name} Bookings</h2>
        <div className={styles.calendarWrapper}>
          <Calendar
            events={allBookings}
            localizer={dateLocalizer}
            toolbar
            titleAccessor="title"
            step={30}
            timeslots={1}
            selectable
            showMultiDayTimes
            popup
            views={views}
            components={components}
            view={view}
            culture={CURRENT_LOCALE}
            date={dateView}
            formats={{
              dayHeaderFormat: DAY_HEADER_FORMAT,
              dayRangeHeaderFormat: weekRangeFormat,
            }}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            eventPropGetter={eventPropGetter}
            scrollToTime={dateView}
            onRangeChange={onRangeChange}
            onView={onView}
            onSelectSlot={onSelectSlot}
            onNavigate={onNavigate}
            onSelectEvent={onSelectEvent}
            onSelecting={onSelecting}
            onDoubleClickEvent={removeNewBooking}
          />
        </div>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer justify="space between">
          <Button
            color="black"
            content="Back"
            onClick={() => dispatch(backFromBookingPeriodsSelectionAction())}
          />

          <Button
            color="blue"
            content="Next"
            onClick={() => dispatch(confirmBookingPeriodsAction())}
            disabled={newBookingPeriods.length === 0}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingCreationTimeSlotSelector;
