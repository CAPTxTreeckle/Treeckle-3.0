import { useEffect } from "react";
import { Segment } from "semantic-ui-react";
import { useParams } from "react-router-dom";
import { useGetSingleBooking } from "../../custom-hooks/api/bookings-api";
import BookingDetailsView from "../../components/booking-details-view/booking-details-view";
import styles from "./booking-single-view-page.module.scss";
import PlaceholderWrapper from "../../components/placeholder-wrapper";

// type Props = {};

function BookingSingleViewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { booking, loading, getSingleBooking } = useGetSingleBooking();

  useEffect(() => {
    getSingleBooking(bookingId);
  }, [getSingleBooking, bookingId]);

  return (
    <>
      <h1>Booking Request</h1>

      <PlaceholderWrapper
        loading={loading}
        loadingMessage="Retrieving booking"
        showDefaultMessage={!booking}
        defaultMessage="No booking found"
        inverted
        placeholder
      >
        <Segment>
          {booking && (
            <BookingDetailsView
              className={styles.detailsContainer}
              booking={booking}
              showFullDetails
            />
          )}
        </Segment>
      </PlaceholderWrapper>
    </>
  );
}

export default BookingSingleViewPage;
