import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { CurrentUser } from "../../types/users";

type CurrentUserState = CurrentUser | null;

const initialState: CurrentUserState = null as CurrentUserState;

export const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    setCurrentUserAction: (_, { payload }: PayloadAction<CurrentUser | null>) =>
      payload,
  },
});

// action creators
export const { setCurrentUserAction } = currentUserSlice.actions;

// selectors
export const selectCurrentUser = ({ currentUser }: RootState) => currentUser;
export const selectIsLoggedIn = createSelector(
  selectCurrentUser,
  (currentUser) => Boolean(currentUser?.access),
);
export const selectCurrentUserDisplayInfo = createSelector(
  selectCurrentUser,
  (currentUser) => {
    const { access, refresh, ...displayInfo } = { ...currentUser };
    return displayInfo;
  },
);

export default currentUserSlice.reducer;
