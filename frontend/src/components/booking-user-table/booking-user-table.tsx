import { useCallback, useEffect, useMemo } from "react";
import { Column } from "react-base-table";
import { Segment, Popup, Button } from "semantic-ui-react";
import {
  VENUE,
  NAME,
  ID,
  START_DATE_TIME_STRING,
  END_DATE_TIME_STRING,
  CREATED_AT_STRING,
  STATUS,
  CREATED_AT,
  END_DATE_TIME,
  START_DATE_TIME,
} from "../../constants";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import useTableState, {
  TableStateOptions,
} from "../../custom-hooks/use-table-state";
import {
  useAppSelector,
  useAppDispatch,
  useDeepEqualAppSelector,
} from "../../redux/hooks";
import {
  selectBookingsByUserId,
  setBookingsAction,
} from "../../redux/slices/bookings-slice";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { displayDateTime } from "../../utils/parser-utils";
import BookingBaseTable, { BookingViewProps } from "../booking-base-table";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import PlaceholderWrapper from "../placeholder-wrapper";
import SearchBar from "../search-bar";

const VENUE_NAME = `${VENUE}.${NAME}`;

const bookingAdminTableStateOptions: TableStateOptions = {
  searchKeys: [
    ID,
    VENUE_NAME,
    START_DATE_TIME_STRING,
    END_DATE_TIME_STRING,
    CREATED_AT_STRING,
    STATUS,
  ],
};

function BookingUserTable() {
  const { getBookings: _getBookings, loading } = useGetBookings();
  const { id: userId } = useDeepEqualAppSelector(selectCurrentUserDisplayInfo);
  const allBookings = useAppSelector((state) =>
    selectBookingsByUserId(state, userId ?? 0),
  );
  const dispatch = useAppDispatch();

  const getBookings = useCallback(async () => {
    const bookings = await _getBookings({ userId });
    dispatch(setBookingsAction(bookings));
  }, [_getBookings, dispatch, userId]);

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
        defaultActionColumnWidth={150}
      >
        <Column<BookingViewProps>
          key={ID}
          dataKey={ID}
          title="ID"
          width={80}
          resizable
          sortable
          align="center"
        />
        <Column<BookingViewProps>
          key={VENUE_NAME}
          dataKey={VENUE_NAME}
          title="Venue"
          width={230}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={START_DATE_TIME}
          dataKey={START_DATE_TIME_STRING}
          title="Start"
          width={230}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={END_DATE_TIME}
          dataKey={END_DATE_TIME_STRING}
          title="End"
          width={230}
          resizable
          sortable
        />
        <Column<BookingViewProps>
          key={CREATED_AT}
          dataKey={CREATED_AT_STRING}
          title="Created at"
          width={230}
          resizable
          sortable
        />
      </BookingBaseTable>
    </Segment.Group>
  );
}

export default BookingUserTable;
