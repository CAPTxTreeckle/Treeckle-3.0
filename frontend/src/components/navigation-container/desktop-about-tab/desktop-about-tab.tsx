import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "semantic-ui-react";

import {
  OUR_STORY_PATH,
  PRIVACY_POLICY_PATH,
  TERMS_OF_USE_PATH,
} from "../../../routes/paths";

function DesktopAboutTab() {
  const { pathname } = useLocation();

  return (
    <Dropdown
      className={clsx({ active: pathname.startsWith("/about") })}
      text="About"
      item
      floating
    >
      <Dropdown.Menu>
        <Dropdown.Item
          as={Link}
          to={OUR_STORY_PATH}
          active={pathname.startsWith(OUR_STORY_PATH)}
          text="Our Story"
          icon={{ className: "fas fa-book-spells" }}
        />
        <Dropdown.Item
          as={Link}
          to={TERMS_OF_USE_PATH}
          active={pathname.startsWith(TERMS_OF_USE_PATH)}
          text="Terms of Use"
          icon={{ className: "fas fa-file-contract" }}
        />
        <Dropdown.Item
          as={Link}
          to={PRIVACY_POLICY_PATH}
          active={pathname.startsWith(PRIVACY_POLICY_PATH)}
          text="Privacy Policy"
          icon={{ className: "fas fa-user-shield" }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default DesktopAboutTab;
