import { useEffect, useMemo } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Form, Header } from "semantic-ui-react";
import * as yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { EMAIL, NAME, VENUE_ID } from "../../constants";
import { BookingNotificationSubscriptionPostData } from "../../types/bookings";
import { deepTrim, sort } from "../../utils/parser-utils";
import { useGetVenues } from "../../custom-hooks/api/venues-api";
import FormField from "../form-field";
import DropdownSelectorFormField from "../dropdown-selector-form-field";
import styles from "./booking-notification-subscription-form.module.scss";

type BookingNotificationSubscriptionFormProps =
  BookingNotificationSubscriptionPostData & {
    [VENUE_ID]: string;
  };

const schema = yup.object().shape({
  [NAME]: yup.string().trim().required("Please enter a name"),
  [EMAIL]: yup
    .string()
    .trim()
    .email("Input must be a valid email")
    .required("Please enter an email"),
  [VENUE_ID]: yup
    .string()
    .trim()
    .required("Please choose a venue to subscribe to"),
});

const defaultValues: BookingNotificationSubscriptionFormProps = {
  [NAME]: "",
  [EMAIL]: "",
  [VENUE_ID]: "",
};

function BookingNotificationSubscriptionForm() {
  const methods = useForm<BookingNotificationSubscriptionFormProps>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const { venues, loading, getVenues } = useGetVenues();
  const sortedVenueOptions = useMemo(
    () =>
      sort(
        venues.map(({ id, venueFormProps: { name } }) => ({
          text: name,
          value: `${id}`,
        })),
        { props: "text" },
      ),
    [venues],
  );
  console.log(sortedVenueOptions);

  useEffect(() => {
    getVenues({ fullDetails: false });
  }, [getVenues]);

  const { handleSubmit, reset } = methods;

  const onSubmit = async (
    formData: BookingNotificationSubscriptionFormProps,
  ) => {
    deepTrim(formData);
    reset();
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Header as={Form.Field}>Add Subscribers</Header>

        <Form.Group className={styles.fieldsContainer} widths="equal">
          <FormField fluid required label="Name" inputName={NAME} width="4" />
          <FormField
            fluid
            required
            label="Email"
            inputName={EMAIL}
            type="email"
            width="4"
          />
          <DropdownSelectorFormField
            className={styles.dropdown}
            fluid
            required
            label="Venue"
            inputName={VENUE_ID}
            width="5"
            loading={loading}
            defaultOptions={sortedVenueOptions}
            search
            placeholder="Choose a venue"
          />
          <Form.Button
            type="submit"
            color="blue"
            content="Subscribe"
            fluid
            width="3"
          />
        </Form.Group>
      </Form>
    </FormProvider>
  );
}

export default BookingNotificationSubscriptionForm;
