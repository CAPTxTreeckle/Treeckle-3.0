import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { BOOKINGS_PATH } from "../../routes/paths";
import BookingCreationSection from "../../components/booking-creation-section";

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
        <Button.Content visible content={<Icon name="close" fitted />} />
      </Button>

      <h2>Booking Creation</h2>
      <BookingCreationSection />
    </>
  );
}

export default BookingsCreationPage;
