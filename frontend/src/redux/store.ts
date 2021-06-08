import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import currentUserReducer from "./slices/current-user-slice";

const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
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

export default store;
