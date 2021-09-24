import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Popup } from "semantic-ui-react";
import { BOOKINGS_CREATION_PATH } from "../../routes/paths";
import Tab, { TabOption } from "../../components/tab";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import BookingUserTable from "../../components/booking-user-table";
import BookingUserCalendar from "../../components/booking-user-calendar";
import {
  useDeepEqualAppSelector,
  useAppDispatch,
  useAppSelector,
} from "../../redux/hooks";
import {
  selectBookingsLoadingState,
  setBookingsAction,
  updateBookingsAction,
} from "../../redux/slices/bookings-slice";
import HorizontalLayoutContainer from "../../components/horizontal-layout-container";

const OPTIONS: TabOption[] = [
  {
    name: "Table",
    pane: <BookingUserTable />,
  },
  {
    name: "Calendar",
    pane: <BookingUserCalendar />,
  },
];

function BookingsPage() {
  const { getBookings: _getBookings } = useGetBookings();
  const loading = useAppSelector(selectBookingsLoadingState);
  const { id: userId } =
    useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};

  const dispatch = useAppDispatch();

  const getBookings = useCallback(
    async (
      bookingsAction: typeof setBookingsAction | typeof updateBookingsAction,
    ) => {
      dispatch(bookingsAction({ loading: true }));
      const bookings = await _getBookings({ queryParams: { userId } });
      dispatch(bookingsAction({ bookings, loading: false }));
    },
    [_getBookings, dispatch, userId],
  );

  useEffect(() => {
    getBookings(setBookingsAction);
  }, [getBookings]);

  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="teal"
        as={Link}
        to={BOOKINGS_CREATION_PATH}
      >
        <Button.Content hidden content="Create New Bookings" />
        <Button.Content visible content={<Icon name="plus" fitted />} />
      </Button>

      <h1>
        <HorizontalLayoutContainer align="center">
          <span>My Bookings</span>

          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={() => getBookings(updateBookingsAction)}
                loading={loading}
                disabled={loading}
              />
            }
            position="top center"
            hideOnScroll
          />
        </HorizontalLayoutContainer>
      </h1>

      <Tab options={OPTIONS} showTitle={false} />
    </>
  );
}

export default BookingsPage;
