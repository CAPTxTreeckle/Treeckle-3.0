import { BaseData } from "./base";
import {
  CATEGORY,
  FIELD_LABEL,
  FIELD_TYPE,
  PLACEHOLDER_TEXT,
  CAPACITY,
  REQUIRED_FIELD,
  CUSTOM_VENUE_BOOKING_FORM_FIELDS,
  IC_CONTACT_NUMBER,
  IC_EMAIL,
  IC_NAME,
  NAME,
  FORM_FIELD_DATA,
} from "../constants";

export type VenueGetQueryParams = { [CATEGORY]?: string | null };

export type VenuePostData = {
  [NAME]: string;
  [CATEGORY]: string;
  [CAPACITY]: string | null;
  [IC_NAME]: string;
  [IC_EMAIL]: string;
  [IC_CONTACT_NUMBER]: string;
  [FORM_FIELD_DATA]: CustomVenueBookingFormFieldProps[];
};

export type VenuePutData = VenuePostData;

export type VenueData = BaseData & VenuePostData;

export enum FieldType {
  Text = "TEXT",
  TextArea = "TEXT_AREA",
  Number = "NUMBER",
  Boolean = "BOOLEAN",
}

export type CustomVenueBookingFormFieldProps = {
  [FIELD_TYPE]: FieldType;
  [FIELD_LABEL]: string;
  [PLACEHOLDER_TEXT]: string;
  [REQUIRED_FIELD]: boolean;
};

export type VenueFormProps = {
  [NAME]: string;
  [CATEGORY]: string;
  [CAPACITY]: string;
  [IC_NAME]: string;
  [IC_EMAIL]: string;
  [IC_CONTACT_NUMBER]: string;
  [CUSTOM_VENUE_BOOKING_FORM_FIELDS]?: CustomVenueBookingFormFieldProps[];
};

export type VenueViewProps = BaseData & {
  venueFormProps: VenueFormProps;
};
