import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuItem } from "semantic-ui-react";

type Props = {
  label: ReactNode;
  redirectPath: string;
  onTabClick?: () => void;
  icon?: ReactNode;
};

function TabItem({ label, redirectPath, onTabClick, icon }: Props) {
  const { pathname } = useLocation();

  return (
    <MenuItem
      as={Link}
      to={redirectPath}
      active={pathname.startsWith(redirectPath)}
      content={label}
      onClick={onTabClick}
      icon={icon}
    />
  );
}

export default TabItem;
