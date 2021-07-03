import { useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { useGetSingleBooking } from "../../custom-hooks/api/bookings-api";
import styles from "./booking-single-view-page.module.scss";

// type Props = {};

function BookingSingleViewPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { booking, loading, getSingleBooking } = useGetSingleBooking();

  useEffect(() => {
    getSingleBooking(bookingId);
  }, [getSingleBooking, bookingId]);

  return (
    <>
      <h1>Booking</h1>
    </>
  );
}

export default BookingSingleViewPage;
