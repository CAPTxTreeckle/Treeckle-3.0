import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import { loadFromLocalStorage } from "../utils/local-storage-utils";
import currentUserReducer from "./slices/current-user-slice";
import bookingsReducer from "./slices/bookings-slice";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    bookings: bookingsReducer,
  },
  preloadedState: { currentUser: loadFromLocalStorage("user") },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
