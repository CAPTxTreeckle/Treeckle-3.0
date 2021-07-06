import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_VENUES_PATH,
} from "../../../routes/paths";

function DesktopAdminTab() {
  const { pathname } = useLocation();

  return (
    <Dropdown
      className={clsx({ active: pathname.startsWith("/admin") })}
      text="Admin"
      item
      floating
    >
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={ADMIN_BOOKINGS_PATH}
          active={pathname.startsWith(ADMIN_BOOKINGS_PATH)}
          text="Bookings"
          icon="book"
        />
        <Dropdown.Item
          as={Link}
          to={ADMIN_VENUES_PATH}
          active={pathname.startsWith(ADMIN_VENUES_PATH)}
          text="Venues"
          icon="building"
        />
        <Dropdown.Item
          as={Link}
          to={ADMIN_USERS_PATH}
          active={pathname.startsWith(ADMIN_USERS_PATH)}
          text="Users"
          icon="users"
        />
        <Dropdown.Item
          as={Link}
          to={ADMIN_SETTINGS_PATH}
          active={pathname.startsWith(ADMIN_SETTINGS_PATH)}
          text="Settings"
          icon="settings"
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default DesktopAdminTab;
