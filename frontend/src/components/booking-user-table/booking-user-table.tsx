import { useMemo } from "react";
import { Column } from "react-base-table";
import { Segment } from "semantic-ui-react";

import {
  CREATED_AT,
  CREATED_AT_STRING,
  DATE_FORMAT,
  EVENT_DATE,
  EVENT_TIME_RANGE,
  ID,
  NAME,
  STATUS,
  TITLE,
  VENUE,
} from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppSelector, useDeepEqualAppSelector } from "../../redux/hooks";
import {
  selectBookingsByUserId,
  selectBookingsLoadingState,
} from "../../redux/slices/bookings-slice";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { displayDateTime, displayTimeRange } from "../../utils/transform-utils";
import BookingBaseTable, { BookingViewProps } from "../booking-base-table";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";

const VENUE_NAME = `${VENUE}.${NAME}`;

const BOOKING_ADMIN_TABLE_STATE_OPTIONS: TableStateOptions = {
  searchKeys: [
    ID,
    VENUE_NAME,
    EVENT_DATE,
    EVENT_TIME_RANGE,
    CREATED_AT_STRING,
    STATUS,
  ],
};

function BookingUserTable() {
  const { id: userId } =
    useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const userBookings = useAppSelector((state) =>
    selectBookingsByUserId(state, userId ?? 0),
  );
  const loading = useAppSelector(selectBookingsLoadingState);

  const bookingViewData: BookingViewProps[] = useMemo(
    () =>
      userBookings.map((booking) => ({
        ...booking,
        [EVENT_DATE]: displayDateTime(booking.startDateTime, DATE_FORMAT),
        [EVENT_TIME_RANGE]: displayTimeRange(
          booking.startDateTime,
          booking.endDateTime,
        ),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
        children: [{ [ID]: `${booking.id}-details`, booking }],
      })),
    [userBookings],
  );

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(bookingViewData, BOOKING_ADMIN_TABLE_STATE_OPTIONS);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <SearchBar fluid onSearchValueChange={onSearchValueChange} />
      </Segment>

      <BookingBaseTable
        data={processedData}
        emptyRenderer={() => (
          <PlaceholderWrapper
            showDefaultMessage={!loading}
            defaultMessage="No booking requests found"
            placeholder
          />
        )}
        overlayRenderer={
          <PlaceholderWrapper
            dimmed
            placeholder
            loading={loading}
            fillParent
            loadingMessage="Retrieving booking requests"
          />
        }
        sortBy={sortBy}
        setSortBy={setSortBy}
        defaultStatusColumnWidth={110}
        defaultActionColumnWidth={50}
      >
        <Column<BookingViewProps>
          key={TITLE}
          dataKey={TITLE}
          title="Booking Title"
          width={320}
          resizable
          sortable
          align="center"
        />
        <Column<BookingViewProps>
          key={VENUE_NAME}
          dataKey={VENUE_NAME}
          title="Venue"
          width={240}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={EVENT_DATE}
          dataKey={EVENT_DATE}
          title="Date"
          width={150}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={EVENT_TIME_RANGE}
          dataKey={EVENT_TIME_RANGE}
          title="Time"
          width={200}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={220}
          resizable
          sortable
        />
      </BookingBaseTable>
    </Segment.Group>
  );
}

export default BookingUserTable;
