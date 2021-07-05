import { createSlice } from "@reduxjs/toolkit";
import { userInvitesAdapter } from "../entities";
import type { RootState } from "../store";

const initialState = userInvitesAdapter.getInitialState();

const userInvitesSlice = createSlice({
  name: "userInvites",
  initialState,
  reducers: {
    resetUserInvitesAction: () => initialState,
    setUserInvitesAction: userInvitesAdapter.setAll,
    updateUserInviteAction: userInvitesAdapter.upsertOne,
    deleteUserInviteAction: userInvitesAdapter.removeOne,
  },
});

// action creators
export const {
  resetUserInvitesAction,
  setUserInvitesAction,
  updateUserInviteAction,
  deleteUserInviteAction,
} = userInvitesSlice.actions;

export const { selectAll: selectUserInvites } = userInvitesAdapter.getSelectors(
  ({ userInvites }: RootState) => userInvites,
);

export default userInvitesSlice.reducer;
