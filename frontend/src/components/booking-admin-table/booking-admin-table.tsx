import { useEffect, useMemo, useCallback, useState } from "react";
import { Column } from "react-base-table";
import { Button, Popup, Segment } from "semantic-ui-react";
import {
  NAME,
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  VENUE_NAME,
  START_DATE_TIME,
  END_DATE_TIME,
  CREATED_AT,
  STATUS,
  EMAIL,
  BOOKER,
  ID,
  USER_ID,
} from "../../constants";
import { PROFILE_PATH } from "../../routes/paths";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { displayDateTime } from "../../utils/parser-utils";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import LinkifyTextViewer from "../linkify-text-viewer";
import BookingStatusButton from "../booking-status-button";
import BookingTable, { BookingDisplayProps } from "../booking-table";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;

const bookingAdminTableStateOptions: TableStateOptions = {
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

const nameRenderer = ({
  rowData: { booker },
}: {
  rowData: Partial<BookingDisplayProps>;
}) =>
  booker ? (
    <a
      href={PROFILE_PATH.replace(`:${USER_ID}`, `${booker.id}`)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {booker.name}
    </a>
  ) : null;

const emailRenderer = ({
  rowData: { booker },
}: {
  rowData: Partial<BookingDisplayProps>;
}) => (booker ? <LinkifyTextViewer>{booker.email}</LinkifyTextViewer> : null);

function BookingAdminTable() {
  const { bookings, getBookings } = useGetBookings();
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setLoading(true);
    await getBookings();
    setLoading(false);
  }, [getBookings]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const bookingAdminDisplayData: BookingDisplayProps[] = useMemo(
    () =>
      bookings.map((booking) => ({
        ...booking,
        [START_DATE_TIME_STRING]: displayDateTime(booking.startDateTime),
        [END_DATE_TIME_STRING]: displayDateTime(booking.endDateTime),
        [CREATED_AT_STRING]: displayDateTime(booking.createdAt),
        children: [{ [ID]: `${booking.id}-details`, booking }],
      })),
    [bookings],
  );

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(bookingAdminDisplayData, bookingAdminTableStateOptions);

  const statusButtonRenderer = useCallback(
    ({
      rowData: { status, id },
    }: {
      // eslint-disable-next-line react/no-unused-prop-types
      rowData: Partial<BookingDisplayProps>;
    }) =>
      status && id !== undefined ? (
        <BookingStatusButton
          bookingId={id}
          status={status}
          getBookings={getBookings}
          adminView
        />
      ) : null,
    [getBookings],
  );

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button icon="redo alternate" color="blue" onClick={onRefresh} />
            }
            position="top center"
          />
        </HorizontalLayoutContainer>
      </Segment>

      <BookingTable
        data={processedBookings}
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
      >
        <Column<BookingDisplayProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={60}
          resizable
          sortable
          align="center"
        />
        <Column<BookingDisplayProps>
          key={BOOKER_NAME}
          title="Name"
          width={150}
          resizable
          sortable
          cellRenderer={nameRenderer}
        />
        <Column<BookingDisplayProps>
          key={BOOKER_EMAIL}
          title="Email"
          width={160}
          resizable
          sortable
          cellRenderer={emailRenderer}
        />
        <Column<BookingDisplayProps>
          key={VENUE_NAME}
          dataKey={VENUE_NAME}
          title="Venue"
          width={180}
          resizable
          sortable
        />
        <Column<BookingDisplayProps>
          key={START_DATE_TIME}
          dataKey={START_DATE_TIME_STRING}
          title="Start"
          width={160}
          resizable
          sortable
        />
        <Column<BookingDisplayProps>
          key={END_DATE_TIME}
          dataKey={END_DATE_TIME_STRING}
          title="End"
          width={160}
          resizable
          sortable
        />
        <Column<BookingDisplayProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={160}
          resizable
          sortable
        />
        <Column<BookingDisplayProps>
          key={STATUS}
          title="Status"
          width={110}
          sortable
          align="center"
          cellRenderer={statusButtonRenderer}
        />
      </BookingTable>
    </Segment.Group>
  );
}

export default BookingAdminTable;
