import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, MenuItem } from "semantic-ui-react";

import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_VENUES_PATH,
} from "../../../routes/paths";
import HorizontalLayoutContainer from "../../horizontal-layout-container";
import PendingBookingCountLabel from "../../pending-booking-count-label";
import TabItem from "../tab-item";
import styles from "./mobile-admin-tab.module.scss";

type Props = {
  onTabClick?: () => void;
};

function MobileAdminTab({ onTabClick }: Props) {
  const [isExpanded, setExpanded] = useState(false);
  const { pathname } = useLocation();

  return (
    <Accordion as={MenuItem} active={pathname.startsWith("/admin")}>
      <Accordion.Title
        className={styles.title}
        onClick={() => setExpanded(!isExpanded)}
        active={isExpanded}
        content={
          <HorizontalLayoutContainer align="center" spacing="compact">
            <span>Admin</span>

            <PendingBookingCountLabel />
          </HorizontalLayoutContainer>
        }
      />

      <Accordion.Content active={isExpanded}>
        <TabItem
          label="Bookings"
          redirectPath={ADMIN_BOOKINGS_PATH}
          onTabClick={onTabClick}
          icon="book"
          extra={<PendingBookingCountLabel />}
        />
        <TabItem
          label="Venues"
          redirectPath={ADMIN_VENUES_PATH}
          onTabClick={onTabClick}
          icon="building"
        />
        <TabItem
          label="Users"
          redirectPath={ADMIN_USERS_PATH}
          onTabClick={onTabClick}
          icon="users"
        />
        <TabItem
          label="Settings"
          redirectPath={ADMIN_SETTINGS_PATH}
          onTabClick={onTabClick}
          icon="settings"
        />
      </Accordion.Content>
    </Accordion>
  );
}

export default MobileAdminTab;
