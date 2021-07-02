import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { EMAIL_REGEX, NON_COMMA_SPACE_REGEX } from "../../constants";
import {
  PendingCreationUser,
  Role,
  UserCreationCsvRowData,
  UserCreationFormProps,
  UserCreationStatus,
  userRoles,
} from "../../types/users";
import type { RootState } from "../store";

type UserCreationState = {
  pendingCreationUsers: PendingCreationUser[];
};

const initialState: UserCreationState = {
  pendingCreationUsers: [],
} as UserCreationState;

const parseToPendingCreationUsers = <T>(
  data: T[],
  emailAndRoleGetter: (element: T) => { email: string; role: Role },
  currentPendingCreationUsers: PendingCreationUser[],
) =>
  data.reduce(
    ({ newId, newPendingCreationUsers, existingEmails }, element) => {
      const { email, role } = emailAndRoleGetter(element);
      const user: PendingCreationUser = {
        id: newId,
        email,
        role,
        status: UserCreationStatus.New,
      };

      if (!EMAIL_REGEX.test(user.email)) {
        if (!user.email) {
          user.email = "<empty>";
        }
        user.status = UserCreationStatus.Invalid;
      } else if (existingEmails.has(user.email)) {
        user.status = UserCreationStatus.Duplicate;
      } else {
        existingEmails.add(user.email);
      }

      newPendingCreationUsers.push(user);
      return { newId: newId - 1, newPendingCreationUsers, existingEmails };
    },
    {
      newId: (currentPendingCreationUsers[0]?.id ?? 0) + data.length,
      newPendingCreationUsers: [] as PendingCreationUser[],
      existingEmails: new Set(
        currentPendingCreationUsers.map(({ email }) => email),
      ),
    },
  );

const userCreationSlice = createSlice({
  name: "userCreation",
  initialState,
  reducers: {
    resetUserCreationAction: () => initialState,
    addPendingCreationUsersFromInputData: (
      { pendingCreationUsers },
      { payload: { role, emails } }: PayloadAction<UserCreationFormProps>,
    ) => {
      const words = emails.toLowerCase().match(NON_COMMA_SPACE_REGEX) ?? [];

      const { newPendingCreationUsers } = parseToPendingCreationUsers(
        words,
        (word) => ({ email: word, role }),
        pendingCreationUsers,
      );

      return {
        pendingCreationUsers:
          newPendingCreationUsers.concat(pendingCreationUsers),
      };
    },
    addPendingCreationUsersFromCsvData: (
      { pendingCreationUsers },
      { payload }: PayloadAction<UserCreationCsvRowData[]>,
    ) => {
      const { newPendingCreationUsers } = parseToPendingCreationUsers(
        payload,
        (row) => {
          const email = row[0]?.trim().toLowerCase();
          const roleString = row[1]?.trim().toUpperCase();
          const role = (userRoles as string[]).includes(roleString)
            ? (roleString as Role)
            : Role.Resident;

          return { email, role };
        },
        pendingCreationUsers,
      );

      return {
        pendingCreationUsers:
          newPendingCreationUsers.concat(pendingCreationUsers),
      };
    },
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
