import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { BOOKINGS_PATH } from "../../routes/paths";
import BookingCreationSection from "../../components/booking-creation-section";
import { useAppDispatch } from "../../redux/hooks";
import { cancelBookingCreationAction } from "../../redux/slices/booking-creation-slice";

function BookingsCreationPage() {
  const dispatch = useAppDispatch();

  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="red"
        as={Link}
        to={BOOKINGS_PATH}
        onClick={() => dispatch(cancelBookingCreationAction())}
      >
        <Button.Content hidden content="Cancel Booking Creation" />
        <Button.Content visible content={<Icon name="close" fitted />} />
      </Button>

      <h1>Booking Creation</h1>
      <BookingCreationSection />
    </>
  );
}

export default BookingsCreationPage;
