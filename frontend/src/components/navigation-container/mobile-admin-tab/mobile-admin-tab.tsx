import { useState } from "react";
import { Accordion, MenuItem } from "semantic-ui-react";
import { useLocation } from "react-router-dom";
import TabItem from "../tab-item";
import {
  ADMIN_BOOKINGS_PATH,
  ADMIN_USERS_PATH,
  ADMIN_SETTINGS_PATH,
  ADMIN_VENUES_PATH,
} from "../../../routes/paths";

type Props = {
  onTabClick?: () => void;
};

function MobileAdminTab({ onTabClick }: Props) {
  const [isExpanded, setExpanded] = useState(false);
  const { pathname } = useLocation();

  return (
    <Accordion
      as={MenuItem}
      fitted="vertically"
      active={pathname.startsWith("/admin")}
    >
      <Accordion.Title
        onClick={() => setExpanded(!isExpanded)}
        active={isExpanded}
        content="Admin"
      />

      <Accordion.Content active={isExpanded}>
        <TabItem
          label="Bookings"
          redirectPath={ADMIN_BOOKINGS_PATH}
          onTabClick={onTabClick}
        />
        <TabItem
          label="Venues"
          redirectPath={ADMIN_VENUES_PATH}
          onTabClick={onTabClick}
        />
        <TabItem
          label="Users"
          redirectPath={ADMIN_USERS_PATH}
          onTabClick={onTabClick}
        />
        <TabItem
          label="Settings"
          redirectPath={ADMIN_SETTINGS_PATH}
          onTabClick={onTabClick}
        />
      </Accordion.Content>
    </Accordion>
  );
}

export default MobileAdminTab;
