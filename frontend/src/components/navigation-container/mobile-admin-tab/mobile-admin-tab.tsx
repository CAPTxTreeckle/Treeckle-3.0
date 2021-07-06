import { useState } from "react";
import clsx from "clsx";
import { Accordion, MenuItem } from "semantic-ui-react";
import { useLocation } from "react-router-dom";
import TabItem from "../tab-item";
import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_VENUES_PATH,
} from "../../../routes/paths";
import styles from "./mobile-admin-tab.module.scss";

type Props = {
  onTabClick?: () => void;
};

function MobileAdminTab({ onTabClick }: Props) {
  const [isExpanded, setExpanded] = useState(false);
  const { pathname } = useLocation();

  return (
    <Accordion
      className={clsx(styles.mobileAdminTab, styles.important)}
      as={MenuItem}
      active={pathname.startsWith("/admin")}
    >
      <Accordion.Title
        className={clsx(styles.title, styles.important)}
        onClick={() => setExpanded(!isExpanded)}
        active={isExpanded}
        content="Admin"
      />

      <Accordion.Content active={isExpanded}>
        <TabItem
          label="Bookings"
          redirectPath={ADMIN_BOOKINGS_PATH}
          onTabClick={onTabClick}
          icon="book"
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
