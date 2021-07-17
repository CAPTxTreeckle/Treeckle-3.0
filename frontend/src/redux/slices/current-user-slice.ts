import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { AuthenticationData } from "../../types/auth";

type CurrentUserState = Partial<AuthenticationData> | null;

const initialState: CurrentUserState = null as CurrentUserState;

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    updateCurrentUserAction: (
      state,
      { payload }: PayloadAction<CurrentUserState | null>,
    ) => (payload === null ? null : { ...state, ...payload }),
  },
});

// action creators
export const { updateCurrentUserAction } = currentUserSlice.actions;

// selectors
export const selectCurrentUser = ({ currentUser }: RootState) => currentUser;
export const selectIsLoggedIn = createSelector(
  selectCurrentUser,
  (currentUser) => Boolean(currentUser?.tokens && currentUser?.user),
);
export const selectCurrentUserTokens = createSelector(
  selectCurrentUser,
  (currentUser) => currentUser?.tokens,
);
export const selectCurrentUserDisplayInfo = createSelector(
  selectCurrentUser,
  (currentUser) => {
    return currentUser?.user;
  },
);

export default currentUserSlice.reducer;
