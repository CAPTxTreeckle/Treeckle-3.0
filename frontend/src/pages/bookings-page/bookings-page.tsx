import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Icon, Popup } from "semantic-ui-react";
import { useMediaQuery } from "react-responsive";

import BookingUserCalendar from "../../components/booking-user-calendar";
import BookingUserTable from "../../components/booking-user-table";
import HorizontalLayoutContainer from "../../components/horizontal-layout-container";
import Tab, { TabOption } from "../../components/tab";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import {
  useAppDispatch,
  useAppSelector,
  useDeepEqualAppSelector,
} from "../../redux/hooks";
import {
  selectBookingsLoadingState,
  setBookingsAction,
  updateBookingsAction,
} from "../../redux/slices/bookings-slice";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { BOOKINGS_CREATION_PATH } from "../../routes/paths";

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
  const { name } = useAppSelector(selectCurrentUserDisplayInfo) ?? {};

  const isTabletOrLarger = useMediaQuery({ query: "(min-width: 768px)" });

  const { getBookings: _getBookings } = useGetBookings();
  const loading = useAppSelector(selectBookingsLoadingState);
  const { id: userId } =
    useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};

  const dispatch = useAppDispatch();

  useScrollToTop();

  const getBookings = useCallback(
    async (bookingsAction: typeof setBookingsAction) => {
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
      <h2>Welcome, {name}!</h2>
      <p>
        <strong>Note:</strong> Treeckle is currently in development and we are
        working hard towards making residential life better for you. For urgent
        queries or if you have found any bugs, please contact us at
        treeckle@googlegroups.com.
      </p>
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

      {isTabletOrLarger ? <div /> : <br />}

      <Tab options={OPTIONS} showTitle={false} />
    </>
  );
}

export default BookingsPage;
