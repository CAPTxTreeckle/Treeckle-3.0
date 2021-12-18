import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon, IconProps, MenuItem } from "semantic-ui-react";

type Props = {
  label: ReactNode;
  redirectPath: string;
  onTabClick?: () => void;
  icon?: ReactNode;
  extra?: ReactNode;
};

function TabItem({ label, redirectPath, onTabClick, icon, extra }: Props) {
  const { pathname } = useLocation();

  return (
    <MenuItem
      as={Link}
      to={redirectPath}
      active={pathname.startsWith(redirectPath)}
      onClick={onTabClick}
    >
      {typeof icon === "string" ? (
        <Icon name={icon as IconProps["name"]} />
      ) : (
        icon
      )}
      {label}
      {extra}
    </MenuItem>
  );
}

export default TabItem;
