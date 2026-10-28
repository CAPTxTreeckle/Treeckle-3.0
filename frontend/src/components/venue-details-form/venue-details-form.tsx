import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useModal } from "react-modal-hook";
import { Button, ButtonProps, Form, Header, Segment } from "semantic-ui-react";
import * as yup from "yup";

import {
  BOOKING_FORM_FIELDS,
  CAPACITY,
  CATEGORY,
  IC_CONTACT_NUMBER,
  IC_EMAIL,
  IC_NAME,
  LABEL,
  NAME,
  PHONE_NUM_REGEX,
  PLACEHOLDER,
  REQUIRED,
  SHORT_NOTICE_DAYS,
  SHORT_NOTICE_ENABLED,
  SHORT_NOTICE_MESSAGE,
  SHORT_NOTICE_TITLE,
  TYPE,
} from "../../constants";
import {
  DEFAULT_SHORT_NOTICE_WARNING,
  useGetVenueCategories,
} from "../../custom-hooks/api/venues-api";
import { FieldType, VenueFormProps } from "../../types/venues";
import { deepTrim, sort } from "../../utils/transform-utils";
import BookingCreationShortNoticeWarning from "../booking-creation-short-notice-warning";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import FormField from "../form-field";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import RadioFormField from "../radio-form-field";
import TextAreaFormField from "../text-area-form-field";
import VenueDetailsCustomFormFieldsSection from "../venue-details-custom-form-fields-section";

// matches the max_length of Venue.short_notice_title in the backend
const SHORT_NOTICE_TITLE_MAX_LENGTH = 255;

const SCHEMA = yup.object().shape({
  [NAME]: yup.string().trim().required("Please enter a venue name"),
  [CATEGORY]: yup
    .string()
    .trim()
    .required("Please select an existing category or add a new one"),
  [CAPACITY]: yup
    .number()
    .positive("Capacity must be a positive number")
    .integer("Capacity must be an integer")
    .transform(
      (value, originalValue) =>
        (typeof originalValue === "string" && originalValue === ""
          ? null
          : value) as number | null,
    )
    .nullable(),
  [IC_NAME]: yup.string().trim().notRequired(),
  [IC_EMAIL]: yup
    .string()
    .trim()
    .email("Input must be a valid email")
    .notRequired(),
  [IC_CONTACT_NUMBER]: yup
    .string()
    .trim()
    .matches(PHONE_NUM_REGEX, "Input must be a valid phone number")
    .notRequired(),
  [BOOKING_FORM_FIELDS]: yup
    .array(
      yup
        .object()
        .shape({
          [TYPE]: yup
            .mixed<FieldType>()
            .oneOf(Object.values(FieldType))
            .required("Please choose a field type"),
          [LABEL]: yup
            .string()
            .trim()
            .required("Please enter a label / question"),
          [PLACEHOLDER]: yup.string().trim().notRequired(),
          [REQUIRED]: yup.boolean().required("An error has occurred"),
        })
        .required(),
    )
    .notRequired(),
  [SHORT_NOTICE_ENABLED]: yup.boolean().required(),
  // the short notice fields are hidden when the warning is disabled, so they are only validated when enabled
  [SHORT_NOTICE_DAYS]: yup
    .number()
    .transform(
      (value, originalValue) =>
        (originalValue === "" ? undefined : value) as number | undefined,
    )
    .when(SHORT_NOTICE_ENABLED, {
      is: true,
      then: yup
        .number()
        .typeError("Please enter a number of days")
        .integer("Number of days must be a whole number")
        .min(1, "Number of days must be at least 1")
        .max(365, "Number of days must be at most 365")
        .required("Please enter a number of days"),
    }),
  [SHORT_NOTICE_TITLE]: yup
    .string()
    .trim()
    .when(SHORT_NOTICE_ENABLED, {
      is: true,
      then: yup
        .string()
        .max(
          SHORT_NOTICE_TITLE_MAX_LENGTH,
          `Title must be at most ${SHORT_NOTICE_TITLE_MAX_LENGTH} characters`,
        )
        .required("Please enter a title for the warning"),
    }),
  [SHORT_NOTICE_MESSAGE]: yup
    .string()
    .trim()
    .when(SHORT_NOTICE_ENABLED, {
      is: true,
      then: yup.string().required("Please enter a message for the warning"),
    }),
});

// when the warning is disabled, invalid hidden values fall back to the last saved ones
function withValidShortNoticeSettings(
  formData: VenueFormProps,
  savedValues: VenueFormProps,
): VenueFormProps {
  if (formData.shortNoticeEnabled) {
    return formData;
  }

  const { shortNoticeDays, shortNoticeTitle, shortNoticeMessage } = formData;
  const isValidDays =
    Number.isInteger(shortNoticeDays) &&
    shortNoticeDays >= 1 &&
    shortNoticeDays <= 365;
  const isValidTitle =
    !!shortNoticeTitle?.trim() &&
    shortNoticeTitle.trim().length <= SHORT_NOTICE_TITLE_MAX_LENGTH;

  return {
    ...formData,
    shortNoticeDays: isValidDays
      ? shortNoticeDays
      : savedValues.shortNoticeDays,
    shortNoticeTitle: isValidTitle
      ? shortNoticeTitle
      : savedValues.shortNoticeTitle,
    shortNoticeMessage: shortNoticeMessage || savedValues.shortNoticeMessage,
  };
}

type Props = {
  onSubmit?: (data: VenueFormProps) => Promise<unknown>;
  defaultValues?: VenueFormProps;
  submitButtonProps: ButtonProps;
};

const DEFAULT_VALUES: VenueFormProps = {
  [NAME]: "",
  [CATEGORY]: "",
  [CAPACITY]: "",
  [IC_NAME]: "",
  [IC_EMAIL]: "",
  [IC_CONTACT_NUMBER]: "",
  [BOOKING_FORM_FIELDS]: [],
  ...DEFAULT_SHORT_NOTICE_WARNING,
};

function VenueDetailsForm({
  defaultValues = DEFAULT_VALUES,
  onSubmit,
  submitButtonProps,
}: Props) {
  const methods = useForm<VenueFormProps>({
    resolver: yupResolver(SCHEMA),
    defaultValues,
  });
  const { handleSubmit, watch } = methods;
  const isShortNoticeEnabled = watch(SHORT_NOTICE_ENABLED);
  const { venueCategories, loading, getVenueCategories } =
    useGetVenueCategories();
  const sortedVenueCategories = useMemo(
    () => sort(venueCategories),
    [venueCategories],
  );

  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    getVenueCategories().catch((error) => console.error(error));
  }, [getVenueCategories]);

  const [showShortNoticePreview, hideShortNoticePreview] = useModal(
    ({ in: open, onExited }: { in: boolean; onExited: () => void }) => (
      <BookingCreationShortNoticeWarning
        open={open}
        onExited={onExited}
        onClose={hideShortNoticePreview}
        title={watch(SHORT_NOTICE_TITLE)}
        message={watch(SHORT_NOTICE_MESSAGE)}
      />
    ),
    [watch],
  );

  const _onSubmit = async (formData: VenueFormProps) => {
    setSubmitting(true);
    await onSubmit?.(
      deepTrim(withValidShortNoticeSettings(formData, defaultValues)),
    );

    setSubmitting(false);
  };

  return (
    <FormProvider {...methods}>
      <Form
        onSubmit={() => {
          handleSubmit(_onSubmit)().catch((error) => console.error(error));
        }}
      >
        <Segment.Group raised>
          <Segment>
            <Header as={Form.Field}>
              Venue Details
              <Header.Subheader>
                Please fill in the details for the venue.
              </Header.Subheader>
            </Header>

            <Form.Group widths="equal">
              <FormField required label="Venue Name" name={NAME} autoFocus />

              <DropdownSelectorFormField
                name={CATEGORY}
                label="Category"
                placeholder="Select/add a category"
                required
                search
                allowAdditions
                defaultOptions={sortedVenueCategories}
                loading={loading}
              />

              <FormField
                label="Recommended Capacity"
                name={CAPACITY}
                type="number"
              />
            </Form.Group>

            <Form.Group widths="equal">
              <FormField label="Venue IC Name" name={IC_NAME} />

              <FormField label="Venue IC Email" name={IC_EMAIL} type="email" />

              <FormField
                label="Venue IC Contact Number"
                name={IC_CONTACT_NUMBER}
                type="tel"
              />
            </Form.Group>
          </Segment>

          <Segment>
            <Header as={Form.Field}>
              Short Notice Warning
              <Header.Subheader>
                Users will see this warning when they select a time slot that is
                too close to today.
              </Header.Subheader>
            </Header>

            <RadioFormField
              name={SHORT_NOTICE_ENABLED}
              label="Show a warning for short notice bookings"
              type="toggle"
            />

            {isShortNoticeEnabled && (
              <>
                <Form.Group widths="equal">
                  <FormField
                    required
                    label="Warn when booking is within (days)"
                    name={SHORT_NOTICE_DAYS}
                    type="number"
                  />

                  <FormField
                    required
                    label="Warning Title"
                    name={SHORT_NOTICE_TITLE}
                  />
                </Form.Group>

                <TextAreaFormField
                  required
                  label="Warning Message"
                  name={SHORT_NOTICE_MESSAGE}
                />

                <Button
                  type="button"
                  basic
                  icon="eye"
                  content="Preview as user"
                  onClick={showShortNoticePreview}
                />
              </>
            )}
          </Segment>

          <Segment>
            <Header as={Form.Field}>
              Custom Booking Form Fields
              <Header.Subheader>
                Please set up the fields for the booking form.
              </Header.Subheader>
            </Header>

            <VenueDetailsCustomFormFieldsSection />
          </Segment>

          <Segment>
            <HorizontalLayoutContainer justify="end">
              <Form.Button
                {...submitButtonProps}
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </HorizontalLayoutContainer>
          </Segment>
        </Segment.Group>
      </Form>
    </FormProvider>
  );
}

export default VenueDetailsForm;
