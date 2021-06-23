import { useMemo, useState } from "react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Button, Popup, Label } from "semantic-ui-react";
import { useUpdateBookingStatuses } from "../../custom-hooks/api/bookings-api";
import {
  BookingStatus,
  BookingStatusDetails,
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
};

function BookingStatusButton({ bookingId, status, adminView }: Props) {
  const { updateBookingStatuses, loading } = useUpdateBookingStatuses();
  const [isOpened, setOpened] = useState(false);
  const dispatch = useAppDispatch();

  const actionButtons = useMemo(() => {
    const onUpdateStatus = async (action: BookingStatusActionType) => {
      setOpened(false);

      try {
        const updatedBookings = await updateBookingStatuses([
          { bookingId, action },
        ]);

        dispatch(updateBookingsAction(updatedBookings));

        toast.success(
          updatedBookings.length > 1
            ? "Booking statuses updated successfully."
            : "The booking status has been updated successfully.",
        );
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
          fluid
          color={BookingStatusDetails.get(status)?.color}
          className={clsx(styles.bookingStatusButton, styles.important)}
          content={status.toLowerCase()}
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
      open={isOpened}
      onOpen={() => setOpened(true)}
      onClose={() => setOpened(false)}
      hideOnScroll
      disabled={loading}
    />
  );
}

export default BookingStatusButton;
