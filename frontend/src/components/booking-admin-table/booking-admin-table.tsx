import { useMemo } from "react";
import { Column } from "react-base-table";
import { Segment } from "semantic-ui-react";

import {
  BOOKER,
  CREATED_AT,
  CREATED_AT_STRING,
  DATE_FORMAT,
  EMAIL,
  EVENT_DATE_STRING,
  EVENT_TIME_RANGE,
  ID,
  NAME,
  START_DATE_TIME,
  START_DATE_TIME_STRING,
  START_TIME_MINS,
  TITLE,
  VENUE,
} from "../../constants";
import useTableState from "../../custom-hooks/use-table-state-admin";
import { useAppSelector } from "../../redux/hooks";
import {
  selectAllBookings,
  selectBookingsLoadingState,
} from "../../redux/slices/bookings-slice";
import {
  dateTimeToTimeMins,
  displayDateTime,
  displayTimeRange,
} from "../../utils/transform-utils";
import BookingBaseTable, { BookingViewProps } from "../booking-base-table";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../admin-search-bar";
import UserEmailRenderer from "../user-email-renderer";
import UserNameRenderer from "../user-name-renderer";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;
const VENUE_NAME = `${VENUE}.${NAME}`;

function BookingAdminTable() {
  const allBookings = useAppSelector(selectAllBookings);
  const loading = useAppSelector(selectBookingsLoadingState);

  const bookingViewData: BookingViewProps[] = useMemo(
    () =>
      allBookings.map((booking) => ({
        ...booking,
        [START_TIME_MINS]: dateTimeToTimeMins(booking.startDateTime),
        [START_DATE_TIME_STRING]: displayDateTime(booking.startDateTime),
        [EVENT_DATE_STRING]: displayDateTime(
          booking.startDateTime,
          DATE_FORMAT,
        ),
        [EVENT_TIME_RANGE]: displayTimeRange(
          booking.startDateTime,
          booking.endDateTime,
        ),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
        children: [{ [ID]: `${booking.id}-details`, booking }],
      })),
    [allBookings],
  );

  const { processedData, sortBy, setSortBy, onFilterChange } =
    useTableState(bookingViewData);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <SearchBar fluid onFilterChange={onFilterChange} />
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
        adminView
      >
        <Column<BookingViewProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={70}
          resizable
          sortable
          align="center"
        />
        <Column<BookingViewProps>
          key={TITLE}
          dataKey={TITLE}
          title="Booking Title"
          width={210}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={BOOKER_NAME}
          dataKey={BOOKER}
          title="Name"
          width={90}
          resizable
          sortable
          cellRenderer={UserNameRenderer}
        />
        <Column<BookingViewProps>
          key={BOOKER_EMAIL}
          dataKey={BOOKER}
          title="Email"
          width={130}
          resizable
          sortable
          cellRenderer={UserEmailRenderer}
        />
        <Column<BookingViewProps>
          key={VENUE_NAME}
          dataKey={VENUE_NAME}
          title="Venue"
          width={190}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={START_DATE_TIME}
          dataKey={EVENT_DATE_STRING}
          title="Date"
          width={100}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={START_TIME_MINS}
          dataKey={EVENT_TIME_RANGE}
          title="Time"
          width={150}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={165}
          resizable
          sortable
        />
      </BookingBaseTable>
    </Segment.Group>
  );
}

export default BookingAdminTable;
