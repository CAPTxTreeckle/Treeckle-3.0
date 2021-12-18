import { DASHBOARD_PATH } from "../../../routes/paths";
import TabItem from "../tab-item";

type Props = {
  onTabClick?: () => void;
};

function DashboardTab({ onTabClick }: Props) {
  return (
    <TabItem
      label="Dashboard"
      redirectPath={DASHBOARD_PATH}
      onTabClick={onTabClick}
    />
  );
}

export default DashboardTab;
