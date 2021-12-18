import { useEffect } from "react";

import { useAppSelector } from "../../redux/hooks";
import {
  BookingCreationState,
  selectBookingCreation,
} from "../../redux/slices/booking-creation-slice";
import { BookingCreationStep } from "../../types/bookings";
import { saveToLocalStorage } from "../../utils/local-storage-utils";

function LocalStorageBookingCreationManager() {
  const bookingCreation = useAppSelector(selectBookingCreation);

  useEffect(() => {
    const data: BookingCreationState | null = (() => {
      if (
        bookingCreation.currentCreationStep === BookingCreationStep.Category ||
        bookingCreation.createdBookings
      ) {
        // clean up local storage
        return null;
      }

      if (
        bookingCreation.currentCreationStep === BookingCreationStep.Finalize
      ) {
        // Change final state to the state before
        // This allows revalidation of the form in the 2nd last state before submitting
        return {
          ...bookingCreation,
          currentCreationStep: BookingCreationStep.Form,
        };
      }

      return bookingCreation;
    })();

    saveToLocalStorage("bookingCreation", data);
  }, [bookingCreation]);

  return null;
}

export default LocalStorageBookingCreationManager;
