import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AuthenticationData } from "../../types/auth";

type CurrentUserState = Partial<AuthenticationData> | null;

const initialState: CurrentUserState = null as CurrentUserState;

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    setCurrentUserAction: (
      state,
      { payload }: PayloadAction<CurrentUserState | null>,
    ) => (payload === null ? null : { ...state, ...payload }),
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
export const selectCurrentUserId = createSelector(
  selectCurrentUser,
  (currentUser) => currentUser?.id,
);
export const selectCurrentUserDisplayInfo = createSelector(
  selectCurrentUser,
  (currentUser) => {
    const { access, refresh, ...displayInfo } = { ...currentUser };
    return displayInfo;
  },
);

export default currentUserSlice.reducer;
