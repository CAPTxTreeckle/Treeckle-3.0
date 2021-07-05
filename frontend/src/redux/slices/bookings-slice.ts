import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { normalize } from "normalizr";
import { BookingData } from "../../types/bookings";
import { VENUE, BOOKER } from "../../constants";
import {
  UserEntityType,
  VenueEntityType,
  BookingEntityType,
  bookingEntity,
  usersAdapter,
  venuesAdapter,
  bookingsAdapter,
} from "../entities";
import type { RootState } from "../store";

type Entities = {
  users: { [key: string]: UserEntityType };
  venues: { [key: string]: VenueEntityType };
  bookings: { [key: string]: BookingEntityType };
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

const initialState = {
  users: usersAdapter.getInitialState(),
  venues: venuesAdapter.getInitialState(),
  bookings: bookingsAdapter.getInitialState(),
};

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    resetBookingsAction: () => initialState,
    setBookingsAction: (state, { payload }: PayloadAction<BookingData[]>) => {
      const { users, venues, bookings } = normalizeBookings(payload);

      usersAdapter.setAll(state.users, users);
      venuesAdapter.setAll(state.venues, venues);
      bookingsAdapter.setAll(state.bookings, bookings);
    },
    updateBookingsAction: (
      state,
      { payload }: PayloadAction<BookingData[]>,
    ) => {
      const { users, venues, bookings } = normalizeBookings(payload);

      usersAdapter.upsertMany(state.users, users);
      venuesAdapter.upsertMany(state.venues, venues);
      bookingsAdapter.upsertMany(state.bookings, bookings);
    },
  },
});

// action creators
export const { resetBookingsAction, setBookingsAction, updateBookingsAction } =
  bookingsSlice.actions;

// selectors
const { selectById: selectUserById } = usersAdapter.getSelectors();
const { selectById: selectVenueById } = venuesAdapter.getSelectors();
const { selectAll: selectBookings } = bookingsAdapter.getSelectors();

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

export default bookingsSlice.reducer;
