import TabItem from "../tab-item";
import { DASHBOARD_PATH } from "../../../routes/paths";

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
