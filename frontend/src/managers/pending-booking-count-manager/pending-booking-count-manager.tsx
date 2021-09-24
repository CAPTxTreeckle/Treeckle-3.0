import { useCallback } from "react";
import { useGetPendingBookingCount } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch, useDeepEqualAppSelector } from "../../redux/hooks";
import useInterval from "../../custom-hooks/use-interval";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { Role } from "../../types/users";
import { setPendingBookingCountAction } from "../../redux/slices/pending-booking-count-slice";

// 30 mins
const DELAY_INTERVAL = 1000 * 60 * 30;

function PendingBookingCountManager() {
  const dispatch = useAppDispatch();
  const { role } = useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const { getPendingBookingCount } = useGetPendingBookingCount();

  const delay = role === Role.Admin ? DELAY_INTERVAL : null;

  const updatePendingBookingCount = useCallback(async () => {
    try {
      dispatch(setPendingBookingCountAction({ loading: true }));
      const count = await getPendingBookingCount();
      dispatch(setPendingBookingCountAction({ count, loading: false }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(setPendingBookingCountAction({ loading: false }));
    }
  }, [getPendingBookingCount, dispatch]);

  useInterval({
    callback: updatePendingBookingCount,
    delay,
    fireOnFirstTime: true,
  });

  return null;
}

export default PendingBookingCountManager;
