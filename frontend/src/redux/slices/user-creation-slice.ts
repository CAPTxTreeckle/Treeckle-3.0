import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import {
  PendingCreationUser,
  UserCreationCsvRowData,
  UserCreationFormProps,
} from "../../types/users";
import type { RootState } from "../store";

type UserCreationState = {
  pendingCreationUsers: PendingCreationUser[];
};

const initialState: UserCreationState = {
  pendingCreationUsers: [],
} as UserCreationState;

const userCreationSlice = createSlice({
  name: "userCreation",
  initialState,
  reducers: {
    resetUserCreationAction: () => initialState,
    addPendingCreationUsersFromInputData: (
      state,
      { payload }: PayloadAction<UserCreationFormProps>,
    ) => {},
    addPendingCreationUsersFromCsvData: (
      state,
      { payload }: PayloadAction<UserCreationCsvRowData[]>,
    ) => {},
  },
});

// action creators
export const {
  resetUserCreationAction,
  addPendingCreationUsersFromInputData,
  addPendingCreationUsersFromCsvData,
} = userCreationSlice.actions;

// selectors
const selectUserCreation = ({ userCreation }: RootState) => userCreation;
export const selectPendingCreationUsers = createSelector(
  selectUserCreation,
  ({ pendingCreationUsers }) => pendingCreationUsers,
);

export default userCreationSlice.reducer;
