import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";

import BookingCreationSection from "../../components/booking-creation-section";
import { BOOKINGS_PATH } from "../../routes/paths";

function BookingsCreationPage() {
  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="red"
        as={Link}
        to={BOOKINGS_PATH}
      >
        <Button.Content hidden content="Cancel Booking Creation" />
        <Button.Content visible content={<Icon name="times" fitted />} />
      </Button>

      <h1>Booking Creation</h1>
      <BookingCreationSection />
    </>
  );
}

export default BookingsCreationPage;
