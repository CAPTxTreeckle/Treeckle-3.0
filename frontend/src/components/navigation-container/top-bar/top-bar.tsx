import { ReactNode } from "react";
import classNames from "classnames";
import { Menu } from "semantic-ui-react";
import styles from "./top-bar.module.scss";

type Props = {
  children: ReactNode;
};

function TopBar({ children }: Props) {
  return (
    <Menu
      className={classNames(styles.topBar, styles.important)}
      borderless
      size="huge"
    >
      {children}
    </Menu>
  );
}

export default TopBar;
