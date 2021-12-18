import { Icon, Label } from "semantic-ui-react";

import { useDeepEqualAppSelector } from "../../redux/hooks";
import { selectPendingBookingCount } from "../../redux/slices/pending-booking-count-slice";
import styles from "./pending-booking-count-label.module.scss";

function PendingBookingCountLabel() {
  const { count, loading } = useDeepEqualAppSelector(selectPendingBookingCount);

  return (
    <Label
      className={styles.label}
      content={loading ? undefined : count}
      icon={loading ? <Icon name="spinner" loading fitted /> : undefined}
      color="orange"
    />
  );
}

export default PendingBookingCountLabel;
