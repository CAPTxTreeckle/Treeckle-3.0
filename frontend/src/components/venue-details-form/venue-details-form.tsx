import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ButtonProps, Form, Header, Segment } from "semantic-ui-react";
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
  TYPE,
} from "../../constants";
import { useGetVenueCategories } from "../../custom-hooks/api/venues-api";
import { FieldType, VenueFormProps } from "../../types/venues";
import { deepTrim, sort } from "../../utils/transform-utils";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import FormField from "../form-field";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import VenueDetailsCustomFormFieldsSection from "../venue-details-custom-form-fields-section";

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
});

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
  const { handleSubmit } = methods;
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

  const _onSubmit = async (formData: VenueFormProps) => {
    setSubmitting(true);
    await onSubmit?.(deepTrim(formData));

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
