import { schema } from "normalizr";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { UserData, UserInviteData } from "../types/users";
import { BookingData } from "../types/bookings";
import { VENUE, BOOKER } from "../constants";

export type UserInviteEntityType = UserInviteData;

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
export const userInviteEntity = new schema.Entity<UserInviteEntityType>(
  "userInvites",
);
export const userEntity = new schema.Entity<UserEntityType>("users");
export const venueEntity = new schema.Entity<VenueEntityType>("venues");
export const bookingEntity = new schema.Entity<BookingEntityType>("bookings", {
  booker: userEntity,
  venue: venueEntity,
});

// Adapters
export const userInvitesAdapter = createEntityAdapter<UserInviteEntityType>();
export const usersAdapter = createEntityAdapter<UserEntityType>();
export const venuesAdapter = createEntityAdapter<VenueEntityType>();
export const bookingsAdapter = createEntityAdapter<BookingEntityType>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});
