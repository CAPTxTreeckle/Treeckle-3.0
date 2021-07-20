import { useEffect, useRef } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Segment, Form, Ref } from "semantic-ui-react";
import {
  BOOKING_FORM_RESPONSES,
  REQUIRED,
  RESPONSE,
  TITLE,
} from "../../constants";
import {
  useDeepEqualAppSelector,
  useAppDispatch,
  useAppSelector,
} from "../../redux/hooks";
import {
  backFromBookingFormAction,
  completeBookingFormAction,
  selectBookingFormProps,
  selectSelectedVenue,
  syncVenueAction,
} from "../../redux/slices/booking-creation-slice";
import { BookingFormProps } from "../../types/bookings";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import FormField from "../form-field";
import CustomFormFieldRenderer from "../custom-form-field-renderer";
import { useGetSingleVenue } from "../../custom-hooks/api/venues-api";
import PlaceholderWrapper from "../placeholder-wrapper";
import BookingCreationErrorAlert from "../booking-creation-error-alert";
import { deepTrim } from "../../utils/parser-utils";

const schema = yup.object().shape({
  [TITLE]: yup.string().trim().required("Please enter a short booking title"),
  [BOOKING_FORM_RESPONSES]: yup
    .array(
      yup
        .object()
        .shape({
          [REQUIRED]: yup.boolean(),
          [RESPONSE]: yup.mixed<string | boolean>().when(REQUIRED, {
            is: true,
            then: yup.lazy((value) =>
              typeof value === "string"
                ? yup.string().trim().required("This field is required")
                : yup
                    .boolean()
                    .required("An error has occurred")
                    .oneOf([true], "This field must be checked"),
            ),
          }),
        })
        .required(),
    )
    .notRequired(),
});

function BookingCreationCustomForm() {
  const selectedVenue = useAppSelector(selectSelectedVenue);
  const bookingFormProps = useDeepEqualAppSelector(selectBookingFormProps);
  const { getSingleVenue, loading } = useGetSingleVenue();
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (selectedVenue?.id !== undefined) {
      (async () => {
        const venue = await getSingleVenue(selectedVenue.id);

        dispatch(syncVenueAction(venue ?? null));
      })();
    }
  }, [getSingleVenue, dispatch, selectedVenue?.id]);

  const methods = useForm<BookingFormProps>({
    resolver: yupResolver(schema),
    defaultValues: bookingFormProps ?? undefined,
  });
  const { handleSubmit, control, getValues, reset } = methods;
  const { fields } = useFieldArray({
    control,
    name: BOOKING_FORM_RESPONSES,
  });

  useEffect(() => {
    if (bookingFormProps) {
      reset(bookingFormProps);
    }
  }, [reset, bookingFormProps]);

  const onSubmit = (formData: BookingFormProps) =>
    dispatch(completeBookingFormAction(deepTrim(formData)));

  return (
    <>
      <Segment padded="very">
        <PlaceholderWrapper
          placeholder
          loading={loading}
          loadingMessage="Loading booking form"
          showDefaultMessage={!bookingFormProps}
          defaultMessage={() => (
            <BookingCreationErrorAlert errorMessage="No booking form data found" />
          )}
        >
          <FormProvider {...methods}>
            <Ref innerRef={formRef}>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <FormField name={TITLE} label="Short Booking Title" required />

                {fields.map(
                  ({ id, type, label, placeholder, required }, index) => (
                    <CustomFormFieldRenderer
                      key={id}
                      name={`${BOOKING_FORM_RESPONSES}.${index}.${RESPONSE}`}
                      type={type}
                      label={label}
                      placeholder={placeholder}
                      required={required}
                    />
                  ),
                )}
              </Form>
            </Ref>
          </FormProvider>
        </PlaceholderWrapper>
      </Segment>

      <Segment secondary>
        <HorizontalLayoutContainer justify="space between">
          <Button
            color="black"
            content="Back"
            onClick={() => dispatch(backFromBookingFormAction(getValues()))}
          />

          <Button
            color="blue"
            content="Next"
            disabled={!bookingFormProps}
            onClick={() => {
              formRef.current?.reportValidity() &&
                formRef.current?.dispatchEvent(
                  new Event("submit", { cancelable: true, bubbles: true }),
                );
            }}
          />
        </HorizontalLayoutContainer>
      </Segment>
    </>
  );
}

export default BookingCreationCustomForm;
