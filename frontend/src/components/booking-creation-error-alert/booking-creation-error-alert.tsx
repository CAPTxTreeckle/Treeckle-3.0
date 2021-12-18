import { Button } from "semantic-ui-react";

import { useAppDispatch } from "../../redux/hooks";
import { resetBookingCreationAction } from "../../redux/slices/booking-creation-slice";
import BookingCreationHelpButton from "../booking-creation-help-button";
import HorizontalLayoutContainer from "../horizontal-layout-container";
import styles from "./booking-creation-error-alert.module.scss";

type Props = {
  errorMessage?: string;
};

function BookingCreationErrorAlert({
  errorMessage = "An unexpected error has occurred",
}: Props) {
  const dispatch = useAppDispatch();

  return (
    <div className={styles.bookingCreationErrorAlert}>
      <div>{errorMessage}</div>
      <HorizontalLayoutContainer align="center" spacing="compact">
        <span>Please reset the form or contact us via</span>
        <span>
          <BookingCreationHelpButton />
        </span>
        <span>if the problem persists</span>
      </HorizontalLayoutContainer>
      <Button
        content="Reset"
        color="red"
        onClick={() => dispatch(resetBookingCreationAction())}
      />
    </div>
  );
}

export default BookingCreationErrorAlert;
