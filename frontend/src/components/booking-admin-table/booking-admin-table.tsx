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
  VENUE,
} from "../../constants";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { displayDateTime } from "../../utils/parser-utils";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import UserNameRenderer from "../user-name-renderer";
import UserEmailRenderer from "../user-email-renderer";
import BookingBaseTable, { BookingViewProps } from "../booking-base-table";
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

  const { processedData, sortBy, setSortBy, onSearchValueChange } =
    useTableState(bookingViewData, bookingAdminTableStateOptions);

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
                loading={loading}
                disabled={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
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
