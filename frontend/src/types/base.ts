import { ID, CREATED_AT, UPDATED_AT } from "../constants";

export type BaseData = {
  [ID]: number;
  [CREATED_AT]: number;
  [UPDATED_AT]: number;
};
