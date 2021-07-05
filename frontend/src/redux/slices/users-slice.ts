import { createSlice } from "@reduxjs/toolkit";
import { usersAdapter } from "../entities";
import type { RootState } from "../store";

const initialState = usersAdapter.getInitialState();

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    resetUsersAction: () => initialState,
    setUsersAction: usersAdapter.setAll,
    updateUserAction: usersAdapter.upsertOne,
    deleteUserAction: usersAdapter.removeOne,
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
