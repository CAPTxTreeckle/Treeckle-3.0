import { UserData } from "./users";
import { ACCESS, REFRESH } from "../constants";

export type AuthenticationData = UserData & {
  [ACCESS]: string;
  [REFRESH]: string;
};
