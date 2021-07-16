import {
  ACCESS_TOKEN,
  ACTION,
  EMAIL,
  EMAILS,
  HAS_FACEBOOK_AUTH,
  HAS_GOOGLE_AUTH,
  HAS_PASSWORD_AUTH,
  ID,
  IS_SELF,
  NAME,
  ORGANIZATION,
  PASSWORD,
  PAYLOAD,
  PROFILE_IMAGE,
  ROLE,
  STATUS,
  TOKEN_ID,
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
  [PROFILE_IMAGE]: string;
  [IS_SELF]?: boolean;
};

export type SelfData = UserData & {
  [HAS_PASSWORD_AUTH]: boolean;
  [HAS_GOOGLE_AUTH]: boolean;
  [HAS_FACEBOOK_AUTH]: boolean;
};

export enum SelfPatchAction {
  Password = "PASSWORD",
  Google = "GOOGLE",
  Facebook = "FACEBOOK",
}

export type GooglePayloadPostData = {
  [TOKEN_ID]: string;
} | null;

export type FacebookPayloadPostData = {
  [ACCESS_TOKEN]: string;
} | null;

export type PasswordPayloadPostData = {
  [PASSWORD]: string;
};

export type SelfPatchData =
  | {
      [ACTION]: SelfPatchAction.Password;
      [PAYLOAD]: PasswordPayloadPostData;
    }
  | {
      [ACTION]: SelfPatchAction.Google;
      [PAYLOAD]: GooglePayloadPostData;
    }
  | {
      [ACTION]: SelfPatchAction.Facebook;
      [PAYLOAD]: FacebookPayloadPostData;
    };

export type UserInvitePostData = {
  [EMAIL]: string;
  [ROLE]: Role;
};

export type UserInvitePatchData = {
  [ROLE]: Role;
};

export type UserPatchData = {
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

export const USER_CREATION_STATUS_DETAILS = new Map<
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
  [ID]: number;
  [EMAIL]: string;
  [ROLE]: Role;
  [STATUS]: UserCreationStatus;
};

export type UserCreationFormProps = {
  [ROLE]: Role.Resident;
  [EMAILS]: string;
};

export type UserCreationCsvRowData = [string, string];
