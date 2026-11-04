import { FormProvider, useForm } from "react-hook-form";
import { Card, Form, Header, Label } from "semantic-ui-react";

import { BOOKING_FORM_FIELDS } from "../../constants";
import { BookingFormFieldProps, VenueFormProps } from "../../types/venues";
import CustomFormFieldRenderer from "../custom-form-field-renderer";
import PlaceholderWrapper from "../placeholder-wrapper";
import styles from "./venue-booking-display-form.module.scss";

type Props = {
  venueFormProps: VenueFormProps;
};

function VenueBookingDisplayForm({ venueFormProps }: Props) {
  const {
    name,
    category,
    [BOOKING_FORM_FIELDS]: fields = [],
    shortNoticeEnabled,
    shortNoticeDays,
  } = venueFormProps;
  const methods = useForm<BookingFormFieldProps[]>();

  return (
    <FormProvider {...methods}>
      <Form className={styles.venueBookingForm}>
        <Card className={styles.card} centered raised>
          <Card.Content className={styles.header}>
            <Header textAlign="center">
              {name}
              <Header.Subheader>{category}</Header.Subheader>
            </Header>
            <div className={styles.shortNoticeLabel}>
              {shortNoticeEnabled ? (
                <Label
                  basic
                  color="orange"
                  size="small"
                  icon="warning sign"
                  content={`Warns within ${shortNoticeDays} day${
                    shortNoticeDays === 1 ? "" : "s"
                  }`}
                />
              ) : (
                <Label
                  basic
                  size="small"
                  icon="bell slash"
                  content="No short notice warning"
                />
              )}
            </div>
          </Card.Content>
          <Card.Content>
            <PlaceholderWrapper
              defaultMessage="No form fields"
              showDefaultMessage={fields.length === 0}
              placeholder
            >
              {fields.map((field, index) => (
                <CustomFormFieldRenderer
                  key={index}
                  name={`${index}`}
                  readOnly
                  {...field}
                />
              ))}
            </PlaceholderWrapper>
          </Card.Content>
        </Card>
      </Form>
    </FormProvider>
  );
}

export default VenueBookingDisplayForm;
