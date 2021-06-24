import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { loadFromLocalStorage } from "../utils/local-storage-utils";
import currentUserReducer, {
  setCurrentUserAction,
} from "./slices/current-user-slice";
import bookingsReducer, { resetBookingsAction } from "./slices/bookings-slice";
import bookingCreationReducer, {
  resetBookingCreationAction,
} from "./slices/booking-creation-slice";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    bookings: bookingsReducer,
    bookingCreation: bookingCreationReducer,
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
  dispatch(setCurrentUserAction(null));
};

export default store;
