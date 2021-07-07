import { COMMENTER, CONTENT, IS_ACTIVE } from "../constants";
import { BaseData } from "./base";
import { UserData } from "./users";

export type CommentData = BaseData & {
  [COMMENTER]: UserData;
  [CONTENT]: string;
  [IS_ACTIVE]: boolean;
};
