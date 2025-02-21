import { useCallback, useEffect } from "react";
import { Button, Popup } from "semantic-ui-react";

import BookingAdminCalendarsSection from "../../components/booking-admin-calendars-section";
import BookingAdminTable from "../../components/booking-admin-table";
import HorizontalLayoutContainer from "../../components/horizontal-layout-container";
import Tab, { TabOption } from "../../components/tab";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import useScrollToTop from "../../custom-hooks/use-scroll-to-top";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectBookingsLoadingState,
  setBookingsAction,
  updateBookingsAction,
} from "../../redux/slices/bookings-slice";
import { refreshPendingBookingCountThunk } from "../../redux/slices/pending-booking-count-slice";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";

const OPTIONS: TabOption[] = [
  {
    name: "Table",
    pane: <BookingAdminTable />,
  },
  {
    name: "Calendars",
    pane: <BookingAdminCalendarsSection />,
  },
];

function AdminBookingsPage() {
  const { getBookings: _getBookings } = useGetBookings();
  const loading = useAppSelector(selectBookingsLoadingState);
  const dispatch = useAppDispatch();

  useScrollToTop();

  const getBookings = useCallback(
    async (bookingsAction: typeof setBookingsAction) => {
      try {
        dispatch(bookingsAction({ loading: true }));
        const bookings = await _getBookings({
          resolveError: false,
        });
        dispatch(bookingsAction({ bookings, loading: false }));
        dispatch(refreshPendingBookingCountThunk());
      } catch (error) {
        dispatch(bookingsAction({ loading: false }));
        resolveApiError(error as ApiResponseError);
      }
    },
    [_getBookings, dispatch],
  );

  useEffect(() => {
    getBookings(setBookingsAction).catch((error) => console.error(error));
  }, [getBookings]);

  return (
    <>
      <h1>
        <HorizontalLayoutContainer align="center">
          <span>Booking Requests</span>

          <Popup
            content="Refresh"
            trigger={
              <Button
                icon="redo alternate"
                color="blue"
                onClick={() => {
                  getBookings(updateBookingsAction).catch((error) =>
                    console.error(error),
                  );
                }}
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

export default AdminBookingsPage;
