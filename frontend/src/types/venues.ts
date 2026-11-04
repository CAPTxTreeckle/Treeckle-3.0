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
  IC_TELEGRAM_HANDLE,
  LABEL,
  NAME,
  ORGANIZATION,
  PLACEHOLDER,
  REQUIRED,
  SHORT_NOTICE_DAYS,
  SHORT_NOTICE_ENABLED,
  SHORT_NOTICE_MESSAGE,
  SHORT_NOTICE_TITLE,
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
  [IC_TELEGRAM_HANDLE]: string;
  [FORM_FIELD_DATA]: BookingFormFieldProps[];
} & ShortNoticeWarningProps;

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

export type ShortNoticeWarningProps = {
  [SHORT_NOTICE_ENABLED]: boolean;
  [SHORT_NOTICE_DAYS]: number;
  [SHORT_NOTICE_TITLE]: string;
  [SHORT_NOTICE_MESSAGE]: string;
};

export type VenueFormProps = {
  [NAME]: string;
  [CATEGORY]: string;
  [CAPACITY]: string;
  [IC_NAME]: string;
  [IC_EMAIL]: string;
  [IC_CONTACT_NUMBER]: string;
  [IC_TELEGRAM_HANDLE]: string;
  [BOOKING_FORM_FIELDS]?: BookingFormFieldProps[];
} & ShortNoticeWarningProps;

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
