import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { AppThunk, RootState } from "../store";
import { selectPendingBookings } from "./bookings-slice";

type PendingBookingCountState = {
  count: number;
  loading: boolean;
};

const initialState: PendingBookingCountState = {
  count: 0,
  loading: false,
} as PendingBookingCountState;

const pendingBookingCountSlice = createSlice({
  name: "pendingBookingCount",
  initialState,
  reducers: {
    resetPendingBookingCountAction: () => initialState,
    setPendingBookingCountAction: (
      state,
      {
        payload: { count, loading },
      }: PayloadAction<Partial<PendingBookingCountState>>,
    ) => {
      if (count !== undefined) {
        state.count = count;
      }

      if (loading !== undefined) {
        state.loading = loading;
      }
    },
  },
});

// action creators
export const { resetPendingBookingCountAction, setPendingBookingCountAction } =
  pendingBookingCountSlice.actions;

// thunks
export const refreshPendingBookingCountThunk =
  (): AppThunk => (dispatch, getState) => {
    const count = selectPendingBookings(getState()).length;
    dispatch(setPendingBookingCountAction({ count }));
  };

// selectors
export const selectPendingBookingCount = ({ pendingBookingCount }: RootState) =>
  pendingBookingCount;

export default pendingBookingCountSlice.reducer;
