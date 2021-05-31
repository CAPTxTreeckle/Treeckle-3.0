import { ACCESS, EMAIL, ID, NAME, PROFILE_IMAGE, REFRESH } from "../constants";
import { BaseData } from "./base";

export type UserData = BaseData & {
  [NAME]: string;
  [EMAIL]: string;
  [PROFILE_IMAGE]: string;
};

export type User = {
  [ID]: number;
  [NAME]: string;
  [EMAIL]: string;
  [PROFILE_IMAGE]: string;
  [ACCESS]: string;
  [REFRESH]: string;
};
