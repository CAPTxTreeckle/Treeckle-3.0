import useAxios from "axios-hooks";
import { useCallback, useMemo, useState } from "react";
import { stringifyUrl } from "query-string";
import { snakeCase } from "change-case";
import { useAxiosWithTokenRefresh } from "./auth-api";
import {
  BookingData,
  BookingDeleteData,
  BookingGetQueryParams,
  SingleBookingGetQueryParams,
  BookingPatchData,
  BookingPostData,
  BookingStatusAction,
} from "../../types/bookings";
import { errorHandlerWrapper, resolveApiError } from "../../utils/error-utils";
import { changeKeyCase } from "../../utils/parser-utils";
import { DEFAULT_ARRAY } from "../../constants";

export function useGetTotalBookingCount() {
  const [{ data: totalBookingCount = 0, loading }, apiCall] = useAxios<number>(
    {
      url: "/bookings/totalcount",
      method: "get",
    },
    { manual: true },
  );

  const getTotalBookingCount = useCallback(async () => {
    try {
      const { data: totalBookingCount } = await apiCall();

      console.log(`GET /bookings/totalcount success:`, totalBookingCount);

      return totalBookingCount;
    } catch (error) {
      console.log(`GET /bookings/totalcount error:`, error, error?.response);

      return 0;
    }
  }, [apiCall]);

  return { totalBookingCount, loading, getTotalBookingCount };
}

export function useGetPendingBookingCount() {
  const [{ data: pendingCount = 0, loading }, apiCall] =
    useAxiosWithTokenRefresh<number>(
      {
        url: "/bookings/pendingcount",
        method: "get",
      },
      { manual: true },
    );

  const getPendingBookingCount = useCallback(async () => {
    try {
      return await errorHandlerWrapper(async () => {
        const { data: pendingCount } = await apiCall();

        console.log("GET /bookings/pendingcount success:", pendingCount);

        return pendingCount;
      }, "GET /bookings/pendingcount error:")();
    } catch (error) {
      resolveApiError(error);

      return 0;
    }
  }, [apiCall]);

  return { pendingCount, loading, getPendingBookingCount };
}

export function useGetSingleBooking() {
  const [booking, setBooking] = useState<BookingData>();
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<BookingData>(
    {
      method: "get",
    },
    { manual: true },
  );

  const getSingleBooking = useCallback(
    async (bookingId: number | string) => {
      const url = `/bookings/${bookingId}`;

      try {
        const { data: booking } = await apiCall({
          url,
        });
        console.log(`GET ${url} success:`, booking);
        // TODO: replace with some way to parse
        const parsedBooking = booking;
        setBooking(parsedBooking);
        return parsedBooking;
      } catch (error) {
        console.log(`GET ${url} error:`, error, error?.response);

        setBooking(undefined);
        return undefined;
      }
    },
    [apiCall],
  );

  return { booking, loading, getSingleBooking };
}

export function useGetBookings() {
  const [{ data: bookings = DEFAULT_ARRAY, loading }, apiCall] =
    useAxiosWithTokenRefresh<BookingData[]>(
      {
        method: "get",
      },
      { manual: true },
    );

  const getBookings = useCallback(
    async (queryParams?: BookingGetQueryParams) => {
      const url = stringifyUrl(
        {
          url: "/bookings/",
          query: changeKeyCase(snakeCase, queryParams),
        },
        { skipNull: true, skipEmptyString: true },
      );

      try {
        return await errorHandlerWrapper(async () => {
          const { data: bookings = [] } = await apiCall({ url });

          console.log(`GET ${url} success:`, bookings);

          return bookings;
        }, `GET ${url} error:`)();
      } catch (error) {
        resolveApiError(error);

        return [];
      }
    },
    [apiCall],
  );

  return { bookings, loading, getBookings };
}

export function useCreateBookings() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<BookingData[]>(
    {
      url: "/bookings/",
      method: "post",
    },
    { manual: true },
  );

  const createBookings = useMemo(
    () =>
      errorHandlerWrapper(async (bookingPostData: BookingPostData) => {
        console.log("POST /bookings/ data:", bookingPostData);

        const { data: bookings = [] } = await apiCall({
          data: bookingPostData,
        });

        console.log("POST /bookings/ success:", bookings);

        if (bookings.length === 0) {
          throw new Error("No bookings were created.");
        }

        return bookings;
      }, "POST /bookings/ error:"),
    [apiCall],
  );

  return { loading, createBookings };
}

export function useUpdateBookingStatuses() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<BookingData[]>(
    {
      url: "/bookings/",
      method: "patch",
    },
    { manual: true },
  );

  const updateBookingStatuses = useMemo(
    () =>
      errorHandlerWrapper(async (actions: BookingStatusAction[]) => {
        const bookingPatchData: BookingPatchData = { actions };

        const { data: bookings = [] } = await apiCall({
          data: bookingPatchData,
        });

        console.log(`PATCH /bookings/ success:`, bookings);

        if (bookings.length === 0) {
          throw new Error("No booking statuses were updated.");
        }

        return bookings;
      }, "PATCH /bookings/ error:"),
    [apiCall],
  );

  return { updateBookingStatuses, loading };
}

export function useDeleteBookings() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<BookingData[]>(
    {
      url: "/bookings/",
      method: "delete",
    },
    { manual: true },
  );

  const deleteBookings = useMemo(
    () =>
      errorHandlerWrapper(async (ids: number[]) => {
        const bookingDeleteData: BookingDeleteData = { ids };

        const { data: deletedBookings = [] } = await apiCall({
          data: bookingDeleteData,
        });

        console.log(`DELETE /bookings/ success:`, deletedBookings);

        if (deletedBookings.length === 0) {
          throw new Error("No booking requests were deleted.");
        }

        return deletedBookings;
      }, "DELETE /bookings/ error:"),
    [apiCall],
  );

  return { deleteBookings, loading };
}
