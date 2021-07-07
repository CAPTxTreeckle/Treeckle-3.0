import { useMemo, useState } from "react";
import { capitalCase } from "change-case";
import { toast } from "react-toastify";
import { Button, Popup, Label } from "semantic-ui-react";
import { useUpdateBookingStatuses } from "../../custom-hooks/api/bookings-api";
import {
  BookingStatus,
  BOOKING_STATUS_DETAILS,
  BookingStatusActionType,
} from "../../types/bookings";
import { resolveApiError } from "../../utils/error-utils";
import { useAppDispatch } from "../../redux/hooks";
import { updateBookingsAction } from "../../redux/slices/bookings-slice";
import styles from "./booking-status-button.module.scss";

type Props = {
  bookingId: number;
  status: BookingStatus;
  adminView?: boolean;
  fluid?: boolean;
};

function BookingStatusButton({
  bookingId,
  status,
  adminView = false,
  fluid = false,
}: Props) {
  const { updateBookingStatuses, loading } = useUpdateBookingStatuses();
  const [isPopupOpened, setPopupOpened] = useState(false);
  const dispatch = useAppDispatch();

  const actionButtons = useMemo(() => {
    const onUpdateStatus = async (action: BookingStatusActionType) => {
      try {
        setPopupOpened(false);
        const updatedBookings = await updateBookingStatuses([
          { bookingId, action },
        ]);

        toast.success(
          updatedBookings.length > 1
            ? "Booking statuses updated successfully."
            : "The booking status has been updated successfully.",
        );

        dispatch(updateBookingsAction(updatedBookings));
      } catch (error) {
        resolveApiError(error);
      }
    };

    const approveButton = (
      <Button
        key="approve"
        content="Approve"
        color="green"
        onClick={() => onUpdateStatus(BookingStatusActionType.Approve)}
      />
    );

    const revokeButton = (
      <Button
        key="revoke"
        content="Revoke"
        color="orange"
        onClick={() => onUpdateStatus(BookingStatusActionType.Revoke)}
      />
    );

    const rejectButton = (
      <Button
        key="reject"
        content="Reject"
        color="red"
        onClick={() => onUpdateStatus(BookingStatusActionType.Reject)}
      />
    );

    const cancelButton = (
      <Button
        key="cancel"
        content="Cancel"
        color="grey"
        onClick={() => onUpdateStatus(BookingStatusActionType.Cancel)}
      />
    );

    if (!adminView) {
      return status === BookingStatus.Cancelled ||
        status === BookingStatus.Rejected
        ? []
        : [cancelButton];
    }

    switch (status) {
      case BookingStatus.Pending:
        return [approveButton, rejectButton];
      case BookingStatus.Approved:
        return [revokeButton, rejectButton];
      case BookingStatus.Rejected:
        return [approveButton, revokeButton];
      case BookingStatus.Cancelled:
      default:
        return [];
    }
  }, [bookingId, status, adminView, updateBookingStatuses, dispatch]);

  return (
    <Popup
      trigger={
        <Label
          as={Button}
          fluid={fluid}
          color={BOOKING_STATUS_DETAILS.get(status)?.color}
          content={capitalCase(status)}
          disabled={
            status === BookingStatus.Cancelled ||
            (!adminView && status === BookingStatus.Rejected)
          }
          loading={loading}
        />
      }
      position="top center"
      content={
        <Button.Group
          className={styles.bookingStatusActionButtons}
          compact
          vertical
        >
          {actionButtons}
        </Button.Group>
      }
      hoverable
      on="click"
      open={isPopupOpened}
      onOpen={() => setPopupOpened(true)}
      onClose={() => setPopupOpened(false)}
      hideOnScroll
      disabled={loading}
    />
  );
}

export default BookingStatusButton;
