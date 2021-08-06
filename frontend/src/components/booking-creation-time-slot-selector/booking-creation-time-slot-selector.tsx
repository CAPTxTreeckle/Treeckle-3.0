import { useEffect, useCallback } from "react";
import { useModal } from "react-modal-hook";
import {
  Segment,
  Button,
  TransitionablePortal,
  Modal,
  Label,
  Message,
  Icon,
  Grid,
} from "semantic-ui-react";
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
import BookingCalendar, { CalendarBooking } from "../booking-calendar";
import useBookingCreationCalendarState from "../../custom-hooks/use-booking-creation-calendar-state";
import { DEFAULT_ARRAY } from "../../constants";
import { displayDateTimeRange } from "../../utils/parser-utils";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import styles from "./booking-creation-time-slot-selector.module.scss";

function BookingCreationTimeSlotSelector() {
  const { id: venueId, venueFormProps } =
    useAppSelector(selectSelectedVenue) ?? {};
  const newBookingPeriods =
    useAppSelector(selectNewBookingPeriods) ?? DEFAULT_ARRAY;
  const user = useAppSelector(selectCurrentUserDisplayInfo) ?? null;
  const dispatch = useAppDispatch();

  const { bookings: existingBookings, loading, getBookings } = useGetBookings();

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
    onDrillDown,
  } = useBookingCreationCalendarState({
    existingBookings,
    newBookingPeriods,
    user,
    didUpdateNewBookingPeriods,
  });

  useEffect(() => {
    const { start, end } = visibleDateRange;
    const startDateTime = start.getTime();
    const endDateTime = end.getTime();

    getBookings({
      queryParams: {
        venueId,
        statuses: [BookingStatus.Approved, BookingStatus.Pending],
        startDateTime,
        endDateTime,
      },
    });
  }, [getBookings, venueId, visibleDateRange]);

  return (
    <>
      <Segment>
        <Message info icon>
          <Icon name="info circle" />
          <Message.Content>
            <p>
              There are 3 possible types of booking statuses in this calendar:
            </p>
            <Grid
              verticalAlign="middle"
              padded="vertically"
              columns="2"
              stackable
            >
              <Grid.Row className={styles.statusRow}>
                <Grid.Column textAlign="center" width="3">
                  <Label className={styles.status} color="teal" content="New" />
                </Grid.Column>
                <Grid.Column width="13">
                  <p>Newly selected booking</p>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row className={styles.statusRow}>
                <Grid.Column textAlign="center" width="3">
                  <Label
                    className={styles.status}
                    color="green"
                    content="Approved"
                  />
                </Grid.Column>
                <Grid.Column width="13">
                  <p>Existing approved booking.</p>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row className={styles.statusRow}>
                <Grid.Column textAlign="center" width="3">
                  <Label
                    className={styles.status}
                    color="orange"
                    content="Pending"
                  />
                </Grid.Column>
                <Grid.Column width="13">
                  <p>Existing booking which has yet to be approved.</p>
                </Grid.Column>
              </Grid.Row>
            </Grid>
            <p>
              <strong>Note:</strong> You are <strong>not</strong> allowed to
              make <Label as="span" color="teal" content="New" /> bookings which
              overlap with existing{" "}
              <Label as="span" color="green" content="Approved" /> bookings.
            </p>
          </Message.Content>
        </Message>

        <Segment>
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
                  onRemove={(e) => {
                    e.stopPropagation();
                    removeNewBooking(booking);
                  }}
                />
              );
            })}
          </Label.Group>
        </Segment>

        <h2>{venueFormProps?.name} Bookings</h2>
        <BookingCalendar
          events={allBookings}
          view={view}
          date={dateView}
          scrollToTime={dateView}
          onRangeChange={onRangeChange}
          onView={onView}
          onSelectSlot={onSelectSlot}
          onNavigate={onNavigate}
          onSelectEvent={onSelectEvent}
          onSelecting={onSelecting}
          onDoubleClickEvent={removeNewBooking}
          onDrillDown={onDrillDown}
          selectable
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
            onClick={() => dispatch(confirmBookingPeriodsAction())}
            disabled={newBookingPeriods.length === 0}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingCreationTimeSlotSelector;
