import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { loadFromLocalStorage } from "../utils/local-storage-utils";
import currentUserReducer, {
  setCurrentUserAction,
} from "./slices/current-user-slice";
import bookingsReducer, { resetBookingsAction } from "./slices/bookings-slice";
import bookingCreationReducer, {
  resetBookingCreationAction,
} from "./slices/booking-creation-slice";
import userCreationReducer, {
  resetUserCreationAction,
} from "./slices/user-creation-slice";
import usersReducer, { resetUsersAction } from "./slices/users-slice";
import userInvitesReducer, {
  resetUserInvitesAction,
} from "./slices/user-invites-slice";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    bookings: bookingsReducer,
    bookingCreation: bookingCreationReducer,
    userCreation: userCreationReducer,
    users: usersReducer,
    userInvites: userInvitesReducer,
  },
  preloadedState: {
    currentUser: loadFromLocalStorage("user"),
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

export const resetReduxState = (dispatch: AppDispatch) => {
  dispatch(resetBookingsAction());
  dispatch(resetBookingCreationAction());
  dispatch(resetUserCreationAction());
  dispatch(resetUsersAction());
  dispatch(resetUserInvitesAction());
  dispatch(setCurrentUserAction(null));
};

export default store;
