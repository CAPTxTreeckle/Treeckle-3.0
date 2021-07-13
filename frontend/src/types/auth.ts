import { UserData } from "./users";
import { ACCESS, EMAIL, NAME, PASSWORD, REFRESH, TOKEN_ID } from "../constants";

export type AuthenticationData = UserData & {
  [ACCESS]: string;
  [REFRESH]: string;
};

export type GoogleLoginPostData = {
  [TOKEN_ID]: string;
};

export type CheckAccountPostData = {
  [EMAIL]: string;
};

export type LoginDetails = {
  [NAME]?: string;
  [EMAIL]: string;
};

export type PasswordLoginPostData = {
  [NAME]: string;
  [EMAIL]: string;
  [PASSWORD]: string;
};
