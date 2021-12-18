import { ACCESS, EMAIL, NAME, REFRESH, TOKENS, USER } from "../constants";
import {
  FacebookPayloadPostData,
  GooglePayloadPostData,
  PasswordPayloadPostData,
  SelfData,
} from "./users";

export type AuthenticationData = {
  [USER]: SelfData;
  [TOKENS]: {
    [ACCESS]: string;
    [REFRESH]: string;
  };
};

export type TokenRefreshPostData = {
  [REFRESH]: string;
};

export type CheckAccountPostData = {
  [EMAIL]: string;
};

export type PasswordResetPostData = CheckAccountPostData;

export type LoginDetails = {
  [NAME]?: string;
  [EMAIL]: string;
};

export type GoogleLoginPostData = GooglePayloadPostData;

export type FacebookLoginPostData = FacebookPayloadPostData;

export type PasswordLoginPostData = PasswordPayloadPostData & {
  [NAME]: string;
  [EMAIL]: string;
};
