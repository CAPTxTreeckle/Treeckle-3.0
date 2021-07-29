import { useCallback, useEffect } from "react";
import { Popup, Button } from "semantic-ui-react";
import BookingAdminTable from "../../components/booking-admin-table";
import HorizontalLayoutContainer from "../../components/horizontal-layout-container";
import BookingAdminCalendarsSection from "../../components/booking-admin-calendars-section";
import Tab, { TabOption } from "../../components/tab";
import { useGetBookings } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectBookingsLoadingState,
  setBookingsAction,
} from "../../redux/slices/bookings-slice";
import { refreshPendingBookingCountThunk } from "../../redux/slices/pending-booking-count-slice";

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

  const getBookings = useCallback(async () => {
    dispatch(setBookingsAction({ loading: true }));
    const bookings = await _getBookings();
    dispatch(setBookingsAction({ bookings, loading: false }));
    dispatch(refreshPendingBookingCountThunk());
  }, [_getBookings, dispatch]);

  useEffect(() => {
    getBookings();
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
                onClick={getBookings}
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
