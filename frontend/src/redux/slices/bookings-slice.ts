import {
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { normalize } from "normalizr";

import { BOOKER, VENUE } from "../../constants";
import { BookingData, BookingStatus } from "../../types/bookings";
import { UserData } from "../../types/users";
import { VenueData } from "../../types/venues";
import {
  bookingEntity,
  BookingEntityType,
  bookingsAdapter,
  UserEntityType,
  usersAdapter,
  VenueEntityType,
  venuesAdapter,
} from "../entities";
import type { RootState } from "../store";

type Entities = {
  users: { [key: string]: UserEntityType };
  venues: { [key: string]: VenueEntityType };
  bookings: { [key: string]: BookingEntityType };
};

type BookingsState = {
  users: EntityState<UserData>;
  venues: EntityState<VenueData>;
  bookings: EntityState<BookingEntityType>;
  loading: boolean;
};

type UpdateAction = {
  bookings?: BookingData[];
  loading?: boolean;
};

const normalizeBookings = (data: BookingData[]) => {
  const normalizedBookings = normalize<BookingEntityType, Entities>(data, [
    bookingEntity,
  ]);

  const {
    users = {},
    venues = {},
    bookings = {},
  } = normalizedBookings.entities;

  return { users, venues, bookings };
};

const updateBookings = ({
  state,
  updateFn,
  bookingsToBeUpdated,
}: {
  state: BookingsState;
  updateFn: "setAll" | "upsertMany";
  bookingsToBeUpdated: BookingData[];
}) => {
  const { users, venues, bookings } = normalizeBookings(bookingsToBeUpdated);

  usersAdapter[updateFn](state.users, users);
  venuesAdapter[updateFn](state.venues, venues);
  bookingsAdapter[updateFn](state.bookings, bookings);
};

const updateBookingsActionGenerator =
  (updateFn: "setAll" | "upsertMany") =>
  (
    state: BookingsState,
    { payload: { bookings, loading } }: PayloadAction<UpdateAction>,
  ) => {
    if (bookings) {
      updateBookings({
        state,
        updateFn,
        bookingsToBeUpdated: bookings,
      });
    }

    if (loading !== undefined) {
      state.loading = loading;
    }
  };

const initialState: BookingsState = {
  users: usersAdapter.getInitialState(),
  venues: venuesAdapter.getInitialState(),
  bookings: bookingsAdapter.getInitialState(),
  loading: false,
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    resetBookingsAction: () => initialState,
    setBookingsAction: updateBookingsActionGenerator("setAll"),
    updateBookingsAction: updateBookingsActionGenerator("upsertMany"),
  },
});

// action creators
export const { resetBookingsAction, setBookingsAction, updateBookingsAction } =
  bookingsSlice.actions;

// selectors
const { selectById: selectUserById } = usersAdapter.getSelectors();
const { selectById: selectVenueById } = venuesAdapter.getSelectors();
const { selectAll: selectBookings } = bookingsAdapter.getSelectors();

export const selectBookingsLoadingState = ({
  bookings: { loading },
}: RootState) => loading;

export const selectAllBookings = createSelector(
  ({ bookings }: RootState) => bookings,
  ({ users, venues, bookings }) => {
    const allBookings: BookingData[] = selectBookings(bookings).flatMap(
      (booking) => {
        const booker = selectUserById(users, booking[BOOKER]);
        const venue = selectVenueById(venues, booking[VENUE]);

        return booker && venue ? [{ ...booking, booker, venue }] : [];
      },
    );

    return allBookings;
  },
);

export const selectBookingsByUserId = createSelector(
  selectAllBookings,
  (_: unknown, userId: number) => userId,
  (allBookings, userId) =>
    allBookings.filter(({ booker: { id } }) => id === userId),
);

export const selectBookingsByVenueId = createSelector(
  selectAllBookings,
  (_: unknown, venueId: number) => venueId,
  (allBookings, venueId) =>
    allBookings.filter(({ venue: { id } }) => id === venueId),
);

export const selectPendingBookings = createSelector(
  selectAllBookings,
  (allBookings) =>
    allBookings.filter(({ status }) => status === BookingStatus.Pending),
);

export default bookingsSlice.reducer;
