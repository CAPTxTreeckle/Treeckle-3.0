import { createSlice } from "@reduxjs/toolkit";

import { usersAdapter } from "../entities";
import type { RootState } from "../store";

const initialState = usersAdapter.getInitialState();

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsersAction: () => initialState,
    setUsersAction: (state, action) => usersAdapter.setAll(state, action),
    updateUserAction: (state, action) => usersAdapter.upsertOne(state, action),
    deleteUserAction: (state, action) => usersAdapter.removeOne(state, action),
  },
});

// action creators
export const {
  resetUsersAction,
  setUsersAction,
  updateUserAction,
  deleteUserAction,
} = usersSlice.actions;

export const { selectAll: selectUsers } = usersAdapter.getSelectors(
  ({ users }: RootState) => users,
);

export default usersSlice.reducer;
