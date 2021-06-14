import { MenuItem } from "semantic-ui-react";

type Props = {
  onTabClick?: () => void;
};

function SidebarTab({ onTabClick }: Props) {
  return <MenuItem onClick={onTabClick} icon="bars" />;
}

export default SidebarTab;
