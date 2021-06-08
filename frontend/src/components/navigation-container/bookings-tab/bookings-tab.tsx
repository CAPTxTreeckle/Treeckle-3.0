import TabItem from "../tab-item";
import { BOOKINGS_PATH } from "../../../routes/paths";

type Props = {
  onTabClick?: () => void;
};

function BookingsTab({ onTabClick }: Props) {
  return (
    <TabItem
      label="Bookings"
      redirectPath={BOOKINGS_PATH}
      onTabClick={onTabClick}
    />
  );
}

export default BookingsTab;
