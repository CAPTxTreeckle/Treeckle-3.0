import { LabelProps } from "semantic-ui-react";
import {
  ACTION,
  ACTIONS,
  BOOKER,
  BOOKING_ID,
  BOOKING_FORM_RESPONSES,
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
  NAME,
  EMAIL,
} from "../constants";
import { BaseData } from "./base";
import { UserData } from "./users";
import { BookingFormFieldProps, VenueData } from "./venues";

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
  [FORM_RESPONSE_DATA]: BookingFormResponse[];
};

export type DateTimeRange = {
  [START_DATE_TIME]: number;
  [END_DATE_TIME]: number;
};

export type BookingData = BaseData & {
  [TITLE]: string;
  [BOOKER]: UserData;
  [VENUE]: VenueData;
  [START_DATE_TIME]: number;
  [END_DATE_TIME]: number;
  [STATUS]: BookingStatus;
  [FORM_RESPONSE_DATA]: BookingFormResponse[];
};

export type BookingFormResponse = BookingFormFieldProps & {
  [RESPONSE]: string | boolean;
};

export type BookingFormProps = {
  [TITLE]: string;
  [BOOKING_FORM_RESPONSES]?: BookingFormResponse[];
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

export const BOOKING_STATUS_DETAILS = new Map<
  BookingStatus,
  { color: LabelProps["color"] }
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

export enum BookingCreationStep {
  Category = 0,
  Venue,
  TimeSlot,
  Form,
  Finalize,
  __length,
}

export type BookingNotificationSubscriptionData = {
  [NAME]: string;
  [EMAIL]: string;
  [VENUE]: VenueData;
};

export type BookingNotificationSubscriptionPostData = {
  [NAME]: string;
  [EMAIL]: string;
  [VENUE_ID]: number | string;
};
