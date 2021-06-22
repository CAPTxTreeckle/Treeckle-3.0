import { useMemo, useState, useEffect } from "react";
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
import styles from "./booking-status-button.module.scss";

type Props = {
  bookingId: number;
  status: BookingStatus;
  getBookings: () => Promise<unknown>;
  adminView?: boolean;
};

function BookingStatusButton({
  bookingId,
  status,
  getBookings,
  adminView,
}: Props) {
  const { updateBookingStatuses, loading } = useUpdateBookingStatuses();
  const [isOpened, setOpened] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const actionButtons = useMemo(() => {
    const onUpdateStatus = async (action: BookingStatusActionType) => {
      setOpened(false);

      try {
        const updatedBooking = (
          await updateBookingStatuses([{ bookingId, action }])
        )[0];

        if (!updatedBooking) {
          return;
        }

        setCurrentStatus(updatedBooking.status);
        toast.success("The booking status has been updated successfully.");
        getBookings();
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
      return currentStatus === BookingStatus.Cancelled ||
        currentStatus === BookingStatus.Rejected
        ? []
        : [cancelButton];
    }

    switch (currentStatus) {
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
  }, [bookingId, currentStatus, getBookings, adminView, updateBookingStatuses]);

  return (
    <Popup
      trigger={
        <Label
          as={Button}
          fluid
          color={BookingStatusDetails.get(currentStatus)?.color}
          className={clsx(styles.bookingStatusButton, styles.important)}
          content={currentStatus.toLowerCase()}
          disabled={
            currentStatus === BookingStatus.Cancelled ||
            (!adminView && currentStatus === BookingStatus.Rejected)
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
