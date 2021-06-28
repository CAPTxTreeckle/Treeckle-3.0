import { useEffect } from "react";
import { useModal } from "react-modal-hook";
import {
  Segment,
  Button,
  TransitionablePortal,
  Modal,
  Label,
} from "semantic-ui-react";
import { Calendar, View } from "react-big-calendar";
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
  chooseBookingPeriodsAction,
  selectNewBookingPeriods,
  selectSelectedVenue,
} from "../../redux/slices/booking-creation-slice";
import { BookingStatus } from "../../types/bookings";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import useBookingCreationCalendarState, {
  CalendarBooking,
} from "../../custom-hooks/use-booking-creation-calendar-state";
import { DEFAULT_ARRAY } from "../../constants";
import styles from "./booking-creation-time-slot-selector.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { displayDateTimeRange } from "../../utils/parser-utils";

const eventPropGetter = ({
  isNew,
}: CalendarBooking): { className?: string; style?: React.CSSProperties } =>
  isNew ? { style: { backgroundColor: "#00b5ad" } } : {};

const views: View[] = ["month", "week", "day"];

function BookingCreationTimeSlotSelector() {
  const selectedVenue = useAppSelector(selectSelectedVenue);
  const newBookingPeriods =
    useAppSelector(selectNewBookingPeriods) ?? DEFAULT_ARRAY;
  const dispatch = useAppDispatch();
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

  const { name: venueName } = selectedVenue?.venueFormProps ?? {};

  const { bookings: approvedBookings, loading, getBookings } = useGetBookings();

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
  } = useBookingCreationCalendarState(approvedBookings, newBookingPeriods);

  useEffect(() => {
    const { start, end } = visibleDateRange;
    const startDateTime = start.getTime();
    const endDateTime = end.getTime();

    getBookings({
      venueName,
      status: BookingStatus.Approved,
      startDateTime,
      endDateTime,
    });
  }, [getBookings, venueName, visibleDateRange]);

  useEffect(() => {
    if (loading) {
      showModal();
    } else {
      hideModal();
    }
  }, [loading, showModal, hideModal]);

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
                  key={label}
                  color="teal"
                  className="pointer"
                  content={label}
                  onClick={(e) => onSelectEvent(booking, e, true)}
                  onRemove={() => removeNewBooking(booking)}
                />
              );
            })}
          </Label.Group>
        </Segment>

        <h2>{venueName} Bookings</h2>
        <Calendar
          className={styles.calendar}
          events={allBookings}
          localizer={dateLocalizer}
          toolbar
          step={30}
          timeslots={1}
          selectable
          showMultiDayTimes
          popup
          views={views}
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
            onClick={() =>
              dispatch(
                chooseBookingPeriodsAction(
                  newBookings.map(({ start, end }) => ({
                    startDateTime: start.getTime(),
                    endDateTime: end.getTime(),
                  })),
                ),
              )
            }
            disabled={newBookings.length === 0}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingCreationTimeSlotSelector;
