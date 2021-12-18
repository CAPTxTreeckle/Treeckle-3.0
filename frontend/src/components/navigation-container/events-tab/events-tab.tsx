import { EVENTS_PATH } from "../../../routes/paths";
import TabItem from "../tab-item";

type Props = {
  onTabClick?: () => void;
};

function EventsTab({ onTabClick }: Props) {
  return (
    <TabItem
      label="Events"
      redirectPath={EVENTS_PATH}
      onTabClick={onTabClick}
    />
  );
}

export default EventsTab;
