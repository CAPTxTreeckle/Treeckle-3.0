import { StrictLabelProps } from "semantic-ui-react";
import {
  ACTION,
  ACTIONS,
  BOOKER,
  BOOKING_ID,
  CUSTOM_VENUE_BOOKING_FORM_RESPONSES,
  DATE_TIME_RANGES,
  END_DATE_TIME,
  RESPONSE,
  FORM_RESPONSE_DATA,
  START_DATE_TIME,
  STATUS,
  TITLE,
  VENUE_ID,
  VENUE_NAME,
  IDS,
  USER_ID,
  VENUE,
  ID,
  NAME,
} from "../constants";
import { BaseData } from "./base";
import { UserData } from "./users";
import { CustomVenueBookingFormFieldProps } from "./venues";

export type CustomVenueBookingFormData = CustomVenueBookingFormFieldProps &
  CustomVenueBookingFormResponseProps;

export type BookingGetQueryParams = {
  [USER_ID]?: number | string | null;
  [VENUE_NAME]?: string | null;
  [START_DATE_TIME]?: number | string | null;
  [END_DATE_TIME]?: number | string | null;
  [STATUS]?: BookingStatus | null;
};

export type BookingPostData = {
  [TITLE]: string;
  [VENUE_ID]: number;
  [DATE_TIME_RANGES]: DateTimeRange[];
  [FORM_RESPONSE_DATA]: CustomVenueBookingFormData[];
};

export type DateTimeRange = {
  [START_DATE_TIME]: number;
  [END_DATE_TIME]: number;
};

export type BookingData = BaseData & {
  [TITLE]: string;
  [BOOKER]: UserData;
  [VENUE]: { [ID]: number; [NAME]: string };
  [START_DATE_TIME]: number;
  [END_DATE_TIME]: number;
  [STATUS]: BookingStatus;
  [FORM_RESPONSE_DATA]: CustomVenueBookingFormData[];
};

export type CustomVenueBookingFormResponseProps = {
  [RESPONSE]: string | boolean;
};

export type BookingPatchData = {
  [ACTIONS]: BookingStatusAction[];
};

export type BookingDeleteData = {
  [IDS]: number[];
};

export type BookingStatusAction = {
  [BOOKING_ID]: number;
  [ACTION]: BookingStatusActionType;
};

export enum BookingStatusActionType {
  Revoke = "REVOKE",
  Approve = "APPROVE",
  Reject = "REJECT",
  Cancel = "CANCEL",
}

export enum BookingStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Rejected = "REJECTED",
  Cancelled = "CANCELLED",
}

export const BookingStatusDetails = new Map<
  BookingStatus,
  { color: StrictLabelProps["color"] }
>([
  [
    BookingStatus.Approved,
    {
      color: "green",
    },
  ],
  [BookingStatus.Cancelled, { color: "grey" }],
  [BookingStatus.Pending, { color: "orange" }],
  [
    BookingStatus.Rejected,
    {
      color: "red",
    },
  ],
]);

export type BookingFormProps = {
  [TITLE]: string;
  [CUSTOM_VENUE_BOOKING_FORM_RESPONSES]?: CustomVenueBookingFormResponseProps[];
};
