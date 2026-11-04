import { useCallback, useEffect, useState } from "react";
import { Button, Popup } from "semantic-ui-react";

import BookingAdminCalendarsSection from "../../components/booking-admin-calendars-section";
import BookingAdminTable from "../../components/booking-admin-table";
import { Filters } from "../../components/admin-search-bar/admin-search-bar";
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
import { BookingGetQueryParams, BookingStatus } from "../../types/bookings";

const DEFAULT_FILTERS: Filters = {
  title: "",
  venue: "",
  date: "",
  status: "",
};

function getQueryParams({ title, venue, date, status }: Filters): BookingGetQueryParams {
  return {
    title: title || null,
    venueName: venue || null,
    dateFilter: date || null,
    statuses: status ? [status.toUpperCase() as BookingStatus] : null,
  };
}

function AdminBookingsPage() {
  const { getBookings: _getBookings } = useGetBookings();
  const loading = useAppSelector(selectBookingsLoadingState);
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useScrollToTop();

  const getBookings = useCallback(
    async (
      bookingsAction: typeof setBookingsAction,
      requestedFilters: Filters,
    ) => {
      try {
        dispatch(bookingsAction({ loading: true }));
        const bookings = await _getBookings({
          queryParams: getQueryParams(requestedFilters),
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
    const timeoutId = window.setTimeout(() => {
      void getBookings(setBookingsAction, filters).catch((error) =>
        console.error(error),
      );
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [filters, getBookings]);

  const options: TabOption[] = [
    {
      name: "Table",
      pane: <BookingAdminTable onFilterChange={setFilters} />,
    },
    {
      name: "Calendars",
      pane: <BookingAdminCalendarsSection />,
    },
  ];

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
                  getBookings(updateBookingsAction, filters).catch((error) =>
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

      <Tab options={options} showTitle={false} />
    </>
  );
}

export default AdminBookingsPage;
