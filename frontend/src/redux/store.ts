import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import { loadFromLocalStorage } from "../utils/local-storage-utils";
import bookingCreationReducer, {
  resetBookingCreationAction,
} from "./slices/booking-creation-slice";
import bookingNotificiationSubscriptionReducer, {
  resetBookingNotificationSubscriptionsAction,
} from "./slices/booking-notification-subscription-slice";
import bookingsReducer, { resetBookingsAction } from "./slices/bookings-slice";
import currentUserReducer, {
  updateCurrentUserAction,
} from "./slices/current-user-slice";
import pendingBookingCountReducer, {
  resetPendingBookingCountAction,
} from "./slices/pending-booking-count-slice";
import userCreationReducer, {
  resetUserCreationAction,
} from "./slices/user-creation-slice";
import userInvitesReducer, {
  resetUserInvitesAction,
} from "./slices/user-invites-slice";
import usersReducer, { resetUsersAction } from "./slices/users-slice";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    bookings: bookingsReducer,
    bookingCreation: bookingCreationReducer,
    userCreation: userCreationReducer,
    users: usersReducer,
    userInvites: userInvitesReducer,
    bookingNotificiationSubscriptions: bookingNotificiationSubscriptionReducer,
    pendingBookingCount: pendingBookingCountReducer,
  },
  preloadedState: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    currentUser: loadFromLocalStorage("user"),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    bookingCreation: loadFromLocalStorage("bookingCreation"),
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const resetAppState = () => {
  store.dispatch(resetBookingsAction());
  store.dispatch(resetBookingCreationAction());
  store.dispatch(resetUserCreationAction());
  store.dispatch(resetUsersAction());
  store.dispatch(resetUserInvitesAction());
  store.dispatch(resetBookingNotificationSubscriptionsAction());
  store.dispatch(resetPendingBookingCountAction());
  store.dispatch(updateCurrentUserAction(null));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  window.FB?.getLoginStatus(({ status }: fb.StatusResponse) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    status === "connected" && window.FB?.logout();
  });
};

export default store;
