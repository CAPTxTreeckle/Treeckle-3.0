import { snakeCase } from "change-case";
import { stringifyUrl } from "query-string";
import { useCallback, useMemo, useState } from "react";

import { DEFAULT_ARRAY } from "../../constants";
import {
  BookingNotificationSubscriptionData,
  BookingNotificationSubscriptionPostData,
  VenueData,
  VenueFormProps,
  VenueGetQueryParams,
  VenuePostData,
  VenuePutData,
  VenueViewProps,
} from "../../types/venues";
import { errorHandlerWrapper, resolveApiError } from "../../utils/error-utils";
import { changeKeyCase } from "../../utils/transform-utils";
import { useAxiosWithTokenRefresh } from "./auth-api";

function parseVenueFormProps(venueFormProps: VenueFormProps): VenuePostData {
  const {
    name,
    category,
    capacity,
    icName,
    icEmail,
    icContactNumber,
    bookingFormFields,
  } = venueFormProps;
  const data: VenuePostData = {
    name,
    category,
    capacity: capacity || null,
    icName,
    icEmail,
    icContactNumber,
    formFieldData: bookingFormFields ?? [],
  };

  return data;
}

function parseVenueData(venueData: VenueData): VenueViewProps {
  const {
    id,
    createdAt,
    updatedAt,
    name,
    category = "",
    capacity,
    icName = "",
    icEmail = "",
    icContactNumber = "",
    formFieldData,
    organization = "",
  } = venueData;

  const venueViewProps: VenueViewProps = {
    id,
    createdAt,
    updatedAt,
    organization,
    venueFormProps: {
      name,
      category,
      capacity: capacity ?? "",
      icName,
      icEmail,
      icContactNumber,
      bookingFormFields: formFieldData,
    },
  };

  return venueViewProps;
}

export function useGetVenueCategories() {
  const [{ data: venueCategories = DEFAULT_ARRAY, loading }, apiCall] =
    useAxiosWithTokenRefresh<string[]>(
      {
        url: "/venues/categories",
        method: "get",
      },
      { manual: true },
    );

  const getVenueCategories = useCallback(async () => {
    try {
      return await errorHandlerWrapper(
        async () => {
          const { data: categories = [] } = await apiCall();
          console.log("GET /venues/categories success:", categories);
          return categories;
        },
        { logMessageLabel: "GET /venues/categories error:" },
      )();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);

      return [];
    }
  }, [apiCall]);

  return { venueCategories, loading, getVenueCategories };
}

export function useGetVenues() {
  const [venues, setVenues] = useState<VenueViewProps[]>([]);
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<VenueData[]>(
    {
      method: "get",
    },
    { manual: true },
  );

  const getVenues = useCallback(
    async (queryParams?: VenueGetQueryParams) => {
      const url = stringifyUrl(
        {
          url: "/venues/",
          query: changeKeyCase(snakeCase, queryParams),
        },
        { skipNull: true, skipEmptyString: true },
      );

      try {
        return await errorHandlerWrapper(
          async () => {
            const { data: venues = [] } = await apiCall({ url });

            console.log(`GET ${url} success:`, venues);
            const parsedVenues = venues.map((venue) => parseVenueData(venue));
            setVenues(parsedVenues);
            return parsedVenues;
          },
          { logMessageLabel: `GET ${url} error:` },
        )();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        resolveApiError(error);

        setVenues([]);
        return [];
      }
    },
    [apiCall],
  );

  return { venues, loading, getVenues };
}

export function useCreateVenue() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    VenueData,
    VenuePostData
  >(
    {
      url: "/venues/",
      method: "post",
    },
    { manual: true },
  );

  const createVenue = useMemo(
    () =>
      errorHandlerWrapper(
        async (venueFormProps: VenueFormProps) => {
          const data: VenuePostData = parseVenueFormProps(venueFormProps);
          const { data: venue } = await apiCall({
            data,
          });
          console.log("POST /venues/ success:", venue);

          return venue;
        },
        { logMessageLabel: "POST /venues/ error:" },
      ),
    [apiCall],
  );

  return { createVenue, loading };
}

export function useDeleteVenue() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<VenueData>(
    {
      method: "delete",
    },
    { manual: true },
  );

  const deleteVenue = useMemo(
    () =>
      errorHandlerWrapper(
        async (venueId: number) => {
          const url = `/venues/${venueId}`;

          const { data: deletedVenue } = await apiCall({
            url,
          });

          console.log(`DELETE ${url} success:`, deletedVenue);

          return deletedVenue;
        },
        { logMessageLabel: `DELETE /venues/:venueId error:` },
      ),
    [apiCall],
  );

  return { deleteVenue, loading };
}

export function useGetSingleVenue() {
  const [venue, setVenue] = useState<VenueViewProps>();
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<VenueData>(
    {
      method: "get",
    },
    { manual: true },
  );

  const getSingleVenue = useCallback(
    async (venueId: number | string) => {
      const url = `/venues/${venueId}`;

      try {
        return await errorHandlerWrapper(
          async () => {
            const { data: venue } = await apiCall({
              url,
            });

            console.log(`GET ${url} success:`, venue);

            const parsedVenue = parseVenueData(venue);
            setVenue(parsedVenue);

            return parsedVenue;
          },
          { logMessageLabel: `GET ${url} error:` },
        )();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        resolveApiError(error);

        setVenue(undefined);
        return undefined;
      }
    },
    [apiCall],
  );

  return { venue, loading, getSingleVenue };
}

export function useUpdateVenue() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    VenueData,
    VenuePutData
  >(
    {
      method: "put",
    },
    { manual: true },
  );

  const updateVenue = useMemo(
    () =>
      errorHandlerWrapper(
        async (venueId: number | string, venueFormProps: VenueFormProps) => {
          const url = `/venues/${venueId}`;

          const data: VenuePutData = parseVenueFormProps(venueFormProps);

          const { data: venue } = await apiCall({
            url,
            data,
          });

          console.log(`PUT ${url} success:`, venue);

          return venue;
        },
        { logMessageLabel: `PUT /venues/:venueId error:` },
      ),
    [apiCall],
  );

  return { updateVenue, loading };
}

export function useGetBookingNotificationSubscriptions() {
  const [
    { data: bookingNotificationSubscriptions = DEFAULT_ARRAY, loading },
    apiCall,
  ] = useAxiosWithTokenRefresh<BookingNotificationSubscriptionData[]>(
    {
      url: "/venues/subscriptions",
      method: "get",
    },
    { manual: true },
  );

  const getBookingNotificationSubscriptions = useCallback(async () => {
    try {
      return await errorHandlerWrapper(
        async () => {
          const { data: bookingNotificationSubscriptions = [] } =
            await apiCall();

          console.log(
            `GET /venues/subscriptions success:`,
            bookingNotificationSubscriptions,
          );

          return bookingNotificationSubscriptions;
        },
        { logMessageLabel: `GET /venues/subscriptions error:` },
      )();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      resolveApiError(error);
      return [];
    }
  }, [apiCall]);

  return {
    bookingNotificationSubscriptions,
    loading,
    getBookingNotificationSubscriptions,
  };
}

export function useCreateBookingNotificationSubscription() {
  const [{ loading }, apiCall] = useAxiosWithTokenRefresh<
    BookingNotificationSubscriptionData,
    BookingNotificationSubscriptionPostData
  >(
    {
      method: "post",
    },
    { manual: true },
  );

  const createBookingNotificationSubscription = useMemo(
    () =>
      errorHandlerWrapper(
        async (
          venueId: number | string,
          data: BookingNotificationSubscriptionPostData,
        ) => {
          const url = `/venues/${venueId}/subscriptions`;

          const { data: bookingNotificationSubscriptions } = await apiCall({
            url,
            data,
          });
          console.log(`POST ${url} success:`, bookingNotificationSubscriptions);

          return bookingNotificationSubscriptions;
        },
        { logMessageLabel: "POST /venues/:venueId/subscriptions error:" },
      ),
    [apiCall],
  );

  return { createBookingNotificationSubscription, loading };
}

export function useDeleteBookingNotificationSubscription() {
  const [{ loading }, apiCall] =
    useAxiosWithTokenRefresh<BookingNotificationSubscriptionData>(
      {
        method: "delete",
      },
      { manual: true },
    );

  const deleteBookingNotificationSubscription = useMemo(
    () =>
      errorHandlerWrapper(
        async (subscriptionId: number | string) => {
          const url = `/venues/subscriptions/${subscriptionId}`;

          const { data: deletedBookingNotificationSubscription } =
            await apiCall({
              url,
            });

          console.log(
            `DELETE ${url} success:`,
            deletedBookingNotificationSubscription,
          );

          return deletedBookingNotificationSubscription;
        },
        {
          logMessageLabel: `DELETE /venues/subscription/:subscriptionId error:`,
        },
      ),
    [apiCall],
  );

  return { deleteBookingNotificationSubscription, loading };
}
