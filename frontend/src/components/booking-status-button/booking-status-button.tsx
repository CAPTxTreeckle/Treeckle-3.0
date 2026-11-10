import { capitalCase } from "change-case";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button, Icon, Label, Popup } from "semantic-ui-react";

import { useUpdateBookingStatus } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateBookingsAction } from "../../redux/slices/bookings-slice";
import { refreshPendingBookingCountThunk } from "../../redux/slices/pending-booking-count-slice";
import {
  BOOKING_STATUS_DETAILS,
  BookingStatus,
  BookingStatusAction,
} from "../../types/bookings";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import styles from "./booking-status-button.module.scss";

type Props = {
  bookingId: number;
  status: BookingStatus;
  adminView?: boolean;
  // shown in the user's cancel confirmation, e.g. "MPSH · 19/11/2026 7.00 PM - 10.30 PM"
  details?: string;
};

function BookingStatusButton({
  bookingId,
  status,
  adminView,
  details,
}: Props) {
  const { updateBookingStatus, loading } = useUpdateBookingStatus();
  const [isPopupOpened, setPopupOpened] = useState(false);
  const dispatch = useAppDispatch();

  const actionButtons = useMemo(() => {
    const onUpdateStatus = async (action: BookingStatusAction) => {
      try {
        setPopupOpened(false);
        const updatedBookings = await updateBookingStatus(bookingId, action);

        toast.success(
          updatedBookings.length > 1
            ? "Booking statuses updated successfully."
            : "The booking status has been updated successfully.",
        );

        dispatch(updateBookingsAction({ bookings: updatedBookings }));

        if (action !== BookingStatusAction.Cancel) {
          dispatch(refreshPendingBookingCountThunk());
        }
      } catch (error) {
        resolveApiError(error as ApiResponseError);
      }
    };

    const approveButton = (
      <Button
        key="approve"
        content="Approve"
        color="green"
        onClick={() => {
          onUpdateStatus(BookingStatusAction.Approve).catch((error) => {
            console.error(error);
          });
        }}
      />
    );

    const revokeButton = (
      <Button
        key="revoke"
        content="Revoke"
        color="orange"
        onClick={() => {
          onUpdateStatus(BookingStatusAction.Revoke).catch((error) => {
            console.error(error);
          });
        }}
      />
    );

    const rejectButton = (
      <Button
        key="reject"
        content="Reject"
        color="red"
        onClick={() => {
          onUpdateStatus(BookingStatusAction.Reject).catch((error) => {
            console.error(error);
          });
        }}
      />
    );

    const cancelButton = (
      <Button
        key="cancel"
        content="Cancel booking"
        color="red"
        compact
        size="tiny"
        onClick={() => {
          onUpdateStatus(BookingStatusAction.Cancel).catch((error) => {
            console.error(error);
          });
        }}
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
  }, [bookingId, status, adminView, updateBookingStatus, dispatch]);

  if (!adminView) {
    return (
      // stop clicks (incl. inside the portalled popup) from toggling the row's details
      <div className={styles.userView} onClick={(e) => e.stopPropagation()}>
        <Label
          className={styles.statusLabel}
          color={BOOKING_STATUS_DETAILS.get(status)?.color}
          content={capitalCase(status)}
        />
        {actionButtons.length > 0 && (
          <Popup
            trigger={
              <Button
                basic
                compact
                size="tiny"
                color="red"
                icon="close"
                content="Cancel"
                loading={loading}
                disabled={loading}
              />
            }
            position="top center"
            className={styles.confirmPopup}
            content={
              <>
                <div className={styles.confirmBody}>
                  <Icon
                    circular
                    name="exclamation"
                    color="red"
                    className={styles.confirmIcon}
                  />
                  <div>
                    <div className={styles.confirmTitle}>
                      Cancel this booking?
                    </div>
                    <div className={styles.confirmText}>
                      {details && <div>{details}</div>}
                      You can&apos;t undo this.
                    </div>
                  </div>
                </div>
                <div className={styles.confirmButtons}>
                  <Button
                    basic
                    compact
                    size="tiny"
                    content="Keep booking"
                    onClick={() => setPopupOpened(false)}
                  />
                  {actionButtons}
                </div>
              </>
            }
            on="click"
            open={isPopupOpened}
            onOpen={() => setPopupOpened(true)}
            onClose={() => setPopupOpened(false)}
            hideOnScroll
          />
        )}
      </div>
    );
  }

  return (
    <Popup
      trigger={
        <Button
          fluid
          size="tiny"
          compact
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
          size="tiny"
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
