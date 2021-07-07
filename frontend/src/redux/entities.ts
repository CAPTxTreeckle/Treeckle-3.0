import { schema } from "normalizr";
import { createEntityAdapter } from "@reduxjs/toolkit";
import { UserData, UserInviteData } from "../types/users";
import { BookingData } from "../types/bookings";
import { VENUE, BOOKER } from "../constants";
import {
  BookingNotificationSubscriptionData,
  VenueData,
} from "../types/venues";

export type BookingNotificationSubscriptionEntityType =
  BookingNotificationSubscriptionData;

export type UserInviteEntityType = UserInviteData;

export type UserEntityType = UserData;

export type VenueEntityType = VenueData;

export type BookingEntityType = Omit<
  BookingData,
  typeof VENUE | typeof BOOKER
> & {
  [VENUE]: number;
  [BOOKER]: number;
};

// Define normalizr entity schemas
export const bookingNotificationSubscriptionEntity =
  new schema.Entity<BookingNotificationSubscriptionEntityType>(
    "bookingNotificationSubscription",
  );
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
export const bookingNotificationSubscriptionsAdapter =
  createEntityAdapter<BookingNotificationSubscriptionEntityType>({
    sortComparer: (a, b) => b.createdAt - a.createdAt,
  });
export const userInvitesAdapter = createEntityAdapter<UserInviteEntityType>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});
export const usersAdapter = createEntityAdapter<UserEntityType>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});
export const venuesAdapter = createEntityAdapter<VenueEntityType>();
export const bookingsAdapter = createEntityAdapter<BookingEntityType>({
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});
