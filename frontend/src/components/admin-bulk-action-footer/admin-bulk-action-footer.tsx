import { useMemo, useState } from "react";
import { Button } from "semantic-ui-react";
import { toast } from "react-toastify";
import styles from "./admin-bulk-action-footer.module.scss";

import { useUpdateBulkBookingStatus } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch } from "../../redux/hooks";
import { updateBookingsAction } from "../../redux/slices/bookings-slice";
import { refreshPendingBookingCountThunk } from "../../redux/slices/pending-booking-count-slice";
import { BookingStatusAction, BookingStatus } from "../../types/bookings";
import { ApiResponseError, resolveApiError } from "../../utils/error-utils";
import { BookingViewProps } from "../admin-booking-base-table";

type Props = {
  selectedIds: Set<number>;
  processedData: BookingViewProps[];
  onSelectionChange: (ids: Set<number>) => void;
};

const BookingSelectionFooter = ({ selectedIds, processedData, onSelectionChange }: Props) => {
  const dispatch = useAppDispatch();
  const { updateBulkBookingStatus } = useUpdateBulkBookingStatus();
  const [processing, setProcessing] = useState(false);

  // extracts booking Ids to select all
  const visibleIds = useMemo(() => {
    return processedData
      .map((b) => b.id)
      .filter((id): id is number => id !== undefined);
  }, [processedData]);

  const isAllSelected = selectedIds.size === visibleIds.length && visibleIds.length > 0;

  // if all visible bookings are already selected, button will deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(visibleIds));
    }
  };

  const handleBulkAction = async (action: BookingStatusAction) => {
    const actionLabel = action === BookingStatusAction.Approve ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${actionLabel} ${selectedIds.size} bookings?`)) {
      return;
    }

    setProcessing(true);
    
    // filter out cancelled bookings and clashes e.g. accepting an already accepted booking
    try {
      const validBookingsToUpdate = processedData.filter((booking) => {
        if (!booking.id || !selectedIds.has(booking.id)) return false;
        
        if (action === BookingStatusAction.Approve) {
          return booking.status !== BookingStatus.Approved && booking.status !== BookingStatus.Cancelled;
        } else {
          return booking.status !== BookingStatus.Rejected && booking.status !== BookingStatus.Cancelled;
        }
      });

      if (validBookingsToUpdate.length === 0) {
        toast.info("No bookings were updated.");
        setProcessing(false);
        onSelectionChange(new Set());
        return;
      }

      const validBookingIds = validBookingsToUpdate
        .map((b) => b.id)
        .filter((id): id is number => id !== undefined);

      const allUpdatedBookings = await updateBulkBookingStatus(validBookingIds, action);

      dispatch(updateBookingsAction({ bookings: allUpdatedBookings }));
      dispatch(refreshPendingBookingCountThunk());

      toast.success(
        `Successfully updated ${allUpdatedBookings.length} bookings.`
      );

      onSelectionChange(new Set());

    } catch (error) {
      resolveApiError(error as ApiResponseError);
    } finally {
      setProcessing(false);
    }
  };

  if (selectedIds.size === 0) return null;

  return (
    <div className={styles.footerContainer}>
      
      <div className={styles.selectionGroup}>
        <Button 
            className={styles.deselectIconBtn} 
            onClick={() => onSelectionChange(new Set())}
            title="Deselect all"
        >
            ✕
        </Button>
        
        <span className={styles.separator}>|</span>

        <div className={styles.countBadge}>
          {selectedIds.size}
        </div>
        <span className={styles.selectionText}>selected</span>

        <span className={styles.separator}>|</span>

        <Button
            className={styles.selectAllBtn}
            onClick={handleSelectAll}
            compact
        >
            {isAllSelected ? "Deselect all" : "Select all"}
        </Button>
      </div>

      <div className={styles.buttonGroup}>
        <Button 
          size="small" 
          color="green" 
          onClick={() => { void handleBulkAction(BookingStatusAction.Approve); }}
          className={styles.actionBtn}
          loading={processing}
          disabled={processing}
        >
          Approve all
        </Button>
        
        <Button 
          size="small" 
          color="red" 
          onClick={() => { void handleBulkAction(BookingStatusAction.Reject); }}
          className={styles.actionBtn}
          loading={processing}
          disabled={processing}
        >
          Reject all
        </Button>
      </div>
    </div>
  );
};

export default BookingSelectionFooter;