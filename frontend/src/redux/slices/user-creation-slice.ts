import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import { EMAIL_REGEX, NON_COMMA_SPACE_REGEX } from "../../constants";
import {
  PendingCreationUser,
  Role,
  UserCreationCsvRowData,
  UserCreationFormProps,
  UserCreationStatus,
  UserInviteData,
  userRoles,
} from "../../types/users";
import type { RootState } from "../store";

type UserCreationState = {
  pendingCreationUsers: PendingCreationUser[];
  unsuccessfullyCreatedUsers: PendingCreationUser[];
};

const initialState: UserCreationState = {
  pendingCreationUsers: [],
  unsuccessfullyCreatedUsers: [],
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
    resetUnsuccessfullyCreatedUsers: (state) => {
      state.unsuccessfullyCreatedUsers =
        initialState.unsuccessfullyCreatedUsers;
    },
    addPendingCreationUsersFromInputDataAction: (
      state,
      { payload: { role, emails } }: PayloadAction<UserCreationFormProps>,
    ) => {
      const words = emails.toLowerCase().match(NON_COMMA_SPACE_REGEX) ?? [];

      const { newPendingCreationUsers } = parseToPendingCreationUsers(
        words,
        (word) => ({ email: word, role }),
        state.pendingCreationUsers,
      );

      state.pendingCreationUsers = newPendingCreationUsers.concat(
        state.pendingCreationUsers,
      );
    },
    addPendingCreationUsersFromCsvDataAction: (
      state,
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
        state.pendingCreationUsers,
      );

      state.pendingCreationUsers = newPendingCreationUsers.concat(
        state.pendingCreationUsers,
      );
    },
    removePendingCreationUserAction: (
      state,
      { payload }: PayloadAction<number>,
    ) => {
      const userToBeRemoved = state.pendingCreationUsers.find(
        ({ id }) => id === payload,
      );

      if (!userToBeRemoved) {
        return;
      }

      const updatedPendingCreationUsers = state.pendingCreationUsers.filter(
        (user) => user !== userToBeRemoved,
      );

      // change a duplicate entry (if exists) to New status
      [...updatedPendingCreationUsers].reverse().some((user) => {
        if (user.email === userToBeRemoved.email) {
          if (user.status === UserCreationStatus.Duplicate) {
            user.status = UserCreationStatus.New;
          }
          // will break the array iteration
          return true;
        }
        // array iteration continues
        return false;
      });

      state.pendingCreationUsers = updatedPendingCreationUsers;
    },
    updateNewPendingCreationUsersToCreatedAction: (
      state,
      { payload }: PayloadAction<UserInviteData[]>,
    ) => {
      const createdEmails = new Set(payload.map(({ email }) => email));

      state.pendingCreationUsers = state.pendingCreationUsers.map((user) =>
        user.status === UserCreationStatus.New && createdEmails.has(user.email)
          ? { ...user, status: UserCreationStatus.Created }
          : user,
      );
    },
    updateUnsuccessfullyCreatedUsersAction: (state) =>
      state.pendingCreationUsers.reduce(
        ({ unsuccessfullyCreatedUsers, pendingCreationUsers }, user) => {
          if (user.status !== UserCreationStatus.New) {
            pendingCreationUsers.push(user);
          } else {
            const invalidUser = {
              ...user,
              status: UserCreationStatus.Invalid,
            };

            unsuccessfullyCreatedUsers.push(invalidUser);
            pendingCreationUsers.push(invalidUser);
          }

          return { unsuccessfullyCreatedUsers, pendingCreationUsers };
        },
        {
          unsuccessfullyCreatedUsers: [] as PendingCreationUser[],
          pendingCreationUsers: [] as PendingCreationUser[],
        },
      ),
  },
});

// action creators
export const {
  resetUserCreationAction,
  resetUnsuccessfullyCreatedUsers,
  addPendingCreationUsersFromInputDataAction,
  addPendingCreationUsersFromCsvDataAction,
  removePendingCreationUserAction,
  updateNewPendingCreationUsersToCreatedAction,
  updateUnsuccessfullyCreatedUsersAction,
} = userCreationSlice.actions;

// selectors
const selectUserCreation = ({ userCreation }: RootState) => userCreation;
export const selectPendingCreationUsers = createSelector(
  selectUserCreation,
  ({ pendingCreationUsers }) => pendingCreationUsers,
);
export const selectUnsuccessfullyCreatedUsers = createSelector(
  selectUserCreation,
  ({ unsuccessfullyCreatedUsers }) => unsuccessfullyCreatedUsers,
);

export default userCreationSlice.reducer;
