import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";
import PendingBookingCountLabel from "../../pending-booking-count-label";
import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_VENUES_PATH,
} from "../../../routes/paths";
import HorizontalLayoutContainer from "../../horizontal-layout-container";

function DesktopAdminTab() {
  const { pathname } = useLocation();

  return (
    <Dropdown
      className={clsx({ active: pathname.startsWith("/admin") })}
      text="Admin"
      item
      icon={<PendingBookingCountLabel />}
      floating
    >
      <Dropdown.Menu>
        <Dropdown.Item
          className="flex-display"
          as={Link}
          to={ADMIN_BOOKINGS_PATH}
          active={pathname.startsWith(ADMIN_BOOKINGS_PATH)}
          text={
            <HorizontalLayoutContainer align="center">
              <span>Bookings</span>

              <PendingBookingCountLabel />
            </HorizontalLayoutContainer>
          }
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
