import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { CurrentUser } from "../../types/users";

type CurrentUserState = CurrentUser | null;

export const userSlice = createSlice({
  name: "user",
  initialState: null as CurrentUserState,
  reducers: {
    updateCurrentUser: (_, { payload }: PayloadAction<CurrentUser | null>) =>
      payload,
  },
});

export const { updateCurrentUser } = userSlice.actions;

export const getCurrentUserRole = ({ currentUser }: RootState) =>
  currentUser?.role;
export const getIsLoggedIn = ({ currentUser }: RootState) =>
  Boolean(currentUser?.access);
export const getCurrentUser = ({ currentUser }: RootState) => currentUser;

export default userSlice.reducer;
