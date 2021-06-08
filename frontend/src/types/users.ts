import {
  ACCESS,
  EMAIL,
  ID,
  NAME,
  ORGANIZATION,
  PROFILE_IMAGE,
  REFRESH,
  ROLE,
  STATUS,
  UUID,
} from "../constants";
import { BaseData } from "./base";

export enum Role {
  Admin = "ADMIN",
  Organizer = "ORGANIZER",
  Resident = "RESIDENT",
}

export const userRoles = Object.values(Role);

export type UserInviteData = BaseData & {
  [EMAIL]: string;
  [ROLE]: Role;
  [ORGANIZATION]: string;
};

export type UserData = UserInviteData & {
  [NAME]: string;
};

export type CurrentUser = {
  [ID]: number;
  [NAME]: string;
  [EMAIL]: string;
  [ROLE]: Role;
  [ORGANIZATION]: string;
  [ACCESS]: string;
  [REFRESH]: string;
  [PROFILE_IMAGE]: string | null;
};

export type UserInvitePostData = {
  [EMAIL]: string;
  [ROLE]: Role;
};

export type UserInvitePatchData = {
  [ID]: number;
  [ROLE]?: Role;
};

export type UserPatchData = {
  [ID]: number;
  [NAME]?: string;
  [EMAIL]?: string;
  [ROLE]?: Role;
};

export enum UserCreationStatus {
  New = "NEW",
  Created = "CREATED",
  Duplicate = "DUPLICATE",
  Invalid = "INVALID",
}

export const userCreationStatuses = Object.values(UserCreationStatus);

export const UserCreationStatusDetails = new Map<
  UserCreationStatus,
  { description: string; classType: string }
>([
  [
    UserCreationStatus.New,
    {
      description:
        "Newly added user entry which has yet to be submitted for creation.",
      classType: "",
    },
  ],
  [
    UserCreationStatus.Created,
    { description: "Newly created user.", classType: "positive" },
  ],
  [
    UserCreationStatus.Duplicate,
    { description: "Duplicate user emails found.", classType: "warning" },
  ],
  [
    UserCreationStatus.Invalid,
    {
      description:
        "User has invalid details or user already exists in the system.",
      classType: "negative",
    },
  ],
]);

export type PendingCreationUser = {
  [UUID]: string;
  [EMAIL]: string;
  [ROLE]: Role;
  [STATUS]: UserCreationStatus;
};
