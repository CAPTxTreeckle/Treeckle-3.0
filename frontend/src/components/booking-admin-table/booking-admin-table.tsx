import { useMemo } from "react";
import { Column } from "react-base-table";
import { Segment } from "semantic-ui-react";

import {
  BOOKER,
  CREATED_AT,
  CREATED_AT_STRING,
  EMAIL,
  END_DATE_TIME,
  END_DATE_TIME_STRING,
  ID,
  NAME,
  START_DATE_TIME,
  START_DATE_TIME_STRING,
  STATUS,
  VENUE,
} from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useAppSelector } from "../../redux/hooks";
import {
  selectAllBookings,
  selectBookingsLoadingState,
} from "../../redux/slices/bookings-slice";
import { displayDateTime } from "../../utils/transform-utils";
import BookingBaseTable, { BookingViewProps } from "../booking-base-table";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import UserEmailRenderer from "../user-email-renderer";
import UserNameRenderer from "../user-name-renderer";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;
const VENUE_NAME = `${VENUE}.${NAME}`;

const BOOKING_ADMIN_TABLE_STATE_OPTIONS: TableStateOptions = {
  searchKeys: [
    ID,
    BOOKER_NAME,
    BOOKER_EMAIL,
    VENUE_NAME,
    START_DATE_TIME_STRING,
    END_DATE_TIME_STRING,
    CREATED_AT_STRING,
    STATUS,
  ],
};

function BookingAdminTable() {
  const allBookings = useAppSelector(selectAllBookings);
  const loading = useAppSelector(selectBookingsLoadingState);

  const bookingViewData: BookingViewProps[] = useMemo(
    () =>
      allBookings.map((booking) => ({
        ...booking,
        [START_DATE_TIME_STRING]: displayDateTime(booking.startDateTime),
        [END_DATE_TIME_STRING]: displayDateTime(booking.endDateTime),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
        children: [{ [ID]: `${booking.id}-details`, booking }],
      })),
    [allBookings],
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
        adminView
      >
        <Column<BookingViewProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={60}
          resizable
          sortable
          align="center"
        />
        <Column<BookingViewProps>
          key={BOOKER_NAME}
          dataKey={BOOKER}
          title="Name"
          width={150}
          resizable
          sortable
          cellRenderer={UserNameRenderer}
        />
        <Column<BookingViewProps>
          key={BOOKER_EMAIL}
          dataKey={BOOKER}
          title="Email"
          width={180}
          resizable
          sortable
          cellRenderer={UserEmailRenderer}
        />
        <Column<BookingViewProps>
          key={VENUE_NAME}
          dataKey={VENUE_NAME}
          title="Venue"
          width={180}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={START_DATE_TIME}
          dataKey={START_DATE_TIME_STRING}
          title="Start"
          width={160}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={END_DATE_TIME}
          dataKey={END_DATE_TIME_STRING}
          title="End"
          width={160}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={160}
          resizable
          sortable
        />
      </BookingBaseTable>
    </Segment.Group>
  );
}

export default BookingAdminTable;
