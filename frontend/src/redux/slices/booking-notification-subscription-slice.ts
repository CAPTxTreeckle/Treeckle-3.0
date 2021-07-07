import { createSlice } from "@reduxjs/toolkit";
import { bookingNotificationSubscriptionsAdapter } from "../entities";
import type { RootState } from "../store";

const initialState = bookingNotificationSubscriptionsAdapter.getInitialState();

const bookingNotificationSubscriptionsSlice = createSlice({
  name: "bookingNotificationSubscriptions",
  initialState,
  reducers: {
    resetBookingNotificationSubscriptionsAction: () => initialState,
    setBookingNotificationSubscriptionsAction:
      bookingNotificationSubscriptionsAdapter.setAll,
    updateBookingNotificationSubscriptionAction:
      bookingNotificationSubscriptionsAdapter.upsertOne,
    deleteBookingNotificationSubscriptionAction:
      bookingNotificationSubscriptionsAdapter.removeOne,
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
