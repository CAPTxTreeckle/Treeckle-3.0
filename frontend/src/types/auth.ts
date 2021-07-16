import {
  SelfData,
  GooglePayloadPostData,
  FacebookPayloadPostData,
  PasswordPayloadPostData,
} from "./users";
import { ACCESS, EMAIL, NAME, REFRESH, TOKENS, USER } from "../constants";

export type AuthenticationData = {
  [USER]: SelfData;
  [TOKENS]: {
    [ACCESS]: string;
    [REFRESH]: string;
  };
};

export type CheckAccountPostData = {
  [EMAIL]: string;
};

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
