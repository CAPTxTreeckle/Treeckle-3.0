import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Accordion, MenuItem } from "semantic-ui-react";
import {
  OUR_STORY_PATH,
  TERMS_OF_USE_PATH,
  PRIVACY_POLICY_PATH,
} from "../../../routes/paths";
import TabItem from "../tab-item";
import styles from "./mobile-about-tab.module.scss";

type Props = {
  onTabClick?: () => void;
};

function MobileAboutTab({ onTabClick }: Props) {
  const [isExpanded, setExpanded] = useState(false);
  const { pathname } = useLocation();

  return (
    <Accordion as={MenuItem} active={pathname.startsWith("/about")}>
      <Accordion.Title
        className={styles.title}
        content="About"
        onClick={() => setExpanded(!isExpanded)}
        active={isExpanded}
      />

      <Accordion.Content active={isExpanded}>
        <TabItem
          label="Our Story"
          redirectPath={OUR_STORY_PATH}
          onTabClick={onTabClick}
          icon={<i className="fas fa-book-spells icon" />}
        />
        <TabItem
          label="Terms of Use"
          redirectPath={TERMS_OF_USE_PATH}
          onTabClick={onTabClick}
          icon={<i className="fas fa-file-contract icon" />}
        />
        <TabItem
          label="Privacy Policy"
          redirectPath={PRIVACY_POLICY_PATH}
          onTabClick={onTabClick}
          icon={<i className="fas fa-user-shield icon" />}
        />
      </Accordion.Content>
    </Accordion>
  );
}

export default MobileAboutTab;
