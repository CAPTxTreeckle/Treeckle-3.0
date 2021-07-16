import { useGetPendingBookingCount } from "../../custom-hooks/api/bookings-api";
import { useAppDispatch, useDeepEqualAppSelector } from "../../redux/hooks";
import useInterval from "../../custom-hooks/use-interval";
import { selectCurrentUserDisplayInfo } from "../../redux/slices/current-user-slice";
import { Role } from "../../types/users";
import { setPendingBookingCountAction } from "../../redux/slices/pending-booking-count-slice";

// 5 mins
const DELAY_INTERVAL = 1000 * 60 * 5;

function PendingBookingCountManager() {
  const dispatch = useAppDispatch();
  const { role } = useDeepEqualAppSelector(selectCurrentUserDisplayInfo) ?? {};
  const { getPendingBookingCount } = useGetPendingBookingCount();

  const delay = role === Role.Admin ? DELAY_INTERVAL : null;

  useInterval(
    async () => {
      dispatch(setPendingBookingCountAction({ loading: true }));
      const count = await getPendingBookingCount();
      dispatch(setPendingBookingCountAction({ count, loading: false }));
    },
    delay,
    { fireOnFirstTime: true },
  );

  return null;
}

export default PendingBookingCountManager;
