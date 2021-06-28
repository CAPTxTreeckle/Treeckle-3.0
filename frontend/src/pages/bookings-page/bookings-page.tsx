import { Link } from "react-router-dom";
import { Button, Icon } from "semantic-ui-react";
import { BOOKINGS_CREATION_PATH } from "../../routes/paths";
import BookingUserTable from "../../components/booking-user-table";

function BookingsPage() {
  return (
    <>
      <Button
        animated="vertical"
        fluid
        color="teal"
        as={Link}
        to={BOOKINGS_CREATION_PATH}
      >
        <Button.Content hidden content="Create New Booking" />
        <Button.Content visible content={<Icon name="plus" fitted />} />
      </Button>

      <h1>My Bookings</h1>

      <BookingUserTable />
    </>
  );
}

export default BookingsPage;
