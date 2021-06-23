import {
  createSlice,
  createEntityAdapter,
  PayloadAction,
  createSelector,
} from "@reduxjs/toolkit";
import { normalize, schema } from "normalizr";
import { BookingData } from "../../types/bookings";
import { VENUE, BOOKER } from "../../constants";
import { UserData } from "../../types/users";
import type { RootState } from "../store";

export type UserEntityType = UserData;

export type VenueEntityType = BookingData["venue"];

export type BookingEntityType = Omit<
  BookingData,
  typeof VENUE | typeof BOOKER
> & {
  [VENUE]: number;
  [BOOKER]: number;
};

// Define normalizr entity schemas
export const userEntity = new schema.Entity<UserEntityType>("users");
export const venueEntity = new schema.Entity<VenueEntityType>("venues");
export const bookingEntity = new schema.Entity<BookingEntityType>("bookings", {
  booker: userEntity,
  venue: venueEntity,
});

type Entities = {
  users: { [key: string]: UserEntityType };
  venues: { [key: string]: VenueEntityType };
  bookings: { [key: string]: BookingEntityType };
};

const usersAdapter = createEntityAdapter<UserEntityType>();
const venuesAdapter = createEntityAdapter<VenueEntityType>();
const bookingsAdapter = createEntityAdapter<BookingEntityType>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

export const bookingsSlice = createSlice({
  name: "bookings",
  initialState: {
    users: usersAdapter.getInitialState(),
    venues: venuesAdapter.getInitialState(),
    bookings: bookingsAdapter.getInitialState(),
  },
  reducers: {
    updateBookingsAction: (
      state,
      { payload }: PayloadAction<BookingData[]>,
    ) => {
      const normalizedBookings = normalize<BookingEntityType, Entities>(
        payload,
        [bookingEntity],
      );

      const {
        users = {},
        venues = {},
        bookings = {},
      } = normalizedBookings.entities;

      usersAdapter.upsertMany(state.users, users);
      venuesAdapter.upsertMany(state.venues, venues);
      bookingsAdapter.upsertMany(state.bookings, bookings);
    },
  },
});

// action creators
export const { updateBookingsAction } = bookingsSlice.actions;

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
