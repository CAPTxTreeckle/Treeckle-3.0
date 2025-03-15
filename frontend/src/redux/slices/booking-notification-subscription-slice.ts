import { createSlice } from "@reduxjs/toolkit";

import { bookingNotificationSubscriptionsAdapter } from "../entities";
import type { RootState } from "../store";

const initialState = bookingNotificationSubscriptionsAdapter.getInitialState();

const bookingNotificationSubscriptionsSlice = createSlice({
  name: "bookingNotificationSubscriptions",
  initialState,
  reducers: {
    resetBookingNotificationSubscriptionsAction: () => initialState,
    setBookingNotificationSubscriptionsAction: (state, action) =>
      bookingNotificationSubscriptionsAdapter.setAll(state, action),
    updateBookingNotificationSubscriptionAction: (state, action) =>
      bookingNotificationSubscriptionsAdapter.upsertOne(state, action),
    deleteBookingNotificationSubscriptionAction: (state, action) =>
      bookingNotificationSubscriptionsAdapter.removeOne(state, action),
  },
});

// action creators
export const {
  resetBookingNotificationSubscriptionsAction,
  setBookingNotificationSubscriptionsAction,
  updateBookingNotificationSubscriptionAction,
  deleteBookingNotificationSubscriptionAction,
} = bookingNotificationSubscriptionsSlice.actions;

export const { selectAll: selectBookingNotificationSubscriptions } =
  bookingNotificationSubscriptionsAdapter.getSelectors(
    ({ bookingNotificiationSubscriptions }: RootState) =>
      bookingNotificiationSubscriptions,
  );

export default bookingNotificationSubscriptionsSlice.reducer;
