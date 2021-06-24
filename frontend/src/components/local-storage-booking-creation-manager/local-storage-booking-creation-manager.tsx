import { useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import { selectBookingCreation } from "../../redux/slices/booking-creation-slice";
import { BookingCreationStep } from "../../types/bookings";
import { saveToLocalStorage } from "../../utils/local-storage-utils";

function LocalStorageBookingCreationManager() {
  const bookingCreation = useAppSelector(selectBookingCreation);

  useEffect(() => {
    saveToLocalStorage(
      "bookingCreation",
      bookingCreation.currentCreationStep === BookingCreationStep.Category
        ? null
        : bookingCreation,
    );
  }, [bookingCreation]);

  return null;
}

export default LocalStorageBookingCreationManager;
