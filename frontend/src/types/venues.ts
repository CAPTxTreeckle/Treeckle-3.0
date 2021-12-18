import {
  BOOKING_FORM_FIELDS,
  CAPACITY,
  CATEGORY,
  EMAIL,
  FORM_FIELD_DATA,
  FULL_DETAILS,
  IC_CONTACT_NUMBER,
  IC_EMAIL,
  IC_NAME,
  LABEL,
  NAME,
  ORGANIZATION,
  PLACEHOLDER,
  REQUIRED,
  TYPE,
  VENUE,
} from "../constants";
import { BaseData } from "./base";

export type VenueGetQueryParams = {
  [CATEGORY]?: string | null;
  [FULL_DETAILS]?: boolean | string | number | null;
};

export type VenuePostData = {
  [NAME]: string;
  [CATEGORY]: string;
  [CAPACITY]: string | null;
  [IC_NAME]: string;
  [IC_EMAIL]: string;
  [IC_CONTACT_NUMBER]: string;
  [FORM_FIELD_DATA]: BookingFormFieldProps[];
};

export type VenuePutData = VenuePostData;

export type VenueData = BaseData &
  Partial<Omit<VenuePostData, "name">> & {
    [NAME]: string;
    [ORGANIZATION]?: string;
  };

export enum FieldType {
  Text = "TEXT",
  TextArea = "TEXT_AREA",
  Number = "NUMBER",
  Boolean = "BOOLEAN",
  TextDisplay = "TEXT_DISPLAY",
}

export type BookingFormFieldProps = {
  [TYPE]: FieldType;
  [LABEL]: string;
  [PLACEHOLDER]: string;
  [REQUIRED]: boolean;
};

export type VenueFormProps = {
  [NAME]: string;
  [CATEGORY]: string;
  [CAPACITY]: string;
  [IC_NAME]: string;
  [IC_EMAIL]: string;
  [IC_CONTACT_NUMBER]: string;
  [BOOKING_FORM_FIELDS]?: BookingFormFieldProps[];
};

export type VenueViewProps = BaseData & {
  [ORGANIZATION]: string;
  venueFormProps: VenueFormProps;
};

export type BookingNotificationSubscriptionData = BaseData & {
  [NAME]: string;
  [EMAIL]: string;
  [VENUE]: VenueData;
};

export type BookingNotificationSubscriptionPostData = {
  [NAME]: string;
  [EMAIL]: string;
};
