import { useCallback } from "react";

import { useGetPendingBookingCount } from "../../custom-hooks/api/bookings-api";
import useInterval from "../../custom-hooks/use-interval";
import { useAppDispatch, useDeepEqualAppSelector } from "../../redux/hooks";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { setPendingBookingCountAction } from "../../redux/slices/pending-booking-count-slice";
import { Role } from "../../types/users";

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
    } catch (error) {
      console.warn(error);
      dispatch(setPendingBookingCountAction({ loading: false }));
    }
  }, [getPendingBookingCount, dispatch]);

  useInterval({
    callback: () => {
      updatePendingBookingCount().catch((error) => console.error(error));
    },
    delay,
    fireOnFirstTime: true,
  });

  return null;
}

export default PendingBookingCountManager;
