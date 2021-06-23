import { useEffect, useMemo, useCallback } from "react";
import { Column } from "react-base-table";
import { Button, Popup, Segment } from "semantic-ui-react";
import {
  NAME,
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  START_DATE_TIME,
  END_DATE_TIME,
  CREATED_AT,
  STATUS,
  EMAIL,
  BOOKER,
  ID,
  USER_ID,
  VENUE,
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
import BookingTable, { BookingViewProps } from "../booking-table";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectAllBookings,
  setBookingsAction,
} from "../../redux/slices/bookings-slice";

const BOOKER_NAME = `${BOOKER}.${NAME}`;
const BOOKER_EMAIL = `${BOOKER}.${EMAIL}`;
const VENUE_NAME = `${VENUE}.${NAME}`;

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
  rowData: Partial<BookingViewProps>;
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
  rowData: Partial<BookingViewProps>;
}) => (booker ? <LinkifyTextViewer>{booker.email}</LinkifyTextViewer> : null);

function BookingAdminTable() {
  const { getBookings: _getBookings, loading } = useGetBookings();
  const allBookings = useAppSelector(selectAllBookings);
  const dispatch = useAppDispatch();

  const getBookings = useCallback(async () => {
    const bookings = await _getBookings();
    dispatch(setBookingsAction(bookings));
  }, [_getBookings, dispatch]);

  useEffect(() => {
    getBookings();
  }, [getBookings]);

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

  const {
    processedData: processedBookings,
    sortBy,
    setSortBy,
    onSearchValueChange,
  } = useTableState(bookingViewData, bookingAdminTableStateOptions);

  return (
    <Segment.Group raised>
      <Segment secondary>
        <HorizontalLayoutContainer>
          <SearchBar fluid onSearchValueChange={onSearchValueChange} />
          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={getBookings}
              />
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
          title="Name"
          width={150}
          resizable
          sortable
          cellRenderer={nameRenderer}
        />
        <Column<BookingViewProps>
          key={BOOKER_EMAIL}
          title="Email"
          width={160}
          resizable
          sortable
          cellRenderer={emailRenderer}
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
      </BookingTable>
    </Segment.Group>
  );
}

export default BookingAdminTable;
